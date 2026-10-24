/* Four-subject daily budget: pure scheduling and a separate protected settings store. */
(function (root) {
  'use strict';
  const KEY = 'c-study.planner.v1', IDS = ['math2', '408', 'en2', 'politics'];
  const copy = value => JSON.parse(JSON.stringify(value));
  function defaults() {
    return { v: 1, weekdayMinutes: 300, weekendMinutes: 420, reservePercent: 10,
      reviewMinutes: 5, practiceMinutes: 10, restDays: [], restDates: [],
      weights: { math2: 35, '408': 35, en2: 20, politics: 10 } };
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 2000 || Number(value.slice(0, 4)) > 2200) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
  }
  function integer(value, min, max, label) {
    if (!Number.isInteger(value) || value < min || value > max) throw Error(label + '应为 ' + min + '～' + max + ' 的整数');
  }
  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || input.v !== 1) throw Error('不支持的全局计划设置');
    const out = defaults();
    for (const key of ['weekdayMinutes', 'weekendMinutes']) { integer(input[key], 0, 1440, '每日可用分钟'); out[key] = input[key]; }
    integer(input.reservePercent, 0, 50, '机动比例'); out.reservePercent = input.reservePercent;
    for (const key of ['reviewMinutes', 'practiceMinutes']) { integer(input[key], 1, 60, '任务预计分钟'); out[key] = input[key]; }
    if (!Array.isArray(input.restDays) || !Array.isArray(input.restDates)) throw Error('休息日设置无效');
    input.restDays.forEach(day => integer(day, 0, 6, '每周休息日'));
    if (input.restDates.length > 366 || input.restDates.some(day => !validDate(day))) throw Error('临时休息日应为有效日期，最多 366 天');
    out.restDays = [...new Set(input.restDays)].sort(); out.restDates = [...new Set(input.restDates)].sort();
    if (!input.weights || typeof input.weights !== 'object') throw Error('科目分配无效');
    IDS.forEach(id => { integer(input.weights[id], 0, 100, '科目权重'); out.weights[id] = input.weights[id]; });
    if (!IDS.some(id => out.weights[id] > 0)) throw Error('至少为一科设置大于 0 的新课权重');
    if (input.revision != null) { integer(input.revision, 0, Number.MAX_SAFE_INTEGER - 1, '设置版本'); out.revision = input.revision; }
    if (input.savedAt != null) { if (typeof input.savedAt !== 'string' || !Number.isFinite(Date.parse(input.savedAt))) throw Error('设置保存时间无效'); out.savedAt = input.savedAt; }
    return out;
  }
  function capacity(settings, day) {
    if (!validDate(day)) throw Error('计划日期无效');
    const weekDay = new Date(day + 'T12:00:00Z').getUTCDay();
    const rest = settings.restDays.includes(weekDay) || settings.restDates.includes(day);
    const available = rest ? 0 : [0, 6].includes(weekDay) ? settings.weekendMinutes : settings.weekdayMinutes;
    const buffer = Math.ceil(available * settings.reservePercent / 100);
    return { available, buffer, usable: available - buffer, rest };
  }
  function createStore(storage) {
    let baseline, loaded = false, state = defaults(), issue = '', locked = false, enabled = false;
    function read() {
      loaded = true; locked = false; issue = ''; enabled = false;
      try {
        baseline = storage.getItem(KEY);
        state = baseline === null ? defaults() : normalize(JSON.parse(baseline)); enabled = baseline !== null;
      } catch (error) { state = defaults(); locked = true; issue = '全局设置无法读取，已暂停保存。请先下载原文，再恢复上一份设置。'; }
      return copy(state);
    }
    function save(next, replace) {
      if (!loaded) read();
      if (locked && !replace) return false;
      try {
        const current = storage.getItem(KEY);
        if (current !== baseline) { locked = true; issue = '另一页面已更新全局设置。请先下载当前草稿，再重新读取。'; return false; }
        const normalized = normalize(next);
        normalized.revision = Math.max(state.revision || 0, normalized.revision || 0) + 1;
        normalized.savedAt = new Date().toISOString();
        if (current !== null) {
          if (replace) storage.setItem(KEY + '.recovery', current);
          else storage.setItem(KEY + '.previous', current);
        }
        const raw = JSON.stringify(normalized); storage.setItem(KEY, raw);
        baseline = raw; state = normalized; locked = false; issue = ''; enabled = true; return true;
      } catch (error) { issue = '全局设置尚未保存：' + error.message + '。当前生效设置未改变，请下载草稿或重试。'; return false; }
    }
    function restore() {
      try {
        const raw = storage.getItem(KEY + '.previous');
        if (raw === null) { issue = '没有可恢复的上一份设置。'; return false; }
        return save(normalize(JSON.parse(raw)), true);
      } catch (error) { issue = '上一份设置不可用，原记录保持不变。'; return false; }
    }
    function checkExternal() {
      try {
        if (storage.getItem(KEY) !== baseline) { locked = true; issue = '另一页面已更新全局设置。请先下载草稿，再重新读取。'; return true; }
      } catch (error) { locked = true; issue = '暂时无法核对全局设置，已暂停保存。'; }
      return false;
    }
    return { read, save, restore, current: () => copy(state), original: () => baseline,
      archived: () => storage.getItem(KEY + '.recovery') || storage.getItem(KEY + '.previous'), checkExternal,
      info: () => ({ enabled, locked, message: issue }) };
  }
  function readSubjects(storage, catalog, normalizeState) {
    const records = {};
    for (const subject of catalog.subjects) {
      try {
        const raw = storage.getItem(subject.key), input = raw === null ? copy(subject.defaults) : JSON.parse(raw);
        records[subject.id] = { state: normalizeState(input, { subjectId: subject.id, maxScore: subject.maxScore, defaults: () => copy(subject.defaults) }) };
      } catch (error) { records[subject.id] = { error: error.message }; }
    }
    return records;
  }
  function createPlan(settings, catalog, records, today, now = Date.now()) {
    const budget = capacity(settings, today), tasks = [], due = [], candidates = new Map(), loads = {}, sourceIssues = [], expiredSubjects = [];
    let logged = 0, pending = 0, oldGoals = 0;
    for (const subject of catalog.subjects) {
      const record = records[subject.id];
      if (!record || record.error) { sourceIssues.push(subject.id); continue; }
      const s = record.state;
      oldGoals += s.settings.dailyGoal;
      const studied = s.logs.filter(log => log.date === today).reduce((sum, log) => sum + log.minutes, 0);
      const elapsed = s.timer.running ? Math.min(4 * 3600, Math.max(0, (now - s.timer.startTs) / 1000)) : 0;
      const ongoing = Math.ceil((s.timer.accumSec + elapsed) / 60);
      logged += studied; pending += ongoing; loads[subject.id] = studied + ongoing;
      for (const mistake of s.mistakes) if (!mistake.mastered && mistake.nextReview && mistake.nextReview <= today) {
        due.push({ subject: subject.id, id: mistake.id, date: mistake.nextReview, relapse: (mistake.recurrences || []).length > 0 });
      }
      const list = [];
      if (s.settings.examDate <= today) expiredSubjects.push(subject.id);
      if (settings.weights[subject.id] > 0 && s.settings.examDate > today) for (const lesson of subject.lessons) {
        const done = s.lessons[lesson.id] && s.lessons[lesson.id].done;
        if (!done) list.push({ type: 'lesson', subject: subject.id, lesson: lesson.id, title: lesson.title, minutes: lesson.minutes });
        const doneAt = done && s.lessons[lesson.id].doneAt;
        const practiced = done && lesson.quiz.every(id => s.qz[id] && s.qz[id].lastAt && (!doneAt || s.qz[id].lastAt >= doneAt));
        if (lesson.quiz.length && !practiced) list.push({ type: 'practice', subject: subject.id, lesson: lesson.id, title: lesson.title + ' · 配套练习', count: lesson.quiz.length, minutes: settings.practiceMinutes });
      }
      candidates.set(subject.id, list);
    }
    const remaining = Math.max(0, budget.usable - logged - pending);
    const result = { ...budget, logged, pending, remaining, scheduled: 0, unused: remaining, tasks, sourceIssues, oldGoals,
      dueCount: due.length, deferredReviews: due.length, deferredContent: [...candidates.values()].reduce((sum, list) => sum + list.length, 0), expiredSubjects, blocked: sourceIssues.length > 0 };
    if (result.blocked) return result;
    let left = remaining;
    due.sort((a, b) => a.date.localeCompare(b.date) || Number(b.relapse) - Number(a.relapse) || IDS.indexOf(a.subject) - IDS.indexOf(b.subject) || a.id.localeCompare(b.id));
    for (const item of due) {
      if (left < settings.reviewMinutes) break;
      let group = tasks[tasks.length - 1];
      if (!group || group.type !== 'review' || group.subject !== item.subject || group.ids.length >= 50) { group = { type: 'review', subject: item.subject, ids: [], title: '到期错题复习', minutes: 0 }; tasks.push(group); }
      group.ids.push(item.id); group.minutes += settings.reviewMinutes;
      loads[item.subject] += settings.reviewMinutes; left -= settings.reviewMinutes; result.deferredReviews--;
    }
    // A review backlog stays visible and takes priority over all new content.
    if (!result.deferredReviews) {
      while (left > 0) {
        const ready = catalog.subjects.filter(s => (candidates.get(s.id) || [])[0]?.minutes <= left);
        ready.sort((a, b) => loads[a.id] / settings.weights[a.id] - loads[b.id] / settings.weights[b.id] || IDS.indexOf(a.id) - IDS.indexOf(b.id));
        if (!ready.length) break;
        const task = candidates.get(ready[0].id).shift(); tasks.push(task);
        loads[task.subject] += task.minutes; left -= task.minutes; result.deferredContent--;
      }
    }
    result.scheduled = remaining - left; result.unused = left;
    return result;
  }
  const api = { KEY, IDS, defaults, normalize, validDate, capacity, createStore, readSubjects, createPlan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyPlanner = api;
})(typeof window !== 'undefined' ? window : this);
