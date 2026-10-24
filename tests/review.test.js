/* Review policy and actual four-subject actions, with isolated in-memory storage. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const StudyReview = require('../assets/review.js');
const StudyStorage = require('../assets/storage.js');
const { subjects } = require('../assets/common.js');
const clone = value => JSON.parse(JSON.stringify(value));
const today = '2026-10-23', at = '2026-10-23T02:00:00.000Z';

assert.equal(StudyReview.addDays('2028-02-28', 1), '2028-02-29');
assert.equal(StudyReview.addDays('2026-12-31', 1), '2027-01-01');
assert.equal(StudyReview.addDays('2026-03-08', 1), '2026-03-09');
const overdue = { stage: 3, nextReview: '2026-10-20', mastered: false, history: [{ date: '2026-10-01', ok: true }], reason: '旧标签' };
const event = { id: 'r1', date: today, at, attemptId: 'a1', wrong: '<img src=x>', wrongIdx: 1 };
assert.equal(StudyReview.relapse(overdue, event), true);
assert.equal(overdue.nextReview, '2026-10-20', '复发不能推迟已经逾期的任务');
assert.equal(overdue.history.length, 1);
assert.equal(StudyReview.relapse(overdue, event), false, '同一作答事件不能重复记复发');
assert.equal(overdue.recurrences.length, 1);
assert.equal(StudyReview.relapse(overdue, { ...event, id: 'r2', attemptId: 'a2' }), true, '同日另一真实作答应保留');
assert.equal(overdue.recurrences.length, 2);
const summary = StudyReview.reasonSummary([
  {}, { reason: '概念不清' }, { reason: '未归因', reasonConfirmed: true },
  { reason: '概念不清', reasonConfirmed: true }, { reason: '自定义原因', reasonConfirmed: true }
], ['概念不清']);
assert.equal(summary.confirmed, 2); assert.equal(summary.pending, 3);
assert.equal(summary.counts['概念不清'], 1); assert.equal(summary.counts['未归因'], 3);
assert.equal(summary.counts['自定义原因'], 1);

for (const subject of subjects) {
  const folder = path.join(__dirname, '..', subject.folder), app = require(path.join(folder, 'app.js'));
  const rows = new Map(), db = {
    failWrite: false,
    getItem: key => rows.get(key) ?? null,
    setItem(key, value) { if (this.failWrite) throw Error('test quota failure'); rows.set(key, String(value)); }
  };
  const context = vm.createContext({ console, setTimeout: () => 0, localStorage: db, StudyReview, StudyStorage });
  const run = code => vm.runInContext(code, context);
  for (const file of fs.readdirSync(folder).filter(file => /^data-q.*\.js$/.test(file))) run(fs.readFileSync(path.join(folder, file), 'utf8'));
  run(fs.readFileSync(path.join(folder, 'app.js'), 'utf8'));
  run(`load(); todayStr = () => '${today}'; renderDash = () => {}; renderMistakeList = () => {};
    const q = QUESTIONS.find(q => q.type === 'choice'), wrong = (q.ans + 1) % q.opts.length;
    recordAnswer(q, false, wrong);`);
  const state = () => clone(run('S'));
  const originalId = state().mistakes[0].id;
  assert.equal(state().mistakes[0].reason, '未归因');
  assert.equal(state().mistakes[0].reasonConfirmed, false);
  assert.equal(state().mistakes[0].nextReview, '2026-10-24');
  run(`S.mistakes[0].stage = 4; S.mistakes[0].nextReview = '2026-11-07';
    S.mistakes[0].history.push({date: '2026-10-01', ok: true});
    StudyReview.setReason(S.mistakes[0], REASONS[1], true, '${at}');
    recordAnswer(q, false, wrong);`);
  let m = state().mistakes[0];
  assert.equal(m.id, originalId); assert.equal(state().mistakes.length, 1);
  assert.equal(m.stage, 0); assert.equal(m.nextReview, today); assert.equal(m.history.length, 1);
  assert.equal(m.reason, app.REASONS[1], '保留此前标签但重新待确认');
  assert.equal(m.reasonConfirmed, false);
  assert.equal(m.recurrences[0].fromStage, 4);
  assert.equal(m.recurrences[0].fromNextReview, '2026-11-07');
  assert.equal(m.recurrences[0].previousReasonConfirmed, true);
  assert.equal(m.recurrences[0].attemptId, state().attempts[1].id);
  assert.equal(run("confirmMistakeReason(S.mistakes[0].id, '无效原因')"), false);

  // Failed confirmation/review writes must leave both active state and primary bytes intact.
  let before = state(), raw = db.getItem(subject.key); db.failWrite = true;
  assert.equal(run('confirmMistakeReason(S.mistakes[0].id, REASONS[1])'), false);
  assert.deepEqual(state(), before); assert.equal(db.getItem(subject.key), raw);
  assert.equal(run('review(S.mistakes[0].id, true)'), false);
  assert.deepEqual(state(), before); assert.equal(db.getItem(subject.key), raw);
  db.failWrite = false;
  assert.equal(run('confirmMistakeReason(S.mistakes[0].id, REASONS[1])'), true);
  assert.equal(state().mistakes[0].reasonConfirmed, true);
  assert.equal(run('review(S.mistakes[0].id, true)'), true);
  m = state().mistakes[0]; assert.equal(m.stage, 1); assert.equal(m.nextReview, '2026-10-25');
  assert.equal(m.history.length, 2);
  before = state(); raw = db.getItem(subject.key);
  assert.equal(run('review(S.mistakes[0].id, true)'), false, '同日连点不能跳过复习间隔');
  assert.deepEqual(state(), before); assert.equal(db.getItem(subject.key), raw);

  run('recordAnswer(q, false, wrong);');
  assert.equal(state().mistakes[0].nextReview, today, '当天复习通过后再次答错仍应重开今日任务');
  assert.equal(state().mistakes[0].reasonConfirmed, false);
  assert.equal(run('review(S.mistakes[0].id, false)'), true);
  assert.equal(state().mistakes[0].nextReview, '2026-10-24');
  assert.equal(run('review(S.mistakes[0].id, false)'), false);
  run(`S.mistakes[0].mastered = true; S.mistakes[0].stage = 6; S.mistakes[0].nextReview = null;
    recordAnswer(q, false, wrong);`);
  m = state().mistakes[0];
  assert.equal(m.id, originalId); assert.equal(state().mistakes.length, 1);
  assert.equal(m.mastered, false); assert.equal(m.stage, 0); assert.equal(m.nextReview, today);
  assert.equal(m.history.length, 3); assert.equal(m.recurrences.length, 3);
  assert.equal(m.recurrences[2].wasMastered, true);

  const config = { key: subject.key, subjectId: subject.id, maxScore: ['math2', '408'].includes(subject.id) ? 150 : 100, syllabus: app.SYLLABUS, defaults: app.defaultState, getStorage: () => db };
  const store = StudyStorage.create(config), loaded = store.read().state;
  assert.deepEqual(loaded.mistakes, state().mistakes);
  assert.deepEqual(store.prepareImport(JSON.stringify(store.backup(loaded))).state.mistakes, loaded.mistakes);
  const legacy = clone(loaded);
  for (const key of ['reasonConfirmed', 'reasonConfirmedAt', 'recurrences', 'lastWrongAt']) delete legacy.mistakes[0][key];
  legacy.mistakes[0].reason = '旧版自定义原因';
  const imported = store.prepareImport(JSON.stringify(legacy)).state.mistakes[0];
  assert.equal(imported.reason, '旧版自定义原因');
  assert.equal(Object.hasOwn(imported, 'recurrences'), false, '不能补造旧复发记录');
  assert.equal(StudyReview.reasonStatus(imported).category, '未归因');

  // Save unrelated edits without silently confirming an old/custom label.
  context.editFields = Object.fromEntries(Object.entries({ eSrc: '手工题源', eChapter: m.chapterId, eReason: '旧版自定义原因', eDate: today, eDesc: '编辑题目', eWrong: '编辑错解', eCorrect: '编辑解析' }).map(([id, value]) => [id, { value }]));
  context.editFields.eReasonConfirmed = { checked: false };
  run("S.mistakes[0].reason = '旧版自定义原因'; delete S.mistakes[0].reasonConfirmed; el = id => editFields[id]; closeModal = () => {}; saveMistakeEdit({preventDefault(){}}, S.mistakes[0].id);");
  assert.equal(state().mistakes[0].reason, '旧版自定义原因'); assert.equal(state().mistakes[0].reasonConfirmed, false);
  context.editFields.eReasonConfirmed.checked = true;
  run('saveMistakeEdit({preventDefault(){}}, S.mistakes[0].id);');
  assert.equal(state().mistakes[0].reasonConfirmed, true);
  before = state(); db.failWrite = true;
  assert.equal(run('toggleMastered(S.mistakes[0].id)'), false);
  assert.deepEqual(state(), before, '手工标记掌握也应在写入失败时回滚');
  db.failWrite = false;

  const manual = { mDate: today, mSrc: '手工题源', mChapter: m.chapterId, mReason: '未归因', mDesc: '手工错题', mWrong: '', mCorrect: '解析' };
  for (const [id, value] of Object.entries(manual)) context.editFields[id] = { value };
  context.editFields.mistakeAdd = { removeAttribute() {} };
  run('onMistakeSubmit({preventDefault(){}, target:{reset(){}}});');
  assert.equal(state().mistakes[0].reasonConfirmed, false);
  context.editFields.mReason.value = app.REASONS[1];
  run('onMistakeSubmit({preventDefault(){}, target:{reset(){}}});');
  assert.equal(state().mistakes[0].reasonConfirmed, true, '手工明确选择原因可以计入统计');
  before = state(); db.failWrite = true;
  run('onMistakeSubmit({preventDefault(){}, target:{reset(){ throw Error("must retain failed form"); }}});');
  assert.deepEqual(state(), before, '入本保存失败应保留表单和原状态');
  db.failWrite = false;

  const mutations = [
    m => { m.reasonConfirmed = 'true'; }, m => { m.reasonConfirmedAt = '2026-02-30T02:00:00.000Z'; },
    m => { m.recurrences = {}; }, m => { m.recurrences[0].fromStage = 1.5; },
    m => { m.recurrences[0].wrong = {}; }, m => { m.recurrences[0].date = '2026-13-01'; },
    m => { m.recurrences[1].attemptId = m.recurrences[0].attemptId; }
  ];
  for (const mutate of mutations) {
    const invalid = clone(loaded); mutate(invalid.mistakes[0]);
    assert.throws(() => store.prepareImport(JSON.stringify(invalid)));
    const raw = JSON.stringify(invalid), isolated = { getItem: () => raw, setItem: () => { throw Error('must never write corrupt records'); } };
    const protectedStore = StudyStorage.create({ ...config, getStorage: () => isolated });
    const fallback = protectedStore.read().state;
    assert.equal(protectedStore.info().locked, true); assert.equal(protectedStore.original(), raw);
    assert.equal(protectedStore.save(fallback), false);
  }
  console.log('PASS ' + subject.name + ' · 复发重排与历史 / 同日防连评 / 明确归因 / 保存失败回滚 / 旧版及备份校验');
}
console.log('PASS review calendar / overdue priority / attempt idempotency / explicit reason distribution');
