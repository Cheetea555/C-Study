/* 运行：node tests/storage.test.js；只使用内存存储，不接触真实学习记录。 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const StudyReview = require('../assets/review.js');
const Storage = require('../assets/storage.js');
const { subjects } = require('../assets/common.js');
function memory() {
  const rows = new Map();
  return { rows, failRead: false, failWrite: false,
    getItem(key) { if (this.failRead) throw Error('禁止读取'); return rows.get(key) ?? null; },
    setItem(key, value) { if (this.failWrite) throw Error('空间不足'); rows.set(key, String(value)); }
  };
}
for (const subject of subjects) {
  const appPath = path.join(__dirname, '..', subject.folder, 'app.js');
  const app = require(appPath), maxScore = ['math2', '408'].includes(subject.id) ? 150 : 100;
  const make = db => Storage.create({ key: subject.key, subjectId: subject.id, maxScore, syllabus: app.SYLLABUS, defaults: app.defaultState, getStorage: () => db });
  const db = memory(), store = make(db);
  let state = store.read().state;
  assert.equal(store.info().kind, 'new');
  assert.equal(store.save(state), true);
  assert.equal(state.subjectId, subject.id);
  assert.equal(state.revision, 1);
  const first = db.getItem(subject.key);
  state.settings.dailyGoal = 60;
  assert.equal(store.save(state), true);
  assert.equal(db.getItem(subject.key + '.previous'), first);
  assert.equal(store.snapshot().settings.dailyGoal, app.defaultState().settings.dailyGoal);
  assert.deepEqual(store.prepareImport(JSON.stringify(store.backup(state))).state, state);

  // 无法解析、未来版本和内部结构损坏均停写，原始字节保持不变。
  for (const raw of ['{broken-json', '', JSON.stringify({ ...app.defaultState(), v: 99 }), JSON.stringify({ ...app.defaultState(), logs: {} })]) {
    const broken = memory(); broken.setItem(subject.key, raw);
    const blocked = make(broken), fallback = blocked.read().state;
    assert.equal(blocked.info().locked, true);
    assert.equal(blocked.save(fallback), false);
    assert.equal(broken.getItem(subject.key), raw);
    assert.equal(blocked.original(), raw);
  }
  const unavailable = memory(); unavailable.failRead = true;
  const reader = make(unavailable); reader.read();
  assert.equal(reader.info().kind, 'unavailable');
  assert.equal(reader.save(app.defaultState()), false);
  unavailable.failRead = false;
  assert.equal(reader.read().info.ok, true);

  // 两个页面加载同一版本后，旧页面不能覆盖新页面。
  const other = make(db), oldState = other.read().state;
  state.settings.dailyGoal = 70; assert.equal(store.save(state), true);
  const newest = db.getItem(subject.key);
  assert.equal(other.checkExternal().kind, 'conflict');
  assert.equal(other.save(oldState), false);
  assert.equal(db.getItem(subject.key), newest);
  assert.equal(other.read().state.settings.dailyGoal, 70);

  // 导入和清空只有在原文已保留且主记录写入成功后才能切换状态。
  const imported = app.defaultState(); imported.settings.dailyGoal = 90;
  db.failWrite = true;
  assert.equal(store.save(imported, { replace: true }), false);
  assert.equal(db.getItem(subject.key), newest);
  db.failWrite = false;
  assert.equal(store.save(imported, { replace: true }), true);
  assert.equal(db.getItem(subject.key + '.recovery'), newest);
  const broken = memory(); broken.setItem(subject.key, '{unreadable');
  broken.setItem(subject.key + '.previous', newest);
  const recovery = make(broken); recovery.read();
  assert.equal(recovery.save(recovery.snapshot(), { replace: true }), true);
  assert.equal(recovery.archived(), '{unreadable');

  const foreign = subjects.find(s => s.id !== subject.id);
  assert.throws(() => store.prepareImport(JSON.stringify({ ...store.backup(state), subjectId: foreign.id })), /科目/);
  const foreignApp = require(path.join(__dirname, '..', foreign.folder, 'app.js'));
  const legacyForeign = foreignApp.defaultState();
  legacyForeign.kp[foreignApp.SYLLABUS[0].id + '-0'] = { status: 1 };
  assert.throws(() => store.prepareImport(JSON.stringify(legacyForeign)), /导入|范围/);
  assert.equal(store.prepareImport(JSON.stringify(app.defaultState())).unidentified, true);
  const legacy = app.defaultState(); delete legacy.qz; delete legacy.lessons; delete legacy.favF; delete legacy.timer;
  assert.deepEqual(store.prepareImport(JSON.stringify(legacy)).state.lessons, {});
  const running = app.defaultState();
  running.timer = { running: true, startTs: Date.now() - 5000, accumSec: 10, chapterId: null };
  const frozen = store.backup(running);
  assert.equal(running.timer.running, true, '导出不能停止页面的计时');
  assert.equal(frozen.data.timer.running, false, '备份中的计时应暂停在导出时刻');
  assert.ok(frozen.data.timer.accumSec >= 15 && frozen.data.timer.accumSec < 17);
  assert.equal(store.prepareImport(JSON.stringify(frozen)).state.timer.accumSec, frozen.data.timer.accumSec);
  const oldTimer = app.defaultState();
  oldTimer.timer = { running: true, startTs: Date.now() - 86400000, accumSec: 10, chapterId: null };
  assert.equal(store.prepareImport(JSON.stringify(oldTimer)).state.timer.accumSec, 10, '旧备份没有保存时刻时不猜测经过时长');
  for (const mutate of [
    s => { s.settings.examDate = '2026-02-30'; },
    s => { s.settings.dailyGoal = -1; },
    s => { s.settings.targetScore = maxScore + 1; },
    s => { s.kp.bad = { status: 9 }; },
    s => { s.logs = [{ id: 'a', date: '2026-10-23', minutes: '30' }]; },
    s => { s.timer = 'broken'; },
    s => { s.qz.bad = { ok: true, times: 1.5 }; }
  ]) {
    const invalid = app.defaultState(); mutate(invalid);
    assert.throws(() => store.prepareImport(JSON.stringify(store.backup(invalid))));
  }
  assert.throws(() => store.prepareImport('{"settings":{},"logs":[],"mistakes":[],"papers":[],"__proto__":{}}'), /字段/);

  // 用各科真实 load / importData / clearData / exportData 验证接线。
  const browserDb = memory(), messages = [], prompts = [], downloads = [];
  browserDb.setItem(subject.key, '{corrupt');
  const context = vm.createContext({ StudyReview,
    console, setTimeout: () => 0, localStorage: browserDb,
    StudyStorage: { ...Storage, download: (value, filename) => downloads.push({ value, filename }) },
    confirm: message => { prompts.push(message); return true; },
    FileReader: class { readAsText(file) { this.result = file.text; this.onload(); } },
    messages
  });
  vm.runInContext(fs.readFileSync(appPath, 'utf8'), context, { filename: appPath });
  vm.runInContext(`
    toast = msg => messages.push(msg);
    renderAll = syncTimerBtn = updateTimerDisplay = () => {};
    load();
    if (!S.plan) { S.plan = generatePlan(todayStr(), S.settings.examDate, SYLLABUS); save(); }
  `, context);
  assert.equal(browserDb.getItem(subject.key), '{corrupt');
  context.backupText = JSON.stringify(store.backup(state));
  browserDb.failWrite = true;
  vm.runInContext('this.beforeImport = S; importData({text: backupText});', context);
  assert.equal(vm.runInContext('S === beforeImport', context), true);
  assert.match(messages.at(-1), /导入失败/);
  vm.runInContext('clearData();', context);
  assert.equal(vm.runInContext('S === beforeImport', context), true);
  assert.match(messages.at(-1), /清空失败/);
  browserDb.failWrite = false;
  vm.runInContext('importData({text: backupText}); exportData();', context);
  assert.equal(JSON.parse(browserDb.getItem(subject.key)).subjectId, subject.id);
  assert.equal(browserDb.getItem(subject.key + '.recovery'), '{corrupt');
  assert.equal(downloads.at(-1).value.subjectId, subject.id);
  assert.equal(downloads.at(-1).value.schemaVersion, 2);
  assert.match(downloads.at(-1).filename, /backup/);
  const count = prompts.length;
  context.foreignText = JSON.stringify({ ...store.backup(state), subjectId: foreign.id });
  vm.runInContext('importData({text: foreignText});', context);
  assert.equal(prompts.length, count, '跨科备份应在覆盖确认前拒绝');
  vm.runInContext(`
    renderDash = renderStats = () => {};
    el = () => ({value: ''});
    S.timer = {running: false, startTs: 0, accumSec: 90, chapterId: null};
    this.logCount = S.logs.length;
  `, context);
  const beforeTimer = browserDb.getItem(subject.key);
  browserDb.failWrite = true;
  vm.runInContext('finishTimer();', context);
  assert.equal(browserDb.getItem(subject.key), beforeTimer);
  assert.equal(vm.runInContext('S.timer.accumSec', context), 90, '归档失败不能丢失计时');
  assert.equal(vm.runInContext('S.logs.length === logCount', context), true, '归档失败不能半写入学习日志');
  browserDb.failWrite = false;
  vm.runInContext('finishTimer();', context);
  assert.equal(vm.runInContext('S.logs.length === logCount + 1 && S.timer.accumSec === 0', context), true);
  console.log('PASS ' + subject.name + ' · 原文保护 / 快照恢复 / 科目与字段校验 / 失败回滚 / 多页冲突 / 真实应用导入导出');
}
