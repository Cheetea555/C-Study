(function () {
  'use strict';
  const R = window.StudyReplacement, el = id => document.getElementById(id);
  let session;
  const names = { fifo: 'FIFO', lru: 'LRU' };
  function error(message) { el('demoError').textContent = message || ''; el('demoError').hidden = !message; }
  function inputs() { return { algorithm: el('demoAlgorithm').value, frames: Number(el('demoFrames').value), sequence: el('demoSequence').value }; }
  function fill(config) { el('demoAlgorithm').value = config.algorithm; el('demoFrames').value = config.frames; el('demoSequence').value = config.sequence; }
  function dirty() {
    let changed = true;
    try { changed = JSON.stringify(R.validate(inputs())) !== JSON.stringify(session.view().config); } catch (_) { /* 保留无效草稿供修正。 */ }
    el('demoDirty').hidden = !changed;
  }
  function begin(config, updateUrl) {
    const nextSession = R.create(config); // 校验成功后才替换当前推演。
    session = nextSession;
    fill(session.view().config); error(''); el('demoDirty').hidden = true;
    if (updateUrl) {
      try { window.history.replaceState(null, '', R.hashFor(config)); }
      catch (_) { error('演示已开始，浏览器未允许更新地址栏。'); }
    }
    render();
  }
  function predictionState() {
    const v = session.view(), kind = el('predictKind').value;
    el('victimField').hidden = kind !== 'replace';
    el('predictNext').disabled = !v.next || v.next.seen || !kind || (kind === 'replace' && el('predictVictim').value === '');
  }
  function advance(prediction) {
    try { session.next(prediction); error(''); render(); } catch (e) { error(e.message); }
  }
  function render() {
    const v = session.view(), current = v.current;
    el('demoActive').textContent = names[v.config.algorithm] + ' · ' + v.config.frames + ' 个页框 · 访问序列 ' + v.config.sequence;
    el('demoRule').textContent = v.config.algorithm === 'fifo' ? 'FIFO：淘汰最早装入的页。命中不改变装入顺序。' : 'LRU：淘汰最近最久未访问的页。命中也刷新最近使用顺序。';
    el('demoStep').textContent = '第 ' + v.cursor + ' / ' + v.total + ' 步' + (current ? ' · 本次访问页 ' + current.page : ' · 初始为空');
    el('demoSlots').replaceChildren(...v.slots.map((page, index) => {
      const li = document.createElement('li');
      if (current && index === current.slot) li.className = 'demo-slot-active';
      const label = document.createElement('span'), value = document.createElement('strong'), state = document.createElement('small');
      label.textContent = '页框 ' + (index + 1); value.textContent = page === null ? '空' : String(page);
      state.textContent = current && index === current.slot ? current.fault ? '本步装入' : '本步命中' : page === null ? '可装入' : '驻留';
      li.append(label, value, state); return li;
    }));
    el('demoOrder').textContent = (v.config.algorithm === 'fifo' ? '装入顺序（最早 → 最晚）：' : '使用顺序（最久未用 → 最近使用）：') + (v.order.length ? v.order.join(' → ') : '空');
    el('demoExplanation').textContent = current ? current.explanation : '先预测访问页 ' + v.next.page + ' 的结果，或点击下一步直接揭示。';
    el('demoCounts').textContent = '已访问 ' + v.cursor + ' 次 · 缺页 ' + v.faults + ' 次 · 命中 ' + v.hits + ' 次';
    el('demoPrediction').hidden = !v.next;
    el('nextAccess').textContent = v.next ? '下一次：第 ' + v.next.index + ' 步，访问页 ' + v.next.page : '';
    el('predictionFields').hidden = !v.next || v.next.seen;
    el('seenHint').hidden = !v.next || !v.next.seen;
    el('predictKind').value = '';
    const blank = document.createElement('option'); blank.value = ''; blank.textContent = '请选择驻留页';
    el('predictVictim').replaceChildren(blank, ...v.slots.filter(page => page !== null).map(page => {
      const option = document.createElement('option'); option.value = page; option.textContent = '页 ' + page; return option;
    }));
    const feedback = v.feedback;
    el('demoFeedback').textContent = current ? feedback ? (feedback.correct ? '预测正确。' : '预测有误。') + ' 你预测：' + ({ hit: '命中', load: '缺页，装入空闲框', replace: '缺页，淘汰页 ' + feedback.victim })[feedback.kind] + '。' : '本步直接揭示，未作预测。' : '';
    el('demoPrevious').disabled = !v.cursor; el('demoNext').disabled = v.complete;
    el('demoNext').textContent = v.next && v.next.seen ? '下一步（回看）' : '下一步（直接揭示）';
    el('demoConclusion').hidden = !v.complete;
    el('demoConclusion').textContent = v.complete ? '本次推演完成：' + names[v.config.algorithm] + '，' + v.config.frames + ' 帧，缺页 ' + v.faults + ' / ' + v.total + ' 次（' + (v.faults / v.total * 100).toFixed(1) + '%）。可保持序列，修改算法或页框数后再比较。算法间谁更少，与 Belady 异常不是同一个问题；Belady 异常指同一算法增加页框后缺页反而增多。' : '';
    el('historyCaption').textContent = v.cursor ? '第 1～' + v.cursor + ' 步；空页框以「空」表示。' : '尚未开始访问。';
    el('demoHistory').replaceChildren(...v.history.map(step => {
      const row = document.createElement('tr');
      for (const [index, value] of [step.index, step.page, step.fault ? '缺页' : '命中', step.victim === null ? '无' : step.victim, step.after.map(page => page === null ? '空' : page).join(' | '), step.faults].entries()) {
        const cell = document.createElement(index ? 'td' : 'th'); if (!index) cell.scope = 'row'; cell.textContent = value; row.append(cell);
      }
      return row;
    }));
    predictionState(); dirty();
  }
  el('demoForm').addEventListener('submit', event => {
    event.preventDefault();
    try { begin(inputs(), true); el('playerTitle').focus(); el('playerTitle').scrollIntoView({ block: 'start' }); }
    catch (e) { error(e.message); }
  });
  el('editDemo').addEventListener('click', () => { el('configTitle').focus(); el('configTitle').scrollIntoView({ block: 'start' }); });
  el('demoForm').addEventListener('input', dirty);
  el('demoForm').addEventListener('change', dirty);
  for (const [id, frames, sequence] of [['classicPreset', 3, R.example], ['fourPreset', 4, R.example], ['hitPreset', 3, '1,2,3,1,4']]) {
    el(id).addEventListener('click', () => { fill({ algorithm: el('demoAlgorithm').value, frames, sequence }); dirty(); });
  }
  el('predictKind').addEventListener('change', predictionState);
  el('predictVictim').addEventListener('change', predictionState);
  el('predictNext').addEventListener('click', () => {
    if (el('predictNext').disabled) return;
    advance({ kind: el('predictKind').value, victim: el('predictVictim').value === '' ? null : Number(el('predictVictim').value) });
  });
  el('demoNext').addEventListener('click', () => advance());
  el('demoPrevious').addEventListener('click', () => { session.previous(); render(); });
  el('demoReset').addEventListener('click', () => { session.reset(); render(); });
  el('demoStage').addEventListener('keydown', event => {
    if (event.target !== el('demoStage') || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowRight') advance();
    else { if (event.key === 'Home') session.reset(); else session.previous(); render(); }
  });
  function fromLocation() {
    try { begin(R.parseHash(window.location.hash), false); }
    catch (e) { if (!session) begin(R.parseHash(''), false); error(e.message); }
  }
  window.addEventListener('hashchange', fromLocation);
  fromLocation();
})();
