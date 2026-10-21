/* 题库与详解数据校验：node test-data.js */
'use strict';
const assert = require('assert');
const P = require('./app.js');
const NOTES = require('./data-notes.js').NOTES;
const Q = require('./data-q.js').QUESTIONS;

const chIds = new Set(P.SYLLABUS.map(c => c.id));
const ids = new Set();
Q.forEach(q => {
  assert.ok(q.id && !ids.has(q.id), '重复 id: ' + q.id);
  ids.add(q.id);
  assert.ok(chIds.has(q.ch), q.id + ' 章节不存在: ' + q.ch);
  assert.ok([1, 2, 3].includes(q.diff) && ['choice', 'fill', 'solve'].includes(q.type), q.id + ' diff/type 非法');
  assert.ok(q.q.length >= 5 && q.sol.length >= 10, q.id + ' 题干或解析过短');
  if (q.type === 'choice'){
    assert.strictEqual(q.opts.length, 4, q.id + ' 选项数');
    assert.ok(Number.isInteger(q.ans) && q.ans >= 0 && q.ans < 4, q.id + ' 答案下标');
  } else {
    assert.ok(typeof q.ans === 'string' && q.ans.length >= 1, q.id + ' 答案缺失');
  }
});
P.SYLLABUS.forEach(c => {
  assert.strictEqual(Q.filter(q => q.ch === c.id).length, 5, c.id + ' 题目数应为 5');
  assert.ok(NOTES[c.id] && NOTES[c.id].sections.length >= 2, c.id + ' 缺详解');
});
console.log('✅ 英语二题库 ' + Q.length + ' 题（8 章 × 5），详解 8/8 章覆盖，校验通过');
