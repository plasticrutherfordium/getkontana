import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadBudgetInsightsHelpers() {
  const src = readFileSync(new URL('../site/static/app/budget/insights.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaBudgetInsights;
}

const insights = loadBudgetInsightsHelpers();

test('getCurrentPeriod weekly respects week_start', () => {
  const sundayTs = Date.parse('2026-02-15T12:00:00Z') / 1000;
  const mondayPeriod = insights.getCurrentPeriod({
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: sundayTs,
  });
  const sundayPeriod = insights.getCurrentPeriod({
    cadence: 'weekly',
    weekStart: 'sun',
    nowTs: sundayTs,
  });

  assert.notEqual(mondayPeriod.period_id, sundayPeriod.period_id);
  assert.equal(mondayPeriod.end_ts - mondayPeriod.start_ts, 7 * 24 * 60 * 60);
});

test('getCurrentPeriod monthly rolls at month boundaries', () => {
  const febPeriod = insights.getCurrentPeriod({
    cadence: 'monthly',
    nowTs: Math.floor(new Date(2026, 1, 28, 23, 59, 0).getTime() / 1000),
  });
  const marPeriod = insights.getCurrentPeriod({
    cadence: 'monthly',
    nowTs: Math.floor(new Date(2026, 2, 1, 0, 1, 0).getTime() / 1000),
  });

  assert.equal(febPeriod.period_id, '2026-M02');
  assert.equal(marPeriod.period_id, '2026-M03');
  assert.notEqual(febPeriod.period_id, marPeriod.period_id);
});

test('summarizeWalletPeriod computes net drift and top drift categories', () => {
  const summary = insights.summarizeWalletPeriod({
    wallet: {
      id: 'w1',
      budget: { enabled: true },
    },
    walletId: 'w1',
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-11T12:00:00Z') / 1000,
    checkins: [
      {
        id: 'c1',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-10T10:00:00Z') / 1000,
        method: 'count_total',
        drift_minor: 500,
        drift_breakdown: [
          { category: 'fees', minor: 300 },
          { category: 'food', minor: 200 },
        ],
      },
      {
        id: 'c2',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-11T10:00:00Z') / 1000,
        method: 'quick_reconcile',
        drift_minor: -900,
        drift_breakdown: [
          { category: 'loss', minor: -500 },
          { category: 'food', minor: -400 },
        ],
      },
      {
        id: 'c3',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-12T10:00:00Z') / 1000,
        method: 'skip',
        drift_minor: -1000,
        drift_breakdown: [{ category: 'unknown', minor: -1000 }],
      },
      {
        id: 'c4',
        wallet_id: 'w2',
        ts: Date.parse('2026-02-11T12:00:00Z') / 1000,
        method: 'count_total',
        drift_minor: 99999,
        drift_breakdown: [{ category: 'fees', minor: 99999 }],
      },
    ],
    transactions: [],
  });

  assert.equal(summary.planned_checkins, 1);
  assert.equal(summary.completed_checkins, 2);
  assert.equal(summary.net_drift_minor, -400);
  assert.equal(summary.drift_by_category.length, 3);
  assert.equal(summary.drift_by_category[0].category, 'loss');
  assert.equal(summary.drift_by_category[0].minor, -500);
  assert.equal(summary.drift_by_category[1].category, 'fees');
  assert.equal(summary.drift_by_category[1].minor, 300);
  assert.equal(summary.drift_by_category[2].category, 'food');
  assert.equal(summary.drift_by_category[2].minor, -200);
});

test('summarizeWalletPeriod extracts top 3 spends by absolute delta in period', () => {
  const summary = insights.summarizeWalletPeriod({
    wallet: {
      id: 'w1',
      budget: { enabled: true },
    },
    walletId: 'w1',
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-12T12:00:00Z') / 1000,
    checkins: [],
    transactions: [
      {
        id: 's1',
        wallet_id: 'w1',
        type: 'spend',
        delta_minor: -1200,
        created_at: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 's2',
        wallet_id: 'w1',
        type: 'spend',
        delta_minor: -3000,
        created_at: '2026-02-11T10:00:00.000Z',
      },
      {
        id: 's3',
        wallet_id: 'w1',
        type: 'spend',
        amount_minor: 800,
        created_at: '2026-02-12T10:00:00.000Z',
      },
      {
        id: 's4',
        wallet_id: 'w1',
        type: 'spend',
        delta_minor: -2500,
        created_at: '2026-02-12T12:00:00.000Z',
      },
      {
        id: 'x1',
        wallet_id: 'w1',
        type: 'outgoing',
        delta_minor: -7000,
        created_at: '2026-02-12T11:00:00.000Z',
      },
      {
        id: 'x2',
        wallet_id: 'w2',
        type: 'spend',
        delta_minor: -9999,
        created_at: '2026-02-12T11:00:00.000Z',
      },
      {
        id: 'x3',
        wallet_id: 'w1',
        type: 'spend',
        delta_minor: -6000,
        created_at: '2026-02-01T10:00:00.000Z',
      },
    ],
  });

  assert.equal(summary.top_spends.length, 3);
  assert.equal(summary.top_spends[0].id, 's2');
  assert.equal(summary.top_spends[1].id, 's4');
  assert.equal(summary.top_spends[2].id, 's1');
});

test('computeDriftAlert uses max(abs, pct*expected) threshold with latest non-skip check-in', () => {
  const alert = insights.computeDriftAlert({
    wallet: {
      id: 'w1',
      budget: { enabled: true },
    },
    walletId: 'w1',
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-11T12:00:00Z') / 1000,
    alerts: {
      enabled: true,
      abs_minor: 2000,
      pct: 0.1,
    },
    checkins: [
      {
        id: 'older',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-10T09:00:00Z') / 1000,
        method: 'count_total',
        expected_minor: 50000,
        drift_minor: 5100,
      },
      {
        id: 'skip_newer',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-11T11:00:00Z') / 1000,
        method: 'skip',
        expected_minor: 50000,
        drift_minor: 99999,
      },
      {
        id: 'latest_non_skip',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-11T12:00:00Z') / 1000,
        method: 'quick_reconcile',
        expected_minor: 50000,
        drift_minor: 4900,
      },
    ],
  });

  assert.equal(alert.checkin_id, 'latest_non_skip');
  assert.equal(alert.threshold_minor, 5000);
  assert.equal(alert.should_alert, false);
});

test('computeDriftAlert is suppressed while snoozed', () => {
  const nowTs = Date.parse('2026-02-11T12:00:00Z') / 1000;
  const alert = insights.computeDriftAlert({
    wallet: {
      id: 'w1',
      budget: {
        enabled: true,
        drift_alert_snooze_until_ts: nowTs + (2 * 24 * 60 * 60),
      },
    },
    walletId: 'w1',
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs,
    alerts: {
      enabled: true,
      abs_minor: 2000,
      pct: 0.1,
    },
    checkins: [
      {
        id: 'latest_non_skip',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-11T12:00:00Z') / 1000,
        method: 'count_total',
        expected_minor: 10000,
        drift_minor: 3000,
      },
    ],
  });

  assert.equal(alert.threshold_minor, 2000);
  assert.equal(alert.snoozed, true);
  assert.equal(alert.should_alert, false);
});

test('computeDriftAlert does not alert when there is no non-skip baseline in current period', () => {
  const alert = insights.computeDriftAlert({
    wallet: {
      id: 'w1',
      budget: { enabled: true },
    },
    walletId: 'w1',
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-11T12:00:00Z') / 1000,
    alerts: {
      enabled: true,
      abs_minor: 2000,
      pct: 0.1,
    },
    checkins: [
      {
        id: 'skip_current',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-11T12:00:00Z') / 1000,
        method: 'skip',
        expected_minor: 10000,
        drift_minor: 9000,
      },
      {
        id: 'non_skip_old_period',
        wallet_id: 'w1',
        ts: Date.parse('2026-02-01T12:00:00Z') / 1000,
        method: 'count_total',
        expected_minor: 10000,
        drift_minor: 9000,
      },
    ],
  });

  assert.equal(alert.checkin_id, null);
  assert.equal(alert.should_alert, false);
});
