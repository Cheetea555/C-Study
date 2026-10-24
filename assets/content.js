/* 从单向内容引用生成反向查询，不维护第二份关联表。 */
(function (root) {
  'use strict';
  function create(syllabus, lessons, questions) {
    const points = new Map(), lessonRows = Object.values(lessons).flat(), pointLessons = new Map(), pointQuestions = new Map();
    syllabus.forEach(ch => ch.points.forEach(point => points.set(point.id, Object.assign({ chapterId: ch.id }, point))));
    const questionRows = new Map(questions.map(q => [q.id, q]));
    for (const lesson of lessonRows) for (const id of new Set(lesson.pointIds)) {
      if (!pointLessons.has(id)) pointLessons.set(id, []);
      pointLessons.get(id).push(lesson);
    }
    for (const question of questions) for (const id of new Set(question.pointIds || [])) {
      if (!pointQuestions.has(id)) pointQuestions.set(id, []);
      pointQuestions.get(id).push(question);
    }
    const lessonsFor = id => (pointLessons.get(id) || []).slice();
    const questionsFor = id => (pointQuestions.get(id) || []).slice();
    function related(questionId) {
      const question = questionRows.get(questionId);
      return question ? (question.pointIds || []).map(id => ({ point: points.get(id), lessons: lessonsFor(id), questions: questionsFor(id) })).filter(item => item.point) : [];
    }
    return { point: id => points.get(id), lessonsFor, questionsFor, related };
  }
  function esc(value) { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]); }
  function lessonLinks(index, id) {
    return index.lessonsFor(id).map(lesson => '<a class="btn sm ghost" href="' + esc(route('learn', { lesson: lesson.id, point: id })) + '">回看：' + esc(lesson.title) + '</a>').join('');
  }
  function exerciseLink(index, id) {
    const count = index.questionsFor(id).length;
    return count ? '<a class="btn sm ghost" href="' + esc(route('pq', { point: id })) + '">练习本考点 · ' + count + ' 题</a>' : '<span class="muted">尚未关联专项题</span>';
  }
  function demonstrationLink(id) {
    return id === '408.os03.p06' ? '<a class="btn sm ghost" href="../algorithms.html#replacement">演示：FIFO / LRU</a>' : '';
  }
  function pointLinks(index, id) { return '<div class="kp-links">' + lessonLinks(index, id) + exerciseLink(index, id) + demonstrationLink(id) + '</div>'; }
  function lessonPoints(index, lesson) {
    return '<div class="lesson-points"><h4>本课考点与练习</h4>' + lesson.pointIds.map(id => {
      const point = index.point(id);
      return point ? '<div data-focus-point="' + esc(id) + '"><span>' + esc(point.title) + '</span>' + exerciseLink(index, id) + demonstrationLink(id) + '</div>' : '';
    }).join('') + '</div>';
  }
  function relatedHtml(index, questionId) {
    const items = index.related(questionId);
    return items.length ? '<aside class="related-knowledge"><h4>相关知识与补课</h4>' + items.map(item => '<div><strong>' + esc(item.point.title) + '</strong><div class="row">' + lessonLinks(index, item.point.id) + exerciseLink(index, item.point.id) + demonstrationLink(item.point.id) + '</div></div>').join('') + '</aside>' : '';
  }
  function parseRoute(hash) {
    const value = String(hash || '').replace(/^#/, ''), split = value.indexOf('?');
    const tab = split < 0 ? value : value.slice(0, split);
    const params = new URLSearchParams(split < 0 ? '' : value.slice(split + 1));
    const target = { tab: tab || 'dash', lesson: params.get('lesson'), point: params.get('point'),
      question: params.get('question'), card: params.get('card'), text: (params.get('text') || '').slice(0, 200) };
    if (params.has('review')) target.reviewIds = [...new Set(params.get('review').split(',').slice(0, 50).filter(id => /^[a-zA-Z0-9_.:-]{1,180}$/.test(id)))];
    return target;
  }
  function route(tab, values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values || {})) if (value) params.set(key, value);
    return '#' + tab + (params.size ? '?' + params.toString() : '');
  }
  const api = { create, parseRoute, route, pointLinks, lessonPoints, relatedHtml };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyContent = api;
})(typeof window !== 'undefined' ? window : this);
