/* Shared, dependency-free search over public learning content. */
(function (root) {
  'use strict';
  const types = { point: '考点', lesson: '课程', question: '题目', card: '速查卡' };
  const aliases = [
    ['PV', 'PV操作', 'P/V', '信号量'], ['TLB', '快表'], ['求导', '导数']
  ];
  function normalize(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function toText(value) {
    return String(value || '').replace(/<\/?(?:p|br|b|strong|i|em|span|div|li|ul|ol|code|pre|sub|sup|a|details|summary)\b[^>]*>/gi, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g,
      entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }[entity]))
      .replace(/@\{([^{}|]*)\|([^{}]*)\}/g, '($1)/($2)').replace(/@[md]\{([^{}]*)\}/g, '[$1]')
      .replace(/\s+/g, ' ').trim();
  }
  function terms(query) {
    return normalize(query).split(' ').filter(Boolean).map(term => {
      const group = aliases.find(group => group.some(alias => normalize(alias) === term));
      return [...new Set([term, ...(group || []).map(normalize)])];
    });
  }
  function position(text, term, from) {
    let index = text.indexOf(term, from || 0);
    while (index >= 0) {
      // An acronym must not match inside an unrelated English word.
      if (!/^[a-z0-9]+$/.test(term) || (!/[a-z0-9]/.test(text[index - 1] || '') && !/[a-z0-9]/.test(text[index + term.length] || ''))) return index;
      index = text.indexOf(term, index + 1);
    }
    return -1;
  }
  function excerpt(text, term, length) {
    const index = normalize(text).indexOf(term), size = length || 135;
    const start = Math.max(0, index - 35);
    return (start ? '…' : '') + text.slice(start, start + size) + (text.length > start + size ? '…' : '');
  }
  // Keep offsets into original text even when NFKC expands a character.
  function highlight(text, needles) {
    const original = String(text || ''), starts = [], ends = [];
    let folded = '', offset = 0;
    for (const char of original) {
      const value = char.normalize('NFKC').toLowerCase();
      for (let i = 0; i < value.length; i++) { starts.push(offset); ends.push(offset + char.length); }
      folded += value; offset += char.length;
    }
    const ranges = [];
    for (const needle of needles || []) {
      const term = normalize(needle);
      if (!term) continue;
      let index = position(folded, term);
      while (index >= 0) {
        ranges.push([starts[index], ends[index + term.length - 1]]);
        index = position(folded, term, index + term.length);
      }
    }
    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    for (const range of ranges) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
      else merged.push(range.slice());
    }
    const parts = []; offset = 0;
    for (const [start, end] of merged) {
      if (start > offset) parts.push({ text: original.slice(offset, start), match: false });
      parts.push({ text: original.slice(start, end), match: true }); offset = end;
    }
    if (offset < original.length) parts.push({ text: original.slice(offset), match: false });
    return parts;
  }
  function create(records, subjects) {
    const folders = new Map(subjects.map(subject => [subject.id, subject.folder]));
    const rows = records.map(record => ({ record, fields: [
      { text: record.title, label: record.type === 'question' ? '题干' : '标题', weight: 100 },
      { text: record.chapter, label: '章节', weight: 8 },
      ...record.sections.map(section => ({ ...section, weight: 28 }))
    ].map(field => ({ ...field, normalized: normalize(field.text) })) }));
    function search(query, filters) {
      const groups = terms(String(query || '').slice(0, 200)), options = filters || {};
      if (!groups.length) return [];
      const found = [];
      for (const { record, fields } of rows) {
        if (options.subject && record.subject !== options.subject) continue;
        if (options.type && record.type !== options.type) continue;
        let score = 0, evidence = null;
        const hits = [];
        for (const group of groups) {
          let best = null;
          for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            const field = fields[fieldIndex];
            for (const term of group) {
              if (position(field.normalized, term) < 0) continue;
              const value = field.weight * (term === group[0] ? 1 : 0.8) + (field.normalized === term ? 20 : 0);
              if (!best || value > best.score) best = { fieldIndex, term, score: value };
            }
          }
          if (!best) { score = 0; break; }
          score += best.score; hits.push(best.term);
          if (!evidence || (best.fieldIndex >= 2 && evidence.fieldIndex < 2)) evidence = best;
        }
        if (!score) continue;
        const field = fields[evidence.fieldIndex], params = new URLSearchParams();
        let tab;
        if (record.type === 'point') { tab = 'kp'; params.set('point', record.id); }
        if (record.type === 'lesson') { tab = 'learn'; params.set('lesson', record.id); if (evidence.fieldIndex >= 2) params.set('text', evidence.term); }
        if (record.type === 'question') { tab = 'pq'; params.set('question', record.id); }
        if (record.type === 'card') { tab = 'learn'; params.set('card', record.id); }
        const body = evidence.fieldIndex >= 2 ? field.text : record.type === 'question' ? '' : (record.sections[0]?.text || record.chapter);
        found.push({ ...record, score, hits, matched: field.label, snippet: body ? excerpt(body, evidence.term) : '',
          href: folders.get(record.subject) + '/index.html#' + tab + '?' + params.toString() });
      }
      return found.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key, 'en'));
    }
    return { search };
  }
  const api = { create, normalize, toText, terms, highlight, types, aliases };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudySearch = api;
})(typeof window !== 'undefined' ? window : this);
