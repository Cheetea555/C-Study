/* app.js 纯函数单元测试：node test.js */
'use strict';
const assert = require('assert');
const P = require('./app.js');

/* ---------- 日期工具 ---------- */
assert.strictEqual(P.diffDays('2026-10-19', '2026-12-19'), 61);
assert.strictEqual(P.addDays('2026-10-31', 1), '2026-11-01');   // 跨月
assert.strictEqual(P.addDays('2026-12-31', 1), '2027-01-01');   // 跨年
assert.strictEqual(P.addDays('2028-02-28', 1), '2028-02-29');   // 闰年
assert.strictEqual(P.addDays('2026-10-19', -1), '2026-10-18');

/* ---------- 学习计划 ---------- */
const plan = P.generatePlan('2026-10-19', '2026-12-19', P.SYLLABUS);
assert.strictEqual(plan.chapters.length, P.SYLLABUS.length);
plan.chapters.forEach(c => assert.ok(c.s <= c.e, c.id + ' 起止倒置'));
for (let i = 1; i < plan.chapters.length; i++){
  assert.strictEqual(plan.chapters[i].s, plan.chapters[i - 1].e + 1, '章节窗口不连续 @' + plan.chapters[i].id);
}
assert.strictEqual(plan.chapters[0].start, '2026-10-19');
assert.strictEqual(plan.chapters[plan.chapters.length - 1].end, '2026-12-18'); // 考前一天收尾
// 今天在计划内时能定位到当前章节
const idx = P.diffDays('2026-10-19', '2026-10-25');
assert.ok(plan.chapters.some(c => idx >= c.s && idx <= c.e));
// 极端短周期不崩溃，且每章起止合法
const short = P.generatePlan('2026-12-10', '2026-12-19', P.SYLLABUS);
short.chapters.forEach(c => assert.ok(c.s <= c.e && c.e <= short.totalDays - 1));

/* ---------- 错题复习调度（艾宾浩斯） ---------- */
let m = { stage: 0, nextReview: '2026-10-20', history: [], mastered: false };
P.scheduleNext(m, true, '2026-10-20');
assert.strictEqual(m.stage, 1);
assert.strictEqual(m.nextReview, '2026-10-22');           // 间隔序列第 2 项 = 2 天
P.scheduleNext(m, false, '2026-10-22');
assert.strictEqual(m.stage, 0);
assert.strictEqual(m.mastered, false);
assert.strictEqual(m.nextReview, '2026-10-23');           // 不会 → 明天重来
for (let i = 0; i < P.REVIEW_STEPS.length; i++) P.scheduleNext(m, true, '2026-10-23');
assert.strictEqual(m.mastered, true);
assert.strictEqual(m.nextReview, null);

/* ---------- 待复习队列 ---------- */
const today = '2026-10-19';
const list = [
  { mastered: false, nextReview: '2026-10-19' },
  { mastered: false, nextReview: '2026-10-18' },
  { mastered: false, nextReview: '2026-10-25' },
  { mastered: true,  nextReview: null },
  { mastered: false, nextReview: null }
];
assert.strictEqual(P.dueMistakes(list, today).length, 2);

/* ---------- 连续打卡 ---------- */
assert.strictEqual(P.calcStreak(['2026-10-19', '2026-10-18', '2026-10-17'], '2026-10-19'), 3);
assert.strictEqual(P.calcStreak(['2026-10-18', '2026-10-17'], '2026-10-19'), 2); // 今天还没学不打断
assert.strictEqual(P.calcStreak(['2026-10-19', '2026-10-17'], '2026-10-19'), 1); // 断一天
assert.strictEqual(P.calcStreak([], '2026-10-19'), 0);

console.log('✅ 全部断言通过（日期 / 计划生成 / 复习调度 / 待复习队列 / 连续打卡）');
