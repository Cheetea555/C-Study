/* 公式手册数据校验：node test-formulas.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const { FORMULAS, FORMULA_CATS } = require('./data-formulas.js');

// 加载 mathHtml（app.js 在 Node 下不执行 DOM 初始化）
const src = fs.readFileSync('app.js', 'utf8');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={mathHtml:mathHtml};')(mod, mod.exports);
const mathHtml = mod.exports.mathHtml;

const catIds = new Set(FORMULA_CATS.map(c => c.id));
const ids = new Set();
const byCat = {};

FORMULAS.forEach(f => {
  assert.ok(f.id && !ids.has(f.id), '公式 id 重复或缺失: ' + f.id);
  ids.add(f.id);
  assert.ok(catIds.has(f.cat), f.id + ' 分类不存在: ' + f.cat);
  byCat[f.cat] = (byCat[f.cat] || 0) + 1;
  assert.ok(['高频', '常用', '了解'].includes(f.tag), f.id + ' 标签非法: ' + f.tag);
  assert.ok(f.name && f.name.length >= 2, f.id + ' 名称缺失');
  assert.ok(f.f && f.f.length >= 6, f.id + ' 公式内容缺失');
  // 排版标记必须可完整解析
  const r = mathHtml(f.f) + mathHtml(f.tip || '');
  assert.ok(r.indexOf('@{') < 0 && r.indexOf('@m{') < 0 && r.indexOf('@d{') < 0, f.id + ' 存在未解析标记');
  assert.ok(r.indexOf('undefined') < 0, f.id + ' 渲染出 undefined');
});

// 每个非 all 分类至少 5 条，防止漏写大块
Object.keys(byCat).forEach(c => assert.ok(byCat[c] >= 5, '分类 ' + c + ' 仅 ' + byCat[c] + ' 条'));
const hot = FORMULAS.filter(f => f.tag === '高频').length;
const withTips = FORMULAS.filter(f => f.tip).length;
console.log('✅ 公式手册校验通过：共 ' + FORMULAS.length + ' 条 · ' + (byCat.base ? '覆盖 ' + Object.keys(byCat).length + ' 个分类' : '') +
  ' · 高频 ' + hot + ' 条 · 带使用提示 ' + withTips + ' 条 · 排版全部可解析');
