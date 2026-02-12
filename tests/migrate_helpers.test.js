import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadMigrateHelpers() {
  const src = readFileSync(new URL('../site/static/app/migrate.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaMigrate;
}

const migrate = loadMigrateHelpers();

test('migrateV1toV2 derives wallet balances from denoms and leaves ledger entries untouched', () => {
  const stateV1 = {
    settings: { language: 'en' },
    wallets: {
      w1: {
        id: 'w1',
        currency: 'USD',
        denoms: {
          '10.00': 1,
          '0.50': 2,
          '0.05': 3,
        },
        balance_minor: 999999,
        count_mode: 'manual',
      },
      w2: {
        id: 'w2',
        currency: 'JPY',
        denominations: [
          { value_minor: 1000, count: 2 },
          { value: '500', count: 1 },
        ],
      },
    },
    wallet_order: ['w1', 'w2'],
    transactions: [
      { id: 't1', wallet_id: 'w1', amount_minor: 1234, note: 'keep' },
      { id: 't2', wallet_id: 'w2', delta_minor: -500 },
    ],
  };
  const txBefore = JSON.stringify(stateV1.transactions);

  const migrated = migrate.migrateV1toV2(stateV1);
  const txAfter = JSON.stringify(migrated.transactions);

  assert.equal(migrated.schema_version, 2);
  assert.equal(migrated.settings.app_mode, 'precise');
  assert.equal(migrated.settings.budget.default_cadence, 'weekly');
  assert.equal(migrated.settings.budget.week_start, 'mon');
  assert.equal(JSON.stringify(migrated.checkins), '[]');
  assert.equal(migrated.wallets.w1.balance_minor, 1115);
  assert.equal(migrated.wallets.w2.balance_minor, 2500);
  assert.equal(migrated.wallets.w1.count_mode, 'denoms');
  assert.equal(migrated.wallets.w2.count_mode, 'denoms');
  assert.equal(migrated.wallets.w1.budget.enabled, false);
  assert.equal(migrated.wallets.w1.budget.cadence, 'weekly');
  assert.equal(migrated.wallets.w1.budget.period_anchor.week_start, 'mon');
  assert.equal(txAfter, txBefore);
});

test('migrateIfNeeded is idempotent for schema_version 2 payloads', () => {
  const stateV2 = { schema_version: 2, settings: {}, wallets: {}, wallet_order: [], transactions: [], checkins: [] };
  const result = migrate.migrateIfNeeded(stateV2, { latestVersion: 2 });
  assert.equal(result.needsMigration, false);
  assert.equal(result.state, stateV2);
});
