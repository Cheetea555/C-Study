/* FIFO / LRU 的确定性轨迹与临时演示会话；不读写学习记录。 */
(function (root) {
  'use strict';
  const pointId = '408.os03.p06', lessonId = 'Los03-2';
  const example = '1,2,3,4,1,2,5,1,2,3,4,5';
  function validate(input) {
    if (!input || !['fifo', 'lru'].includes(input.algorithm)) throw Error('请选择 FIFO 或 LRU。');
    if (!Number.isInteger(input.frames) || input.frames < 1 || input.frames > 6) throw Error('页框数须为 1～6 的整数。');
    const raw = input.sequence;
    if (typeof raw !== 'string' || raw.length > 500 || !raw.trim()) throw Error('请输入 1～40 个页号。');
    const tokens = raw.trim().split(/[\s,，、;；]+/);
    if (tokens.length > 40 || tokens.some(token => !/^\d{1,2}$/.test(token))) throw Error('请输入 1～40 个 0～99 的整数页号，用空格或逗号分隔；末尾不要加分隔符。');
    return { algorithm: input.algorithm, frames: input.frames, sequence: tokens.map(Number).join(',') };
  }
  function simulate(input) {
    const config = validate(input), sequence = config.sequence.split(',').map(Number);
    const slots = Array(config.frames).fill(null), order = [], trace = [];
    let faults = 0;
    for (const [index, page] of sequence.entries()) {
      const before = slots.slice(), orderBefore = order.slice();
      let slot = slots.indexOf(page), victim = null;
      const fault = slot < 0;
      if (fault) {
        faults++;
        slot = slots.indexOf(null);
        if (slot < 0) { victim = order.shift(); slot = slots.indexOf(victim); }
        slots[slot] = page;
        order.push(page);
      } else if (config.algorithm === 'lru') {
        order.splice(order.indexOf(page), 1); order.push(page);
      }
      const kind = fault ? victim === null ? 'load' : 'replace' : 'hit';
      const explanation = kind === 'load' ? '缺页，装入空闲页框 ' + (slot + 1) + '，无需淘汰。'
        : kind === 'replace' ? '缺页，淘汰' + (config.algorithm === 'fifo' ? '最早装入的' : '最近最久未访问的') + '页 ' + victim + '，将页 ' + page + ' 装入页框 ' + (slot + 1) + '。'
        : config.algorithm === 'fifo' ? '命中页 ' + page + '；FIFO 的装入顺序保持不变。' : '命中页 ' + page + '；将它移到最近使用端，页框位置保持不变。';
      trace.push({ index: index + 1, page, before, orderBefore, after: slots.slice(), order: order.slice(), slot, victim, fault, kind, faults, hits: index + 1 - faults, explanation });
    }
    return trace;
  }
  function create(input) {
    const config = validate(input), trace = simulate(config), predictions = new Map();
    let cursor = 0, furthest = 0;
    function view() {
      const current = cursor ? trace[cursor - 1] : null;
      // 返回副本，页面仅获得当前步及已到达的前缀，不提前展示后续答案。
      return JSON.parse(JSON.stringify({ config, cursor, total: trace.length, complete: cursor === trace.length,
        current, slots: current ? current.after : Array(config.frames).fill(null), order: current ? current.order : [],
        faults: current ? current.faults : 0, hits: current ? current.hits : 0,
        next: cursor < trace.length ? { index: cursor + 1, page: trace[cursor].page, seen: cursor < furthest } : null,
        history: trace.slice(0, cursor), feedback: predictions.get(cursor) || null }));
    }
    function next(prediction) {
      if (cursor === trace.length) return view();
      const step = trace[cursor];
      if (cursor >= furthest) {
        if (prediction != null) {
          if (!['hit', 'load', 'replace'].includes(prediction.kind)) throw Error('请先预测本次访问的结果。');
          if (prediction.kind === 'replace' && (!Number.isInteger(prediction.victim) || !step.before.includes(prediction.victim))) throw Error('请选择当前驻留的淘汰页。');
          predictions.set(cursor + 1, { kind: prediction.kind, victim: prediction.kind === 'replace' ? prediction.victim : null,
            correct: prediction.kind === step.kind && (step.kind !== 'replace' || prediction.victim === step.victim) });
        }
        furthest = cursor + 1;
      }
      cursor++; return view();
    }
    return { view, next, previous() { cursor = Math.max(0, cursor - 1); return view(); },
      reset() { cursor = 0; furthest = 0; predictions.clear(); return view(); } };
  }
  function parseHash(hash) {
    const value = String(hash || '');
    if (!value || value === '#replacement') return validate({ algorithm: 'fifo', frames: 3, sequence: example });
    if (!value.startsWith('#replacement?') || value.length > 1200) throw Error('演示链接无效，请调整配置后开始。');
    const params = new URLSearchParams(value.slice(value.indexOf('?') + 1));
    const frames = params.get('frames');
    if (!/^[1-6]$/.test(frames || '')) throw Error('演示链接中的页框数无效。');
    return validate({ algorithm: params.get('algorithm'), frames: Number(frames), sequence: params.get('sequence') });
  }
  function hashFor(input) {
    const config = validate(input);
    return '#replacement?' + new URLSearchParams({ algorithm: config.algorithm, frames: String(config.frames), sequence: config.sequence });
  }
  const api = { pointId, lessonId, example, validate, simulate, create, parseHash, hashFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyReplacement = api;
})(typeof window !== 'undefined' ? window : this);
