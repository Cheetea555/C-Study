/* Full backups and guarded, recoverable writes across independent localStorage keys. */
(function (root) {
  'use strict';
  const FORMAT = 'c-study-full-backup', JOURNAL = 'c-study.full-restore.v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  function create(Storage, Planner, catalog) {
    const specs = catalog.subjects.map(s => ({ ...s, config: { subjectId: s.id, key: s.key, maxScore: s.maxScore, defaults: () => copy(s.defaults) } }));
    specs.push({ id: 'planner', key: Planner.KEY, name: '全局时间计划' });
    const specFor = id => specs.find(s => s.id === id);
    function validTime(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)); }
    function stateFor(id, data, exportedAt) {
      const spec = specFor(id);
      if (!spec) throw Error('未知备份项目');
      if (id === 'planner') return Planner.normalize(data);
      const prepared = Storage.create(spec.config).prepareImport(JSON.stringify({ format: 'c-study-backup', schemaVersion: 2, subjectId: id, exportedAt, data })).state;
      return Storage.normalize(prepared, spec.config);
    }
    function normalize(input) {
      if (!input || input.format !== FORMAT || input.schemaVersion !== 1 || !validTime(input.exportedAt) || !Array.isArray(input.entries)) throw Error('不支持的完整备份格式、版本或导出时间');
      const entries = new Map();
      for (const entry of input.entries) {
        if (!entry || !specFor(entry.id) || entries.has(entry.id) || !['included', 'missing', 'error'].includes(entry.status)) throw Error('备份含未知、重复或无效项目');
        const row = { id: entry.id, status: entry.status };
        if (entry.status === 'included') row.data = stateFor(entry.id, entry.data, input.exportedAt);
        else if (entry.message != null) { if (typeof entry.message !== 'string') throw Error('备份说明无效'); row.message = entry.message; }
        entries.set(row.id, row);
      }
      if (entries.size !== specs.length) throw Error('备份缺少项目状态，请重新导出');
      return { format: FORMAT, schemaVersion: 1, exportedAt: input.exportedAt, source: input.source === 'browser' ? 'browser' : 'files',
        protocol: input.protocol === 'file:' ? 'file:' : '', entries: specs.map(s => entries.get(s.id)) };
    }
    function empty(source, protocol) {
      return { format: FORMAT, schemaVersion: 1, exportedAt: new Date().toISOString(), source, protocol: protocol === 'file:' ? 'file:' : '',
        entries: specs.map(s => ({ id: s.id, status: 'missing' })) };
    }
    function capture(storage, protocol) {
      const pack = empty('browser', protocol);
      for (const entry of pack.entries) {
        try {
          const spec = specFor(entry.id), raw = storage.getItem(spec.key);
          if (raw === null) continue;
          const data = JSON.parse(raw);
          if (entry.id === 'planner') entry.data = Planner.normalize(data);
          else {
            const state = Storage.normalize(data, spec.config);
            entry.data = stateFor(entry.id, state, pack.exportedAt);
          }
          entry.status = 'included';
        } catch (error) { entry.status = 'error'; entry.message = error.message; }
      }
      return pack;
    }
    function collect(texts, previous) {
      if (!texts.length) throw Error('请选择备份文件');
      const parsed = texts.map(raw => { try { return JSON.parse(raw); } catch (error) { throw Error('文件不是有效 JSON，尚未收集任何新项目'); } });
      if (parsed.some(value => value && value.format === FORMAT)) {
        if (texts.length !== 1) throw Error('完整备份请单独打开；分别收集时请选择各科备份和全局设置文件');
        return normalize(parsed[0]);
      }
      const pack = previous ? normalize(previous) : empty('files', '');
      pack.source = 'files'; pack.protocol = ''; pack.exportedAt = new Date().toISOString();
      for (const value of parsed) {
        let id;
        if (value && value.format === 'c-study-backup') id = value.subjectId;
        else if (value && value.settings) {
          const inferred = Storage.inferSubjects(value);
          id = value.subjectId || (inferred.length === 1 ? inferred[0] : null);
          if (!id) throw Error('旧备份无法确定科目，请先到对应科目导入并重新导出带科目标识的备份');
        } else { Planner.normalize(value); id = 'planner'; }
        const spec = specFor(id);
        if (!spec || id === 'planner' && value.format) throw Error('不支持的科目或文件格式');
        const row = pack.entries.find(entry => entry.id === id);
        if (row.status === 'included') throw Error(spec.name + '重复，请清空已收集文件后重新选择');
        row.data = id === 'planner' ? Planner.normalize(value) : Storage.normalize(Storage.create(spec.config).prepareImport(JSON.stringify(value)).state, spec.config);
        row.status = 'included'; delete row.message;
      }
      return normalize(pack);
    }
    function describe(input) {
      const pack = normalize(input), rows = pack.entries.map(entry => {
        const row = { id: entry.id, name: specFor(entry.id).name, status: entry.status, message: entry.message || '' };
        if (entry.status === 'included') {
          const s = entry.data;
          row.summary = entry.id === 'planner' ? '工作日 ' + s.weekdayMinutes + ' 分钟 · 周末 ' + s.weekendMinutes + ' 分钟' :
            '已学 ' + Object.values(s.lessons).filter(l => l.done).length + ' 课 · 错题 ' + s.mistakes.length + ' 道 · 日志 ' + s.logs.length + ' 条 · 作答 ' + s.attempts.length + ' 次';
        }
        return row;
      });
      const subjectCount = rows.filter(row => row.id !== 'planner' && row.status === 'included').length;
      return { rows, subjectCount, complete: subjectCount === 4 && !rows.some(row => row.status === 'error') && !(pack.source === 'browser' && pack.protocol === 'file:') };
    }
    function extract(input, id) {
      const pack = normalize(input), row = pack.entries.find(entry => entry.id === id);
      if (!row || row.status !== 'included') throw Error('该项没有可下载的有效记录');
      return id === 'planner' ? copy(row.data) : { format: 'c-study-backup', schemaVersion: 2, subjectId: id, contentVersion: '2026-10', exportedAt: pack.exportedAt, data: copy(row.data) };
    }
    function readJournal(storage) {
      const raw = storage.getItem(JOURNAL);
      if (raw === null) return null;
      const value = JSON.parse(raw);
      if (!value || value.format !== 'c-study-restore-journal' || value.v !== 1 || !Array.isArray(value.entries) || !value.entries.length ||
          !['prepared', 'complete', 'rolled-back', 'rollback-incomplete'].includes(value.status)) throw Error('恢复记录无法识别，请先下载原文');
      const seen = new Set();
      for (const entry of value.entries) {
        if (!entry || !specFor(entry.id) || seen.has(entry.id) || !(entry.before === null || typeof entry.before === 'string') || typeof entry.after !== 'string') throw Error('恢复记录的项目无效');
        seen.add(entry.id);
      }
      return value;
    }
    function rollback(storage, expectedRaw) {
      const baseline = storage.getItem(JOURNAL);
      if (expectedRaw != null && baseline !== expectedRaw) throw Error('恢复记录已经变化，请重新读取');
      const journal = readJournal(storage);
      if (!journal) throw Error('没有可回滚的恢复记录');
      const results = [];
      for (const entry of journal.entries.slice().reverse()) {
        const key = specFor(entry.id).key;
        try {
          if (storage.getItem(JOURNAL) !== baseline) throw Error('恢复记录已经变化，暂停回滚');
          const current = storage.getItem(key);
          if (current === entry.before) { results.push({ id: entry.id, status: 'unchanged' }); continue; }
          if (current !== entry.after) { results.push({ id: entry.id, status: 'conflict' }); continue; }
          if (entry.before === null) storage.removeItem(key); else storage.setItem(key, entry.before);
          results.push({ id: entry.id, status: storage.getItem(key) === entry.before ? 'rolled-back' : 'failed' });
        } catch (error) { results.push({ id: entry.id, status: 'failed', message: error.message }); }
      }
      const ok = results.every(row => ['unchanged', 'rolled-back'].includes(row.status));
      journal.status = ok ? 'rolled-back' : 'rollback-incomplete';
      let warning = '';
      try { if (storage.getItem(JOURNAL) !== baseline) throw Error('恢复记录已经变化'); storage.setItem(JOURNAL, JSON.stringify(journal)); } catch (error) { warning = '回滚结果未能保存，请保留恢复原文并逐项核对'; }
      return { ok, results, warning };
    }
    function prepareRestore(storage, input, selected) {
      const pack = normalize(input), ids = [...new Set(selected)];
      if (!ids.length || ids.length !== selected.length) throw Error('请选择至少一个有效且不重复的恢复项目');
      const now = new Date().toISOString();
      const entries = ids.map(id => {
        const spec = specFor(id), row = pack.entries.find(entry => entry.id === id);
        if (!spec || !row || row.status !== 'included') throw Error('所选项目没有可恢复的记录');
        const before = storage.getItem(spec.key), data = copy(row.data);
        let revision = 0;
        try { const previous = JSON.parse(before); if (Number.isSafeInteger(previous?.revision) && previous.revision >= 0) revision = previous.revision; } catch (error) { /* The original can be damaged; preserve its exact text. */ }
        data.revision = Math.max(data.revision || 0, revision) + 1; data.savedAt = now;
        if (id !== 'planner') data.subjectId = id;
        const normalized = stateFor(id, data, now);
        return { id, before, after: JSON.stringify(normalized) };
      });
      // The baseline is captured at preview time; commit rejects changes made afterwards.
      let used = false;
      function commit() {
        if (used) throw Error('这份恢复预览已使用，请重新预览');
        used = true;
        const oldJournal = readJournal(storage);
        if (oldJournal && ['prepared', 'rollback-incomplete'].includes(oldJournal.status)) throw Error('上次恢复尚待处理，请先回滚或核对恢复记录');
        const expected = new Map(entries.map(entry => [entry.id, entry.before]));
        const check = () => { for (const entry of entries) if (storage.getItem(specFor(entry.id).key) !== expected.get(entry.id)) throw Error(specFor(entry.id).name + '在预览后发生变化，请重新读取并预览'); };
        check();
        const journal = { format: 'c-study-restore-journal', v: 1, status: 'prepared', createdAt: now, entries };
        storage.setItem(JOURNAL, JSON.stringify(journal)); // No main record is touched before this succeeds.
        try {
          for (const entry of entries) if (entry.before !== null) storage.setItem(specFor(entry.id).key + '.recovery', entry.before);
          for (const entry of entries) {
            check(); storage.setItem(specFor(entry.id).key, entry.after); expected.set(entry.id, entry.after);
          }
          check();
        } catch (error) {
          const recovery = rollback(storage, JSON.stringify(journal));
          return { ok: false, message: error.message, recovery };
        }
        journal.status = 'complete';
        let warning = '';
        try { storage.setItem(JOURNAL, JSON.stringify(journal)); } catch (error) { warning = '记录已写入，但恢复结果状态未能保存。请下载恢复原文并核对各科记录'; }
        return { ok: true, ids, warning };
      }
      return { ids: ids.slice(), commit };
    }
    function finishJournal(storage, expected) {
      if (typeof expected !== 'string' || storage.getItem(JOURNAL) !== expected) throw Error('恢复记录已经变化，请重新读取');
      storage.setItem(JOURNAL + '.previous', expected);
      if (storage.getItem(JOURNAL) !== expected) throw Error('恢复记录已经变化，请重新读取');
      storage.removeItem(JOURNAL);
    }
    return { capture, collect, normalize, describe, extract, prepareRestore, readJournal, rollback, finishJournal, specs: specs.map(({ id, name, key }) => ({ id, name, key })) };
  }
  const api = { create, FORMAT, JOURNAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyBackup = api;
})(typeof window !== 'undefined' ? window : this);
