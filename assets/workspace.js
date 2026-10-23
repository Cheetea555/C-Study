/* A shared presentation layer; the four engines keep owning their study data. */
(function () {
  'use strict';
  const C = window.StudyCommon;
  const $ = id => document.getElementById(id);
  const tabInfo = {
    dash: ['今日概览', 'grid', '把注意力，留给今天。'],
    learn: ['课程学习', 'book', '理解一个概念，再向前一步。'],
    pq: ['练习题库', 'pen', '在练习中，把知识变成能力。'],
    mistake: ['错题复习', 'repeat', '每一次回顾，都是一次进步。'],
    kp: ['知识地图', 'target', '看清已经掌握的，也找到下一步。'],
    paper: ['真题成绩', 'chart', '记录每一次检验，看见自己的变化。'],
    stats: ['学习统计', 'chart', '让每一天的投入，都有迹可循。'],
    settings: ['设置与数据', 'settings', '调整学习节奏，妥善保存记录。']
  };
  let bridge, subject, currentTab = 'dash', practiceSource = null, modalFocus = null;
  let reviewIds = [], reviewIndex = 0, reviewRevealed = false;
  let modalBackground = [];
  let storageOK = true;
  let navigationReady = false, navigatingHistory = false;
  function state() { return bridge.getState(); }
  function preferences() { return state().ui || (state().ui = {}); }
  function motion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; }
  function go(name) { bridge.actions.goTab(name); }
  function button(name, label, action, cls) {
    return '<button type="button" class="' + (cls || 'btn') + '" onclick="A.' + action + '">' + C.icon(name) + C.esc(label) + '</button>';
  }
  function mount(config) {
    bridge = config;
    subject = C.subjects.find(s => s.key === config.storeKey);
    document.body.dataset.subject = subject.id;
    const nav = $('tabs');
    const oldNavButtons = Array.from(nav.querySelectorAll('button[data-tab]'));
    oldNavButtons.forEach(b => {
      const key = b.dataset.tab;
      b.innerHTML = C.icon(tabInfo[key][1]) + '<span>' + tabInfo[key][0] + '</span>';
      b.setAttribute('aria-controls', 'tab-' + key);
    });
    const order = ['dash', 'learn', 'pq', 'mistake', 'kp', 'paper', 'stats', 'settings'];
    order.forEach(key => nav.appendChild(oldNavButtons.find(b => b.dataset.tab === key)));
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = '<a class="app-logo" href="../index.html"><span class="logo-mark">' + C.icon('book') + '</span><span>C-Study<small>考研学习工作台</small></span></a>' +
      '<div class="subject-picker"><label for="subjectSwitch">当前学习科目</label><select id="subjectSwitch">' + C.subjects.map(s => '<option value="' + s.folder + '"' + (s.id === subject.id ? ' selected' : '') + '>' + s.name + '</option>').join('') + '</select></div><p class="nav-caption">学习空间</p>';
    document.body.prepend(sidebar);
    sidebar.appendChild(nav);
    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    footer.innerHTML = '<span class="offline-dot"></span> 离线也能安心学习<a href="../index.html">' + C.icon('home') + '返回四科总览</a>';
    sidebar.appendChild(footer);
    $('subjectSwitch').addEventListener('change', e => { window.location.href = '../' + e.target.value + '/index.html'; });
    document.querySelector('.brand').innerHTML = '<span class="subject-symbol">' + C.icon(subject.icon) + '</span><span>' + subject.name + '<small>学习工作台</small></span>';
    const mobileSwitch = document.createElement('a');
    mobileSwitch.className = 'mobile-home'; mobileSwitch.href = '../index.html'; mobileSwitch.innerHTML = C.icon('grid') + '<span>切换科目</span>';
    document.querySelector('header').appendChild(mobileSwitch);
    const main = document.querySelector('main');
    const heading = document.createElement('div');
    heading.className = 'page-heading'; heading.innerHTML = '<div><p class="eyebrow" id="pageEyebrow"></p><h1 id="pageTitle" tabindex="-1">今日概览</h1><p id="pageSubtitle"></p></div><span class="workspace-badge">' + C.icon('book') + '日拱一卒，功不唐捐</span>';
    main.prepend(heading);
    const status = document.createElement('div'); status.id = 'saveStatus'; status.hidden = true; status.className = 'storage-warning'; status.setAttribute('role', 'alert');
    main.prepend(status);
    const hero = document.createElement('div'); hero.id = 'studyHero'; hero.className = 'study-hero';
    $('tab-dash').prepend(hero);
    const dashCards = Array.from(document.querySelectorAll('.dash-grid > .card'));
    ['plan-card', 'timer-card', 'review-card', 'mastery-card'].forEach((name, i) => dashCards[i].classList.add(name));
    dashCards[0].querySelector('h3').textContent = '今日学习计划';
    dashCards[1].querySelector('h3').textContent = '专注计时';
    dashCards[2].querySelector('h3').textContent = '今日复习';
    dashCards[3].querySelector('h3').textContent = '知识掌握';
    const quick = document.createElement('details'); quick.className = 'quick-entry';
    quick.innerHTML = '<summary>忘记计时？补记学习时长</summary>';
    const timerCard = dashCards[1], separator = timerCard.querySelector('hr');
    while (separator.nextSibling) quick.appendChild(separator.nextSibling);
    separator.remove(); timerCard.appendChild(quick);
    quick.querySelector('label').hidden = true;
    const dock = document.createElement('div'); dock.id = 'timerDock'; dock.className = 'timer-dock'; dock.hidden = true;
    dock.innerHTML = '<span class="timer-dot"></span><span id="dockChapter">专注学习</span><strong id="dockTime">00:00</strong>' + button('clock', '暂停', 'toggleTimer()', 'btn sm ghost') + button('check', '结束并记录', 'finishTimer()', 'btn sm');
    document.body.appendChild(dock);
    const bottom = document.createElement('nav'); bottom.className = 'mobile-nav'; bottom.setAttribute('aria-label', '常用功能');
    bottom.innerHTML = ['dash', 'learn', 'pq', 'mistake'].map(key => '<button type="button" data-mobile-tab="' + key + '">' + C.icon(tabInfo[key][1]) + '<span>' + ({ dash: '今日', learn: '学习', pq: '刷题', mistake: '错题' })[key] + '</span></button>').join('') + '<button type="button" id="mobileMore" aria-expanded="false" aria-controls="moreMenu">' + C.icon('more') + '<span>更多</span></button>';
    document.body.appendChild(bottom);
    bottom.querySelectorAll('[data-mobile-tab]').forEach(b => b.addEventListener('click', () => go(b.dataset.mobileTab)));
    const more = document.createElement('div'); more.className = 'more-menu'; more.id = 'moreMenu'; more.hidden = true;
    more.innerHTML = '<p>更多学习工具</p>' + ['kp', 'paper', 'stats', 'settings'].map(key => '<button type="button" data-more-tab="' + key + '">' + C.icon(tabInfo[key][1]) + tabInfo[key][0] + '</button>').join('') + '<a href="../index.html">' + C.icon('grid') + '切换科目 / 四科总览</a>';
    document.body.appendChild(more);
    more.querySelectorAll('button').forEach(b => b.addEventListener('click', () => go(b.dataset.moreTab)));
    $('mobileMore').addEventListener('click', () => toggleMore(more.hidden));
    document.addEventListener('click', e => { if (!more.hidden && !more.contains(e.target) && !$('mobileMore').contains(e.target)) toggleMore(false); });
    const reviewBanner = document.createElement('div'); reviewBanner.id = 'reviewBanner'; reviewBanner.className = 'section-banner';
    reviewBanner.innerHTML = '<div><h3>把易错的，变成拿手的。</h3><p>先独立回忆，再核对解析，最后评价掌握情况。</p></div>' + button('repeat', '开始今日复习', 'startReview()');
    $('tab-mistake').prepend(reviewBanner);
    const dangerButton = document.querySelector('[onclick="A.clearData()"]');
    const dangerZone = document.createElement('details'); dangerZone.className = 'card danger-zone';
    dangerZone.innerHTML = '<summary>危险操作</summary><p class="muted">清空会移除当前科目的全部学习记录。操作前请先导出备份。</p>';
    dangerZone.appendChild(dangerButton); $('tab-settings').appendChild(dangerZone);
    document.querySelectorAll('label').forEach(label => {
      if (label.htmlFor || label.querySelector('input, select, textarea')) return;
      const next = label.nextElementSibling;
      if (next && /^(INPUT|SELECT|TEXTAREA)$/.test(next.tagName) && next.id) label.htmlFor = next.id;
    });
    const accessibleNames = { quickMin: '补记分钟数', quickChapter: '补记所属章节', quickDate: '补记日期', kpSubjectSel: '知识点分类', kpSearch: '搜索知识点', fSearch: '搜索速查卡', fCat: '速查卡分类', mfStatus: '错题状态', mfChapter: '错题章节', mfReason: '错误原因', pqChapter: '练习章节', pqDiff: '练习难度', pqScope: '练习范围' };
    Object.entries(accessibleNames).forEach(([id, name]) => { if ($(id)) $(id).setAttribute('aria-label', name); });
    $('modalBox').setAttribute('role', 'dialog'); $('modalBox').setAttribute('aria-modal', 'true'); $('modalBox').setAttribute('tabindex', '-1');
    document.addEventListener('keydown', onKeydown);
    $('learnList').addEventListener('click', e => {
      const summary = e.target.closest('summary');
      const lesson = summary && summary.parentElement;
      if (lesson && lesson.matches('details.lesson')) rememberLesson(lesson.dataset.lid);
    });
    const learnSearch = document.createElement('div'); learnSearch.className = 'toolbar card lesson-search';
    learnSearch.innerHTML = C.icon('book') + '<input type="search" id="lessonSearch" aria-label="搜索课程" placeholder="搜索章节、课程或学习目标…"><span id="lessonSearchInfo" class="muted"></span>';
    $('learnList').before(learnSearch);
    $('lessonSearch').addEventListener('input', filterLessons);
    const empty = document.createElement('p'); empty.id = 'lessonEmpty'; empty.className = 'card empty-state'; empty.hidden = true; empty.textContent = '没有找到相关课程，试试其他关键词。'; $('learnList').after(empty);
    Object.assign(bridge.actions, { continueLearning, startPlannedLesson, openLesson, backToLesson, startReview, revealReview, judgeReview });
    window.addEventListener('popstate', () => {
      navigatingHistory = true;
      try { go(tabInfo[location.hash.slice(1)] ? location.hash.slice(1) : 'dash'); }
      finally { navigatingHistory = false; }
    });
    window.addEventListener('hashchange', () => { const name = location.hash.slice(1); if (tabInfo[name] && name !== currentTab) go(name); });
    preferences().lastVisit = Date.now(); bridge.save();
    const initial = location.hash.slice(1);
    if (initial === 'resume') continueLearning();
    else go(tabInfo[initial] ? initial : 'dash');
    navigationReady = true;
    refresh();
  }
  function toggleMore(open) {
    $('moreMenu').hidden = !open; $('mobileMore').setAttribute('aria-expanded', String(open));
  }
  function onTab(name) {
    if (!bridge || !tabInfo[name]) return;
    currentTab = name;
    document.body.dataset.tab = name;
    document.title = tabInfo[name][0] + ' · ' + subject.name + ' · C-Study';
    $('pageTitle').textContent = tabInfo[name][0]; $('pageSubtitle').textContent = tabInfo[name][2];
    $('pageEyebrow').textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()) + ' / ' + subject.en;
    document.querySelectorAll('#tabs button').forEach(b => { if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    document.querySelectorAll('[data-mobile-tab]').forEach(b => { const active = b.dataset.mobileTab === name; b.classList.toggle('active', active); if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $('mobileMore').classList.toggle('active', !['dash', 'learn', 'pq', 'mistake'].includes(name));
    toggleMore(false);
    if (!navigatingHistory && location.hash !== '#' + name) {
      try { history[navigationReady ? 'pushState' : 'replaceState'](null, '', '#' + name); }
      catch (e) { /* Navigation remains usable in restrictive local-file browsers. */ }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    $('pageTitle').focus({ preventScroll: true });
    refresh();
  }
  function nextLesson() {
    const S = state(), all = Object.values(bridge.lessons).flat();
    const last = all.find(l => l.id === preferences().lastLesson && !(S.lessons[l.id] && S.lessons[l.id].done));
    if (last) return last;
    const current = S.plan && S.plan.chapters.find(ch => ch.start <= bridge.today() && ch.end >= bridge.today());
    const unfinished = l => !(S.lessons[l.id] && S.lessons[l.id].done);
    return (current && (bridge.lessons[current.id] || []).find(unfinished)) || all.find(unfinished) || all[0];
  }
  function rememberLesson(id) {
    const lesson = Object.values(bridge.lessons).flat().find(l => l.id === id);
    if (!lesson) return;
    preferences().lastLesson = id; preferences().lastLessonTitle = lesson.title;
    preferences().lastVisit = Date.now(); bridge.save();
  }
  function continueLearning() { const lesson = nextLesson(); if (lesson) openLesson(lesson.id); else go('learn'); }
  function startPlannedLesson() {
    const S = state();
    const chapter = S.plan && S.plan.chapters.find(ch => ch.start <= bridge.today() && ch.end >= bridge.today());
    const lessons = chapter ? (bridge.lessons[chapter.id] || []) : [];
    const lesson = lessons.find(l => !(S.lessons[l.id] && S.lessons[l.id].done)) || lessons[0];
    if (lesson) openLesson(lesson.id); else continueLearning();
  }
  function openLesson(id) {
    const lesson = Object.values(bridge.lessons).flat().find(l => l.id === id);
    if (!lesson) return;
    $('lessonSearch').value = ''; filterLessons();
    go('learn');
    const element = Array.from(document.querySelectorAll('details.lesson')).find(d => d.dataset.lid === id);
    if (!element) return;
    element.closest('details.chapter').open = true; element.open = true;
    if (!state().timer.running && !state().timer.accumSec) { $('timerChapter').value = lesson.ch; state().timer.chapterId = lesson.ch; }
    rememberLesson(id);
    const summary = element.querySelector('summary'); summary.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start', behavior: motion() });
  }
  function setPracticeSource(id) { practiceSource = id; rememberLesson(id); }
  function backToLesson() { if (practiceSource) openLesson(practiceSource); }
  function clearPracticeSource() { practiceSource = null; }
  function practiceRendered() {
    if (!bridge) return;
    const area = $('pqArea');
    if (practiceSource && !area.querySelector('.back-to-lesson')) {
      const back = document.createElement('button'); back.type = 'button'; back.className = 'btn ghost back-to-lesson'; back.innerHTML = C.icon('book') + '返回本课'; back.addEventListener('click', backToLesson); area.prepend(back);
    }
  }
  function filterLessons() {
    if (!bridge || !$('lessonSearch')) return;
    const query = $('lessonSearch').value.trim().toLowerCase(); let count = 0;
    document.querySelectorAll('#learnList details.chapter').forEach(chapter => {
      let visible = 0;
      chapter.querySelectorAll('details.lesson').forEach(el => {
        const lesson = (bridge.lessons[chapter.dataset.cid] || []).find(l => l.id === el.dataset.lid);
        const match = !query || (chapter.querySelector('.ch-name').textContent + ' ' + lesson.title + ' ' + lesson.goal).toLowerCase().includes(query);
        el.hidden = !match; if (match) { visible++; count++; }
      });
      chapter.hidden = !visible; if (query && visible) chapter.open = true;
    });
    $('lessonSearchInfo').textContent = query ? count + ' 课匹配' : '';
    if ($('lessonEmpty')) $('lessonEmpty').hidden = count > 0;
  }
  function refresh() {
    if (!bridge) return;
    const data = C.summary(state(), bridge.today()), lesson = nextLesson(), hero = $('studyHero');
    hero.innerHTML = '<div class="hero-copy"><span class="hero-label">' + C.icon('book') + '今天，也向目标靠近一点</span><h2>' + (lesson ? C.esc(lesson.title) : '开启今天的学习') + '</h2><p>' + (lesson ? '约 ' + lesson.mins + ' 分钟 · ' + C.esc((bridge.syllabus.find(c => c.id === lesson.ch) || {}).name || subject.name) : '选择一门课程，从一个小目标开始。') + '</p><div class="hero-actions">' + button('arrow', preferences().lastLesson ? '继续学习' : '开始学习', 'continueLearning()') + button('repeat', '今日复习' + (data.due ? ' · ' + data.due + ' 题' : ''), 'startReview()', 'btn ghost') + '</div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span>' + C.icon(subject.icon) + '</span><small>ONE STEP<br>EVERY DAY.</small></div>';
    const backup = $('backupTip');
    if (backup) {
      hero.after(backup);
      backup.innerHTML = '<span>' + (state().settings.lastBackup ? '距离上次备份已超过一周。' : '你还未导出过学习备份。') + '</span><button type="button" class="text-button" onclick="A.goTab(\'settings\')">去导出备份 →</button>';
    }
    $('reviewBanner').querySelector('button').disabled = data.due === 0;
    $('reviewBanner').querySelector('button').innerHTML = C.icon(data.due ? 'repeat' : 'check') + (data.due ? '开始今日复习 · ' + data.due + ' 题' : '今日暂无待复习');
    updateTimer(); filterLessons();
  }
  function updateTimer() {
    if (!bridge) return;
    const T = state().timer, hasTime = T.running || T.accumSec > 0;
    $('timerDock').hidden = currentTab === 'dash' || !hasTime;
    $('dockTime').textContent = $('timerDisplay').textContent;
    $('dockChapter').textContent = bridge.chapterName(T.chapterId) || '专注学习';
    const pause = $('timerDock').querySelector('button'); pause.innerHTML = C.icon('clock') + (T.running ? '暂停' : '继续');
    $('timerDock').classList.toggle('paused', !T.running);
  }
  function startReview() {
    reviewIds = bridge.due(state().mistakes, bridge.today()).map(m => m.id);
    reviewIndex = 0; reviewRevealed = false;
    if (!reviewIds.length) { go('mistake'); bridge.toast('今日暂无待复习错题，可以先学习或做几道练习。'); return; }
    renderReview();
  }
  function renderReview() {
    const m = state().mistakes.find(x => x.id === reviewIds[reviewIndex]);
    if (!m) {
      bridge.openModal('<div class="review-complete">' + C.icon('check') + '<p class="eyebrow">TODAY, WELL DONE.</p><h2>本轮复习完成</h2><p class="muted">已回顾 ' + reviewIds.length + ' 道错题，下一次复习已安排。</p>' + button('check', '完成', 'closeModal()') + '</div>'); return;
    }
    bridge.openModal('<div class="review-progress"><span class="eyebrow">今日复习</span><span>' + (reviewIndex + 1) + ' / ' + reviewIds.length + '</span></div><div class="pbar"><div class="pfill" style="width:' + (reviewIndex / reviewIds.length * 100) + '%"></div></div><h2>' + C.esc(m.source) + '</h2><p class="review-question">' + bridge.math(m.desc) + '</p>' +
      (Array.isArray(m.opts) ? '<div class="opts">' + m.opts.map((o, i) => '<div class="opt review-option' + (reviewRevealed && i === m.ansIdx ? ' right' : '') + '"><span class="letter">' + 'ABCD'[i] + '</span><span>' + bridge.math(o) + '</span></div>').join('') + '</div>' : '') +
      (reviewRevealed ? '<div class="q-sol"><strong>正确思路 / 解析</strong><div class="review-answer">' + bridge.math(m.correct) + '</div></div><div class="row review-actions">' + button('repeat', '还需巩固', 'judgeReview(false)', 'btn ghost') + button('check', '已经掌握思路', 'judgeReview(true)') + '</div>' : '<p class="muted">先在心里或纸上回忆解题步骤，再查看解析。</p>' + button('book', '查看答案与解析', 'revealReview()')));
  }
  function revealReview() { if (reviewIds[reviewIndex]) { reviewRevealed = true; renderReview(); } }
  function judgeReview(ok) {
    if (!reviewRevealed || !reviewIds[reviewIndex]) return;
    bridge.actions.review(reviewIds[reviewIndex], ok); reviewIndex++; reviewRevealed = false; renderReview();
  }
  function modalOpened() {
    if (!bridge) return;
    if (!document.body.classList.contains('modal-open')) {
      modalFocus = document.activeElement;
      modalBackground = Array.from(document.body.children).filter(el => el !== $('modal') && el.tagName !== 'SCRIPT' && !el.classList.contains('toast')).map(el => ({ el, inert: el.inert }));
      modalBackground.forEach(item => { item.el.inert = true; });
    }
    document.body.classList.add('modal-open');
    const box = $('modalBox');
    if (!box.querySelector('.modal-close')) {
      const close = document.createElement('button'); close.type = 'button'; close.className = 'modal-close'; close.setAttribute('aria-label', '关闭对话框'); close.innerHTML = C.icon('close'); close.addEventListener('click', bridge.actions.closeModal); box.prepend(close);
    }
    const title = box.querySelector('h2, h3'); box.setAttribute('aria-label', title ? title.textContent : '对话框'); box.focus();
    box.querySelectorAll('label').forEach(label => { const next = label.nextElementSibling; if (next && /^(INPUT|SELECT|TEXTAREA)$/.test(next.tagName) && next.id) label.htmlFor = next.id; });
  }
  function modalClosed() {
    document.body.classList.remove('modal-open');
    modalBackground.forEach(item => { item.el.inert = item.inert; }); modalBackground = [];
    if (modalFocus && modalFocus.isConnected && !modalFocus.matches(':disabled') && modalFocus.getClientRects().length) modalFocus.focus({ preventScroll: true });
    else if ($('pageTitle')) $('pageTitle').focus({ preventScroll: true });
    modalFocus = null;
  }
  function onKeydown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.f-body.covered')) { e.preventDefault(); e.target.click(); return; }
    if (e.key === 'Escape') { if (!$('modal').classList.contains('hidden')) bridge.actions.closeModal(); else { toggleMore(false); $('mobileMore').focus(); } }
    if (e.key !== 'Tab' || $('modal').classList.contains('hidden')) return;
    const items = Array.from($('modalBox').querySelectorAll('button:not(:disabled), input:not(:disabled), select, textarea, a[href], summary, [tabindex="0"]')).filter(el => el.getClientRects().length);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === $('modalBox'))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || document.activeElement === $('modalBox'))) { e.preventDefault(); first.focus(); }
  }
  function setStorageStatus(ok) {
    storageOK = ok;
    if (!$('saveStatus')) return;
    $('saveStatus').hidden = ok;
    $('saveStatus').textContent = '记录尚未保存到浏览器，可能是存储空间不足或浏览器限制。请先到「设置与数据」导出备份，再重试保存。';
  }
  function decorateFormulas() {
    document.querySelectorAll('.fcard').forEach(card => {
      const star = card.querySelector('.fstar'), name = card.querySelector('.f-name').textContent;
      star.setAttribute('aria-label', (star.classList.contains('on') ? '取消收藏：' : '收藏：') + name);
      star.setAttribute('aria-pressed', String(star.classList.contains('on')));
      const covered = card.querySelector('.f-body.covered');
      if (covered) { covered.setAttribute('role', 'button'); covered.tabIndex = 0; covered.setAttribute('aria-label', '核对：' + name); }
    });
  }
  window.StudyUI = { mount, onTab, refresh, updateTimer, setPracticeSource, clearPracticeSource, practiceRendered, filterLessons, decorateFormulas, modalOpened, modalClosed, setStorageStatus, storageOK: () => storageOK };
})();
