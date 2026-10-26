// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const START_TIME = Date.parse('2026-10-26T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

function loadHistoryHelpers() {
  let now = START_TIME;
  const stored = new Map();
  class ClockDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }

    static now() {
      return now;
    }
  }
  const localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, String(value)),
    removeItem: (key) => stored.delete(key),
  };
  const sandbox = { window: { localStorage, Date: ClockDate }, Date: ClockDate };
  vm.createContext(sandbox);
  for (const file of ['state.js', 'migrate.js', 'import_export.js']) {
    const source = readFileSync(new URL(`../site/static/app/${file}`, import.meta.url), 'utf8');
    vm.runInContext(source, sandbox, { filename: file });
  }
  return {
    stateIO: sandbox.window.KontanaStateIO,
    migrate: sandbox.window.KontanaMigrate,
    io: sandbox.window.KontanaImportExport,
    setTime: (value) => { now = Date.parse(value); },
  };
}

function historyFixture(schemaVersion = 2) {
  const transaction = (id, createdAt, type, amount, extra = {}) => ({
    id,
    wallet_id: 'w1',
    currency: 'EUR',
    created_at: createdAt,
    type,
    amount_minor: amount,
    delta_minor: type === 'outgoing' ? -amount : amount,
    ...extra,
  });
  const checkin = {
    id: 'old-checkin',
    wallet_id: 'w1',
    ts: Date.parse('2001-01-01T12:00:00Z') / 1000,
    method: 'confirm',
    expected_minor: 10000,
    actual_minor: 10000,
    drift_minor: 0,
  };
  return {
    ...(schemaVersion === 2 ? { schema_version: 2 } : {}),
    settings: { language: 'en', app_mode: 'precise' },
    wallets: {
      w1: {
        id: 'w1',
        name: 'Everyday',
        currency: 'EUR',
        balance_minor: 9000,
        count_mode: 'denoms',
        denominations: [{ value_minor: 5000, count: 1 }, { value_minor: 2000, count: 2 }],
      },
    },
    wallet_order: ['w1'],
    transactions: [
      transaction('opening', '1990-01-01T12:00:00Z', 'incoming', 10000),
      transaction('old-adjustment', '2001-01-01T12:00:00Z', 'adjustment', 0, { checkin_id: checkin.id }),
      ...[31, 30, 29].map((daysAgo, index) => transaction(
        `payment-${daysAgo}`,
        new Date(START_TIME - daysAgo * DAY).toISOString(),
        'outgoing',
        index === 0 ? 1000 : 500,
      )),
      transaction('recent', new Date(START_TIME).toISOString(), 'incoming', 1000),
    ],
    checkins: [checkin],
  };
}

function assertHistoryPreserved(actual, expected) {
  assert.equal(JSON.stringify(actual.transactions), JSON.stringify(expected.transactions));
  assert.equal(JSON.stringify(actual.checkins), JSON.stringify(expected.checkins));
  assert.equal(actual.wallets.w1.balance_minor, 9000);
  assert.equal(actual.transactions.reduce((sum, tx) => sum + tx.delta_minor, 0), 9000);
  assert.equal(actual.transactions.find((tx) => tx.checkin_id)?.checkin_id, actual.checkins[0].id);
}

test('local history survives save and reload after decades without age-based pruning', () => {
  const { stateIO, setTime } = loadHistoryHelpers();
  const expected = historyFixture();
  assert.equal(stateIO.writeStateRaw(expected).ok, true);

  setTime('2100-01-01T12:00:00Z');
  const loaded = stateIO.readStateRaw();
  assert.equal(loaded.ok, true);
  assertHistoryPreserved(loaded.value, expected);

  assert.equal(stateIO.writeStateRaw(loaded.value).ok, true);
  assertHistoryPreserved(stateIO.readStateRaw().value, expected);
});

test('legacy migration preserves old transactions, check-ins, and linked adjustments', () => {
  const { migrate } = loadHistoryHelpers();
  const legacy = historyFixture(1);
  const migrated = migrate.migrateToLatest(legacy);

  assert.equal(migrated.schema_version, 2);
  assertHistoryPreserved(migrated, legacy);
});

test('JSON backup and import preserve complete history across age boundaries', () => {
  const { io, stateIO, setTime } = loadHistoryHelpers();
  const expected = historyFixture();
  const parsed = io.parseJsonText(JSON.stringify(expected));
  assert.equal(parsed.ok, true);

  setTime('2100-01-01T12:00:00Z');
  const candidate = io.coerceToV2Candidate(parsed.value);
  assert.equal(io.validateV2Candidate(candidate).ok, true);
  const preview = io.buildPreview(candidate);
  assert.equal(preview.txCount, expected.transactions.length);
  assert.equal(preview.checkinsCount, expected.checkins.length);

  const imported = io.mergeStates({ schema_version: 2, wallets: {}, transactions: [], checkins: [] }, candidate);
  assertHistoryPreserved(imported, expected);
  assert.equal(stateIO.writeStateRaw(imported).ok, true);
  assertHistoryPreserved(stateIO.readStateRaw().value, expected);
});
