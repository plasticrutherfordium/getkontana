import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadBudgetCheckinHelpers() {
  const src = readFileSync(new URL('../site/static/app/budget/checkins.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaBudgetCheckins;
}

const checkins = loadBudgetCheckinHelpers();

test('buildCheckin computes drift from expected vs actual totals', () => {
  const row = checkins.buildCheckin({
    id: 'checkin_1',
    wallet_id: 'w1',
    ts: 1739577600,
    cadence: 'weekly',
    week_start: 'mon',
    method: 'count_total',
    expected_minor: 10000,
    actual_minor: 10625,
    category: 'fees',
  });

  assert.equal(row.drift_minor, 625);
  assert.equal(row.actual_minor, 10625);
  assert.equal(row.drift_breakdown.length, 1);
  assert.equal(row.drift_breakdown[0].category, 'fees');
  assert.equal(row.drift_breakdown[0].minor, 625);
});

test('buildCheckin emits canonical shape for confirm and skip branches', () => {
  const confirm = checkins.buildCheckin({
    id: 'checkin_confirm',
    wallet_id: 'w1',
    ts: 1739577600,
    cadence: 'weekly',
    week_start: 'mon',
    method: 'confirm',
    expected_minor: 5000,
  });
  const skip = checkins.buildCheckin({
    id: 'checkin_skip',
    wallet_id: 'w1',
    ts: 1739577600,
    cadence: 'weekly',
    week_start: 'mon',
    method: 'skip',
    expected_minor: 5000,
  });

  assert.equal(confirm.wallet_id, 'w1');
  assert.equal(typeof confirm.period_id, 'string');
  assert.equal(confirm.method, 'confirm');
  assert.equal(confirm.expected_minor, 5000);
  assert.equal(confirm.actual_minor, 5000);
  assert.equal(confirm.drift_minor, 0);
  assert.equal(Array.isArray(confirm.drift_breakdown), true);

  assert.equal(skip.method, 'skip');
  assert.equal(skip.actual_minor, null);
  assert.equal(skip.drift_minor, 0);
  assert.equal(Array.isArray(skip.drift_breakdown), true);
});

test('buildAdjustmentTransaction creates linked adjustment tx', () => {
  const tx = checkins.buildAdjustmentTransaction({
    id: 'tx_checkin_1',
    wallet: { id: 'w1', name: 'Main', currency: 'USD' },
    drift_minor: -725,
    category: 'loss',
    note: 'cash missing',
    checkin_id: 'checkin_abc',
    ts: 1739577600,
  });

  assert.equal(tx.id, 'tx_checkin_1');
  assert.equal(tx.type, 'adjustment');
  assert.equal(tx.wallet_id, 'w1');
  assert.equal(tx.checkin_id, 'checkin_abc');
  assert.equal(tx.amount_minor, 725);
  assert.equal(tx.delta_minor, -725);
  assert.equal(tx.category, 'loss');
});

test('resolveWalletBalanceMinor only updates balance for count/reconcile methods', () => {
  const current = 10000;
  const confirm = { method: 'confirm', actual_minor: 10100 };
  const skip = { method: 'skip', actual_minor: 9500 };
  const counted = { method: 'count_total', actual_minor: 9300 };

  assert.equal(checkins.shouldUpdateWalletBalance(confirm), false);
  assert.equal(checkins.shouldUpdateWalletBalance(skip), false);
  assert.equal(checkins.shouldUpdateWalletBalance(counted), true);
  assert.equal(checkins.resolveWalletBalanceMinor(current, confirm), current);
  assert.equal(checkins.resolveWalletBalanceMinor(current, skip), current);
  assert.equal(checkins.resolveWalletBalanceMinor(current, counted), 9300);
});

test('getPeriodId weekly respects configured week_start', () => {
  const sundayTs = Date.parse('2026-02-15T12:00:00Z') / 1000;
  const monPeriod = checkins.getPeriodId(sundayTs, { cadence: 'weekly', weekStart: 'mon' });
  const sunPeriod = checkins.getPeriodId(sundayTs, { cadence: 'weekly', weekStart: 'sun' });

  assert.notEqual(monPeriod, sunPeriod);
});

test('isCheckinDue handles weekly, fortnightly, and monthly cadence periods', () => {
  const walletId = 'w1';
  const weeklyCheckinTs = Date.parse('2026-02-02T12:00:00Z') / 1000;
  const fortnightCheckinTs = weeklyCheckinTs;
  const monthlyCheckinTs = Date.parse('2026-02-05T12:00:00Z') / 1000;

  const weekly = checkins.buildCheckin({
    wallet_id: walletId,
    ts: weeklyCheckinTs,
    cadence: 'weekly',
    week_start: 'mon',
    method: 'confirm',
    expected_minor: 1000,
  });
  const fortnightly = checkins.buildCheckin({
    wallet_id: walletId,
    ts: fortnightCheckinTs,
    cadence: 'fortnightly',
    week_start: 'mon',
    method: 'confirm',
    expected_minor: 1000,
  });
  const monthly = checkins.buildCheckin({
    wallet_id: walletId,
    ts: monthlyCheckinTs,
    cadence: 'monthly',
    week_start: 'mon',
    method: 'confirm',
    expected_minor: 1000,
  });

  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [weekly],
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-05T12:00:00Z') / 1000,
  }), false);
  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [weekly],
    cadence: 'weekly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-10T12:00:00Z') / 1000,
  }), true);

  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [fortnightly],
    cadence: 'fortnightly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-06T12:00:00Z') / 1000,
  }), false);
  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [fortnightly],
    cadence: 'fortnightly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-17T12:00:00Z') / 1000,
  }), true);

  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [monthly],
    cadence: 'monthly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-02-28T12:00:00Z') / 1000,
  }), false);
  assert.equal(checkins.isCheckinDue({
    walletId,
    checkins: [monthly],
    cadence: 'monthly',
    weekStart: 'mon',
    nowTs: Date.parse('2026-03-01T12:00:00Z') / 1000,
  }), true);
});

