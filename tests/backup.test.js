/* Multi-key restore failures must retain exact originals. Uses only memory storage. */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs'), vm = require('node:vm');
const Storage = require('../assets/storage.js'), Planner = require('../assets/planner.js');
const catalog = require('../assets/plan-catalog.js'), Backup = require('../assets/backup.js');
const B = Backup.create(Storage, Planner, catalog), clone = value => JSON.parse(JSON.stringify(value));
function memory() {
  return { rows: new Map(), fail: null,
    getItem(key) { if (this.fail) this.fail('get', key); return this.rows.get(key) ?? null; },
    setItem(key, value) { if (this.fail) this.fail('set', key, value); this.rows.set(key, String(value)); },
    removeItem(key) { if (this.fail) this.fail('remove', key); this.rows.delete(key); } };
}
const apps = catalog.subjects.map(s => require(path.join('..', s.folder, 'app.js')));
function populated() {
  const db = memory();
  catalog.subjects.forEach((subject, i) => {
    const s = clone(subject.defaults), chapter = apps[i].SYLLABUS[0], point = chapter.points[0];
    const questionId = ['q01-1', 'Qds01-1', 'Qe01-1', 'Qp01-1'][i];
    s.logs.push({ id: 'log-1', date: '2026-10-24', chapterId: chapter.id, minutes: 25, note: '私人的学习备注' });
    s.lessons[subject.lessons[0].id] = { done: true, doneAt: '2026-10-24' };
    s.kp[point.legacyKey] = { status: 3, updatedAt: '2026-10-24' };
    s.qz[questionId] = { ok: false, times: 2, lastAt: '2026-10-24', lastPick: 1 };
    s.attempts.push({ id: 'attempt-1', questionId, answeredAt: '2026-10-24T08:00:00.000Z', correct: false, isFirst: true,
      maxScore: 1, score: 0, mode: 'practice', gradingMethod: 'automatic', answer: 1, pointIds: [point.id] });
    s.favF['F01'] = true;
    s.papers.push({ id: 'paper-1', date: '2026-10-24', score: 50, name: '验收套卷', type: '模拟', note: '自评成绩' });
    s.mistakes.push({ id: 'm-1', date: '2026-10-24', chapterId: chapter.id, source: '手工笔记', desc: '<img onerror="bad">', correct: '正确解法', wrong: '错解', reason: '', stage: 0, mastered: false, nextReview: '2026-10-25', history: [] });
    s.timer = { running: true, chapterId: chapter.id, startTs: Date.now() - 60000, accumSec: 30 };
    db.setItem(subject.key, JSON.stringify(s, null, 2));
  });
  db.setItem(Planner.KEY, JSON.stringify(Planner.defaults())); db.setItem('unrelated', 'keep me');
  return db;
}
const primary = db => B.specs.map(s => [s.key, db.getItem(s.key)]);
const source = populated(), sourceBytes = [...source.rows], pack = B.capture(source, 'http:');
assert.deepEqual([...source.rows], sourceBytes, '导出不可修改任何主记录或备份提醒');
assert.equal(B.describe(pack).complete, true); assert.equal(B.describe(pack).subjectCount, 4);
for (const entry of pack.entries.filter(e => e.id !== 'planner')) {
  assert.equal(entry.data.timer.running, false); assert.equal(entry.data.timer.startTs, 0);
  const original = JSON.parse(source.getItem(B.specs.find(s => s.id === entry.id).key));
  assert.equal(entry.data.timer.accumSec, 30 + Math.max(0, (Date.parse(pack.exportedAt) - original.timer.startTs) / 1000));
  assert.deepEqual(entry.data.mistakes, original.mistakes); assert.deepEqual(entry.data.logs, original.logs);
  for (const field of ['qz', 'attempts', 'papers', 'favF', 'lessons', 'kp']) assert.deepEqual(entry.data[field], original[field], field + '必须完整保留');
}
assert.equal(B.describe(B.capture(source, 'file:')).complete, false, '本地文件跨科可见性不能承诺完整');
const blank = memory(), missing = B.capture(blank, 'http:');
assert.ok(missing.entries.every(e => e.status === 'missing' && !e.data));
assert.equal(B.describe(missing).complete, false);
const broken = populated(); broken.setItem(catalog.subjects[0].key, '{broken');
const partial = B.capture(broken, 'https:'); assert.equal(partial.entries[0].status, 'error');
assert.equal(B.describe(partial).complete, false); assert.equal(broken.getItem(catalog.subjects[0].key), '{broken');
broken.fail = op => { if (op === 'get') throw Error('读取受限'); };
assert.ok(B.capture(broken).entries.every(e => e.status === 'error'));

