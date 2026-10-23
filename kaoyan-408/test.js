/* app.js 纯函数单元测试：node test.js */
'use strict';
const assert = require('assert');
const P = require('./app.js');

/* ---------- 日期工具 ---------- */
assert.strictEqual(P.diffDays('2026-10-19', '2026-12-19'), 61);
assert.strictEqual(P.addDays('2026-10-31', 1), '2026-11-01');
assert.strictEqual(P.addDays('2026-12-31', 1), '2027-01-01');
assert.strictEqual(P.addDays('2028-02-28', 1), '2028-02-29');

/* ---------- 学习计划（26 章） ---------- */
const plan = P.generatePlan('2026-10-19', '2026-12-19', P.SYLLABUS);
assert.strictEqual(plan.chapters.length, P.SYLLABUS.length);
assert.strictEqual(plan.chapters.length, 26);
plan.chapters.forEach(c => assert.ok(c.s <= c.e, c.id + ' 起止倒置'));
for (let i = 1; i < plan.chapters.length; i++){
  assert.strictEqual(plan.chapters[i].s, plan.chapters[i - 1].e + 1, '章节窗口不连续 @' + plan.chapters[i].id);
}
assert.strictEqual(plan.chapters[0].start, '2026-10-19');
assert.strictEqual(plan.chapters[plan.chapters.length - 1].end, '2026-12-18');

/* ---------- 错题复习调度（艾宾浩斯） ---------- */
let m = { stage: 0, nextReview: '2026-10-20', history: [], mastered: false };
P.scheduleNext(m, true, '2026-10-20');
assert.strictEqual(m.stage, 1);
assert.strictEqual(m.nextReview, '2026-10-22');
P.scheduleNext(m, false, '2026-10-22');
assert.strictEqual(m.stage, 0);
assert.strictEqual(m.nextReview, '2026-10-23');
for (let i = 0; i < P.REVIEW_STEPS.length; i++) P.scheduleNext(m, true, '2026-10-23');
assert.strictEqual(m.mastered, true);

/* ---------- 待复习队列 / 连续打卡 ---------- */
assert.strictEqual(P.dueMistakes([{ mastered: false, nextReview: '2026-10-19' }, { mastered: false, nextReview: '2026-10-25' }], '2026-10-19').length, 1);
assert.strictEqual(P.calcStreak(['2026-10-19', '2026-10-18'], '2026-10-19'), 2);
assert.strictEqual(P.calcStreak(['2026-10-18'], '2026-10-19'), 1);
assert.strictEqual(P.calcStreak([], '2026-10-19'), 0);

/* ---------- 备份提醒 ---------- */
assert.strictEqual(P.backupDueDays('', '2026-10-19'), -1);           // 从未备份
assert.strictEqual(P.backupDueDays('2026-10-19', '2026-10-19'), 0);  // 当天刚备份
assert.strictEqual(P.backupDueDays('2026-10-12', '2026-10-19'), 7);  // 满 7 天
assert.strictEqual(P.backupDueDays('2026-10-01', '2026-10-19'), 18);

console.log('✅ 408 纯函数断言全部通过（日期 / 26 章计划生成 / 复习调度 / 打卡连续性 / 备份提醒）');
