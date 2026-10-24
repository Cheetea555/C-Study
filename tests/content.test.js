/* 固定 ID 迁移、引用完整性与真实作答流程：node tests/content.test.js。 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const StudyReview = require('../assets/review.js');
const Storage = require('../assets/storage.js');
const Content = require('../assets/content.js');
const Common = require('../assets/common.js');
const root = path.resolve(__dirname, '..'), allIds = new Set();
for (const subject of Common.subjects) {
  const folder = path.join(root, subject.folder), app = require(path.join(folder, 'app.js'));
  const files = fs.readdirSync(folder);
  const questions = files.filter(f => /^data-q.*\.js$/.test(f)).flatMap(f => require(path.join(folder, f)).QUESTIONS);
  const lessons = Object.assign({}, ...files.filter(f => /^data-lessons.*\.js$/.test(f)).map(f => require(path.join(folder, f)).LESSONS));
  const catalog = new Map(), covered = new Set();
  app.SYLLABUS.forEach(ch => ch.points.forEach(point => {
    assert.match(point.id, new RegExp('^' + subject.id + '\\.'));
    assert.equal(allIds.has(point.id), false, '考点 ID 不可重复：' + point.id);
    assert.equal(catalog.has(point.legacyKey), false, '迁移键不可重复');
    assert.equal(typeof point.title, 'string'); allIds.add(point.id); catalog.set(point.legacyKey, point.id);
  }));
  for (const [chapterId, rows] of Object.entries(lessons)) for (const lesson of rows) {
    assert.equal(Object.hasOwn(lesson, 'pts'), false, '新课程不再引用数组下标');
    lesson.pointIds.forEach(id => {
      assert.ok(app.SYLLABUS.find(ch => ch.id === chapterId).points.some(point => point.id === id), '课程跨章或悬空引用：' + lesson.id);
      covered.add(id);
    });
    lesson.quiz.forEach(id => assert.ok(questions.some(q => q.id === id)));
  }
  for (const id of catalog.values()) assert.ok(covered.has(id), '缺少课程覆盖：' + id);
  questions.forEach(q => (q.pointIds || []).forEach(id => assert.ok(app.SYLLABUS.find(ch => ch.id === q.ch).points.some(point => point.id === id), '题目考点不存在或跨章')));

  const stored = new Map(), db = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)) };
  const old = app.defaultState(), firstPoint = app.SYLLABUS[0].points[0];
  delete old.attempts;
  old.kp[firstPoint.legacyKey] = { status: 3, updatedAt: '2026-10-23' };
  old.kp['orphan-999'] = { status: 1 };
  old.qz[questions[0].id] = { ok: false, times: 7, lastAt: '2026-10-22' };
  const original = JSON.stringify(old); stored.set(subject.key, original);
  const config = { key: subject.key, subjectId: subject.id, maxScore: ['math2', '408'].includes(subject.id) ? 150 : 100, syllabus: app.SYLLABUS, defaults: app.defaultState, getStorage: () => db };
  const store = Storage.create(config), migrated = store.read().state;
  assert.equal(migrated.kp[firstPoint.id].status, 3);
  assert.equal(Object.hasOwn(migrated.kp, firstPoint.legacyKey), false);
  assert.equal(migrated.kp['orphan-999'].status, 1, '未知旧键仍保留');
  assert.equal(migrated.attempts.length, 0, '旧聚合次数不应补造历史');
  assert.equal(stored.get(subject.key), original, '读取迁移不能提前覆盖原文');
  assert.equal(store.save(migrated), true);
  assert.equal(stored.get(subject.key + '.previous'), original);
  const reordered = app.SYLLABUS.map(ch => ({ ...ch, points: ch.points.slice().reverse() }));
  const reload = Storage.create({ ...config, syllabus: reordered }).read().state;
  assert.deepEqual(reload.kp, migrated.kp, '重排显示顺序不能改变掌握记录');
  assert.deepEqual(store.prepareImport(JSON.stringify(store.backup(reload))).state.kp, migrated.kp, '重复迁移应保持幂等');

  const context = vm.createContext({ StudyReview, console, setTimeout: () => 0, localStorage: db, StudyStorage: Storage, StudyContent: Content });
  for (const file of files.filter(f => /^data-(?:q|lessons).*\.js$/.test(f))) vm.runInContext(fs.readFileSync(path.join(folder, file), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(folder, 'app.js'), 'utf8'), context);
  vm.runInContext(`
    load();
    const choice = QUESTIONS.find(q => q.type === 'choice');
    recordAnswer(choice, true, choice.ans);
    if (S.attempts.length !== 1 || S.attempts[0].isFirst) throw Error('不能将旧题重做当作首答');
    const fresh = QUESTIONS.find(q => q.type === 'choice' && !S.qz[q.id]);
    recordAnswer(fresh, false, (fresh.ans + 1) % fresh.opts.length);
    recordAnswer(fresh, true, fresh.ans);
    if (!S.attempts[1].isFirst || S.attempts[2].isFirst || S.attempts[1].correct || !S.attempts[2].correct) throw Error('首答和重做记录混淆');
    if (S.qz[fresh.id].times !== 2) throw Error('旧聚合指标未更新');
    this.document = {getElementById: () => ({}), querySelectorAll: () => []};
    const originalStats = renderStats, originalMistakes = renderMistakeList;
    let statsRefreshes = 0, mistakeRefreshes = 0;
    renderStats = () => statsRefreshes++;
    renderMistakeList = () => mistakeRefreshes++;
    goTab('stats'); goTab('mistake');
    if (statsRefreshes !== 1 || mistakeRefreshes !== 1) throw Error('进入页面时未刷新最新作答记录');
    renderStats = originalStats; renderMistakeList = originalMistakes;
    delete this.document;
  `, context);
  const saved = JSON.parse(stored.get(subject.key));
  assert.equal(saved.attempts.length, 3);
  assert.deepEqual(Common.attemptSummary(saved.attempts), { total: 3, correct: 2, firstTotal: 1, firstCorrect: 0 });
  const sample = {
    math2: ['math2.c01.p09', 'L01-3', ['q01-1', 'q01-2', 'q01-4']],
    '408': ['408.ds03.p04', 'Lds03-1', ['Qds03-1', 'Qds03-2']],
    en2: ['en2.e03.p02', 'Le03-2', ['Qe03-1', 'Qe03-2', 'Qe03-3']],
    politics: ['politics.p04.p02', 'Lp04-1', ['Qp04-3']]
  }[subject.id];
  const [pointId, lessonId, expectedIds] = sample, index = Content.create(app.SYLLABUS, lessons, questions);
  assert.deepEqual(index.questionsFor(pointId).map(question => question.id), expectedIds);
  assert.ok(index.lessonsFor(pointId).some(lesson => lesson.id === lessonId));
  assert.ok(Content.pointLinks(index, pointId).includes(lessonId));
  assert.ok(Content.lessonPoints(index, Object.values(lessons).flat().find(lesson => lesson.id === lessonId)).includes('data-focus-point="' + pointId + '"'));
  vm.runInContext(`
    renderPractice = renderLearn = renderDash = renderKP = () => {};
    el = () => ({value: ''}); goTab = () => {};
    const attemptsBeforePoint = S.attempts.length;
    pqSession = { qid: ${JSON.stringify(expectedIds[0])}, picked: 0, revealed: true, judged: true };
    practicePoint(${JSON.stringify(pointId)});
    if (filteredQuestions().map(q => q.id).join(',') !== ${JSON.stringify(expectedIds.join(','))}) throw Error('四科专项题集错误');
    if (pqSession.revealed || pqSession.judged || S.attempts.length !== attemptsBeforePoint) throw Error('进入专项练习泄露答案或自动作答');
    const targetQuestion = QUESTIONS.find(q => q.id === ${JSON.stringify(expectedIds[0])});
    recordAnswer(targetQuestion, true, targetQuestion.type === 'choice' ? targetQuestion.ans : -1);
    if (S.attempts.at(-1).mode === 'lesson' || !S.attempts.at(-1).pointIds.includes(${JSON.stringify(pointId)})) throw Error('专项练习模式或考点记录错误');
    if (!relatedKnowledgeHtml(targetQuestion.id).includes(${JSON.stringify(lessonId)})) throw Error('四科解析缺少回看课程');
    practicePoint('missing.point');
    if (filteredQuestions().length) throw Error('无效专项链接不能扩大为整科题库');
  `, context);
  if (subject.id === '408') {
    const index = Content.create(app.SYLLABUS, lessons, questions);
    const related = index.related('Qds02-3');
    assert.deepEqual(related.map(item => item.point.id), ['408.ds02.singly-linked-list']);
    assert.ok(related[0].lessons.some(l => l.id === 'Lds02-2'));
    assert.deepEqual(index.questionsFor('408.ds02.singly-linked-list').map(q => q.id), ['Qds02-2', 'Qds02-3']);
    vm.runInContext(`
      renderPractice = renderLearn = renderDash = renderKP = () => {};
      el = () => ({value: ''}); goTab = () => {};
      markLesson('Lds02-2');
      if (S.kp['408.ds02.singly-linked-list'].status !== 1) throw Error('学完课程未标记固定考点');
      practicePoint('408.ds02.singly-linked-list');
      if (filteredQuestions().map(q => q.id).join(',') !== 'Qds02-2,Qds02-3') throw Error('考点题集不正确');
      if (pqSession.revealed) throw Error('专项练习不应直接泄露历史答案');
      const linked = QUESTIONS.find(q => q.id === 'Qds02-3');
      recordAnswer(linked, false, 0);
      if (!S.attempts.at(-1).pointIds.includes('408.ds02.singly-linked-list')) throw Error('作答未保留考点');
      const links = relatedKnowledgeHtml('Qds02-3');
      if (!links.includes('Lds02-2') || !links.includes('408.ds02.singly-linked-list')) throw Error('缺少返回课程链接');
    `, context);
  }
  console.log('PASS ' + subject.name + ' · 固定 ID / 全考点课程覆盖 / 旧进度迁移与重排 / 逐次作答');
}
assert.equal(allIds.size, 420);
const deepLink = Content.route('learn', { lesson: 'Lds02-2', point: '408.ds02.singly-linked-list' });
assert.deepEqual(Content.parseRoute(deepLink), { tab: 'learn', lesson: 'Lds02-2', point: '408.ds02.singly-linked-list', question: null, card: null, text: '' });
assert.deepEqual(Content.parseRoute('#pq?point=408.ds02.singly-linked-list'), { tab: 'pq', lesson: null, point: '408.ds02.singly-linked-list', question: null, card: null, text: '' });
const unsafeIndex = Content.create([{id:'c',points:[{id:'p',title:'<img onerror="bad">'}]}], {c:[{id:'l',pointIds:['p'],title:'<script>bad</script>'}]}, [{id:'q',pointIds:['p']}]);
assert.ok(Content.relatedHtml(unsafeIndex, 'q').includes('&lt;script&gt;'));
assert.ok(!Content.relatedHtml(unsafeIndex, 'q').includes('<img'));
const detached = unsafeIndex.questionsFor('p'); detached.length = 0;
assert.equal(unsafeIndex.questionsFor('p').length, 1, '查询返回值不能改写反向索引');
console.log('PASS 四科专项练习与回看 / 无效链接不扩展 / 深链接与安全渲染');
