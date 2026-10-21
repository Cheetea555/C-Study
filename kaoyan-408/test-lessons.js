/* 教学数据完整性校验：node test-lessons.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const P = require('./app.js');
const Q = require('./data-q1.js').QUESTIONS.concat(require('./data-q2.js').QUESTIONS);
const ALLQ = new Set(Q.map(q => q.id));
const L = Object.assign({}, require('./data-lessons1.js').LESSONS, require('./data-lessons2.js').LESSONS);

// 加载 mathHtml（app.js 在 Node 下不执行 DOM 初始化）
const src = fs.readFileSync('app.js', 'utf8');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={mathHtml:mathHtml};')(mod, mod.exports);
const mathHtml = mod.exports.mathHtml;

const ids = new Set();
let total = 0, exCount = 0, quizRefs = 0;

P.SYLLABUS.forEach(c => {
  const arr = L[c.id];
  assert.ok(Array.isArray(arr) && arr.length >= 2, c.id + ' 教学课程数不足（应 ≥ 2）');
  arr.forEach(les => {
    total++;
    assert.ok(les.id && !ids.has(les.id), '课程 id 重复或缺失: ' + les.id);
    ids.add(les.id);
    assert.strictEqual(les.ch, c.id, les.id + ' 的 ch 与所属章节不符');
    assert.ok(les.title && les.title.length >= 4, les.id + ' 标题过短');
    assert.ok(les.mins >= 10 && les.mins <= 40, les.id + ' mins 非法');
    assert.ok(les.goal && les.goal.length >= 8, les.id + ' goal 缺失');
    assert.ok(Array.isArray(les.concept) && les.concept.length >= 3, les.id + ' concept 不足 3 条');
    assert.ok(Array.isArray(les.examples) && les.examples.length >= 2, les.id + ' 例题不足 2 道');
    les.examples.forEach(e => {
      exCount++;
      assert.ok(e.q && e.sol && e.sol.length >= 10, les.id + ' 例题内容缺失');
    });
    assert.ok(Array.isArray(les.pitfalls) && les.pitfalls.length >= 1, les.id + ' 缺常见错误');
    assert.ok(Array.isArray(les.pts) && les.pts.length >= 1, les.id + ' pts 缺失');
    les.pts.forEach(p => assert.ok(Number.isInteger(p) && p >= 0 && p < c.points.length, les.id + ' 知识点下标越界: ' + p));
    les.quiz.forEach(qid => {
      quizRefs++;
      assert.ok(ALLQ.has(qid), les.id + ' 配套题不存在: ' + qid);
    });
    // 排版标记可解析
    const texts = [les.goal].concat(les.concept, les.pitfalls)
      .concat(les.examples.reduce((a, e) => a.concat([e.q, e.sol]), []));
    texts.forEach(s => {
      const r = mathHtml(s);
      assert.ok(r.indexOf('@{') < 0 && r.indexOf('@m{') < 0 && r.indexOf('@d{') < 0, les.id + ' 存在未解析标记');
      assert.ok(r.indexOf('undefined') < 0, les.id + ' 渲染出 undefined');
    });
  });
});

console.log('✅ 408 教学数据校验通过：' + total + ' 课 · ' + exCount + ' 道例题 · ' + quizRefs +
  ' 个配套题引用全部有效 · 排版标记全部可解析');
