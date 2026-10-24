(function () {
  'use strict';
  const C = window.StudyCommon, S = window.StudyStorage, B = window.StudyBackup;
  const engine = B.create(S, window.StudyPlanner, window.StudyPlanCatalog), $ = id => document.getElementById(id);
  const storage = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key) };
  const canRestore = location.protocol !== 'file:';
  const names = new Map(engine.specs.map(spec => [spec.id, spec.name]));
  let current, collected = null, pending = null, journalAction = null, journalRaw = null, reading = false;
  function issue(message) { $('backupWarning').hidden = !message; $('backupWarning').textContent = message || ''; }
  function status(message) { $('backupStatus').textContent = message; }
  function completeness(pack) {
    const info = engine.describe(pack), planner = info.rows.find(row => row.id === 'planner');
    return (info.complete ? '四科记录齐全' : '部分备份：已找到 ' + info.subjectCount + '/4 科记录') + ' · 全局计划' + (planner.status === 'included' ? '已包含' : planner.status === 'error' ? '读取异常' : '未包含');
  }
  function rowText(row) { return row.status === 'included' ? row.summary : row.status === 'error' ? '无法读取：' + row.message : '未找到记录，不会用空白数据替代'; }
  function cancelPreview() { pending = null; $('restoreConfirmation').hidden = true; }
  function renderCurrent() {
    current = engine.capture(storage, location.protocol);
    $('backupOrigin').textContent = canRestore ? '读取当前站点已保存的记录。未找到的科目会标为缺失，请核对是否在其他浏览器或站点学习。' : '本地文件模式：跨文件记录可能隔离。可收集和下载备份；统一恢复请在同一 HTTP 站点使用，或拆分后去各科分别导入。';
    $('browserRecords').innerHTML = engine.describe(current).rows.map(row => '<li><strong>' + C.esc(row.name) + '</strong><span>' + C.esc(rowText(row)) + '</span>' + (row.status === 'error' ? '<button class="text-button" type="button" data-download-raw="' + row.id + '">下载该项原文</button>' : '') + '</li>').join('');
    $('browserCompleteness').textContent = completeness(current);
    $('exportFull').disabled = !current.entries.some(row => row.status === 'included');
    renderJournal();
  }
  function renderCollection() {
    cancelPreview(); $('collectedBackup').hidden = !collected;
    if (!collected) { $('importRecords').innerHTML = ''; return; }
    $('importCompleteness').textContent = completeness(collected);
    $('importRecords').innerHTML = engine.describe(collected).rows.map(row => '<label><input type="checkbox" name="restoreItem" value="' + row.id + '" ' + (row.status === 'included' ? 'checked' : 'disabled') + '><span><strong>' + C.esc(row.name) + '</strong><small>' + C.esc(rowText(row)) + '</small></span></label>').join('');
    $('previewRestore').disabled = !canRestore || reading;
    $('extractBackups').innerHTML = engine.describe(collected).rows.filter(row => row.status === 'included').map(row => '<button type="button" class="btn sm ghost" data-extract-backup="' + row.id + '">下载' + C.esc(row.name) + '备份</button>').join('');
  }
  function renderJournal() {
    try {
      journalRaw = storage.getItem(B.JOURNAL);
      const archived = journalRaw === null;
      if (archived) journalRaw = storage.getItem(B.JOURNAL + '.previous');
      $('restoreJournal').hidden = journalRaw === null;
      if (journalRaw === null) return;
      $('previewFinishJournal').disabled = archived || !canRestore;
      if (archived) { $('journalStatus').textContent = '上次恢复处理已结束，保留一份原文副本供下载。'; $('previewRollback').disabled = true; return; }
      const journal = engine.readJournal(storage), labels = { prepared: '上次恢复未完成结果确认，请核对或回滚。', complete: '上次恢复已写入；需要时可下载覆盖前原文或回滚。', 'rolled-back': '上次恢复已回滚，原记录已还原。', 'rollback-incomplete': '部分项目尚未回滚，请查看处理结果或下载原文核对。' };
      $('journalStatus').textContent = labels[journal.status]; $('previewRollback').disabled = !canRestore || journal.status === 'rolled-back';
    } catch (error) { $('restoreJournal').hidden = false; $('journalStatus').textContent = '恢复记录无法读取，请先下载原文核对，再结束恢复处理。'; $('previewRollback').disabled = true; }
  }
  function accept(texts) { cancelPreview(); collected = engine.collect(texts, collected); renderCollection(); issue(''); status('已读取备份，请核对项目后选择恢复范围。'); }
  function downloadPack(pack) { const info = engine.describe(pack); S.download(pack, 'c-study-' + (info.complete ? 'full' : 'partial') + '-backup-' + C.localDate() + '.json'); }
  function results(message, rows) {
    const labels = { unchanged: '保持恢复前原文', 'rolled-back': '已还原原文', conflict: '检测到后续变更，保留当前记录', failed: '未能还原，请下载恢复原文', restored: '已恢复' };
    $('restoreResult').hidden = false; $('restoreResultMessage').textContent = message;
    $('restoreResultRows').innerHTML = rows.map(row => '<li><strong>' + C.esc(names.get(row.id)) + '</strong><span>' + C.esc(labels[row.status] || row.status) + (row.message ? '：' + C.esc(row.message) : '') + '</span></li>').join('');
    $('restoreResultTitle').focus({ preventScroll: true }); $('restoreResult').scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  $('refreshBackup').addEventListener('click', () => { cancelPreview(); issue(''); renderCurrent(); status('已重新读取当前浏览器记录；已收集的备份仍保留。'); });
  $('exportFull').addEventListener('click', () => { try { renderCurrent(); if (!current.entries.some(row => row.status === 'included')) throw Error('没有可导出的有效记录，请先收集各科备份'); downloadPack(current); status('已发起备份下载，请确认文件保存成功。缺失或异常项目请另行补齐。'); } catch (error) { issue(error.message); } });
  $('browserRecords').addEventListener('click', event => { const id = event.target.closest('[data-download-raw]')?.dataset.downloadRaw; if (!id) return; try { const raw = storage.getItem(engine.specs.find(s => s.id === id).key); if (raw === null) throw Error('没有可下载的原文'); S.download(raw, 'c-study-' + id + '-original.json'); } catch (error) { issue(error.message); } });
  $('backupFiles').addEventListener('change', async event => {
    if (reading) return;
    reading = true; cancelPreview(); $('backupFiles').disabled = true; $('previewRestore').disabled = true;
    $('readBackupText').disabled = true; $('resetCollection').disabled = true;
    try {
      const files = [...event.target.files]; if (!files.length) return;
      if (files.length > 5 || files.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) throw Error('每次最多选择 5 个文件，总大小不超过 20 MB');
      accept(await Promise.all(files.map(file => file.text())));
    } catch (error) { issue('读取失败：' + error.message); }
    finally { reading = false; $('backupFiles').disabled = false; $('backupFiles').value = ''; $('previewRestore').disabled = !canRestore; $('readBackupText').disabled = false; $('resetCollection').disabled = false; }
  });
  $('readBackupText').addEventListener('click', () => { try { if ($('backupText').value.length > 20 * 1024 * 1024) throw Error('粘贴内容过大'); accept([$('backupText').value]); } catch (error) { issue('读取失败：' + error.message); } });
  $('downloadCollection').addEventListener('click', () => { try { downloadPack(collected); status('已发起收集备份下载，请确认文件保存成功。'); } catch (error) { issue(error.message); } });
  $('extractBackups').addEventListener('click', event => { const id = event.target.closest('[data-extract-backup]')?.dataset.extractBackup; if (!id) return; try { S.download(engine.extract(collected, id), 'c-study-' + id + '-backup-' + C.localDate() + '.json'); status('已发起单项备份下载，可到对应科目或全局计划页导入。'); } catch (error) { issue(error.message); } });
  $('resetCollection').addEventListener('click', () => { collected = null; $('backupText').value = ''; renderCollection(); status('已清空收集区，学习记录未改变。'); });
  $('importRecords').addEventListener('change', cancelPreview);
  $('previewRestore').addEventListener('click', () => {
    try {
      if (reading) throw Error('备份文件正在读取，请稍后预览');
      if (!canRestore) throw Error('本地文件模式请拆分下载后去各科导入，或在同一 HTTP 站点统一恢复');
      const ids = [...document.querySelectorAll('[name="restoreItem"]:checked')].map(el => el.value);
      pending = engine.prepareRestore(storage, collected, ids); issue('');
      $('restoreConfirmText').textContent = '将替换：' + ids.map(id => names.get(id)).join('、') + '。请确认已下载当前记录的备份。';
      $('restoreConfirmation').hidden = false; $('restoreConfirmTitle').focus({ preventScroll: true }); $('restoreConfirmation').scrollIntoView({ block: 'start', behavior: 'auto' });
    } catch (error) { cancelPreview(); issue(error.message); }
  });
  $('cancelRestore').addEventListener('click', () => { cancelPreview(); status('已取消恢复，学习记录未改变。'); $('previewRestore').focus(); });
  $('commitRestore').addEventListener('click', () => {
    if (!pending || !canRestore || reading) return;
    const plan = pending; cancelPreview(); issue('');
    try {
      const result = plan.commit(); renderCurrent();
      if (result.ok) results('已恢复选中项目。请重新打开相关科目页和全局计划页。' + result.warning, result.ids.map(id => ({ id, status: 'restored' })));
      else results('恢复未完成：' + result.message + '。' + (result.recovery.ok ? '已回滚，恢复前原文已还原。' : '部分项目未能回滚，请下载恢复原文核对。') + result.recovery.warning, result.recovery.results);
    } catch (error) { renderJournal(); issue('恢复已停止：' + error.message + '。请核对上次恢复记录与各科当前状态。'); }
  });
  $('downloadJournal').addEventListener('click', () => { try { const raw = storage.getItem(B.JOURNAL) ?? storage.getItem(B.JOURNAL + '.previous'); if (raw === null) throw Error('恢复原文已发生变化，请重新读取'); S.download(raw, 'c-study-restore-originals-' + C.localDate() + '.json'); } catch (error) { issue(error.message); } });
  function previewJournal(action) {
    if (!canRestore) { issue('本地文件模式仅支持下载恢复原文，请在原 HTTP 站点处理恢复记录'); return; }
    cancelPreview(); journalAction = { action, raw: journalRaw }; $('journalConfirmation').hidden = false;
    $('journalConfirmText').textContent = action === 'rollback' ? '将回滚上次恢复。后续已变更的项目会保留，请核对处理结果。' : '结束恢复处理仅移除当前恢复标记，保留一份原文副本，学习记录不变。请先下载恢复原文并确认当前各科记录正确。';
    $('commitJournalAction').focus();
  }
  $('previewRollback').addEventListener('click', () => previewJournal('rollback'));
  $('previewFinishJournal').addEventListener('click', () => previewJournal('finish'));
  $('cancelJournalAction').addEventListener('click', () => { journalAction = null; $('journalConfirmation').hidden = true; });
  $('commitJournalAction').addEventListener('click', () => {
    if (!journalAction || !canRestore) return;
    const action = journalAction; journalAction = null; $('journalConfirmation').hidden = true; issue('');
    try {
      if (storage.getItem(B.JOURNAL) !== action.raw) throw Error('恢复记录已发生变化，请重新读取');
      if (action.action === 'rollback') { const result = engine.rollback(storage, action.raw); renderCurrent(); results((result.ok ? '已还原恢复前记录。' : '部分项目未还原，请核对下列结果。') + result.warning, result.results); }
      else { engine.finishJournal(storage, action.raw); renderCurrent(); status('已结束恢复处理，学习记录保持当前状态。恢复原文副本可在下次恢复前下载。'); }
    } catch (error) { renderJournal(); issue(error.message); }
  });
  window.addEventListener('storage', event => { if (event.key === null || engine.specs.some(s => s.key === event.key) || event.key === B.JOURNAL) { renderCurrent(); status('其他页面更新了记录；确认恢复时会再次核对，请检查当前恢复范围。'); } });
  renderCurrent();
})();
