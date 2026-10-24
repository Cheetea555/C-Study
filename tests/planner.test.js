/* Budget invariants, backlog behavior, real content, storage and bounded review links. */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const P = require('../assets/planner.js'), Storage = require('../assets/storage.js'), Review = require('../assets/review.js'), Content = require('../assets/content.js');
const catalog = require('../assets/plan-catalog.js'), builder = require('../scripts/build-plan-catalog.js');
const clone = value => JSON.parse(JSON.stringify(value)), today = '2026-10-24', now = Date.parse(today + 'T04:00:00Z');
const memory = () => ({ rows: new Map(), failRead: false, failWrite: false,
  getItem(key) { if (this.failRead) throw Error('read unavailable'); return this.rows.get(key) ?? null; },
  setItem(key, value) { if (this.failWrite) throw Error('quota'); this.rows.set(key, String(value)); } });
const config = options => ({ ...P.defaults(), reservePercent: 0, ...options });
const blank = () => Object.fromEntries(catalog.subjects.map(s => [s.id, { state: clone(s.defaults) }]));
const make = (settings, records = blank(), date = today) => P.createPlan(settings, catalog, records, date, now);
function mistake(id, date) { return { id, date, source: 'test', desc: 'test', correct: '', stage: 0, mastered: false, nextReview: date, history: [] }; }

assert.equal(catalog.subjects.flatMap(s => s.lessons).length, 156);
assert.deepEqual(builder.build(), catalog);
assert.equal(fs.readFileSync(path.join(__dirname, '../assets/plan-catalog.js'), 'utf8').replace(/\r\n/g, '\n'), builder.serialize(catalog));
assert.equal(P.capacity(P.defaults(), today).available, 420);
assert.equal(P.capacity(P.defaults(), '2026-10-26').available, 300);
assert.equal(P.capacity(config({ restDays: [6] }), today).available, 0);
assert.equal(P.capacity(config({ restDates: [today] }), today).rest, true);
assert.equal(P.capacity(config({ weekendMinutes: 5, reservePercent: 50 }), today).usable, 2);
assert.equal(P.validDate('2028-02-29'), true); assert.equal(P.validDate('2026-02-29'), false);
assert.equal(P.validDate('2200-01-01'), true);
for (const bad of [{ v: 99 }, { weekdayMinutes: -1 }, { reservePercent: 60 }, { reviewMinutes: 0 }, { restDays: [7] }, { restDates: ['2026-02-30'] }, { weights: { math2: 0, '408': 0, en2: 0, politics: 0 } }]) assert.throws(() => P.normalize({ ...P.defaults(), ...bad }));

const records = blank();
records.math2.state.mistakes = [mistake('old', '2026-10-20'), mistake('new', today)];
records['408'].state.mistakes = [mistake('middle', '2026-10-21')];
const before = clone(records);
const short = make(config({ weekendMinutes: 12 }), records);
assert.equal(short.scheduled, 10); assert.equal(short.deferredReviews, 1);
assert.deepEqual(short.tasks.flatMap(task => task.ids || []), ['old', 'middle']);
assert.equal(short.tasks.every(task => task.type === 'review'), true, '预算内优先复习，积压时不加新课');
assert.deepEqual(records, before, '安排不能改写任何完成历史或复习日期');
assert.equal(make(config({ restDays: [6] }), records).tasks.length, 0);
assert.equal(make(config({ restDays: [6] }), records).deferredReviews, 3);

const work = blank();
work.math2.state.logs.push({ id: 'log', date: today, minutes: 20 });
work['408'].state.timer = { running: true, startTs: now - 10 * 60000, accumSec: 300 };
const occupied = make(config({ weekendMinutes: 60, reservePercent: 10 }), work);
assert.equal(occupied.logged, 20); assert.equal(occupied.pending, 15);
assert.equal(occupied.remaining, 19);
assert.ok(occupied.scheduled <= 19);
assert.equal(make(config({ weekendMinutes: 20 }), work).tasks.length, 0);
const restNextDay = make(config({ restDays: [6] }), records, '2026-10-26');
assert.equal(restNextDay.tasks[0].type, 'review', '休息日积压错题下一学习日仍优先');

const onlyMath = config({ weekendMinutes: 35, weights: { math2: 100, '408': 0, en2: 0, politics: 0 } });
const untouched = blank(), lesson = catalog.subjects.find(s => s.id === 'math2').lessons[0];
assert.equal(make(onlyMath, untouched).tasks[0].lesson, lesson.id);
untouched.math2.state.lessons[lesson.id] = { done: true, doneAt: today };
assert.equal(make(onlyMath, untouched).tasks.some(task => task.type === 'lesson' && task.lesson === lesson.id), false);
// A completed lesson with outstanding matching practice is retried before its next lesson.
const first408 = catalog.subjects.find(s => s.id === '408').lessons[0];
const only408 = config({ weekendMinutes: 50, weights: { math2: 0, '408': 100, en2: 0, politics: 0 } });
untouched['408'].state.lessons[first408.id] = { done: true, doneAt: today };
assert.equal(make(only408, untouched).tasks[0].type, 'practice');
assert.equal(make(only408, untouched).tasks[0].lesson, first408.id);
for (const id of first408.quiz) untouched['408'].state.qz[id] = { ok: false, times: 1, lastAt: today };
assert.equal(make(only408, untouched).tasks.some(task => task.type === 'practice' && task.lesson === first408.id), false);
untouched['408'].state.settings.examDate = today;
assert.equal(make(only408, untouched).tasks.length, 0);
assert.deepEqual(make(only408, untouched).expiredSubjects, ['408']);
assert.equal(make(onlyMath, records).tasks.some(task => task.subject === '408' && task.type === 'review'), true, '权重零只暂停新内容');

