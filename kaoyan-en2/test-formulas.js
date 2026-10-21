/* 速查卡数据校验：node test-formulas.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const { FORMULAS, FORMULA_CATS } = require('./data-formulas.js');
const src = fs.readFileSync('app.js', 'utf8');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={mathHtml:mathHtml};')(mod, mod.exports);
const mathHtml = mod.exports.mathHtml;

const catIds = new Set(FORMULA_CATS.map(c => c.id));
const ids = new Set();
FORMULAS.forEach(f => {
  assert.ok(f.id && !ids.has(f.id), '卡片 id 重复: ' + f.id);
  ids.add(f.id);
  assert.ok(catIds.has(f.cat), f.id + ' 分类不存在');
  assert.ok(['高频', '常用', '了解'].includes(f.tag), f.id + ' 标签非法');
  assert.ok(f.name.length >= 2 && f.f.length >= 6, f.id + ' 内容缺失');
  const r = mathHtml(f.f) + mathHtml(f.tip || '');
  assert.ok(r.indexOf('@{') < 0 && r.indexOf('undefined') < 0, f.id + ' 排版异常');
});
console.log('✅ 英语二速查卡 ' + FORMULAS.length + ' 张 / ' + FORMULA_CATS.length + ' 个分类，校验通过');
