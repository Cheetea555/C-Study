/* 算法轨迹、预测状态、内容入口与页面配置回归：node tests/replacement.test.js。 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const R = require('../assets/replacement.js');
const Content = require('../assets/content.js');
const root = path.resolve(__dirname, '..');
const config = { algorithm: 'fifo', frames: 3, sequence: R.example };
for (const [algorithm, frames, expected] of [['fifo', 3, 9], ['fifo', 4, 10], ['lru', 3, 10], ['lru', 4, 8]]) {
  assert.equal(R.simulate({ ...config, algorithm, frames }).at(-1).faults, expected, algorithm + '/' + frames);
}
// OSTEP 第 22 章图 22.2 / 22.5 的队列轨迹；固定页框位置与队列位置分别断言。
const book = '0,1,2,0,1,3,0,3,1,2,1';
for (const [algorithm, faults, victims] of [['fifo', 7, [null, null, null, null, null, 0, 1, null, 2, 3, null]], ['lru', 5, [null, null, null, null, null, 2, null, null, null, 0, null]]]) {
  const trace = R.simulate({ ...config, algorithm, sequence: book });
  assert.equal(trace.at(-1).faults, faults);
  assert.deepEqual(trace.map(step => step.victim), victims);
  assert.deepEqual(trace[3].after, [0, 1, 2], '命中不能交换物理页框');
  assert.deepEqual(trace[3].order, algorithm === 'fifo' ? [0, 1, 2] : [1, 2, 0]);
}
assert.equal(R.simulate({ ...config, frames: 1, sequence: '0,0,99,99,0' }).at(-1).faults, 3);
assert.equal(R.simulate({ ...config, frames: 6, sequence: '0,1,2,3,4,5,0,5' }).at(-1).faults, 6);
// 独立参照：根据装入/最近访问时间选择淘汰页，不使用生产实现的顺序队列。
function reference(sequence, frames, algorithm) {
  const memory = new Map(), outcomes = [];
  for (const [time, page] of sequence.entries()) {
    const fault = !memory.has(page);
    let victim = null;
    if (fault && memory.size === frames) {
      victim = [...memory].sort((a, b) => a[1] - b[1])[0][0]; memory.delete(victim);
    }
    if (fault || algorithm === 'lru') memory.set(page, time);
    outcomes.push({ fault, victim, residents: [...memory.keys()].sort((a, b) => a - b) });
  }
  return outcomes;
}
let seed = 47831;
for (let sample = 0; sample < 200; sample++) {
  const sequence = Array.from({ length: 20 }, () => { seed = (seed * 16807) % 2147483647; return seed % 9; });
  for (const algorithm of ['fifo', 'lru']) for (const frames of [1, 2, 3, 6]) {
    const trace = R.simulate({ algorithm, frames, sequence: sequence.join(',') });
    assert.deepEqual(trace.map(step => ({ fault: step.fault, victim: step.victim, residents: step.after.filter(page => page !== null).sort((a, b) => a - b) })), reference(sequence, frames, algorithm));
    trace.forEach((step, index) => {
      assert.equal(step.hits + step.faults, index + 1);
      assert.equal(new Set(step.order).size, step.order.length);
    });
  }
}
for (const invalid of [{ frames: 0 }, { frames: 7 }, { frames: 2.5 }, { algorithm: 'opt' }, { sequence: '' }, { sequence: '-1' }, { sequence: '1.2' }, { sequence: '100' }, { sequence: '1,,2,' }, { sequence: '1,2,<script>' }, { sequence: Array(41).fill(1).join(',') }, { sequence: [1, 2] }]) {
  assert.throws(() => R.create({ ...config, ...invalid }));
}
assert.equal(R.validate({ ...config, sequence: ' 00，1；2 3、99 ' }).sequence, '0,1,2,3,99');
assert.deepEqual(R.parseHash(R.hashFor(config)), config);
assert.equal(R.parseHash('').sequence, R.example);
for (const hash of ['#missing', '#replacement?algorithm=fifo&frames=3.0&sequence=1', '#replacement?algorithm=fifo&frames=3&sequence=']) assert.throws(() => R.parseHash(hash));
const s = R.create({ ...config, sequence: '0,1,2,0,3' });
assert.equal(s.previous().cursor, 0);
assert.equal(s.view().history.length, 0);
assert.deepEqual(Object.keys(s.view().next).sort(), ['index', 'page', 'seen']);
assert.throws(() => s.next({ kind: 'replace', victim: 0 }));
assert.equal(s.view().cursor, 0, '无效预测不推进');
assert.equal(s.next({ kind: 'load' }).feedback.correct, true);
const copy = s.view(); copy.slots[0] = 99; copy.config.frames = 6;
assert.equal(s.view().slots[0], 0); assert.equal(s.view().config.frames, 3);
s.next({ kind: 'hit' });
assert.equal(s.view().feedback.correct, false);
s.previous(); assert.equal(s.view().history.length, 1);
assert.equal(s.view().next.seen, true);
s.next({ kind: 'load' });
assert.equal(s.view().feedback.correct, false, '回看不能改写已揭示的预测');
s.next(); s.next();
const beforeInvalid = s.view();
assert.throws(() => s.next({ kind: 'replace', victim: 99 }));
assert.deepEqual(s.view(), beforeInvalid);
assert.equal(s.next({ kind: 'replace', victim: 0 }).feedback.correct, true, 'FIFO 命中后仍淘汰最早装入页 0');
assert.equal(s.view().faults, 4);
assert.deepEqual(s.next(), s.view(), '末步不重复推进');
s.previous(); assert.equal(s.view().faults, 3);
s.reset(); assert.equal(s.view().feedback, null); assert.equal(s.view().next.seen, false);

const app = require('../kaoyan-408/app.js'), lessons = require('../kaoyan-408/data-lessons2.js').LESSONS;
const questions = require('../kaoyan-408/data-q2.js').QUESTIONS;
const index = Content.create(app.SYLLABUS, lessons, questions);
const lesson = lessons.os03.find(row => row.id === R.lessonId);
assert.ok(lesson.pointIds.includes(R.pointId));
assert.ok(Content.pointLinks(index, R.pointId).includes('../algorithms.html#replacement'));
assert.ok(Content.lessonPoints(index, lesson).includes('../algorithms.html#replacement'));
assert.ok(Content.relatedHtml(index, 'Qos03-3').includes('../algorithms.html#replacement'));
assert.equal(index.questionsFor(R.pointId).length, 1);

// 执行实际页面控制器，验证无效配置保留推演、预测清空与历史链接。
const nodes = new Map();
function element(id) {
  if (!nodes.has(id)) nodes.set(id, { value: '', hidden: false, disabled: false, textContent: '', children: [], handlers: {}, focus() { this.focused = true; }, scrollIntoView() {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; if (id === 'predictVictim') this.value = ''; } });
  return nodes.get(id);
}
const events = {}, document = { getElementById: element, createElement: () => ({ value: '', textContent: '', children: [], append(...items) { this.children.push(...items); } }) };
let url = '', writes = 0;
const context = vm.createContext({ URLSearchParams, document, window: { StudyReplacement: R, location: { hash: '' }, history: { replaceState(a, b, value) { url = value; } }, addEventListener(name, fn) { events[name] = fn; } }, localStorage: { setItem() { writes++; throw Error('演示不得写入'); }, getItem() { throw Error('演示不得读取'); } } });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/replacement-page.js'), 'utf8'), context);
const fire = (id, event = 'click') => element(id).handlers[event]({ preventDefault() {} });
assert.match(element('demoStep').textContent, /第 0/);
assert.equal(element('demoHistory').children.length, 0);
element('predictKind').value = 'load'; fire('predictKind', 'change'); fire('predictNext');
assert.match(element('demoFeedback').textContent, /预测正确/);
assert.equal(element('demoHistory').children.length, 1);
fire('demoPrevious'); assert.equal(element('seenHint').hidden, false);
fire('demoNext'); assert.match(element('demoFeedback').textContent, /预测正确/);
element('demoSequence').value = '坏输入'; fire('demoForm', 'input'); fire('demoForm', 'submit');
assert.equal(element('demoError').hidden, false); assert.match(element('demoStep').textContent, /第 1/);
assert.equal(element('demoDirty').hidden, false);
fire('hitPreset'); assert.equal(element('demoSequence').value, '1,2,3,1,4');
assert.match(element('demoStep').textContent, /第 1/, '预设不立即替换实验');
fire('demoForm', 'submit'); assert.equal(element('demoError').hidden, true);
assert.equal(element('playerTitle').focused, true, '应用配置后返回播放器');
fire('editDemo'); assert.equal(element('configTitle').focused, true, '调整配置入口聚焦设置标题');
assert.match(element('demoStep').textContent, /第 0/); assert.match(url, /sequence=1/);
element('predictKind').value = 'replace'; fire('predictKind', 'change'); assert.equal(element('predictNext').disabled, true);
const key = event => element('demoStage').handlers.keydown({ target: element('demoStage'), preventDefault() {}, ...event });
key({ key: 'ArrowRight' }); assert.match(element('demoStep').textContent, /第 1/);
key({ key: 'ArrowRight', ctrlKey: true }); assert.match(element('demoStep').textContent, /第 1/);
key({ key: 'Home' }); assert.match(element('demoStep').textContent, /第 0/);
context.window.location.hash = '#replacement?algorithm=lru&frames=1&sequence=0,0'; events.hashchange();
fire('demoNext'); fire('demoNext');
assert.equal(element('demoConclusion').hidden, false); assert.match(element('demoCounts').textContent, /缺页 1 次 · 命中 1 次/);
assert.equal(element('demoNext').disabled, true);
context.window.location.hash = '#replacement?algorithm=bad'; events.hashchange();
assert.equal(element('demoError').hidden, false); assert.match(element('demoCounts').textContent, /已访问 2 次/);
fire('demoReset'); assert.equal(element('demoHistory').children.length, 0);
assert.equal(writes, 0);
console.log('PASS FIFO/LRU · published traces / 1600 reference comparisons / prediction / rewind / input bounds / content links / page flow / no storage');