const many = blank(); many.math2.state.mistakes = Array.from({ length: 55 }, (_, i) => mistake('r' + String(i).padStart(3, '0'), today));
const groups = make(config({ weekendMinutes: 300 }), many).tasks.filter(task => task.type === 'review');
assert.equal(groups[0].ids.length, 50); assert.equal(groups[1].ids.length, 5);
const selection = Content.parseRoute(Content.route('mistake', { review: groups[0].ids.join(',') })).reviewIds;
assert.equal(Review.selectDue(many.math2.state.mistakes, today, selection).length, 50);
assert.deepEqual(Review.selectDue(many.math2.state.mistakes, today, []), [], '过期的限定队列不能退回全科错题');
many.math2.state.mistakes[0].mastered = true;
assert.equal(Review.selectDue(many.math2.state.mistakes, today, selection).length, 49);
assert.deepEqual(Content.parseRoute('#mistake?review=%3Cscript%3E,ok,ok').reviewIds, ['ok']);

// Exercise many budgets, rates and workloads against conservation and uniqueness rules.
for (let i = 0; i < 200; i++) {
  const sample = blank(), settings = config({ weekendMinutes: i * 7 % 421, reservePercent: i % 51, reviewMinutes: i % 12 + 1, practiceMinutes: i % 16 + 1 });
  for (const subject of catalog.subjects) {
    sample[subject.id].state.logs = [{ date: today, minutes: i % 31 }];
    sample[subject.id].state.mistakes = Array.from({ length: i % 7 }, (_, index) => mistake(subject.id + '-' + index, today));
  }
  const result = make(settings, sample);
  assert.ok(result.scheduled <= Math.max(0, result.usable - result.logged - result.pending));
  assert.equal(result.tasks.reduce((sum, task) => sum + task.minutes, 0), result.scheduled);
  const taskIds = result.tasks.flatMap(task => task.ids ? task.ids.map(id => task.subject + ':' + id) : task.subject + ':' + task.type + ':' + task.lesson);
  assert.equal(new Set(taskIds).size, taskIds.length);
  if (result.deferredReviews) assert.ok(result.tasks.every(task => task.type === 'review'));
}

// Whole-subject reads reuse production validation and never save to subject keys.
const db = memory();
assert.equal(P.readSubjects(db, catalog, Storage.normalize).math2.state.logs.length, 0);
for (const subject of catalog.subjects) db.setItem(subject.key, JSON.stringify(subject.defaults));
const bytes = [...db.rows.entries()];
P.readSubjects(db, catalog, Storage.normalize); assert.deepEqual([...db.rows.entries()], bytes);
db.setItem(catalog.subjects[0].key, '{broken');
const brokenRecords = P.readSubjects(db, catalog, Storage.normalize);
assert.equal(make(P.defaults(), brokenRecords).blocked, true);
assert.equal(make(P.defaults(), brokenRecords).tasks.length, 0);
assert.equal(db.getItem(catalog.subjects[0].key), '{broken');

const budgetDb = memory(), a = P.createStore(budgetDb), b = P.createStore(budgetDb);
a.read(); assert.equal(a.info().enabled, false);
assert.equal(a.save(P.defaults()), true); const first = budgetDb.getItem(P.KEY);
b.read(); assert.equal(a.save({ ...P.defaults(), weekdayMinutes: 60 }), true);
assert.equal(b.save({ ...P.defaults(), weekdayMinutes: 90 }), false); assert.equal(b.info().locked, true);
assert.equal(budgetDb.getItem(P.KEY + '.previous'), first);
assert.equal(a.restore(), true); assert.equal(a.current().weekdayMinutes, 300);
assert.ok(a.archived());
const saved = a.current(), raw = budgetDb.getItem(P.KEY); budgetDb.failWrite = true;
assert.equal(a.save({ ...saved, weekdayMinutes: 180 }), false);
assert.deepEqual(a.current(), saved); assert.equal(budgetDb.getItem(P.KEY), raw); budgetDb.failWrite = false;
assert.equal(a.save({ ...saved, weekdayMinutes: 180 }), true);
const brokenDb = memory(); brokenDb.setItem(P.KEY, '{invalid');
const protectedStore = P.createStore(brokenDb); protectedStore.read();
assert.equal(protectedStore.save(P.defaults()), false); assert.equal(protectedStore.original(), '{invalid');
assert.equal(protectedStore.save(P.defaults(), true), true); assert.equal(brokenDb.getItem(P.KEY + '.recovery'), '{invalid');
brokenDb.failRead = true; protectedStore.read(); assert.equal(protectedStore.info().locked, true);
assert.equal(protectedStore.save(P.defaults(), true), false);
console.log('PASS global planner · real lessons / 200 budget invariants / backlog and rest / progress and timer / bounded reviews / source protection / transactional settings');
