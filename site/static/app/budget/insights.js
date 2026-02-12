(function attachKontanaBudgetInsights(global) {
  const VALID_CADENCE = new Set(['weekly', 'fortnightly', 'monthly']);
  const VALID_CATEGORIES = new Set(['fees', 'food', 'misc', 'transfer', 'loss', 'unknown']);
  const WEEK_START_INDEX = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = 7 * MS_PER_DAY;

  function toInt(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.trunc(parsed);
  }

  function nowEpochSec() {
    return Math.floor(Date.now() / 1000);
  }

  function normalizeCadence(value, fallback = 'weekly') {
    return VALID_CADENCE.has(value) ? value : fallback;
  }

  function normalizeWeekStart(value, fallback = 'mon') {
    const key = String(value || '').trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(WEEK_START_INDEX, key) ? key : fallback;
  }

  function normalizeCategory(value) {
    return VALID_CATEGORIES.has(value) ? value : 'unknown';
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

  function computeWeekState(tsSec, weekStart) {
    const sec = toInt(tsSec, nowEpochSec());
    const date = new Date(sec * 1000);
    const weekStartDate = startOfWeekLocal(date, weekStart);
    const year = weekStartDate.getFullYear();
    const firstOfYear = new Date(year, 0, 1);
    const firstWeekStart = startOfWeekLocal(firstOfYear, weekStart);
    const weekIndex = Math.max(0, Math.floor((weekStartDate.getTime() - firstWeekStart.getTime()) / MS_PER_WEEK));
    return {
      year,
      weekIndex,
      weekStartDate,
      firstWeekStart,
    };
  }

  function getCurrentPeriod(options = {}) {
    const cadence = normalizeCadence(options.cadence, 'weekly');
    const weekStart = normalizeWeekStart(options.weekStart, 'mon');
    const nowTs = toInt(options.nowTs, nowEpochSec());

    if (cadence === 'monthly') {
      const date = new Date(nowTs * 1000);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const month = String(start.getMonth() + 1).padStart(2, '0');
      return {
        cadence,
        week_start: weekStart,
        period_id: `${start.getFullYear()}-M${month}`,
        start_ts: Math.floor(start.getTime() / 1000),
        end_ts: Math.floor(end.getTime() / 1000),
      };
    }

    const weekState = computeWeekState(nowTs, weekStart);
    if (cadence === 'weekly') {
      const start = weekState.weekStartDate;
      const end = new Date(start.getTime() + MS_PER_WEEK);
      return {
        cadence,
        week_start: weekStart,
        period_id: `${weekState.year}-W${String(weekState.weekIndex + 1).padStart(2, '0')}`,
        start_ts: Math.floor(start.getTime() / 1000),
        end_ts: Math.floor(end.getTime() / 1000),
      };
    }

    const fortnightIndex = Math.floor(weekState.weekIndex / 2);
    const fortnightStart = new Date(weekState.firstWeekStart.getTime() + fortnightIndex * 2 * MS_PER_WEEK);
    const fortnightEnd = new Date(fortnightStart.getTime() + 2 * MS_PER_WEEK);
    return {
      cadence,
      week_start: weekStart,
      period_id: `${weekState.year}-F${String(fortnightIndex + 1).padStart(2, '0')}`,
      start_ts: Math.floor(fortnightStart.getTime() / 1000),
      end_ts: Math.floor(fortnightEnd.getTime() / 1000),
    };
  }

  function isTsInPeriod(tsSec, period) {
    const ts = toInt(tsSec, -1);
    if (!Number.isFinite(ts) || ts < 0) return false;
    if (!period || !Number.isFinite(Number(period.start_ts)) || !Number.isFinite(Number(period.end_ts))) return false;
    return ts >= period.start_ts && ts < period.end_ts;
  }

  function parseTxTsSec(tx) {
    const parsed = Date.parse(tx?.created_at || '');
    if (!Number.isFinite(parsed)) return null;
    return Math.floor(parsed / 1000);
  }

  function getCheckinBreakdownRows(checkin, driftMinor) {
    const rows = Array.isArray(checkin?.drift_breakdown) ? checkin.drift_breakdown : [];
    if (rows.length > 0) {
      return rows.map((row) => ({
        category: normalizeCategory(row?.category),
        minor: toInt(row?.minor, 0),
      })).filter((row) => row.minor !== 0);
    }
    if (driftMinor === 0) return [];
    return [{ category: normalizeCategory(checkin?.category), minor: driftMinor }];
  }

  function summarizeWalletPeriod(options = {}) {
    const walletId = String(options.walletId || options.wallet?.id || '').trim();
    const cadence = normalizeCadence(options.cadence, 'weekly');
    const weekStart = normalizeWeekStart(options.weekStart, 'mon');
    const period = getCurrentPeriod({
      cadence,
      weekStart,
      nowTs: options.nowTs,
    });

    if (!walletId) {
      return {
        period,
        planned_checkins: 0,
        completed_checkins: 0,
        net_drift_minor: 0,
        drift_by_category: [],
        recent_checkins: [],
        top_spends: [],
      };
    }

    const checkins = Array.isArray(options.checkins) ? options.checkins : [];
    const walletCheckins = checkins
      .filter((row) => row && row.wallet_id === walletId)
      .sort((a, b) => toInt(b?.ts, 0) - toInt(a?.ts, 0));
    const checkinsInPeriod = walletCheckins
      .filter((row) => isTsInPeriod(row?.ts, period));
    const completedCheckins = checkinsInPeriod
      .filter((row) => row?.method !== 'skip');

    let netDriftMinor = 0;
    const driftByCategoryMap = new Map();
    completedCheckins.forEach((checkin) => {
      const driftMinor = toInt(checkin?.drift_minor, 0);
      netDriftMinor += driftMinor;
      getCheckinBreakdownRows(checkin, driftMinor).forEach((row) => {
        const prior = driftByCategoryMap.get(row.category) || 0;
        driftByCategoryMap.set(row.category, prior + row.minor);
      });
    });

    const driftCategoryLimit = Math.max(1, toInt(options.driftCategoriesLimit, 3));
    const driftByCategory = [...driftByCategoryMap.entries()]
      .map(([category, minor]) => ({ category, minor }))
      .filter((row) => row.minor !== 0)
      .sort((a, b) => {
        const absDiff = Math.abs(b.minor) - Math.abs(a.minor);
        if (absDiff !== 0) return absDiff;
        return String(a.category).localeCompare(String(b.category));
      })
      .slice(0, driftCategoryLimit);

    const txRows = Array.isArray(options.transactions) ? options.transactions : [];
    const spendsInPeriod = txRows
      .filter((tx) => tx && tx.wallet_id === walletId && tx.type === 'spend')
      .filter((tx) => {
        const txTs = parseTxTsSec(tx);
        if (txTs == null) return false;
        return isTsInPeriod(txTs, period);
      });
    const spendLimit = Math.max(1, toInt(options.topSpendsLimit, 3));
    const topSpends = spendsInPeriod
      .slice()
      .sort((a, b) => {
        const deltaA = Number.isFinite(Number(a?.delta_minor)) ? toInt(a.delta_minor, 0) : -Math.abs(toInt(a?.amount_minor, 0));
        const deltaB = Number.isFinite(Number(b?.delta_minor)) ? toInt(b.delta_minor, 0) : -Math.abs(toInt(b?.amount_minor, 0));
        const absDiff = Math.abs(deltaB) - Math.abs(deltaA);
        if (absDiff !== 0) return absDiff;
        const tsDiff = toInt(parseTxTsSec(b), 0) - toInt(parseTxTsSec(a), 0);
        if (tsDiff !== 0) return tsDiff;
        return String(b?.id || '').localeCompare(String(a?.id || ''));
      })
      .slice(0, spendLimit);

    const recentLimit = Math.max(1, toInt(options.recentLimit, 5));
    const recentCheckins = walletCheckins.slice(0, recentLimit);
    const plannedCheckins = options.wallet?.budget?.enabled === true ? 1 : 0;

    return {
      period,
      planned_checkins: plannedCheckins,
      completed_checkins: completedCheckins.length,
      net_drift_minor: netDriftMinor,
      drift_by_category: driftByCategory,
      recent_checkins: recentCheckins,
      top_spends: topSpends,
    };
  }

  function computeDriftAlert(options = {}) {
    const wallet = options.wallet || {};
    const walletId = String(options.walletId || wallet.id || '').trim();
    const nowTs = toInt(options.nowTs, nowEpochSec());
    const cadence = normalizeCadence(options.cadence, 'weekly');
    const weekStart = normalizeWeekStart(options.weekStart, 'mon');
    const alerts = options.alerts && typeof options.alerts === 'object' ? options.alerts : {};
    const enabled = alerts.enabled !== false;
    const period = getCurrentPeriod({ cadence, weekStart, nowTs });
    const snoozeUntilTs = Math.max(0, toInt(
      options.snooze_until_ts,
      toInt(wallet?.budget?.drift_alert_snooze_until_ts, 0),
    ));

    if (!walletId || wallet?.budget?.enabled !== true || !enabled) {
      return {
        should_alert: false,
        snoozed: false,
        period,
        threshold_minor: 0,
        drift_minor: 0,
        expected_minor: 0,
        checkin_id: null,
      };
    }

    const checkins = Array.isArray(options.checkins) ? options.checkins : [];
    const baseline = checkins
      .filter((row) => row && row.wallet_id === walletId && row.method !== 'skip')
      .filter((row) => isTsInPeriod(row?.ts, period))
      .sort((a, b) => {
        const tsDiff = toInt(b?.ts, 0) - toInt(a?.ts, 0);
        if (tsDiff !== 0) return tsDiff;
        return String(b?.id || '').localeCompare(String(a?.id || ''));
      })[0] || null;

    if (!baseline) {
      return {
        should_alert: false,
        snoozed: false,
        period,
        threshold_minor: 0,
        drift_minor: 0,
        expected_minor: 0,
        checkin_id: null,
      };
    }

    const expectedMinor = Math.max(0, toInt(baseline.expected_minor, 0));
    const driftMinor = toInt(baseline.drift_minor, 0);
    const absMinorThreshold = Math.max(0, toInt(alerts.abs_minor, 2000));
    const pctThresholdRaw = Number(alerts.pct);
    const pctThreshold = Number.isFinite(pctThresholdRaw) && pctThresholdRaw >= 0 ? pctThresholdRaw : 0.1;
    const thresholdMinor = Math.max(absMinorThreshold, Math.ceil(expectedMinor * pctThreshold));
    const snoozed = snoozeUntilTs > nowTs;
    const shouldAlert = !snoozed && Math.abs(driftMinor) >= thresholdMinor;

    return {
      should_alert: shouldAlert,
      snoozed,
      period,
      threshold_minor: thresholdMinor,
      drift_minor: driftMinor,
      expected_minor: expectedMinor,
      checkin_id: baseline?.id || null,
      baseline_ts: toInt(baseline?.ts, 0),
      snooze_until_ts: snoozeUntilTs,
    };
  }

  global.KontanaBudgetInsights = {
    normalizeCadence,
    normalizeWeekStart,
    getCurrentPeriod,
    isTsInPeriod,
    summarizeWalletPeriod,
    computeDriftAlert,
  };
}(window));
