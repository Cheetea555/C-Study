/* Shared, dependency-free presentation helpers. Works with file:// and Node. */
(function (root) {
  'use strict';
  const subjects = [
    { id: 'math2', folder: 'kaoyan-math2', key: 'kaoyan-math2.v1', name: '数学二', en: 'MATHEMATICS', icon: 'math', points: 142, chapters: 15, lessons: 53, questions: 150, description: '从极限出发，把每一步推导学扎实。' },
    { id: '408', folder: 'kaoyan-408', key: 'kaoyan-408.v1', name: '计算机 408', en: 'COMPUTER SCIENCE', icon: 'code', points: 165, chapters: 26, lessons: 55, questions: 130, description: '连接知识体系，理解计算机的运作。' },
    { id: 'en2', folder: 'kaoyan-en2', key: 'kaoyan-en2.v1', name: '英语二', en: 'ENGLISH', icon: 'book', points: 40, chapters: 8, lessons: 16, questions: 40, description: '读懂一句话，再读懂一篇文章。' },
    { id: 'politics', folder: 'kaoyan-politics', key: 'kaoyan-pol.v1', name: '思想政治', en: 'POLITICS', icon: 'flag', points: 73, chapters: 16, lessons: 32, questions: 48, description: '梳理原理与脉络，让记忆有据可循。' }
  ];
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15"/>',
    math: '<path d="m4 13 4 6L14 4h7M15 11h6m-6 6h6"/>',
    code: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-3-12-2 2 2 2m6-4 2 2-2 2"/>',
    flag: '<path d="M5 21V4c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
    pen: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
    repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
    chart: '<path d="M4 3v17h17M8 15l4-5 4 3 5-7"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="3" fill="currentColor" stroke="none"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    home: '<path d="m3 10 9-7 9 7v10H3Zm6 10v-7h6v7"/>'
  };
  function icon(name) {
    return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.book) + '</svg>';
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function localDate(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function summary(state, today) {
    if (!state || !state.settings || !Array.isArray(state.logs) || !Array.isArray(state.mistakes)) return null;
    const minutes = state.logs.filter(l => l && l.date === today).reduce((n, l) => n + Math.max(0, Number(l.minutes) || 0), 0);
    const due = state.mistakes.filter(m => m && !m.mastered && m.nextReview && m.nextReview <= today).length;
    const mastered = Object.values(state.kp || {}).filter(p => p && p.status === 3).length;
    const learned = Object.values(state.lessons || {}).filter(l => l && l.done).length;
    return { minutes, due, mastered, learned, lastVisit: Number(state.ui && state.ui.lastVisit) || 0 };
  }
  const api = { subjects, icon, esc, localDate, summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyCommon = api;
})(typeof window !== 'undefined' ? window : this);
