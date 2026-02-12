(function attachKontanaLedgerTx(global) {
  const ADJUSTMENT_CATEGORIES = ['loss', 'unknown'];
  const TRACKING_LEVELS = ['none', 'big_only', 'all'];

  function nowEpochSec() {
    return Math.floor(Date.now() / 1000);
  }

  function toInt(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.trunc(parsed);
  }

  function normalizeCategory(value) {
    if (ADJUSTMENT_CATEGORIES.includes(value)) return value;
    return 'unknown';
  }

  function normalizeTrackingLevel(value) {
    if (TRACKING_LEVELS.includes(value)) return value;
    return 'big_only';
  }

  function evaluateQuickSpendThreshold(input = {}) {
    const trackingLevel = normalizeTrackingLevel(input.tracking_level);
    const amountMinor = Math.max(0, toInt(input.amount_minor, 0));
    const thresholdMinor = Math.max(0, toInt(input.threshold_minor, 0));
    if (trackingLevel !== 'big_only') {
      return {
        tracking_level: trackingLevel,
        threshold_minor: thresholdMinor,
        hint: '',
      };
    }
    return {
      tracking_level: trackingLevel,
      threshold_minor: thresholdMinor,
      hint: amountMinor >= thresholdMinor ? 'good' : 'below',
    };
  }

  function validateTransfer(input = {}) {
    const fromWalletId = String(input.from_wallet_id || '').trim();
    const toWalletId = String(input.to_wallet_id || '').trim();
    const amountMinor = toInt(input.amount_minor, 0);
    const fromBalanceMinor = toInt(input.from_balance_minor, 0);
    const fromCurrency = String(input.from_currency || '').trim();
    const toCurrency = String(input.to_currency || '').trim();

    if (!fromWalletId || !toWalletId) {
      return { ok: false, error: 'wallet_required' };
    }
    if (fromWalletId === toWalletId) {
      return { ok: false, error: 'same_wallet' };
    }
    if (amountMinor <= 0) {
      return { ok: false, error: 'invalid_amount' };
    }
    if (!fromCurrency || !toCurrency || fromCurrency !== toCurrency) {
      return { ok: false, error: 'currency_mismatch' };
    }
    if (amountMinor > fromBalanceMinor) {
      return {
        ok: false,
        error: 'insufficient_balance',
        missing_minor: amountMinor - fromBalanceMinor,
      };
    }
    return { ok: true };
  }

  function buildTransferPair(input = {}) {
    const fromWallet = input.from_wallet || {};
    const toWallet = input.to_wallet || {};
    const amountMinor = toInt(input.amount_minor, 0);
    if (!fromWallet.id || !toWallet.id) throw new TypeError('wallet_required');
    if (amountMinor <= 0) throw new TypeError('invalid_amount');

    const ts = toInt(input.ts, nowEpochSec());
    const date = new Date(ts * 1000);
    const createdAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    const transferId = typeof input.transfer_id === 'string' && input.transfer_id
      ? input.transfer_id
      : `transfer_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    const note = String(input.note || '').trim();
    const fromBalanceMinor = toInt(input.from_balance_minor, toInt(fromWallet.balance_minor, 0));
    const toBalanceMinor = toInt(input.to_balance_minor, toInt(toWallet.balance_minor, 0));

    const base = {
      created_at: createdAt,
      currency: fromWallet.currency || toWallet.currency || '',
      amount_minor: amountMinor,
      transfer_id: transferId,
      category: 'transfer',
      note,
    };

    const outgoingTx = {
      ...base,
      id: typeof input.tx_out_id === 'string' && input.tx_out_id
        ? input.tx_out_id
        : `tx_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      type: 'transfer_out',
      wallet_id: fromWallet.id,
      wallet_name: fromWallet.name || '',
      delta_minor: -amountMinor,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWallet.id,
    };

    const incomingTx = {
      ...base,
      id: typeof input.tx_in_id === 'string' && input.tx_in_id
        ? input.tx_in_id
        : `tx_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      type: 'transfer_in',
      wallet_id: toWallet.id,
      wallet_name: toWallet.name || '',
      delta_minor: amountMinor,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWallet.id,
    };

    return {
      transfer_id: transferId,
      outgoing_tx: outgoingTx,
      incoming_tx: incomingTx,
      from_next_balance_minor: fromBalanceMinor - amountMinor,
      to_next_balance_minor: toBalanceMinor + amountMinor,
    };
  }

  function buildAdjustmentTx(input = {}) {
    const wallet = input.wallet || {};
    if (!wallet.id || !wallet.currency) throw new TypeError('wallet_required');
    const amountMinor = toInt(input.amount_minor, 0);
    if (amountMinor <= 0) throw new TypeError('invalid_amount');
    const direction = input.direction === 'increase' ? 'increase' : 'decrease';
    const deltaMinor = direction === 'increase' ? amountMinor : -amountMinor;
    const category = normalizeCategory(input.category);
    const ts = toInt(input.ts, nowEpochSec());
    const date = new Date(ts * 1000);
    const createdAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    const currentBalanceMinor = toInt(input.current_balance_minor, toInt(wallet.balance_minor, 0));

    const tx = {
      id: typeof input.tx_id === 'string' && input.tx_id
        ? input.tx_id
        : `tx_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      created_at: createdAt,
      wallet_id: wallet.id,
      wallet_name: wallet.name || '',
      currency: wallet.currency,
      type: 'adjustment',
      amount_minor: amountMinor,
      delta_minor: deltaMinor,
      adjustment_direction: direction,
      category,
      note: String(input.note || '').trim(),
    };

    return {
      tx,
      next_balance_minor: currentBalanceMinor + deltaMinor,
    };
  }

  function buildQuickSpendTx(input = {}) {
    const wallet = input.wallet || {};
    if (!wallet.id || !wallet.currency) throw new TypeError('wallet_required');
    const amountMinor = toInt(input.amount_minor, 0);
    if (amountMinor <= 0) throw new TypeError('invalid_amount');
    const ts = toInt(input.ts, nowEpochSec());
    const date = new Date(ts * 1000);
    const createdAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    const currentBalanceMinor = toInt(input.current_balance_minor, toInt(wallet.balance_minor, 0));
    const tx = {
      id: typeof input.tx_id === 'string' && input.tx_id
        ? input.tx_id
        : `tx_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      created_at: createdAt,
      wallet_id: wallet.id,
      wallet_name: wallet.name || '',
      currency: wallet.currency,
      type: 'spend',
      amount_minor: amountMinor,
      delta_minor: -amountMinor,
      category: 'misc',
      note: String(input.note || '').trim(),
    };
    const envelopeId = String(input.envelope_id || '').trim();
    if (envelopeId) tx.envelope_id = envelopeId;
    return {
      tx,
      next_balance_minor: currentBalanceMinor - amountMinor,
    };
  }

  global.KontanaLedgerTx = {
    ADJUSTMENT_CATEGORIES,
    TRACKING_LEVELS,
    validateTransfer,
    buildTransferPair,
    buildAdjustmentTx,
    buildQuickSpendTx,
    evaluateQuickSpendThreshold,
  };
}(window));