const singles = catalog.subjects.map((s, i) => Storage.create({ subjectId: s.id, maxScore: s.maxScore, defaults: () => clone(s.defaults) }).backup(JSON.parse(source.getItem(s.key))));
let collected = B.collect(singles.slice(0, 2).map(JSON.stringify));
assert.equal(B.describe(collected).subjectCount, 2);
collected = B.collect(singles.slice(2).map(JSON.stringify).concat(JSON.stringify(Planner.defaults())), collected);
assert.equal(B.describe(collected).complete, true);
assert.deepEqual(B.collect([JSON.stringify(pack)]), B.normalize(pack));
for (const subject of catalog.subjects) {
  const single = B.extract(pack, subject.id);
  const prepared = Storage.create({ subjectId: subject.id, maxScore: subject.maxScore, defaults: () => clone(subject.defaults) }).prepareImport(JSON.stringify(single));
  assert.equal(single.subjectId, subject.id); assert.equal(prepared.unidentified, false);
  assert.equal(prepared.state.timer.running, false); assert.equal(prepared.state.attempts.length, 1);
}
assert.deepEqual(Planner.normalize(B.extract(pack, 'planner')), pack.entries[4].data);
assert.throws(() => B.extract(missing, 'math2'), /没有可下载/);
const collectedBefore = JSON.stringify(collected);
assert.throws(() => B.collect([JSON.stringify(singles[0])], collected), /重复/);
assert.throws(() => B.collect(['{invalid'], collected), /有效 JSON/);
assert.equal(JSON.stringify(collected), collectedBefore, '错误文件不得破坏已收集备份');
assert.throws(() => B.collect([JSON.stringify(pack), JSON.stringify(singles[0])]), /单独打开/);
assert.throws(() => B.collect([JSON.stringify(catalog.subjects[0].defaults)]), /无法确定科目/);
assert.throws(() => B.collect([JSON.stringify({ ...singles[0], subjectId: '408' })]), /其他科目|进度/);
const old = JSON.parse(source.getItem(catalog.subjects[0].key));
assert.equal(B.describe(B.collect([JSON.stringify(old)])).subjectCount, 1, '可识别科目的旧备份可以收集');
for (const mutate of [value => { value.schemaVersion = 999; }, value => { value.exportedAt = 'bad'; }, value => { value.entries.pop(); }, value => { value.entries[0].id = 'unknown'; }, value => { value.entries[1].id = value.entries[0].id; }, value => { value.entries[0].data.logs = {}; }, value => { value.entries[4].data.weights.math2 = -1; }]) {
  const invalid = clone(pack); mutate(invalid); assert.throws(() => B.normalize(invalid));
}
const unsafe = clone(pack); Object.defineProperty(unsafe.entries[0].data, '__proto__', { value: {}, enumerable: true });
assert.throws(() => B.normalize(unsafe), /不支持的字段/);

const target = populated(), originals = primary(target), plan = B.prepareRestore(target, pack, ['math2', 'planner']);
assert.deepEqual(primary(target), originals, '预览不能写入');
assert.throws(() => B.prepareRestore(target, pack, []), /至少一个/);
assert.throws(() => B.prepareRestore(target, partial, ['math2']), /没有可恢复/);
assert.throws(() => B.prepareRestore(target, pack, ['math2','math2']), /不重复/);
const changed = clone(catalog.subjects[0].defaults); changed.settings.dailyGoal = 77;
target.setItem(catalog.subjects[0].key, JSON.stringify(changed));
assert.throws(() => plan.commit(), /发生变化/); assert.equal(target.getItem(Backup.JOURNAL), null);
assert.throws(() => plan.commit(), /已使用/);