test('weekly period id stays stable across year-crossing week', () => {
  const dec31 = Date.parse('2026-12-31T12:00:00Z') / 1000;
  const jan1 = Date.parse('2027-01-01T12:00:00Z') / 1000;
  const decPeriod = checkins.getPeriodId(dec31, { cadence: 'weekly', weekStart: 'mon' });
  const janPeriod = checkins.getPeriodId(jan1, { cadence: 'weekly', weekStart: 'mon' });

  assert.match(decPeriod, /^\d{4}-W\d{2}$/);
  assert.match(janPeriod, /^\d{4}-W\d{2}$/);
  assert.equal(decPeriod, janPeriod);
});

test('buildQuickReconcileArtifacts creates quick_reconcile checkin, linked tx, and wallet updates', () => {
  const wallet = {
    id: 'w1',
    name: 'Main',
    currency: 'USD',
    balance_minor: 4000,
    denominations: [
      { value_minor: 1000, count: 2 },
      { value_minor: 500, count: 2 },
    ],
  };
  const denomsBefore = JSON.stringify(wallet.denominations);
  const artifacts = checkins.buildQuickReconcileArtifacts({
    checkin_id: 'checkin_qr_1',
    tx_id: 'tx_qr_1',
    wallet,
    wallet_id: wallet.id,
    ts: 1739577600,
    cadence: 'weekly',
    week_start: 'mon',
    expected_minor: 4000,
    actual_minor: 3550,
  });

  assert.equal(artifacts.checkin.method, 'quick_reconcile');
  assert.equal(artifacts.checkin.expected_minor, 4000);
  assert.equal(artifacts.checkin.actual_minor, 3550);
  assert.equal(artifacts.checkin.drift_minor, -450);
  assert.equal(artifacts.checkin.drift_breakdown[0].category, 'unknown');
  assert.equal(artifacts.adjustmentTx?.checkin_id, artifacts.checkin.id);
  assert.equal(artifacts.adjustmentTx?.delta_minor, -450);
  assert.equal(artifacts.next_balance_minor, 3550);
  assert.equal(artifacts.next_count_mode, 'total');
  assert.equal(JSON.stringify(wallet.denominations), denomsBefore);
});

test('buildQuickReconcileArtifacts can emit zero-drift linked adjustment tx', () => {
  const artifacts = checkins.buildQuickReconcileArtifacts({
    checkin_id: 'checkin_qr_2',
    tx_id: 'tx_qr_2',
    wallet: { id: 'w1', name: 'Main', currency: 'USD', balance_minor: 5000 },
    wallet_id: 'w1',
    ts: 1739577600,
    cadence: 'weekly',
    week_start: 'mon',
    expected_minor: 5000,
    actual_minor: 5000,
  });
  assert.equal(artifacts.checkin.method, 'quick_reconcile');
  assert.equal(artifacts.checkin.drift_minor, 0);
  assert.equal(artifacts.adjustmentTx?.id, 'tx_qr_2');
  assert.equal(artifacts.adjustmentTx?.delta_minor, 0);
});

test('requiresLargeDriftConfirm follows abs threshold', () => {
  assert.equal(checkins.requiresLargeDriftConfirm(1999, 2000), false);
  assert.equal(checkins.requiresLargeDriftConfirm(2000, 2000), true);
  assert.equal(checkins.requiresLargeDriftConfirm(-5000, 2000), true);
});
