/* app.js 纯函数单元测试：node test.js */
'use strict';
const assert = require('assert');
const P = require('./app.js');

assert.strictEqual(P.diffDays('2026-10-19', '2026-12-19'), 61);
assert.strictEqual(P.addDays('2026-12-31', 1), '2027-01-01');
assert.strictEqual(P.FULL_SCORE, 100, '政治满分应为 100');

const plan = P.generatePlan('2026-10-19', '2026-12-19', P.SYLLABUS);
assert.strictEqual(plan.chapters.length, 16, '政治应 16 章');
plan.chapters.forEach(c => assert.ok(c.s <= c.e, c.id + ' 起止倒置'));
for (let i = 1; i < plan.chapters.length; i++){
  assert.strictEqual(plan.chapters[i].s, plan.chapters[i - 1].e + 1, '章节窗口不连续 @' + plan.chapters[i].id);
}

let m = { stage: 0, nextReview: '2026-10-20', history: [], mastered: false };
P.scheduleNext(m, true, '2026-10-20');
assert.strictEqual(m.nextReview, '2026-10-22');
P.scheduleNext(m, false, '2026-10-22');
assert.strictEqual(m.stage, 0);
assert.strictEqual(P.calcStreak(['2026-10-19', '2026-10-18'], '2026-10-19'), 2);
console.log('✅ 政治纯函数断言全部通过（日期 / 16 章计划 / 复习调度 / 满分=100）');
