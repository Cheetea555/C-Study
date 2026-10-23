(function () {
  'use strict';
  const C = window.StudyCommon;
  document.querySelector('.logo-mark').innerHTML = C.icon('book');
  function render() {
    const today = C.localDate();
    const records = C.subjects.map(subject => {
      try {
        const raw = localStorage.getItem(subject.key);
        if (!raw) return { subject, data: null, saved: null, unavailable: false };
        const saved = JSON.parse(raw), data = C.summary(saved, today);
        return { subject, data, saved, unavailable: !data };
      } catch (e) { return { subject, data: null, saved: null, unavailable: true }; }
    });
    document.getElementById('portalDate').textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()) + ' / YOUR STUDY SPACE';
    const incomplete = records.some(r => r.unavailable);
    for (const [id, field] of [['totalMinutes', 'minutes'], ['totalDue', 'due'], ['totalLessons', 'learned']]) {
      document.getElementById(id).textContent = incomplete ? '—' : records.reduce((n, r) => n + (r.data ? r.data[field] : 0), 0);
    }
    document.getElementById('subjectGrid').innerHTML = records.map(({ subject: s, data: d, unavailable }) => {
      const progress = d ? Math.min(100, Math.round(d.mastered / s.points * 100)) : 0;
      return '<a class="subject-card" data-subject="' + s.id + '" href="' + s.folder + '/index.html"><div class="subject-card-top"><span class="subject-icon">' + C.icon(s.icon) + '</span><span class="subject-status">' + (unavailable ? '记录暂时无法读取' : d ? (d.due ? '待复习 ' + d.due + ' 题' : '今日已学 ' + d.minutes + ' 分钟') : '等待你的第一步') + '</span></div><span class="eyebrow">' + s.en + '</span><h3>' + s.name + '</h3><p class="subject-description">' + s.description + '</p><div class="subject-progress"><span>知识点掌握</span><span>' + (unavailable ? '暂无统计' : (d ? d.mastered : 0) + ' / ' + s.points) + '</span></div><div class="pbar"><div class="pfill" style="width:' + progress + '%"></div></div><div class="subject-card-footer"><span>' + s.chapters + ' 章 · ' + s.lessons + ' 课 · ' + s.questions + ' 道练习</span><span>进入学习 ' + C.icon('arrow') + '</span></div></a>';
    }).join('');
    const recent = records.filter(r => r.data && r.data.lastVisit).sort((a, b) => b.data.lastVisit - a.data.lastVisit)[0];
    if (recent) {
      document.getElementById('portalResume').innerHTML = '<span class="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>继续学习' + recent.subject.name + '</h3><p>' + C.esc(recent.saved.ui.lastLessonTitle || '回到你的学习节奏，从上次的位置继续。') + '</p><a class="btn" href="' + recent.subject.folder + '/index.html#resume">继续上次学习 ' + C.icon('arrow') + '</a>';
    }
    const fileMode = location.protocol === 'file:';
    const note = incomplete ? '部分记录暂时无法读取，汇总暂不显示。可进入各科检查记录，并导出备份。' : '学习记录保存在当前浏览器中。每周到各科「设置与数据」导出一次备份，让每一份努力都有留存。';
    document.getElementById('portalNote').innerHTML = C.icon('book') + '<span>' + note + (fileMode ? '<br>本地文件模式下，跨科统计可能受浏览器限制，请以各科页面的记录为准。' : '') + '</span>';
  }
  render();
  window.addEventListener('storage', render);
  window.addEventListener('pageshow', render);
  window.addEventListener('focus', render);
})();
