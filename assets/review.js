/* Four-subject review scheduling and explicit mistake attribution. */
(function (root) {
  'use strict';
  const STEPS = Object.freeze([1, 2, 4, 7, 15, 30]), UNASSIGNED = '未归因';
  function addDays(date, days) {
    const value = new Date(date + 'T12:00:00Z'); value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }
  function isDue(mistake, today) { return !mistake.mastered && !!mistake.nextReview && mistake.nextReview <= today; }
  function selectDue(list, today, selection) {
    const due = list.filter(mistake => isDue(mistake, today)).map(mistake => mistake.id);
    return Array.isArray(selection) ? [...new Set(selection)].filter(id => due.includes(id)) : due;
  }
  // This is the schedule calculation. User actions separately enforce eligibility.
  function scheduleNext(mistake, remembered, today) {
    mistake.history = mistake.history || [];
    mistake.history.push({ date: today, ok: !!remembered });
    if (remembered) {
      mistake.stage += 1;
      if (mistake.stage >= STEPS.length) { mistake.mastered = true; mistake.nextReview = null; }
      else mistake.nextReview = addDays(today, STEPS[mistake.stage]);
    } else { mistake.stage = 0; mistake.mastered = false; mistake.nextReview = addDays(today, 1); }
    return mistake;
  }
  function reasonStatus(mistake) {
    const reason = mistake.reason || UNASSIGNED;
    const confirmed = mistake.reasonConfirmed === true && reason !== UNASSIGNED;
    return { reason, confirmed, category: confirmed ? reason : UNASSIGNED,
      label: confirmed || reason === UNASSIGNED ? reason : '待确认 · 原标签：' + reason };
  }
  function setReason(mistake, reason, confirmed, at) {
    mistake.reason = String(reason || UNASSIGNED);
    mistake.reasonConfirmed = !!confirmed && mistake.reason !== UNASSIGNED;
    mistake.reasonConfirmedAt = mistake.reasonConfirmed ? at : null;
    return mistake;
  }
  function reasonSummary(mistakes, reasons) {
    const counts = Object.create(null);
    for (const reason of [UNASSIGNED, ...reasons]) counts[reason] = 0;
    let confirmed = 0;
    for (const mistake of mistakes) {
      const status = reasonStatus(mistake);
      counts[status.category] = (counts[status.category] || 0) + 1;
      if (status.confirmed) confirmed++;
    }
    return { counts, confirmed, pending: mistakes.length - confirmed, total: mistakes.length };
  }
  function relapse(mistake, event) {
    const events = mistake.recurrences || (mistake.recurrences = []);
    if (event.attemptId && events.some(row => row.attemptId === event.attemptId)) return false;
    const nextReview = !mistake.mastered && mistake.nextReview && mistake.nextReview < event.date ? mistake.nextReview : event.date;
    events.push({ id: event.id, date: event.date, at: event.at, attemptId: event.attemptId || null,
      fromStage: mistake.stage, fromNextReview: mistake.nextReview || null, wasMastered: !!mistake.mastered,
      previousWrong: mistake.wrong || '', previousReason: mistake.reason || UNASSIGNED,
      previousReasonConfirmed: reasonStatus(mistake).confirmed, wrong: event.wrong || '',
      wrongIdx: Number.isInteger(event.wrongIdx) && event.wrongIdx >= 0 ? event.wrongIdx : null });
    mistake.stage = 0; mistake.mastered = false; mistake.nextReview = nextReview;
    mistake.lastWrongAt = event.at;
    setReason(mistake, mistake.reason, false, event.at);
    return true;
  }
  const api = { STEPS, UNASSIGNED, addDays, isDue, selectDue, scheduleNext, reasonStatus, setReason, reasonSummary, relapse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyReview = api;
})(typeof window !== 'undefined' ? window : this);