const destination = memory(); destination.setItem(catalog.subjects[0].key, '{damaged-original'); destination.setItem('unrelated', 'keep me');
const exactBefore = primary(destination), allIds = B.specs.map(s => s.id);
const success = B.prepareRestore(destination, pack, allIds).commit(); assert.equal(success.ok, true);
assert.equal(destination.getItem(catalog.subjects[0].key + '.recovery'), '{damaged-original');
assert.equal(destination.getItem('unrelated'), 'keep me');
const restored = JSON.parse(destination.getItem(catalog.subjects[0].key));
assert.equal(restored.subjectId, 'math2'); assert.equal(restored.timer.running, false); assert.equal(restored.logs.length, 1);
assert.ok(restored.revision >= 1); assert.equal(B.readJournal(destination).status, 'complete');
const realStore = Storage.create({ subjectId: 'math2', key: catalog.subjects[0].key, maxScore: 150, defaults: apps[0].defaultState, syllabus: apps[0].SYLLABUS, getStorage: () => destination });
assert.equal(realStore.read().state.kp[apps[0].SYLLABUS[0].points[0].id].status, 3, '旧考点由科目应用正常迁移');
assert.equal(B.rollback(destination).ok, true); assert.deepEqual(primary(destination), exactBefore, '回滚恢复原字节，并移除恢复前不存在的主键');
const plannerOnly = populated(), plannerBefore = primary(plannerOnly);
assert.equal(B.prepareRestore(plannerOnly, pack, ['planner']).commit().ok, true);
assert.deepEqual(primary(plannerOnly).slice(0, 4), plannerBefore.slice(0, 4), '只恢复设置不动各科');

for (const failure of ['journal', 'sidecar', 'second-main', 'after-write']) {
  const db = populated(), before = primary(db); let failed = false;
  db.fail = (op, key, value) => {
    const match = failure === 'journal' ? key === Backup.JOURNAL : failure === 'sidecar' ? key.endsWith('.recovery') : key === catalog.subjects[1].key;
    if (op === 'set' && match && !failed) {
      failed = true;
      if (failure === 'after-write') db.rows.set(key, value);
      throw Error('模拟写入失败');
    }
  };
  const prepared = B.prepareRestore(db, pack, allIds);
  if (failure === 'journal') assert.throws(() => prepared.commit(), /模拟写入失败/);
  else { const result = prepared.commit(); assert.equal(result.ok, false); assert.equal(result.recovery.ok, true); }
  assert.deepEqual(primary(db), before, failure + '：所有主记录必须回到原字节');
}

const stuck = populated(), stuckBefore = primary(stuck); let blockRollback = false;
stuck.fail = (op, key) => {
  if (op === 'set' && key === catalog.subjects[1].key) { blockRollback = true; throw Error('第二科失败'); }
  if (blockRollback && op === 'set' && key === catalog.subjects[0].key) throw Error('回滚暂时失败');
};
const failedRestore = B.prepareRestore(stuck, pack, allIds).commit();
assert.equal(failedRestore.ok, false); assert.equal(failedRestore.recovery.ok, false);
assert.equal(B.readJournal(stuck).status, 'rollback-incomplete');
stuck.fail = null;
assert.throws(() => B.prepareRestore(stuck, pack, ['planner']).commit(), /尚待处理/);
assert.equal(B.rollback(stuck).ok, true); assert.deepEqual(primary(stuck), stuckBefore, '可在重新打开页面后继续回滚');

const interrupted = populated(), interruptedBefore = primary(interrupted);
B.prepareRestore(interrupted, pack, allIds).commit();
const journal = B.readJournal(interrupted); journal.status = 'prepared';
interrupted.setItem(Backup.JOURNAL, JSON.stringify(journal));
journal.entries.slice(1).forEach(entry => interrupted.setItem(B.specs.find(s => s.id === entry.id).key, entry.before));
assert.equal(B.rollback(interrupted).ok, true); assert.deepEqual(primary(interrupted), interruptedBefore, '中断时一部分写入、一部分未写入也可还原');

const concurrent = populated(); let raced = false;
concurrent.fail = (op, key) => {
  if (op === 'set' && key === catalog.subjects[1].key && !raced) {
    raced = true; concurrent.rows.set(catalog.subjects[0].key, 'another tab changed it'); throw Error('中途外部更新');
  }
};
const raceResult = B.prepareRestore(concurrent, pack, allIds).commit();
assert.equal(raceResult.ok, false); assert.equal(raceResult.recovery.ok, false);
assert.equal(raceResult.recovery.results.find(row => row.id === 'math2').status, 'conflict');
assert.equal(concurrent.getItem(catalog.subjects[0].key), 'another tab changed it', '不能为回滚覆盖其他页面的新记录');
concurrent.fail = null;
const rawJournal = concurrent.getItem(Backup.JOURNAL);
assert.throws(() => B.rollback(concurrent, 'stale'), /已经变化/);
assert.throws(() => B.finishJournal(concurrent, 'stale'), /已经变化/);
B.finishJournal(concurrent, rawJournal);
assert.equal(concurrent.getItem(Backup.JOURNAL), null); assert.equal(concurrent.getItem(Backup.JOURNAL + '.previous'), rawJournal);
assert.equal(concurrent.getItem(catalog.subjects[0].key), 'another tab changed it');

