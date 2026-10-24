/* 速查卡手册数据校验：node test-formulas.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const { FORMULAS, FORMULA_CATS } = require('./data-formulas.js');

const src = fs.readFileSync('app.js', 'utf8');
const mod = { exports: {} };
new Function('module', 'exports', 'StudyReview', src + '\nmodule.exports={mathHtml:mathHtml};')(mod, mod.exports, require('../assets/review.js'));
const mathHtml = mod.exports.mathHtml;

const catIds = new Set(FORMULA_CATS.map(c => c.id));
const ids = new Set();
const byCat = {};

FORMULAS.forEach(f => {
  assert.ok(f.id && !ids.has(f.id), '速查卡 id 重复或缺失: ' + f.id);
  ids.add(f.id);
  assert.ok(catIds.has(f.cat), f.id + ' 分类不存在: ' + f.cat);
  byCat[f.cat] = (byCat[f.cat] || 0) + 1;
  assert.ok(['高频', '常用', '了解'].includes(f.tag), f.id + ' 标签非法: ' + f.tag);
  assert.ok(f.name && f.name.length >= 2, f.id + ' 名称缺失');
  assert.ok(f.f && f.f.length >= 6, f.id + ' 内容缺失');
  const r = mathHtml(f.f) + mathHtml(f.tip || '');
  assert.ok(r.indexOf('@{') < 0 && r.indexOf('undefined') < 0, f.id + ' 排版异常');
});

Object.keys(byCat).forEach(c => assert.ok(byCat[c] >= 5, '分类 ' + c + ' 仅 ' + byCat[c] + ' 条'));
const hot = FORMULAS.filter(f => f.tag === '高频').length;
console.log('✅ 速查卡校验通过：共 ' + FORMULAS.length + ' 张 · ' + Object.keys(byCat).length + ' 个分类 · 高频 ' + hot + ' 张');
