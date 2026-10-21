/* 题库与详解数据完整性校验：node test-data.js */
'use strict';
const assert = require('assert');
const P = require('./app.js');
const NOTES = require('./data-notes.js').NOTES;
const Q1 = require('./data-q1.js').QUESTIONS;
const Q2 = require('./data-q2.js').QUESTIONS;
const ALL = Q1.concat(Q2);

const chIds = new Set(P.SYLLABUS.map(c => c.id));
const ids = new Set();

ALL.forEach(q => {
  assert.ok(q.id && !ids.has(q.id), '重复或缺失 id: ' + q.id);
  ids.add(q.id);
  assert.ok(chIds.has(q.ch), q.id + ' 的章节 ' + q.ch + ' 不在大纲中');
  assert.ok([1, 2, 3].includes(q.diff), q.id + ' 难度取值非法');
  assert.ok(['choice', 'fill', 'solve'].includes(q.type), q.id + ' 题型非法');
  assert.ok(typeof q.q === 'string' && q.q.length >= 5, q.id + ' 题干过短');
  assert.ok(typeof q.sol === 'string' && q.sol.length >= 10, q.id + ' 解析过短');
  if (q.type === 'choice'){
    assert.ok(Array.isArray(q.opts) && q.opts.length === 4, q.id + ' 选项数必须为 4');
    assert.ok(Number.isInteger(q.ans) && q.ans >= 0 && q.ans < q.opts.length, q.id + ' 答案下标非法');
  } else {
    assert.ok(typeof q.ans === 'string' && q.ans.length >= 1, q.id + ' 答案缺失');
  }
});

// 每章至少 4 题、每章有详解
P.SYLLABUS.forEach(c => {
  const n = ALL.filter(q => q.ch === c.id).length;
  assert.ok(n >= 4, c.id + ' 题目数为 ' + n + '，应 ≥ 4');
  assert.ok(NOTES[c.id] && Array.isArray(NOTES[c.id].sections) && NOTES[c.id].sections.length >= 2, c.id + ' 缺少知识点详解');
  NOTES[c.id].sections.forEach(s => assert.ok(s.h && Array.isArray(s.ul) && s.ul.length >= 1, c.id + ' 详解小节结构错误'));
});

const bySub = {};
P.SYLLABUS.forEach(c => { bySub[c.subject] = (bySub[c.subject] || 0) + ALL.filter(q => q.ch === c.id).length; });
console.log('✅ 408 题库共 ' + ALL.length + ' 题（' +
  Object.keys(bySub).map(k => k + ' ' + bySub[k]).join(' / ') +
  '），详解覆盖 ' + Object.keys(NOTES).length + '/26 章，结构校验全部通过');
