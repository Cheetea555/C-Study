/* 错题自动记录功能自测：node test-mistake.js
   驱动 app.js 真实的 recordAnswer / addQToMistake / mistakeOptsHtml，覆盖：
   错解快照 / 选项快照 / 重复做错的去重更新 / 非选择题 / 答对不入本 /
   掌握后重错重新开卡 / 详情选项渲染 / 旧数据（无快照字段）兼容 / 持久化序列化 */
'use strict';
const assert = require('assert');

/* 模拟浏览器 localStorage（app.js 的 save() 会真实走一遍序列化） */
const store = {};
global.localStorage = {
  getItem(k){ return k in store ? store[k] : null; },
  setItem(k, v){ store[k] = String(v); },
  removeItem(k){ delete store[k]; }
};

const P = require('./app.js');

/* 各科目题库文件名不同：单文件（data-q.js）或上下篇（data-q1/2.js），按存在者加载 */
function loadQuestions(){
  try { return require('./data-q.js').QUESTIONS; } catch (e){ /* 无单文件题库 */ }
  try { return require('./data-q1.js').QUESTIONS.concat(require('./data-q2.js').QUESTIONS); } catch (e){ /* 无上下篇题库 */ }
  return [];
}
const QUESTIONS = loadQuestions();

P.__testSetState(P.defaultState());
assert.ok(QUESTIONS.length >= 40, '题库加载失败');
const choiceQ = QUESTIONS.find(q => q.type === 'choice' && q.opts && q.opts.length >= 2);
const fillQ = QUESTIONS.find(q => q.type === 'fill') || null;
const saved = () => JSON.parse(store[Object.keys(store)[0]]);

/* 1. 选择题答错：自动记录“我当时的错解”与选项快照 */
const w1 = (choiceQ.ans + 1) % choiceQ.opts.length;
P.recordAnswer(choiceQ, false, w1);
let m = saved().mistakes.find(x => x.qid === choiceQ.id);
assert.ok(m, '答错后自动进入错题本');
assert.ok(m.wrong.indexOf('我选了 ' + 'ABCD'[w1] + '．') === 0, '“我当时的错解”记录所选选项字母');
assert.ok(m.wrong.length > ('我选了 ' + 'ABCD'[w1] + '．').length, '错解文本包含选项内容');
assert.ok(Array.isArray(m.opts) && m.opts.length === choiceQ.opts.length &&
  m.opts.every((o, i) => o === choiceQ.opts[i]), '记录完整选项快照');
assert.strictEqual(m.ansIdx, choiceQ.ans, '记录正确项下标');
assert.strictEqual(m.wrongIdx, w1, '记录错选下标');
assert.strictEqual(saved().qz[choiceQ.id].lastPick, w1, '刷题记录保存 lastPick（回看高亮原选择）');

/* 2. 同题再次答错：不新增记录、不重置复习进度，只更新本次错解 */
const keepNext = m.nextReview, keepStage = m.stage;
let w2 = (w1 + 1) % choiceQ.opts.length;
if (w2 === choiceQ.ans || w2 === w1) w2 = w1; // 选项不足时退化为同一下标
P.recordAnswer(choiceQ, false, w2);
assert.strictEqual(saved().mistakes.filter(x => x.qid === choiceQ.id && !x.mastered).length, 1, '重复做错不新增错题记录');
m = saved().mistakes.find(x => x.qid === choiceQ.id);
assert.ok(m.wrong.indexOf('我选了 ' + 'ABCD'[w2] + '．') === 0, '错解更新为最近一次的选择');
assert.strictEqual(m.stage, keepStage, '复习轮次不被重置');
assert.strictEqual(m.nextReview, keepNext, '复习日期不被重置');

/* 3. 填空/解答题答错：无选项快照，错解留待手填 */
if (fillQ){
  P.recordAnswer(fillQ, false, -1);
  const fm = saved().mistakes.find(x => x.qid === fillQ.id);
  assert.ok(fm, '非选择题答错也进错题本');
  assert.strictEqual(fm.wrong, '', '非选择题错解留空');
  assert.ok(fm.opts == null && fm.ansIdx == null && fm.wrongIdx == null, '非选择题无选项快照');
}

/* 4. 答对不入错题本，但记录 lastPick */
const other = QUESTIONS.find(q => q.type === 'choice' && q.id !== choiceQ.id);
const before = saved().mistakes.length;
P.recordAnswer(other, true, other.ans);
assert.strictEqual(saved().mistakes.length, before, '答对不进错题本');
assert.strictEqual(saved().qz[other.id].lastPick, other.ans, '答对同样记录 lastPick');

/* 5. 详情弹窗的选项渲染 */
const html = P.mistakeOptsHtml(m);
assert.ok(html.indexOf('class="opt right"') >= 0, '正确项标绿');
assert.ok(html.indexOf('class="opt wrongpick"') >= 0, '错选标红');
assert.ok(html.indexOf('<span class="letter">A</span>') >= 0, '选项带 A/B/C/D 字母');
assert.strictEqual(P.mistakeOptsHtml({}), '', '旧数据（无 opts）不渲染');
assert.strictEqual(P.mistakeOptsHtml({ opts: null }), '', 'opts 为 null 不渲染');
assert.ok(P.mistakeOptsHtml({ opts: ['x'], ansIdx: 0 }) !== '', '有 opts 正常渲染');

/* 6. 已掌握后再次做错：重新开卡进入新一轮复习 */
const st4 = saved();
st4.mistakes.find(x => x.qid === choiceQ.id).mastered = true;
P.__testSetState(st4);
P.recordAnswer(choiceQ, false, w1);
const active = saved().mistakes.filter(x => x.qid === choiceQ.id && !x.mastered);
assert.strictEqual(active.length, 1, '已掌握后重错重新开卡');
assert.ok(active[0].wrong.indexOf('ABCD'[w1]) > 0, '重新开卡记录本次错解');

console.log('✅ 错题自动记录自测全部通过（错解快照 / 选项快照 / 去重更新 / 旧数据兼容 / 重新开卡 / 持久化）');