const metadataFailure = populated(); let journalWrites = 0;
metadataFailure.fail = (op, key) => { if (op === 'set' && key === Backup.JOURNAL && ++journalWrites === 2) throw Error('状态保存失败'); };
const metadataResult = B.prepareRestore(metadataFailure, pack, allIds).commit();
assert.equal(metadataResult.ok, true); assert.ok(metadataResult.warning); assert.equal(B.readJournal(metadataFailure).status, 'prepared');
metadataFailure.fail = null; assert.equal(B.rollback(metadataFailure).ok, true);
const corruptJournal = memory(); corruptJournal.setItem(Backup.JOURNAL, '{bad-journal');
assert.throws(() => B.prepareRestore(corruptJournal, pack, ['math2']).commit());
B.finishJournal(corruptJournal, '{bad-journal'); assert.equal(corruptJournal.getItem(Backup.JOURNAL + '.previous'), '{bad-journal');
console.log('PASS full backup · read-only export / incomplete sources / collection and legacy identity / selected restore / exact rollback / quota and interruption / external conflicts / preserved originals');

// Exercise the asynchronous file-input path and the file:// write boundary without a real browser profile.
(async function pageChecks() {
  for (const protocol of ['file:', 'http:']) {
    const db = memory(), elements = new Map(), downloads = [];
    function element(id) {
      if (!elements.has(id)) elements.set(id, { hidden: false, disabled: false, value: '', innerHTML: '', textContent: '', handlers: {},
        addEventListener(name, handler) { this.handlers[name] = handler; }, focus() {}, scrollIntoView() {} });
      return elements.get(id);
    }
    const context = vm.createContext({ window: { StudyCommon: require('../assets/common'), StudyStorage: { ...Storage, download: (value, filename) => downloads.push({ value, filename }) },
      StudyBackup: Backup, StudyPlanner: Planner, StudyPlanCatalog: catalog, addEventListener() {} },
      document: { getElementById: element, querySelectorAll: () => [] }, localStorage: db, location: { protocol }, console });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/backup-page.js'), 'utf8'), context);
    const file = value => ({ size: 1024, text: async () => JSON.stringify(value) });
    let finishRead;
    const reading = element('backupFiles').handlers.change({ target: { files: [{ size: 1024, text: () => new Promise(resolve => { finishRead = resolve; }) }, file(singles[1])] } });
    assert.equal(element('previewRestore').disabled, true); assert.equal(element('resetCollection').disabled, true);
    element('previewRestore').handlers.click(); assert.match(element('backupWarning').textContent, /正在读取/);
    assert.equal(db.rows.size, 0, '文件未读完时不能提交旧的恢复预览');
    finishRead(JSON.stringify(singles[0])); await reading;
    assert.match(element('importCompleteness').textContent, /2\/4/); assert.equal(db.rows.size, 0, '选择文件不能写入记录');
    assert.equal(element('previewRestore').disabled, protocol === 'file:');
    await element('backupFiles').handlers.change({ target: { files: [file(singles[2]), { size: 100, text: async () => '{broken' }] } });
    assert.match(element('backupWarning').textContent, /有效 JSON/); assert.match(element('importCompleteness').textContent, /2\/4/, '文件批次失败不保留半份收集结果');
    await element('backupFiles').handlers.change({ target: { files: [{ size: 100, text: async () => { throw Error('读取失败'); } }] } });
    assert.match(element('backupWarning').textContent, /读取失败/); assert.equal(element('backupFiles').disabled, false);
    element('extractBackups').handlers.click({ target: { closest: () => ({ dataset: { extractBackup: 'math2' } }) } });
    assert.equal(downloads[0].value.format, 'c-study-backup'); assert.equal(downloads[0].value.subjectId, 'math2');
    if (protocol === 'file:') {
      element('previewRestore').handlers.click(); element('commitRestore').handlers.click();
      element('previewRollback').handlers.click(); element('commitJournalAction').handlers.click();
      assert.equal(db.rows.size, 0, 'file:// 不允许在总页写入看似完成、各科却无法读取的恢复结果');
      assert.match(element('backupWarning').textContent, /本地文件模式/);
    }
  }
  console.log('PASS backup page · async multi-file collection / failed-batch preservation / extracted downloads / file-mode write boundary');
})().catch(error => { console.error(error); process.exitCode = 1; });
