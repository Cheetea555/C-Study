/* 教学数据校验：node test-lessons.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const P = require('./app.js');
const ALLQ = new Set(require('./data-q.js').QUESTIONS.map(q => q.id));
const L = require('./data-lessons.js').LESSONS;

const src = fs.readFileSync('app.js', 'utf8');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={mathHtml:mathHtml};')(mod, mod.exports);
const mathHtml = mod.exports.mathHtml;

let total = 0, ex = 0, refs = 0;
const ids = new Set();
P.SYLLABUS.forEach(c => {
  const arr = L[c.id];
  assert.ok(Array.isArray(arr) && arr.length >= 2, c.id + ' 课程数不足');
  arr.forEach(les => {
    total++;
    assert.ok(les.id && !ids.has(les.id), '课程 id 重复: ' + les.id);
    ids.add(les.id);
    assert.strictEqual(les.ch, c.id, les.id + ' ch 不符');
    assert.ok(les.title.length >= 4 && les.goal.length >= 8, les.id + ' 标题/目标缺失');
    assert.ok(les.concept.length >= 3, les.id + ' concept 不足 3 条');
    assert.ok(les.examples.length >= 1, les.id + ' 缺例题');
    assert.ok(les.examples.length >= 1 || true, '');
    les.examples.forEach(e => { ex++; assert.ok(e.q && e.sol && e.sol.length >= 10, les.id + ' 例题内容缺失'); });
    assert.ok(les.pitfalls.length >= 1, les.id + ' 缺常见错误');
    les.pts.forEach(p => assert.ok(Number.isInteger(p) && p >= 0 && p < c.points.length, les.id + ' pts 越界'));
    les.quiz.forEach(qid => { refs++; assert.ok(ALLQ.has(qid), les.id + ' 配套题不存在: ' + qid); });
    [les.goal].concat(les.concept, les.pitfalls, les.examples.flatMap(e => [e.q, e.sol])).forEach(s => {
      const r = mathHtml(s);
      assert.ok(r.indexOf('@{') < 0 && r.indexOf('undefined') < 0, les.id + ' 排版异常');
    });
  });
});
console.log('✅ 政治教学数据：' + total + ' 课 · ' + ex + ' 道例题 · ' + refs + ' 个配套题引用全部有效');
