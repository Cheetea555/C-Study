/* 四科共用的记录校验、备份和持久化；兼容 file:// 与 Node。 */
(function (root) {
  'use strict';
  const FORMAT = 'c-study-backup', SCHEMA = 2;
  const names = { math2: '数学二', '408': '408', en2: '英语二', politics: '政治' };
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function fail(message) { throw new Error(message); }
  function number(value, min, max, label) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(label + '超出有效范围');
  }
  function date(value, label) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(label + '不是有效日期');
    const [y, m, d] = value.split('-').map(Number), parsed = new Date(y, m - 1, d);
    if (y < 2000 || y > 2200 || parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) fail(label + '不是有效日期');
  }
  function identifier(value, label) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_.:-]{1,180}$/.test(value)) fail(label + '不是有效标识');
  }
  function text(value, label) { if (typeof value !== 'string') fail(label + '必须是文字'); }
  function boolean(value, label) { if (typeof value !== 'boolean') fail(label + '必须是布尔值'); }
  function timestamp(value, label) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) fail(label + '无效');
    date(value.slice(0, 10), label);
  }
  function safeClone(value) {
    return JSON.parse(JSON.stringify(value), (key, item) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('记录包含不支持的字段');
      return item;
    });
  }
  function pauseTimer(state, cutoff) {
    if (!object(state.timer) || !state.timer.running) return state;
    // 只计到已知的导出/保存时刻，不能把备份存放期间算成学习时间。
    if (Number.isFinite(cutoff)) state.timer.accumSec += Math.max(0, (cutoff - state.timer.startTs) / 1000);
    state.timer.running = false; state.timer.startTs = 0;
    return state;
  }
  function inferSubjects(state) {
    const found = new Set();
    const inspect = id => {
      if (!id) return;
      const stable = /^(math2|408|en2|politics)\./.exec(id);
      if (stable) found.add(stable[1]);
      else if (/^(?:L|Q)?(?:ds|co|os|net)\d/i.test(id)) found.add('408');
      else if (/^(?:L|Q)?e\d/i.test(id)) found.add('en2');
      else if (/^(?:L|Q)?p\d/i.test(id)) found.add('politics');
      else if (/^(?:L?c|q)\d/i.test(id)) found.add('math2');
    };
    for (const field of ['kp', 'qz', 'lessons']) Object.keys(state[field] || {}).forEach(inspect);
    for (const field of ['logs', 'mistakes']) (state[field] || []).forEach(row => { inspect(row.chapterId); inspect(row.qid); });
    (state.attempts || []).forEach(row => { inspect(row.questionId); (row.pointIds || []).forEach(inspect); });
    if (state.plan) (state.plan.chapters || []).forEach(row => inspect(row.id));
    return Array.from(found);
  }
  function normalize(input, config) {
    if (!object(input) || !object(input.settings)) fail('缺少有效的设置与学习记录');
    if (input.v != null && input.v !== 1) fail('记录版本暂不支持，请使用兼容的应用版本');
    if (input.subjectId != null && input.subjectId !== config.subjectId) fail('这份记录属于其他科目');
    const state = safeClone(input), defaults = config.defaults();
    state.v = 1;
    if (state.kp && object(state.kp)) {
      const legacyIds = new Map((config.syllabus || []).flatMap(ch => ch.points.map(p => [p.legacyKey, p.id])));
      for (const id of Object.keys(state.kp)) {
        const stable = legacyIds.get(id);
        if (stable) {
          if (!own(state.kp, stable)) state.kp[stable] = state.kp[id];
          delete state.kp[id];
        }
      }
    }
    state.settings = Object.assign({}, defaults.settings, state.settings);
    date(state.settings.examDate, '考试日期');
    number(state.settings.dailyGoal, 1, 1440, '每日目标');
    number(state.settings.targetScore, 0, config.maxScore, '目标分数');
    if (state.settings.lastBackup) date(state.settings.lastBackup, '备份日期');
    if (state.revision != null) { number(state.revision, 0, Number.MAX_SAFE_INTEGER - 1, '记录版本号'); if (!Number.isInteger(state.revision)) fail('记录版本号必须是整数'); }
    if (state.savedAt != null && (typeof state.savedAt !== 'string' || !Number.isFinite(Date.parse(state.savedAt)))) fail('保存时间无效');
    for (const field of ['kp', 'qz', 'lessons', 'favF']) {
      if (state[field] == null) state[field] = {};
      if (!object(state[field])) fail(field + '必须是记录对象');
      for (const [id, entry] of Object.entries(state[field])) {
        identifier(id, field + ' 标识');
        if (field === 'favF') { boolean(entry, '收藏状态'); continue; }
        if (!object(entry)) fail(field + '记录结构不正确');
        if (field === 'kp') { number(entry.status, 0, 3, '掌握状态'); if (!Number.isInteger(entry.status)) fail('掌握状态必须是整数'); }
        if (field === 'qz') {
          boolean(entry.ok, '作答结果'); number(entry.times, 1, Number.MAX_SAFE_INTEGER, '作答次数');
          if (!Number.isInteger(entry.times)) fail('作答次数必须是整数');
          if (entry.lastPick != null) { number(entry.lastPick, -1, 25, '最近选项'); if (!Number.isInteger(entry.lastPick)) fail('选项必须是整数'); }
        }
        if (field === 'lessons') boolean(entry.done, '课程状态');
        for (const key of ['updatedAt', 'lastAt', 'doneAt']) if (entry[key]) date(entry[key], '记录日期');
      }
    }
    for (const field of ['logs', 'mistakes', 'papers']) {
      if (state[field] == null) state[field] = [];
      if (!Array.isArray(state[field])) fail(field + '必须是数组');
      const ids = new Set();
      for (const row of state[field]) {
        if (!object(row)) fail(field + '记录结构不正确');
        identifier(row.id, '记录 ID');
        if (ids.has(row.id)) fail(field + '存在重复记录 ID');
        ids.add(row.id); date(row.date, '记录日期');
        if (row.chapterId) identifier(row.chapterId, '章节');
        if (field === 'logs') { number(row.minutes, 0, 10080, '学习分钟数'); if (row.note != null) text(row.note, '学习备注'); }
        if (field === 'papers') {
          number(row.score, 0, config.maxScore, '成绩');
          for (const key of ['name', 'type']) text(row[key], '试卷' + key);
          if (row.note != null) text(row.note, '成绩备注');
        }
        if (field === 'mistakes') {
          if (row.qid) identifier(row.qid, '题目');
          for (const key of ['source', 'desc', 'correct']) text(row[key], '错题' + key);
          for (const key of ['wrong', 'reason']) { if (row[key] == null) row[key] = ''; text(row[key], '错题' + key); }
          if (row.stage == null) row.stage = 0;
          number(row.stage, 0, 6, '复习阶段'); if (!Number.isInteger(row.stage)) fail('复习阶段必须是整数');
          if (row.mastered == null) row.mastered = false;
          boolean(row.mastered, '错题掌握状态');
          if (row.nextReview != null) date(row.nextReview, '复习日期');
          if (row.history == null) row.history = [];
          if (!Array.isArray(row.history)) fail('复习历史必须是数组');
          row.history.forEach(h => { if (!object(h)) fail('复习历史结构不正确'); date(h.date, '复习历史日期'); boolean(h.ok, '复习结果'); });
          // Additive fields: retain legacy labels without inventing confirmations or recurrences.
          if (row.reasonConfirmed != null) boolean(row.reasonConfirmed, '错因确认状态');
          for (const key of ['reasonConfirmedAt', 'lastWrongAt']) if (row[key] != null) timestamp(row[key], '错题时间');
          if (row.recurrences != null) {
            if (!Array.isArray(row.recurrences)) fail('复发记录必须是数组');
            const recurrenceIds = new Set(), recurrenceAttempts = new Set();
            for (const event of row.recurrences) {
              if (!object(event)) fail('复发记录结构不正确');
              identifier(event.id, '复发 ID');
              if (recurrenceIds.has(event.id)) fail('复发 ID 重复');
              recurrenceIds.add(event.id); date(event.date, '复发日期'); timestamp(event.at, '复发时间');
              if (event.attemptId != null) {
                identifier(event.attemptId, '复发作答 ID');
                if (recurrenceAttempts.has(event.attemptId)) fail('同一次作答不能重复记录复发');
                recurrenceAttempts.add(event.attemptId);
              }
              number(event.fromStage, 0, 6, '复发前阶段'); if (!Number.isInteger(event.fromStage)) fail('复发前阶段必须是整数');
              if (event.fromNextReview != null) date(event.fromNextReview, '复发前复习日期');
              boolean(event.wasMastered, '复发前掌握状态'); boolean(event.previousReasonConfirmed, '复发前错因确认状态');
              for (const key of ['previousWrong', 'previousReason', 'wrong']) text(event[key], '复发' + key);
              if (event.wrongIdx != null) { number(event.wrongIdx, 0, 25, '复发选项'); if (!Number.isInteger(event.wrongIdx)) fail('复发选项必须是整数'); }
            }
          }
          if (row.opts != null) {
            if (!Array.isArray(row.opts) || row.opts.length < 1 || row.opts.length > 26) fail('错题选项不正确');
            row.opts.forEach(o => text(o, '错题选项'));
            for (const key of ['ansIdx', 'wrongIdx']) if (row[key] != null) {
              number(row[key], 0, row.opts.length - 1, '错题选项下标'); if (!Number.isInteger(row[key])) fail('选项下标必须是整数');
            }
          }
        }
      }
    }
    if (state.attempts == null) state.attempts = [];
    if (!Array.isArray(state.attempts)) fail('逐次作答记录必须是数组');
    const attemptIds = new Set();
    for (const attempt of state.attempts) {
      if (!object(attempt)) fail('逐次作答结构不正确');
      identifier(attempt.id, '作答 ID'); identifier(attempt.questionId, '作答题目');
      if (attemptIds.has(attempt.id)) fail('逐次作答 ID 重复');
      attemptIds.add(attempt.id);
      if (typeof attempt.answeredAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(attempt.answeredAt) || !Number.isFinite(Date.parse(attempt.answeredAt))) fail('作答时间无效');
      boolean(attempt.correct, '作答结果'); boolean(attempt.isFirst, '首答标记');
      number(attempt.maxScore, 1, 150, '作答满分'); number(attempt.score, 0, attempt.maxScore, '作答得分');
      if (!['practice', 'retry', 'lesson'].includes(attempt.mode)) fail('作答模式无效');
      if (!['automatic', 'self'].includes(attempt.gradingMethod)) fail('评分方式无效');
      if (attempt.answer != null) { number(attempt.answer, 0, 25, '作答选项'); if (!Number.isInteger(attempt.answer)) fail('作答选项必须是整数'); }
      if (!Array.isArray(attempt.pointIds)) fail('作答考点引用无效');
      attempt.pointIds.forEach(id => identifier(id, '作答考点'));
    }
    state.timer = Object.assign({}, defaults.timer, state.timer == null ? {} : state.timer);
    if (input.timer != null && !object(input.timer)) fail('计时器结构不正确');
    boolean(state.timer.running, '计时状态');
    number(state.timer.startTs, 0, 1e15, '计时起点'); number(state.timer.accumSec, 0, 1e10, '累计计时');
    if (state.timer.running && !state.timer.startTs) fail('运行中的计时缺少起点');
    if (state.timer.chapterId) identifier(state.timer.chapterId, '计时章节');
    if (state.plan != null) {
      const plan = state.plan;
      if (!object(plan) || !Array.isArray(plan.chapters)) fail('学习计划结构不正确');
      date(plan.startAt, '计划开始日'); date(plan.examDate, '计划考试日');
      number(plan.totalDays, 1, 100000, '计划天数');
      if (plan.generatedAt) date(plan.generatedAt, '计划生成日');
      plan.chapters.forEach(ch => {
        if (!object(ch)) fail('章节计划结构不正确');
        identifier(ch.id, '计划章节'); date(ch.start, '章节开始日'); date(ch.end, '章节结束日');
        number(ch.s, 0, plan.totalDays - 1, '章节起点'); number(ch.e, ch.s, plan.totalDays - 1, '章节终点');
        text(ch.phase, '计划阶段');
      });
    }
    if (state.ui != null) {
      if (!object(state.ui)) fail('界面记录结构不正确');
      if (state.ui.lastVisit != null) number(state.ui.lastVisit, 0, 1e15, '访问时间');
      if (state.ui.lastLesson) identifier(state.ui.lastLesson, '最近课程');
      if (state.ui.lastLessonTitle != null) text(state.ui.lastLessonTitle, '最近课程标题');
    }
    const subjects = inferSubjects(state);
    if (subjects.some(id => id !== config.subjectId)) fail('记录中含有' + subjects.filter(id => id !== config.subjectId).map(id => names[id]).join('、') + '的进度，请到对应科目导入');
    return state;
  }
  function create(config) {
    let loaded = false, baseline = null, lastRaw = null, locked = false;
    let status = { ok: true, kind: 'new', message: '' };
    const storage = () => config.getStorage();
    function update(kind, message, lock) {
      locked = !!lock;
      status = { ok: kind === 'ready' || kind === 'new', kind, message: message || '' };
      return status;
    }
    function read() {
      loaded = true;
      try {
        baseline = storage().getItem(config.key); lastRaw = baseline;
      } catch (e) {
        update('unavailable', '浏览器存储暂时无法读取，已暂停写入。可重新读取或导出当前记录。', true);
        return { state: config.defaults(), info: info() };
      }
      if (baseline === null) { update('new', '', false); return { state: config.defaults(), info: info() }; }
      try {
        const state = normalize(JSON.parse(baseline), config);
        update('ready', '', false);
        return { state, info: info() };
      } catch (e) {
        update('protected', '原记录无法载入，已保留原文并暂停写入。' + (e instanceof SyntaxError ? '记录不是有效的 JSON' : e.message) + '。请先下载原始记录，再尝试恢复。', true);
        return { state: config.defaults(), info: info() };
      }
    }
    function save(state, options) {
      const replace = !!(options && options.replace);
      if (!loaded) read();
      if (locked && !replace) return false;
      try {
        const current = storage().getItem(config.key);
        if (current !== baseline) {
          lastRaw = current;
          update('conflict', '另一页面更新了本科记录，已暂停写入以免覆盖。请先导出当前记录，再重新读取浏览器记录。', true);
          return false;
        }
        const next = normalize(state, config);
        next.subjectId = config.subjectId;
        next.savedAt = new Date().toISOString();
        const previousRevision = current ? (function () { try { const value = JSON.parse(current).revision; return Number.isSafeInteger(value) && value >= 0 ? value : 0; } catch (e) { return 0; } })() : 0;
        next.revision = Math.max(next.revision || 0, previousRevision) + 1;
        const serialized = JSON.stringify(next);
        if (current !== null) {
          if (replace) {
            // 覆盖操作必须先保留原文；原文备份失败时不改动主记录。
            storage().setItem(config.key + '.recovery', current);
            if (!locked) { try { storage().setItem(config.key + '.previous', current); } catch (e) { /* 原文已由 recovery 保存。 */ } }
          } else {
            try { storage().setItem(config.key + '.previous', current); } catch (e) { /* 不阻止容量允许的主记录保存。 */ }
          }
        }
        storage().setItem(config.key, serialized);
        baseline = serialized; lastRaw = serialized;
        state.subjectId = next.subjectId; state.revision = next.revision; state.savedAt = next.savedAt;
        state.kp = next.kp;
        update('ready', '', false);
        return true;
      } catch (e) {
        const reason = ['QuotaExceededError', 'SecurityError', 'ReferenceError', 'InvalidStateError'].includes(e.name) ? '浏览器空间不足或当前环境限制写入' : e.message;
        update('write-failed', '记录尚未保存：' + reason + '。请导出当前记录，或重试保存。', locked);
        return false;
      }
    }
    function prepareImport(raw) {
      let parsed;
      try { parsed = JSON.parse(raw); } catch (e) { fail('备份内容不是有效的 JSON 文件'); }
      let data = parsed, legacy = true;
      if (object(parsed) && own(parsed, 'format')) {
        if (parsed.format !== FORMAT || parsed.schemaVersion !== SCHEMA) fail('不支持的备份格式或版本');
        if (parsed.subjectId !== config.subjectId) fail('这份备份属于' + (names[parsed.subjectId] || '其他科目') + '，请切换到对应科目导入');
        data = parsed.data; legacy = false;
      }
      if (!object(data) || !Array.isArray(data.logs) || !Array.isArray(data.mistakes) || !Array.isArray(data.papers)) fail('缺少完整的学习记录数组');
      const state = normalize(data, config);
      const unidentified = legacy && !data.subjectId && inferSubjects(state).length === 0;
      pauseTimer(state, Date.parse(legacy ? state.savedAt : parsed.exportedAt));
      return { state, unidentified, legacy, summary: '课程 ' + Object.values(state.lessons).filter(l => l.done).length + ' 课、错题 ' + state.mistakes.length + ' 道、学习记录 ' + state.logs.length + ' 条' };
    }
    function backup(state) {
      const now = Date.now();
      return { format: FORMAT, schemaVersion: SCHEMA, subjectId: config.subjectId, contentVersion: '2026-10', exportedAt: new Date(now).toISOString(), data: pauseTimer(safeClone(state), now) };
    }
    function snapshot() {
      const raw = storage().getItem(config.key + '.previous');
      if (raw === null) fail('没有可恢复的有效快照');
      const state = normalize(JSON.parse(raw), config);
      return pauseTimer(state, Date.parse(state.savedAt));
    }
    function original() {
      try { return storage().getItem(config.key); } catch (e) { return lastRaw; }
    }
    function archived() { return storage().getItem(config.key + '.recovery'); }
    function checkExternal() {
      try {
        const current = storage().getItem(config.key);
        if (loaded && current !== baseline) {
          lastRaw = current;
          update('conflict', '另一页面更新了本科记录，已暂停写入以免覆盖。请先导出当前记录，再重新读取浏览器记录。', true);
        }
      } catch (e) { update('unavailable', '浏览器存储暂时无法读取，已暂停写入。请导出当前记录后重试。', true); }
      return info();
    }
    function info() { return Object.assign({}, status, { locked }); }
    return { read, save, prepareImport, backup, snapshot, original, archived, checkExternal, info };
  }
  function download(value, filename) {
    const blob = new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const api = { create, normalize, inferSubjects, download };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyStorage = api;
})(typeof window !== 'undefined' ? window : this);
