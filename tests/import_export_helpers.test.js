import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadImportExportHelpers() {
  const src = readFileSync(new URL('../site/static/app/import_export.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaImportExport;
}

const io = loadImportExportHelpers();

test('detectImportVersion identifies v1 and v2 payloads', () => {
  const v1 = io.detectImportVersion({ wallets: {}, transactions: [] });
  const v2 = io.detectImportVersion({ schema_version: 2, wallets: {}, transactions: [], checkins: [], settings: {}, wallet_order: [] });
  const unknown = io.detectImportVersion({ schema_version: 99 });

  assert.equal(v1.ok, true);
  assert.equal(v1.version, 'v1');
  assert.equal(v2.ok, true);
  assert.equal(v2.version, 'v2');
  assert.equal(unknown.ok, false);
});

test('validateV2Candidate catches malformed v2 shapes', () => {
  const valid = io.validateV2Candidate({
    schema_version: 2,
    settings: {},
    wallets: {},
    wallet_order: [],
    transactions: [],
    checkins: [],
  });
  const invalid = io.validateV2Candidate({
    schema_version: 2,
    settings: null,
    wallets: [],
    wallet_order: null,
    transactions: {},
    checkins: {},
  });
  assert.equal(valid.ok, true);
  assert.equal(invalid.ok, false);
  assert.ok(Array.isArray(invalid.errors));
  assert.ok(invalid.errors.length >= 1);
});

test('mergeStates keeps local wallet on ID collision and renames imported wallet deterministically', () => {
  const current = {
    schema_version: 2,
    settings: { language: 'en' },
    wallets: { w1: { id: 'w1', name: 'Current' } },
    wallet_order: ['w1'],
    transactions: [{ id: 't1', wallet_id: 'w1' }, { id: 't2', wallet_id: 'w1' }],
    checkins: [{ id: 'c1', wallet_id: 'w1' }],
  };
  const imported = {
    schema_version: 2,
    settings: { language: 'es' },
    wallets: { w2: { id: 'w2', name: 'Imported' }, w1: { id: 'w1', name: 'ImportedW1' } },
    wallet_order: ['w2', 'w1'],
    transactions: [{ id: 't2', wallet_id: 'w1' }, { id: 't3', wallet_id: 'w1' }],
    checkins: [{ id: 'c1', wallet_id: 'w1' }, { id: 'c2', wallet_id: 'w1' }],
  };

  const merged = io.mergeStates(current, imported);
  assert.deepEqual(Object.keys(merged.wallets).sort(), ['w1', 'w1-imported', 'w2']);
  assert.equal(merged.wallets.w1.name, 'Current');
  assert.equal(merged.wallets['w1-imported'].name, 'ImportedW1');
  assert.equal(merged.wallets['w1-imported'].id, 'w1-imported');
  assert.equal(JSON.stringify(merged.transactions.map((tx) => tx.id)), JSON.stringify(['t1', 't2', 't3']));
  assert.equal(JSON.stringify(merged.checkins.map((c) => c.id)), JSON.stringify(['c1', 'c2']));
  assert.equal(merged.transactions.find((tx) => tx.id === 't3')?.wallet_id, 'w1-imported');
  assert.equal(merged.checkins.find((row) => row.id === 'c2')?.wallet_id, 'w1-imported');
  assert.equal(merged.settings.language, 'en');
});

test('getWalletIdCollisions returns overlapping wallet IDs', () => {
  const current = { schema_version: 2, wallets: { a: { id: 'a' }, b: { id: 'b' } } };
  const imported = { schema_version: 2, wallets: { b: { id: 'b' }, c: { id: 'c' } } };
  const collisions = io.getWalletIdCollisions(current, imported);
  assert.equal(JSON.stringify(collisions), JSON.stringify(['b']));
});

test('mergeStates dedupes only rows with IDs and keeps legacy rows without IDs', () => {
  const current = {
    schema_version: 2,
    wallets: { w1: { id: 'w1' } },
    wallet_order: ['w1'],
    transactions: [{ id: 'tx-1', wallet_id: 'w1' }, { wallet_id: 'w1', note: 'legacy-a' }],
    checkins: [{ id: 'c-1', wallet_id: 'w1' }, { wallet_id: 'w1', note: 'legacy-c-a' }],
  };
  const imported = {
    schema_version: 2,
    wallets: { w2: { id: 'w2' } },
    wallet_order: ['w2'],
    transactions: [{ id: 'tx-1', wallet_id: 'w2' }, { wallet_id: 'w2', note: 'legacy-b' }],
    checkins: [{ id: 'c-1', wallet_id: 'w2' }, { wallet_id: 'w2', note: 'legacy-c-b' }],
  };

  const merged = io.mergeStates(current, imported);
  assert.equal(merged.transactions.length, 3);
  assert.equal(merged.transactions.filter((row) => row.id === 'tx-1').length, 1);
  assert.equal(merged.transactions.filter((row) => !row.id).length, 2);
  assert.equal(merged.checkins.length, 3);
  assert.equal(merged.checkins.filter((row) => row.id === 'c-1').length, 1);
  assert.equal(merged.checkins.filter((row) => !row.id).length, 2);
});

test('mergeStates preserves checkin-linked adjustment metadata', () => {
  const current = {
    schema_version: 2,
    wallets: { w1: { id: 'w1' } },
    wallet_order: ['w1'],
    transactions: [
      { id: 'tx-1', wallet_id: 'w1', type: 'adjustment', delta_minor: -250, checkin_id: 'checkin-1' },
    ],
    checkins: [{ id: 'checkin-1', wallet_id: 'w1' }],
  };
  const imported = {
    schema_version: 2,
    wallets: { w2: { id: 'w2' } },
    wallet_order: ['w2'],
    transactions: [
      { id: 'tx-2', wallet_id: 'w2', type: 'adjustment', delta_minor: 500, checkin_id: 'checkin-2' },
    ],
    checkins: [{ id: 'checkin-2', wallet_id: 'w2' }],
  };

  const merged = io.mergeStates(current, imported);
  const tx1 = merged.transactions.find((row) => row.id === 'tx-1');
  const tx2 = merged.transactions.find((row) => row.id === 'tx-2');

  assert.equal(tx1?.checkin_id, 'checkin-1');
  assert.equal(tx2?.checkin_id, 'checkin-2');
  assert.equal(merged.checkins.some((row) => row.id === tx2?.checkin_id), true);
});

test('v2 parse/coerce/validate round-trip preserves transfer pairing and wallet count_mode', () => {
  const exported = {
    schema_version: 2,
    settings: { app_mode: 'budget' },
    wallets: {
      w1: { id: 'w1', name: 'Main', currency: 'USD', balance_minor: 6400, count_mode: 'total', denominations: [] },
      w2: { id: 'w2', name: 'Travel', currency: 'USD', balance_minor: 4100, count_mode: 'total', denominations: [] },
    },
    wallet_order: ['w1', 'w2'],
    transactions: [
      {
        id: 'tx_transfer_out',
        wallet_id: 'w1',
        type: 'transfer_out',
        amount_minor: 1500,
        delta_minor: -1500,
        transfer_id: 'transfer_abc',
        to_wallet_id: 'w2',
        category: 'transfer',
      },
      {
        id: 'tx_transfer_in',
        wallet_id: 'w2',
        type: 'transfer_in',
        amount_minor: 1500,
        delta_minor: 1500,
        transfer_id: 'transfer_abc',
        from_wallet_id: 'w1',
        category: 'transfer',
      },
      {
        id: 'tx_adjustment',
        wallet_id: 'w1',
        type: 'adjustment',
        amount_minor: 100,
        delta_minor: -100,
        category: 'loss',
        note: 'lost coin',
      },
    ],
    checkins: [],
  };

  const parsed = io.parseJsonText(JSON.stringify(exported));
  assert.equal(parsed.ok, true);
  const detected = io.detectImportVersion(parsed.value);
  assert.equal(detected.ok, true);
  assert.equal(detected.version, 'v2');
  const candidate = io.coerceToV2Candidate(parsed.value);
  const validation = io.validateV2Candidate(candidate);
  assert.equal(validation.ok, true);

  assert.equal(candidate.wallets.w1.count_mode, 'total');
  assert.equal(candidate.wallets.w2.count_mode, 'total');
  const transferOut = candidate.transactions.find((row) => row.id === 'tx_transfer_out');
  const transferIn = candidate.transactions.find((row) => row.id === 'tx_transfer_in');
  assert.equal(transferOut?.transfer_id, 'transfer_abc');
  assert.equal(transferIn?.transfer_id, 'transfer_abc');
  assert.equal(transferOut?.to_wallet_id, 'w2');
  assert.equal(transferIn?.from_wallet_id, 'w1');
  assert.equal(transferOut?.type, 'transfer_out');
  assert.equal(transferIn?.type, 'transfer_in');
});
