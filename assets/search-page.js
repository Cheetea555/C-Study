(function () {
  'use strict';
  const $ = id => document.getElementById(id), C = window.StudyCommon, S = window.StudySearch, index = window.StudySearchIndex;
  if (!S || !index) { $('searchStatus').textContent = '搜索内容未能加载，请重新打开页面。'; return; }
  const engine = S.create(index.records, index.subjects), pageSize = 20;
  let results = [], shown = pageSize;
  const subjects = new Map(index.subjects.map(subject => [subject.id, subject.name]));
  function marked(text, hits) { return S.highlight(text, hits).map(part => part.match ? '<mark>' + C.esc(part.text) + '</mark>' : C.esc(part.text)).join(''); }
  function render() {
    const query = $('searchQuery').value.trim();
    results = engine.search(query, { subject: $('searchSubject').value, type: $('searchType').value });
    $('searchResults').innerHTML = results.slice(0, shown).map(result => '<article class="card search-result" data-search-key="' + C.esc(result.key) + '">' +
      '<p class="search-meta"><span>' + C.esc(subjects.get(result.subject)) + '</span><span>' + S.types[result.type] + '</span><span>' + C.esc(result.chapter) + '</span></p>' +
      '<h2><a href="' + C.esc(result.href) + '">' + marked(result.title, result.hits) + '</a></h2>' +
      (result.snippet ? '<p class="search-snippet">' + marked(result.snippet, result.hits) + '</p>' : '') +
      '<div class="search-result-footer"><span class="muted">命中' + C.esc(result.matched) + '</span><a href="' + C.esc(result.href) + '">' + ({ lesson: '查看讲解', point: '定位考点', question: '查看题目', card: '打开速查卡' })[result.type] + ' →</a></div></article>').join('');
    $('searchStatus').textContent = !query ? '输入关键词，搜索 ' + index.records.length + ' 条学习内容。' : results.length ? '找到 ' + results.length + ' 条结果，已显示 ' + Math.min(shown, results.length) + ' 条。' : '没有找到相关内容。试试更短的关键词，或切换科目与内容类型。';
    $('searchMore').hidden = shown >= results.length;
    document.title = (query ? query + ' · ' : '') + '四科搜索 · C-Study';
  }
  function updateURL(replace) {
    const params = new URLSearchParams();
    for (const [key, id] of [['q', 'searchQuery'], ['subject', 'searchSubject'], ['type', 'searchType']]) if ($(id).value.trim()) params.set(key, $(id).value.trim());
    if (shown > pageSize) params.set('page', String(shown / pageSize));
    try { history[replace ? 'replaceState' : 'pushState'](null, '', location.pathname + (params.size ? '?' + params.toString() : '')); }
    catch (error) { /* Search still works when local-file history updates are restricted. */ }
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    $('searchQuery').value = (params.get('q') || '').slice(0, 200);
    $('searchSubject').value = subjects.has(params.get('subject')) ? params.get('subject') : '';
    $('searchType').value = Object.hasOwn(S.types, params.get('type')) ? params.get('type') : '';
    shown = Math.max(1, Math.min(Math.ceil(index.records.length / pageSize), Number.parseInt(params.get('page'), 10) || 1)) * pageSize;
    render();
  }
  function search(event) { if (event) event.preventDefault(); shown = pageSize; updateURL(false); render(); }
  $('searchForm').addEventListener('submit', search);
  $('searchSubject').addEventListener('change', search);
  $('searchType').addEventListener('change', search);
  $('resetSearch').addEventListener('click', () => { $('searchForm').reset(); search(); $('searchQuery').focus(); });
  $('searchMore').addEventListener('click', () => { shown += pageSize; updateURL(true); render(); });
  window.addEventListener('popstate', readURL);
  readURL();
})();
