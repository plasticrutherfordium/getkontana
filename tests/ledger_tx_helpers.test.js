import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadLedgerTxHelpers() {
  const src = readFileSync(new URL('../site/static/app/ledger/tx.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaLedgerTx;
}

const ledger = loadLedgerTxHelpers();

test('buildTransferPair creates paired transfer tx with shared transfer_id and balance updates', () => {
  const fromWallet = { id: 'w1', name: 'Main', currency: 'USD', balance_minor: 10000 };
  const toWallet = { id: 'w2', name: 'Travel', currency: 'USD', balance_minor: 2000 };
  const artifacts = ledger.buildTransferPair({
    transfer_id: 'transfer_1',
    tx_out_id: 'tx_out_1',
    tx_in_id: 'tx_in_1',
    from_wallet: fromWallet,
    to_wallet: toWallet,
    amount_minor: 3500,
    note: 'Top up travel wallet',
    ts: 1739577600,
  });

  assert.equal(artifacts.transfer_id, 'transfer_1');
  assert.equal(artifacts.outgoing_tx.id, 'tx_out_1');
  assert.equal(artifacts.incoming_tx.id, 'tx_in_1');
  assert.equal(artifacts.outgoing_tx.type, 'transfer_out');
  assert.equal(artifacts.incoming_tx.type, 'transfer_in');
  assert.equal(artifacts.outgoing_tx.transfer_id, 'transfer_1');
  assert.equal(artifacts.incoming_tx.transfer_id, 'transfer_1');
  assert.equal(artifacts.outgoing_tx.to_wallet_id, 'w2');
  assert.equal(artifacts.incoming_tx.from_wallet_id, 'w1');
  assert.equal(artifacts.from_next_balance_minor, 6500);
  assert.equal(artifacts.to_next_balance_minor, 5500);
});

test('validateTransfer rejects same-wallet transfers', () => {
  const result = ledger.validateTransfer({
    from_wallet_id: 'w1',
    to_wallet_id: 'w1',
    amount_minor: 500,
    from_balance_minor: 1000,
    from_currency: 'USD',
    to_currency: 'USD',
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'same_wallet');
});

test('validateTransfer rejects cross-currency transfers', () => {
  const result = ledger.validateTransfer({
    from_wallet_id: 'w1',
    to_wallet_id: 'w2',
    amount_minor: 500,
    from_balance_minor: 1000,
    from_currency: 'USD',
    to_currency: 'EUR',
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'currency_mismatch');
});

test('buildAdjustmentTx handles decrease and increase with category + note', () => {
  const wallet = { id: 'w1', name: 'Main', currency: 'USD', balance_minor: 10000 };
  const decrease = ledger.buildAdjustmentTx({
    tx_id: 'tx_loss_1',
    wallet,
    current_balance_minor: 10000,
    amount_minor: 800,
    direction: 'decrease',
    category: 'loss',
    note: 'Cash lost',
    ts: 1739577600,
  });
  const increase = ledger.buildAdjustmentTx({
    tx_id: 'tx_found_1',
    wallet,
    current_balance_minor: 9200,
    amount_minor: 500,
    direction: 'increase',
    category: 'unknown',
    note: 'Found cash',
    ts: 1739577600,
  });

  assert.equal(decrease.tx.id, 'tx_loss_1');
  assert.equal(decrease.tx.type, 'adjustment');
  assert.equal(decrease.tx.category, 'loss');
  assert.equal(decrease.tx.note, 'Cash lost');
  assert.equal(decrease.tx.delta_minor, -800);
  assert.equal(decrease.next_balance_minor, 9200);

  assert.equal(increase.tx.id, 'tx_found_1');
  assert.equal(increase.tx.category, 'unknown');
  assert.equal(increase.tx.note, 'Found cash');
  assert.equal(increase.tx.delta_minor, 500);
  assert.equal(increase.next_balance_minor, 9700);
});

test('buildQuickSpendTx creates spend tx with negative delta and reduced wallet balance', () => {
  const wallet = { id: 'w1', name: 'Main', currency: 'USD', balance_minor: 10000 };
  const artifacts = ledger.buildQuickSpendTx({
    tx_id: 'tx_spend_1',
    wallet,
    current_balance_minor: 10000,
    amount_minor: 1250,
    envelope_id: 'env_food',
    note: 'Lunch',
    ts: 1739577600,
  });

  assert.equal(artifacts.tx.id, 'tx_spend_1');
  assert.equal(artifacts.tx.type, 'spend');
  assert.equal(artifacts.tx.amount_minor, 1250);
  assert.equal(artifacts.tx.delta_minor, -1250);
  assert.equal(artifacts.tx.envelope_id, 'env_food');
  assert.equal(artifacts.tx.note, 'Lunch');
  assert.equal(artifacts.next_balance_minor, 8750);
});

test('evaluateQuickSpendThreshold returns below/good hints only for big_only', () => {
  const below = ledger.evaluateQuickSpendThreshold({
    tracking_level: 'big_only',
    amount_minor: 900,
    threshold_minor: 1000,
  });
  const good = ledger.evaluateQuickSpendThreshold({
    tracking_level: 'big_only',
    amount_minor: 1200,
    threshold_minor: 1000,
  });
  const none = ledger.evaluateQuickSpendThreshold({
    tracking_level: 'none',
    amount_minor: 999999,
    threshold_minor: 1000,
  });

  assert.equal(below.hint, 'below');
  assert.equal(good.hint, 'good');
  assert.equal(none.hint, '');
});
