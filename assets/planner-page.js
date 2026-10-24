(function () {
  'use strict';
  const C = window.StudyCommon, P = window.StudyPlanner, catalog = window.StudyPlanCatalog, Content = window.StudyContent;
  const $ = id => document.getElementById(id), storage = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
  if (!P || !catalog) { $('planWarning').hidden = false; $('planWarning').textContent = '计划内容未能加载，请重新打开页面。'; return; }
  const store = P.createStore(storage), names = new Map(catalog.subjects.map(s => [s.id, s.name]));
  let settings = store.read(), dirty = false;
  const fields = ['weekdayMinutes', 'weekendMinutes', 'reservePercent', 'reviewMinutes', 'practiceMinutes'];
  document.querySelector('.logo-mark').innerHTML = C.icon('clock');
  $('restDays').innerHTML = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => '<label><input type="checkbox" name="restDay" value="' + index + '">' + day + '</label>').join('');
  $('budgetWeights').innerHTML = catalog.subjects.map(s => '<div><label for="weight-' + s.id + '">' + C.esc(s.name) + '</label><input id="weight-' + s.id + '" type="number" min="0" max="100" step="1" required></div>').join('');
  function fillForm() {
    fields.forEach(key => { $(key).value = settings[key]; });
    catalog.subjects.forEach(s => { $('weight-' + s.id).value = settings.weights[s.id]; });
    document.querySelectorAll('[name="restDay"]').forEach(input => { input.checked = settings.restDays.includes(Number(input.value)); });
    $('restDates').value = settings.restDates.join('\n'); dirty = false;
  }
  function formValue() {
    const value = { ...settings, weights: {}, restDays: [], restDates: $('restDates').value.split(/[\s,，;；]+/).filter(Boolean) };
    fields.forEach(key => { value[key] = $(key).value.trim() === '' ? NaN : Number($(key).value); });
    catalog.subjects.forEach(s => { const text = $('weight-' + s.id).value.trim(); value.weights[s.id] = text === '' ? NaN : Number(text); });
    document.querySelectorAll('[name="restDay"]:checked').forEach(input => value.restDays.push(Number(input.value)));
    return P.normalize(value);
  }
  function showIssue(message) { $('planWarning').hidden = !message; $('planWarning').textContent = message || ''; }
  function saveSettings(value, replace) {
    if (!store.save(value, replace)) { showIssue(store.info().message); return false; }
    settings = store.current(); fillForm(); render(); return true;
  }
  function render() {
    const today = C.localDate(), records = P.readSubjects(storage, catalog, window.StudyStorage.normalize);
    const plan = P.createPlan(settings, catalog, records, today, Date.now()), info = store.info();
    if (info.locked) { plan.blocked = true; plan.tasks = []; plan.scheduled = 0; }
    $('planDate').textContent = today + ' / YOUR DAILY BUDGET';
    $('planStatus').textContent = info.locked ? (dirty ? '未保存的草稿已保留，请处理设置冲突后再生成安排。' : '全局设置正在保护中，任务生成已暂停。') : dirty ? '表单有未保存的修改，下方仍按当前设置安排。' : info.enabled ? '已应用全局预算；任务依据当前浏览器中的四科进度生成。' : '尚未启用全局预算，下方使用示例设置预览。调整并保存后应用。';
    showIssue(info.message);
    $('budgetSummary').innerHTML = [['可用时间', plan.available], ['已记录 / 预占', plan.blocked ? '—' : plan.logged + plan.pending], ['本次安排', plan.blocked ? '—' : plan.scheduled]].map(([label, value]) => '<div><span>' + label + '</span><strong>' + value + '<small>分钟</small></strong></div>').join('');
    $('budgetExplanation').textContent = plan.blocked ? '设置或学习记录需要检查，暂不生成任务。处理后重新读取或刷新。' : '机动留白 ' + plan.buffer + ' 分钟 · 当天日志 ' + plan.logged + ' 分钟 · 未归档计时预占 ' + plan.pending + ' 分钟 · 尚余 ' + plan.unused + ' 分钟未安排。';
    const notes = [];
    if (plan.sourceIssues.length) notes.push('这些科目的记录暂时无法读取：' + plan.sourceIssues.map(id => names.get(id)).join('、') + '。已停止跨科安排，原记录未改变。');
    if (info.locked) notes.push('全局设置正在保护中，请先下载原文或草稿，再重新读取或恢复。');
    if (location.protocol === 'file:') notes.push('本地文件模式的跨科进度可能受浏览器限制；如无法共享记录，请在同一 HTTP 站点使用全局计划。');
    if (!plan.blocked) {
      if (plan.rest) notes.push('今天为休息日，不安排任务；未处理错题继续保留，到下一学习日优先安排。');
      if (plan.logged + plan.pending > plan.usable) notes.push('已记录与预占时间超过今天可排任务预算，今天不再加任务。');
      if (plan.deferredReviews) notes.push('有 ' + plan.deferredReviews + ' 道到期错题超出本次预算，保留在原错题本，后续优先安排；本次暂停添加新课与配套练习。');
      if (plan.deferredContent) notes.push('还有 ' + plan.deferredContent + ' 项课程或配套练习未排入今天，将按后续预算与实际完成情况继续安排。');
      if (plan.expiredSubjects.length) notes.push(plan.expiredSubjects.map(id => names.get(id)).join('、') + '已到设置的考试日期，暂停新课安排；继续备考可到该科设置更新日期。');
      notes.push('各科原目标合计 ' + plan.oldGoals + ' 分钟。全局安排采用本页预算，科目目标与已有章节日期未被改写。');
    }
    $('planNotices').innerHTML = notes.map(note => '<p>' + C.esc(note) + '</p>').join('');
    $('planTasks').innerHTML = plan.tasks.map((task, index) => {
      const subject = catalog.subjects.find(s => s.id === task.subject), review = task.type === 'review';
      const hash = Content.route(review ? 'mistake' : task.type === 'lesson' ? 'learn' : 'pq', review ? { review: task.ids.join(',') } : { lesson: task.lesson });
      const label = review ? '复习 ' + task.ids.length + ' 道错题' : task.type === 'lesson' ? '学习课程' : '做配套练习';
      return '<li class="card budget-task" data-task-type="' + task.type + '"><span class="task-order">' + (index + 1) + '</span><div><p class="eyebrow">' + C.esc(subject.name) + ' / ' + (review ? '先复习' : task.type === 'lesson' ? '学新课' : '巩固练习') + '</p><h3>' + C.esc(task.title) + '</h3><p class="muted">预计 ' + task.minutes + ' 分钟' + (review ? ' · 本次只复习选中的 ' + task.ids.length + ' 题' : task.type === 'practice' ? ' · ' + task.count + ' 题，按实际完成更新' : ' · 包含课程例题') + '</p><a class="btn sm ' + (review ? '' : 'ghost') + '" href="' + C.esc(subject.folder + '/index.html' + hash) + '">' + label + ' →</a></div></li>';
    }).join('') || '<li class="card empty-state">' + (plan.blocked ? '先处理设置或记录，再生成今天的安排。' : plan.rest ? '好好休息，给下一次学习留些精力。' : '当前没有可排入的任务，可调整预算或继续自主学习。') + '</li>';
    $('weekBudget').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + i);
      const day = date.toISOString().slice(0, 10), cap = P.capacity(settings, day);
      return '<div><span>' + day.slice(5) + '</span><strong>' + (cap.rest ? '休息' : cap.available + ' 分钟') + '</strong></div>';
    }).join('');
  }
  $('budgetForm').addEventListener('input', () => { dirty = true; $('planStatus').textContent = store.info().locked ? '未保存的草稿已保留，请处理设置冲突后再生成安排。' : '表单有未保存的修改，下方仍按当前设置安排。'; });
  $('budgetForm').addEventListener('submit', event => { event.preventDefault(); try { if (saveSettings(formValue())) { $('tasksTitle').focus({ preventScroll: true }); $('tasksTitle').scrollIntoView({ block: 'start', behavior: 'auto' }); } } catch (error) { showIssue(error.message); } });
  $('refreshPlan').addEventListener('click', render);
  $('downloadDraft').addEventListener('click', () => { try { window.StudyStorage.download(formValue(), 'c-study-global-budget-draft.json'); } catch (error) { showIssue(error.message); } });
  $('downloadOriginal').addEventListener('click', () => { const raw = store.original(); if (raw == null) showIssue('没有已读取的全局设置原文。'); else window.StudyStorage.download(raw, 'c-study-global-budget-original.json'); });
  $('downloadArchived').addEventListener('click', () => { try { const raw = store.archived(); if (raw == null) showIssue('没有覆盖前的全局设置。'); else window.StudyStorage.download(raw, 'c-study-global-budget-preserved.json'); } catch (error) { showIssue('暂时无法读取覆盖前设置。'); } });
  $('reloadBudget').addEventListener('click', () => { if (dirty && !confirm('重新读取会放弃未保存的设置草稿。已下载草稿并确定继续？')) return; settings = store.read(); fillForm(); render(); });
  $('restoreBudget').addEventListener('click', () => { if (!confirm('恢复上一份全局预算？将保留覆盖前原文，各科学习记录不变。')) return; if (store.restore()) { settings = store.current(); fillForm(); } render(); });
  $('importBudget').addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const value = P.normalize(JSON.parse(reader.result)); if (confirm('导入这份全局预算并替换当前设置？会保留覆盖前原文，各科学习记录不变。')) saveSettings(value, true); } catch (error) { showIssue('导入失败：' + error.message); } event.target.value = ''; };
    reader.onerror = () => { showIssue('无法读取设置文件，当前设置未改变。'); event.target.value = ''; }; reader.readAsText(file);
  });
  window.addEventListener('storage', event => {
    if (event.key === P.KEY || event.key === null) { if (!dirty) { settings = store.read(); fillForm(); } else store.checkExternal(); }
    render();
  });
  function refreshFromBrowser() { if (store.checkExternal() && !dirty) { settings = store.read(); fillForm(); } render(); }
  window.addEventListener('pageshow', refreshFromBrowser); window.addEventListener('focus', refreshFromBrowser);
  fillForm(); render();
})();
