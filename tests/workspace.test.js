/* Run with: node tests/workspace.test.js. No browser or external dependencies. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../assets/common.js');
const root = path.resolve(__dirname, '..');

assert.equal(C.summary(null, '2026-10-23'), null);
assert.equal(C.summary({ settings: {}, logs: {} }, '2026-10-23'), null);
const legacy = {
  settings: {}, logs: [{ date: '2026-10-23', minutes: 25 }, { date: '2026-10-22', minutes: 90 }],
  mistakes: [{ nextReview: '2026-10-21', mastered: false }, { nextReview: '2026-10-23', mastered: true }, { nextReview: '2026-10-24' }]
};
assert.deepEqual(C.summary(legacy, '2026-10-23'), { minutes: 25, due: 1, mastered: 0, learned: 0, lastVisit: 0 });
assert.equal(C.esc('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
assert.equal(C.localDate(new Date(2026, 0, 2)), '2026-01-02');

for (const subject of C.subjects) {
  const folder = path.join(root, subject.folder);
  const app = require(path.join(folder, 'app.js'));
  assert.equal(subject.points, app.SYLLABUS.reduce((n, ch) => n + ch.points.length, 0), subject.name + ' portal point count');
  let questionCount = 0, lessonCount = 0;
  const context = vm.createContext({
    console, setTimeout: () => 0,
    localStorage: { setItem() {}, getItem() { return null; } }
  });
  for (const file of fs.readdirSync(folder).filter(f => /^data-q.*\.js$/.test(f))) {
    questionCount += require(path.join(folder, file)).QUESTIONS.length;
    vm.runInContext(fs.readFileSync(path.join(folder, file), 'utf8'), context, { filename: file });
  }
  for (const file of fs.readdirSync(folder).filter(f => /^data-lessons.*\.js$/.test(f))) {
    lessonCount += Object.values(require(path.join(folder, file)).LESSONS).flat().length;
  }
  assert.equal(subject.questions, questionCount, subject.name + ' portal question count');
  assert.equal(subject.lessons, lessonCount, subject.name + ' portal lesson count');
  const source = fs.readFileSync(path.join(folder, 'app.js'), 'utf8');
  vm.runInContext(source, context, { filename: subject.folder + '/app.js' });
  vm.runInContext(`
    S = defaultState();
    // Stub the presentation boundary only; execute actual engine actions below.
    renderPractice = function() {};
    renderDash = function() {};
    renderMistakeList = function() {};
    const choice = QUESTIONS.find(q => q.type === 'choice');
    recordAnswer(choice, false, (choice.ans + 1) % choice.opts.length);
    pqFilter = { ch: choice.ch, diff: 0, scope: 'wrong' };
    pqScopeSnapshot = null;
    pqIndex = 0;
    const beforeIds = filteredQuestions().map(q => q.id).join(',');
    pqSession = { qid: choice.id, revealed: true, picked: -1 };
    retryQuestion();
    if (pqSession.revealed || pqSession.picked !== -1 || pqSession.judged) throw Error('retry must hide the answer');
    if (S.qz[choice.id].times !== 1) throw Error('retry must retain answer history');
    pickOpt(choice.ans);
    if (!S.qz[choice.id].ok || S.qz[choice.id].times !== 2) throw Error('retake must record a new attempt');
    if (filteredQuestions().map(q => q.id).join(',') !== beforeIds) throw Error('question disappeared before feedback');
    pqScopeSnapshot = null;
    if (filteredQuestions().some(q => q.id === choice.id)) throw Error('new wrong-only set must exclude corrected question');
    pqFilter = { ch: '', diff: 0, scope: 'undone' }; pqScopeSnapshot = null;
    const undone = filteredQuestions(), firstUndone = undone[0];
    recordAnswer(firstUndone, true, firstUndone.type === 'choice' ? firstUndone.ans : -1);
    if (!filteredQuestions().some(q => q.id === firstUndone.id)) throw Error('undone set shifted after answer');
    pqFilter = { ch: '', diff: 0, scope: 'all' }; pqScopeSnapshot = null;
    const written = QUESTIONS.find(q => q.type !== 'choice');
    if (written) {
      pqIndex = QUESTIONS.indexOf(written);
      pqSession = { qid: written.id, picked: -1, revealed: false, judged: false };
      selfJudge(true);
      if (S.qz[written.id]) throw Error('self judgment must require revealing the answer');
      pqSession.revealed = true;
      selfJudge(true); selfJudge(false);
      if (S.qz[written.id].times !== 1 || !S.qz[written.id].ok) throw Error('duplicate self judgment recorded');
      retryQuestion();
      const html = practiceCard(written, QUESTIONS);
      if (html.includes('正确答案：')) throw Error('retake leaked the solution');
      pqSession.revealed = true;
      if (practiceCard(written, QUESTIONS).includes('本次答对了')) throw Error('old answer shown as current judgment');
    }
    let reported = null;
    this.StudyUI = { setStorageStatus(ok) { reported = ok; } };
    localStorage.setItem = function() { throw Error('quota exceeded'); };
    if (save() !== false || reported !== false) throw Error('storage failure was hidden');
    localStorage.setItem = function() {};
    if (save() !== true || reported !== true) throw Error('storage recovery was not reported');
  `, context, { filename: subject.folder + '/workspace-regressions' });
  console.log('PASS ' + subject.name + ' · retake / stable filters / self judgment / storage errors / portal counts');
}
console.log('PASS shared summary · old data / date / escaping');
