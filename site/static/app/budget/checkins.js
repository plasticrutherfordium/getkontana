(function attachKontanaBudgetCheckins(global) {
  const DRIFT_CATEGORIES = ['fees', 'food', 'misc', 'transfer', 'loss', 'unknown'];
  const VALID_METHODS = new Set(['confirm', 'count_total', 'skip', 'quick_reconcile']);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = 7 * MS_PER_DAY;
  const WEEK_START_INDEX = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  function toInt(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.trunc(parsed);
  }

  function nowEpochSec() {
    return Math.floor(Date.now() / 1000);
  }

  function normalizeWeekStart(value) {
    const token = String(value || '').trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(WEEK_START_INDEX, token)) return token;
    return 'mon';
  }

  function normalizeCadence(value) {
    if (value === 'weekly' || value === 'fortnightly' || value === 'monthly') return value;
    return 'weekly';
  }

  function normalizeCategory(value) {
    if (DRIFT_CATEGORIES.includes(value)) return value;
    return 'unknown';
  }

  function startOfLocalDay(date) {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function startOfWeekLocal(date, weekStart) {
    const startToken = normalizeWeekStart(weekStart);
    const weekStartIdx = WEEK_START_INDEX[startToken];
    const dayStart = startOfLocalDay(date);
    const delta = (dayStart.getDay() - weekStartIdx + 7) % 7;
    dayStart.setDate(dayStart.getDate() - delta);
    return dayStart;
  }

  function computeWeeklyParts(tsSec, weekStart) {
    const sec = toInt(tsSec, nowEpochSec());
    const date = new Date(sec * 1000);
    const weekStartDate = startOfWeekLocal(date, weekStart);
    const year = weekStartDate.getFullYear();
    const firstOfYear = new Date(year, 0, 1);
    const firstWeekStart = startOfWeekLocal(firstOfYear, weekStart);
    const diffMs = weekStartDate.getTime() - firstWeekStart.getTime();
    const week = Math.floor(diffMs / MS_PER_WEEK) + 1;
    return { year, week: Math.max(1, week) };
  }

  function getPeriodId(tsSec, options = {}) {
    const cadence = normalizeCadence(options.cadence);
    if (cadence === 'weekly') {
      const weekly = computeWeeklyParts(tsSec, options.weekStart);
      return `${weekly.year}-W${String(weekly.week).padStart(2, '0')}`;
    }
    if (cadence === 'fortnightly') {
      const weekly = computeWeeklyParts(tsSec, options.weekStart);
      const fortnight = Math.floor((weekly.week - 1) / 2) + 1;
      return `${weekly.year}-F${String(fortnight).padStart(2, '0')}`;
    }
    const sec = toInt(tsSec, nowEpochSec());
    const date = new Date(sec * 1000);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-M${month}`;
  }

  function getLatestWalletCheckin(checkins, walletId) {
    const rows = Array.isArray(checkins) ? checkins : [];
    let latest = null;
    rows.forEach((row) => {
      if (!row || row.wallet_id !== walletId) return;
      const ts = toInt(row.ts, 0);
      if (!latest || ts > latest.ts) latest = { row, ts };
    });
    return latest ? latest.row : null;
  }

  function isCheckinDue(options = {}) {
    const walletId = typeof options.walletId === 'string' ? options.walletId : '';
    if (!walletId) return false;
    const cadence = normalizeCadence(options.cadence);
    const weekStart = normalizeWeekStart(options.weekStart);
    const nowTs = toInt(options.nowTs, nowEpochSec());
    const latest = getLatestWalletCheckin(options.checkins, walletId);
    if (!latest) return true;
    const lastTs = toInt(latest.ts, 0);
    if (lastTs <= 0) return true;
    return getPeriodId(lastTs, { cadence, weekStart }) !== getPeriodId(nowTs, { cadence, weekStart });
  }

  function buildDriftBreakdown(driftMinor, category) {
    const drift = toInt(driftMinor, 0);
    if (drift === 0) return [];
    return [{ category: normalizeCategory(category), minor: drift }];
  }

  function buildCheckin(input = {}) {
    const ts = toInt(input.ts, nowEpochSec());
    const method = VALID_METHODS.has(input.method) ? input.method : 'confirm';
    const expectedMinor = toInt(input.expected_minor, 0);
    const cadence = normalizeCadence(input.cadence);
    const weekStart = normalizeWeekStart(input.week_start);
    const periodId = String(input.period_id || getPeriodId(ts, { cadence, weekStart }));
    let actualMinor = Number.isFinite(Number(input.actual_minor)) ? toInt(input.actual_minor, expectedMinor) : null;
    let driftMinor = Number.isFinite(Number(input.drift_minor)) ? toInt(input.drift_minor, 0) : 0;
    let breakdown = [];

    if (method === 'skip') {
      actualMinor = null;
      driftMinor = 0;
      breakdown = [];
    } else if (method === 'confirm') {
      actualMinor = expectedMinor;
      driftMinor = 0;
      breakdown = [];
    } else {
      if (!Number.isFinite(actualMinor)) actualMinor = expectedMinor;
      driftMinor = actualMinor - expectedMinor;
      breakdown = Array.isArray(input.drift_breakdown) && input.drift_breakdown.length > 0
        ? input.drift_breakdown.map((row) => ({
            category: normalizeCategory(row?.category),
            minor: toInt(row?.minor, 0),
          }))
        : buildDriftBreakdown(driftMinor, input.category);
    }

    const checkin = {
      id: typeof input.id === 'string' && input.id ? input.id : `checkin_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      wallet_id: String(input.wallet_id || ''),
      ts,
      period_id: periodId,
      method,
      expected_minor: expectedMinor,
      actual_minor: actualMinor,
      drift_minor: driftMinor,
      drift_breakdown: breakdown,
    };
    const note = String(input.note || '').trim();
    if (note) checkin.note = note;
    return checkin;
  }

  function buildAdjustmentTransaction(input = {}) {
    const wallet = input.wallet || {};
    const driftMinor = toInt(input.drift_minor, 0);
    const allowZero = input.allowZero === true;
    if (!wallet.id || !wallet.currency || (driftMinor === 0 && !allowZero)) return null;
    const ts = toInt(input.ts, nowEpochSec());
    const date = new Date(ts * 1000);
    const createdAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    const category = normalizeCategory(input.category);

    return {
      id: typeof input.id === 'string' && input.id ? input.id : `tx_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      created_at: createdAt,
      wallet_id: wallet.id,
      wallet_name: wallet.name || '',
      currency: wallet.currency,
      type: 'adjustment',
      amount_minor: Math.abs(driftMinor),
      delta_minor: driftMinor,
      tag: 'budget check-in',
      note: String(input.note || '').trim(),
      category,
      checkin_id: typeof input.checkin_id === 'string' && input.checkin_id ? input.checkin_id : '',
    };
  }

  function requiresLargeDriftConfirm(driftMinor, absMinorThreshold) {
    const threshold = Math.max(0, toInt(absMinorThreshold, 0));
    return Math.abs(toInt(driftMinor, 0)) >= threshold;
  }

  function buildQuickReconcileArtifacts(input = {}) {
    const wallet = input.wallet && typeof input.wallet === 'object' ? input.wallet : {};
    const ts = toInt(input.ts, nowEpochSec());
    const expectedMinor = toInt(input.expected_minor, toInt(wallet.balance_minor, 0));
    const actualMinor = toInt(input.actual_minor, expectedMinor);
    const category = normalizeCategory(input.category);

    const checkin = buildCheckin({
      id: input.checkin_id,
      wallet_id: input.wallet_id || wallet.id,
      ts,
      cadence: input.cadence,
      week_start: input.week_start,
      method: 'quick_reconcile',
      expected_minor: expectedMinor,
      actual_minor: actualMinor,
      category,
      note: input.note,
    });

    const adjustmentTx = buildAdjustmentTransaction({
      id: input.tx_id,
      wallet,
      drift_minor: checkin.drift_minor,
      category,
      note: input.note,
      checkin_id: checkin.id,
      ts,
      allowZero: true,
    });

    return {
      checkin,
      adjustmentTx,
      next_balance_minor: toInt(checkin.actual_minor, expectedMinor),
      next_count_mode: 'total',
    };
  }

  function shouldUpdateWalletBalance(checkin) {
    if (!checkin || typeof checkin !== 'object') return false;
    if (!(checkin.method === 'count_total' || checkin.method === 'quick_reconcile')) return false;
    return Number.isFinite(Number(checkin.actual_minor));
  }

  function resolveWalletBalanceMinor(currentBalanceMinor, checkin) {
    if (!shouldUpdateWalletBalance(checkin)) return toInt(currentBalanceMinor, 0);
    return toInt(checkin.actual_minor, 0);
  }

  global.KontanaBudgetCheckins = {
    DRIFT_CATEGORIES,
    getPeriodId,
    getLatestWalletCheckin,
    isCheckinDue,
    buildCheckin,
    buildAdjustmentTransaction,
    requiresLargeDriftConfirm,
    buildQuickReconcileArtifacts,
    shouldUpdateWalletBalance,
    resolveWalletBalanceMinor,
  };
}(window));
