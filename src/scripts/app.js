import {
      getMinorScale,
      getCurrencyDenominations,
      defaultDenominations,
    } from '/scripts/lib/currency.js';
    import {
      ORDER_LARGEST_FIRST,
      ORDER_SMALLEST_FIRST,
      computeOutgoingPlan,
      computeIncomingPlan,
      computeChangeBreakdown,
    } from '/scripts/lib/strategies.js';
    const STORAGE_KEY = 'kontana_state_v1';
    const MAX_WALLETS = 4;
    const RETENTION_DAYS = 30;
    const APP_VERSION = '0.0.1';

    const SUPPORTED_CURRENCIES = [
      'EUR', 'USD', 'GBP', 'CLP',
      'SEK', 'CHF', 'HUF', 'DKK', 'NOK', 'PLN', 'CAD',
      'ARS', 'PEN', 'BRL', 'MXN',
      'CZK', 'RON', 'CNY', 'JPY', 'INR', 'SGD', 'KRW',
      'EGP', 'ZAR', 'NGN', 'XOF', 'AUD', 'NZD',
    ];

    const CURRENCY_FLAGS = {
      EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', CLP: '🇨🇱',
      SEK: '🇸🇪', CHF: '🇨🇭', HUF: '🇭🇺', DKK: '🇩🇰',
      NOK: '🇳🇴', PLN: '🇵🇱', CAD: '🇨🇦', ARS: '🇦🇷', PEN: '🇵🇪',
      BRL: '🇧🇷', MXN: '🇲🇽', CZK: '🇨🇿', RON: '🇷🇴', CNY: '🇨🇳',
      JPY: '🇯🇵', INR: '🇮🇳', SGD: '🇸🇬', KRW: '🇰🇷', EGP: '🇪🇬',
      ZAR: '🇿🇦', NGN: '🇳🇬', XOF: '🌍', AUD: '🇦🇺', NZD: '🇳🇿',
    };

    const WALLET_NAME_MAX = 18;
    const PAGE_META = {
      cash: {
        title: 'Cash',
      },
      pay: {
        title: 'Pay',
      },
      transactions: {
        title: 'Transactions',
      },
      settings: {
        title: 'Settings',
      },
    };

    function getInitialAppearance() {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
      return prefersDark ? 'dark' : 'light';
    }

    function makeDefaultState() {
      return {
        version: 1,
        settings: {
          payment_strategies: true,
          change_suggestions: true,
          default_strategy: 'greedy',
          denomination_order: ORDER_LARGEST_FIRST,
          coins_rule: 'off',
          show_denominations_on_hand_only: false,
          appearance: getInitialAppearance(),
          launch_updates_signups: [],
          tx_columns: {
            strategy: false,
            note: false,
            breakdown: false,
            change: false,
            wallet: true,
            currency: true,
          },
        },
        wallet_order: [],
        wallets: {},
        transactions: [],
      };
    }

    function uid(prefix) {
      return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    }

    function nowIso() {
      return new Date().toISOString();
    }

    function formatMoney(minor, currency) {
      const scale = getMinorScale(currency);
      const amount = minor / scale;
      const digits = scale === 1 ? 0 : 2;
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(amount);
    }

    function formatDenomValue(valueMinor, currency) {
      return formatMoney(valueMinor, currency);
    }

    function formatDateTimeEU(isoString) {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(isoString));
    }

    function formatDateEU(isoString) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(isoString));
    }

    function formatTimeEU(isoString) {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(isoString));
    }

    function dayKey(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function formatDayGroupLabel(isoString) {
      const today = new Date();
      const target = new Date(isoString);
      const todayKey = dayKey(today.toISOString());
      const targetKey = dayKey(target.toISOString());
      if (targetKey === todayKey) return 'Today';
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (targetKey === dayKey(yesterday.toISOString())) return 'Yesterday';
      return formatDateEU(isoString);
    }


    function truncateNote(note, maxLen = 30) {
      if (!note) return '';
      const trimmed = String(note);
      if (trimmed.length <= maxLen) return trimmed;
      return `${trimmed.slice(0, maxLen - 1)}…`;
    }

    function formatBreakdownLine(breakdown, currency) {
      if (!Array.isArray(breakdown) || breakdown.length === 0) return '-';
      return breakdown.map((r) => `${formatMoney(r.value_minor, currency)} x ${r.count}`).join(', ');
    }

    function toWalletLabel(wallet) {
      const flag = CURRENCY_FLAGS[wallet.currency] || '🏳️';
      return `${flag} ${wallet.currency} — ${wallet.name}`;
    }

    function getCurrencyOrder() {
      const priority = ['EUR', 'USD'];
      const rest = SUPPORTED_CURRENCIES
        .filter((code) => !priority.includes(code))
        .sort((a, b) => a.localeCompare(b));
      return { priority, rest };
    }

    function renderCurrencyOptions(selectedCode = '') {
      const { priority, rest } = getCurrencyOrder();
      const renderOption = (code) => `<option value="${code}" ${selectedCode === code ? 'selected' : ''}>${CURRENCY_FLAGS[code] || '🏳️'} ${code}</option>`;
      return `
        <optgroup label="Priority">
          ${priority.map(renderOption).join('')}
        </optgroup>
        <optgroup label="Other currencies">
          ${rest.map(renderOption).join('')}
        </optgroup>
      `;
    }

    function ageDays(iso) {
      const diffMs = Date.now() - new Date(iso).getTime();
      return Math.floor(diffMs / 86400000);
    }

    function purgeRetention(state) {
      const kept = [];
      const removed = [];
      state.transactions.forEach((tx) => {
        if (ageDays(tx.created_at) < RETENTION_DAYS) kept.push(tx);
        else removed.push(tx);
      });
      state.transactions = kept;
      if (removed.length === 0) return;

      const rolloverByWallet = new Map();
      removed.forEach((tx) => {
        const delta = Number.isFinite(tx.delta_minor) ? tx.delta_minor : 0;
        if (!rolloverByWallet.has(tx.wallet_id)) {
          rolloverByWallet.set(tx.wallet_id, {
            wallet_id: tx.wallet_id,
            wallet_name: tx.wallet_name,
            currency: tx.currency,
            delta_minor: 0,
          });
        }
        rolloverByWallet.get(tx.wallet_id).delta_minor += delta;
      });

      rolloverByWallet.forEach((roll) => {
        if (roll.delta_minor === 0) return;
        state.transactions.push({
          id: uid('tx'),
          created_at: nowIso(),
          wallet_id: roll.wallet_id,
          wallet_name: roll.wallet_name,
          currency: roll.currency,
          type: 'adjustment',
          amount_minor: 0,
          delta_minor: roll.delta_minor,
          tag: 'Adjustment',
          note: 'Retention rollover',
        });
      });
    }

    function getVisibleWallets(state) {
      const ids = Object.keys(state.wallets || {});
      const order = Array.isArray(state.wallet_order) ? state.wallet_order : [];
      const normalized = [];
      const seen = new Set();
      order.forEach((id) => {
        if (state.wallets[id]) {
          normalized.push(id);
          seen.add(id);
        }
      });
      ids.forEach((id) => {
        if (!seen.has(id)) normalized.push(id);
      });
      state.wallet_order = normalized;
      return normalized.map((id) => state.wallets[id]);
    }

    function getWalletTotal(wallet) {
      return wallet.denominations.reduce((sum, row) => sum + row.value_minor * row.count, 0);
    }

    function getExpectedWalletTotal(walletId) {
      return app.state.transactions
        .filter((tx) => tx.wallet_id === walletId)
        .reduce((sum, tx) => sum + (Number.isFinite(tx.delta_minor) ? tx.delta_minor : 0), 0);
    }

    function getDenomCount(wallet, valueMinor) {
      if (app.editMode && app.editMode.walletId === wallet.id) {
        return app.editMode.draft[valueMinor] || 0;
      }
      return wallet.denominations.find((d) => d.value_minor === valueMinor)?.count || 0;
    }

    function getWalletDraftTotal(wallet) {
      return wallet.denominations.reduce((sum, row) => sum + row.value_minor * getDenomCount(wallet, row.value_minor), 0);
    }

    function getDraftAllocationTotal() {
      return Object.entries(app.paymentDraft.allocation || {}).reduce((sum, [value, count]) => sum + Number(value) * Number(count), 0);
    }

    function getAllocationTotal(allocation) {
      return Object.entries(allocation || {}).reduce((sum, [value, count]) => sum + Number(value) * Number(count), 0);
    }

    function breakdownToAllocation(breakdown) {
      return (breakdown || []).reduce((acc, row) => {
        acc[row.value_minor] = row.count;
        return acc;
      }, {});
    }

    function allocationToBreakdown(allocation) {
      return Object.entries(allocation || {})
        .map(([value, count]) => ({ value_minor: Number(value), count: Number(count) }))
        .filter((row) => row.count > 0)
        .sort((a, b) => b.value_minor - a.value_minor);
    }

    function hasIncompleteAllocation() {
      if (!app.paymentDraft.startedAllocation) return false;
      const wallet = app.state.wallets[app.paymentDraft.walletId || ''];
      if (!wallet) return false;
      const amountMinor = parseAmountToMinor(app.paymentDraft.amountInput, wallet.currency);
      if (amountMinor === null) return false;
      const allocated = getDraftAllocationTotal();
      if (app.paymentDraft.mode === 'outgoing') return allocated < amountMinor;
      return allocated !== amountMinor;
    }

    function isAppGated() {
      return Boolean(app.editMode || app.pendingOutgoingChange);
    }

    function getSortedDenoms(wallet, order) {
      const rows = [...wallet.denominations];
      rows.sort((a, b) => {
        if (order === 'smallest_first') return a.value_minor - b.value_minor;
        return b.value_minor - a.value_minor;
      });
      return rows;
    }

    function parseAmountToMinor(input, currency) {
      if (!input || !input.trim()) return null;
      const scale = getMinorScale(currency);
      const cleaned = input.trim().replace(',', '.');
      const n = Number(cleaned);
      if (!Number.isFinite(n) || n <= 0) return null;
      const decimals = cleaned.includes('.') ? cleaned.split('.')[1].length : 0;
      if (scale === 1 && decimals > 0) return null;
      if (scale === 100 && decimals > 2) return null;
      return Math.round(n * scale);
    }

    function normalizeWalletDenominations(wallet) {
      const currentCounts = new Map(wallet.denominations.map((d) => [d.value_minor, d.count]));
      const canonical = getCurrencyDenominations(wallet.currency);
      wallet.denominations = canonical.map((d) => ({
        ...d,
        count: currentCounts.get(d.value_minor) || 0,
      }));
    }

    function downloadTextFile(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function exportJson(state) {
      const date = new Date().toISOString().slice(0, 10);
      downloadTextFile(JSON.stringify(state, null, 2), `kontana-export-${date}.json`, 'application/json');
    }

    function openPdfReport(state) {
      const date = new Date().toISOString().slice(0, 10);
      const lines = [];
      lines.push('Kontana Snapshot Report');
      lines.push(`Generated: ${new Date().toLocaleString()}`);
      lines.push('');
      lines.push('Wallet Totals');
      for (const wallet of Object.values(state.wallets)) {
        lines.push(`- ${toWalletLabel(wallet)}: ${formatMoney(getWalletTotal(wallet), wallet.currency)}`);
      }
      lines.push('');
      lines.push('Transactions (Last 30 Days)');
      const txs = [...state.transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      for (const tx of txs) {
        const amountMinor = Number.isFinite(tx.requested_amount_minor) ? tx.requested_amount_minor : (tx.amount_minor || 0);
        const paidMinor = Number.isFinite(tx.paid_amount_minor) ? tx.paid_amount_minor : 0;
        lines.push(`- ${new Date(tx.created_at).toLocaleString()} | ${tx.wallet_name} | ${tx.type || 'outgoing'} ${formatMoney(amountMinor, tx.currency)} | paid ${formatMoney(paidMinor, tx.currency)} | strategy ${tx.strategy || '-'}`);
      }

      const w = window.open('', '_blank');
      if (!w) {
        modalAlert('Popup blocked. Allow popups to export PDF report.');
        return;
      }
      w.document.write(`<!doctype html><html><head><title>kontana-report-${date}.pdf</title><style>body{font-family:ui-sans-serif,system-ui;padding:24px;white-space:pre-wrap;line-height:1.45}</style></head><body>${lines.join('\n').replace(/</g, '&lt;')}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }

    function createWallet(state, name, currency) {
      if (Object.keys(state.wallets).length >= MAX_WALLETS) {
        throw new Error('You can have up to 4 wallets. Delete one to create another.');
      }
      if (!name || name.trim().length === 0) {
        throw new Error('Wallet name is required.');
      }
      if (name.trim().length > WALLET_NAME_MAX) {
        throw new Error(`Wallet name must be ${WALLET_NAME_MAX} characters or fewer.`);
      }
      const id = uid('wallet');
      state.wallets[id] = {
        id,
        name: name.trim(),
        currency,
        enabled: true,
        denominations: defaultDenominations(currency),
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      if (!Array.isArray(state.wallet_order)) state.wallet_order = [];
      state.wallet_order.push(id);
      return id;
    }

    function applyBreakdownToWallet(wallet, breakdown, direction) {
      const byValue = new Map(wallet.denominations.map((d) => [d.value_minor, d]));
      for (const row of breakdown) {
        const denom = byValue.get(row.value_minor);
        if (!denom) continue;
        denom.count += direction * row.count;
        if (denom.count < 0) denom.count = 0;
      }
      wallet.updated_at = nowIso();
    }

    function setWalletCounts(wallet, breakdown) {
      const byValue = new Map(breakdown.map((row) => [row.value_minor, row.count]));
      wallet.denominations.forEach((denom) => {
        denom.count = byValue.get(denom.value_minor) || 0;
      });
      wallet.updated_at = nowIso();
    }

    function loadState() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return makeDefaultState();
      try {
        const parsed = JSON.parse(raw);
        const merged = { ...makeDefaultState(), ...parsed };
        merged.settings = { ...makeDefaultState().settings, ...(parsed.settings || {}) };
        if (typeof merged.settings.payment_strategies !== 'boolean') {
          merged.settings.payment_strategies = true;
        }
        if (typeof merged.settings.change_suggestions !== 'boolean') {
          merged.settings.change_suggestions = true;
        }
        if (typeof merged.settings.show_denominations_on_hand_only !== 'boolean') {
          merged.settings.show_denominations_on_hand_only = false;
        }
        if (!merged.settings.payment_strategies) {
          merged.settings.coins_rule = 'off';
          merged.settings.change_suggestions = false;
        }
        if (!['greedy', 'lex', 'equalisation'].includes(merged.settings.default_strategy)) {
          merged.settings.default_strategy = 'greedy';
        }
        if (![ORDER_LARGEST_FIRST, ORDER_SMALLEST_FIRST].includes(merged.settings.denomination_order)) {
          merged.settings.denomination_order = ORDER_LARGEST_FIRST;
        }
        if (!['off', 'avoid', 'prefer'].includes(merged.settings.coins_rule)) {
          merged.settings.coins_rule = 'off';
        }
        if (!['light', 'dark'].includes(merged.settings.appearance)) {
          merged.settings.appearance = getInitialAppearance();
        }
        merged.settings.tx_columns = { ...makeDefaultState().settings.tx_columns, ...(parsed.settings?.tx_columns || {}) };
        merged.wallets = parsed.wallets || {};
        if (!Array.isArray(merged.wallet_order)) merged.wallet_order = [];
        Object.values(merged.wallets).forEach((wallet) => {
          if (typeof wallet.enabled !== 'boolean') wallet.enabled = true;
          normalizeWalletDenominations(wallet);
        });
        merged.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        merged.transactions = merged.transactions.map((tx) => {
          const type = tx.type === 'payment' ? 'outgoing' : tx.type;
          if (Number.isFinite(tx.delta_minor)) return tx;
          if (type === 'adjustment') return { ...tx, type, delta_minor: 0 };
          if (type === 'incoming') return { ...tx, type, delta_minor: tx.amount_minor || 0 };
          if (type === 'outgoing') return { ...tx, type, delta_minor: -(tx.amount_minor || 0) };
          if (Number.isFinite(tx.requested_amount_minor)) {
            const change = Number.isFinite(tx.change_received_minor) ? tx.change_received_minor : 0;
            return { ...tx, delta_minor: -tx.requested_amount_minor + change, type: 'outgoing', amount_minor: tx.requested_amount_minor };
          }
          return { ...tx, type: type || 'adjustment', delta_minor: 0 };
        });
        purgeRetention(merged);
        const walletIds = Object.keys(merged.wallets);
        const normalizedOrder = [];
        const seen = new Set();
        merged.wallet_order.forEach((id) => {
          if (merged.wallets[id]) {
            normalizedOrder.push(id);
            seen.add(id);
          }
        });
        walletIds.forEach((id) => {
          if (!seen.has(id)) normalizedOrder.push(id);
        });
        merged.wallet_order = normalizedOrder;
        const walletIdsWithTx = new Set(merged.transactions.map((tx) => tx.wallet_id));
        Object.values(merged.wallets).forEach((wallet) => {
          if (walletIdsWithTx.has(wallet.id)) return;
          const total = getWalletTotal(wallet);
          if (total <= 0) return;
          merged.transactions.push({
            id: uid('tx'),
            created_at: nowIso(),
            wallet_id: wallet.id,
            wallet_name: wallet.name,
            currency: wallet.currency,
            type: 'adjustment',
            amount_minor: 0,
            delta_minor: total,
            tag: 'Adjustment',
            note: 'Initial balance migration',
            breakdown: wallet.denominations.filter((d) => d.count > 0).map((d) => ({ value_minor: d.value_minor, count: d.count })),
          });
        });
        return merged;
      } catch {
        return makeDefaultState();
      }
    }

    const app = {
      state: loadState(),
      activeTab: 'cash',
      activeWalletId: null,
      cashDenomTabByWallet: {},
      paymentDenomTabByWallet: {},
      editMode: null,
      pendingOutgoingChange: null,
      walletDragActive: false,
      paymentDraft: {
        walletId: null,
        amountInput: '',
        strategy: 'greedy',
        mode: 'outgoing',
        note: '',
        allocation: {},
        manualEntry: false,
        startedAllocation: false,
        showAllDenoms: false,
      },
      paymentSuccessMessage: '',
      paymentSuccessSummary: null,
      launchSignupMessage: '',
      modal: null,
      modalResolver: null,
      settingsOpen: false,
    };

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(app.state));
    }

    function getWalletList() {
      return getVisibleWallets(app.state);
    }

    function getAllWallets() {
      return Object.values(app.state.wallets);
    }

    function getLatestTransaction() {
      return [...app.state.transactions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    }

    function getLatestTransactionForWallet(walletId, type) {
      return [...app.state.transactions]
        .filter((tx) => tx.wallet_id === walletId && (!type || tx.type === type))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    }

    function setPaymentSuccess(tx) {
      if (!tx) return;
      app.paymentSuccessMessage = `${tx.type === 'incoming' ? 'Incoming' : 'Outgoing'} transaction recorded.`;
      app.paymentSuccessSummary = {
        type: tx.type,
        created_at: tx.created_at,
        wallet_id: tx.wallet_id,
        wallet_name: tx.wallet_name,
        currency: tx.currency,
        amount_minor: Number.isFinite(tx.amount_minor) ? tx.amount_minor : Math.abs(tx.delta_minor || 0),
        note: tx.note || '',
        change_expected_minor: Number.isFinite(tx.change_expected_minor) ? tx.change_expected_minor : 0,
        change_received_minor: Number.isFinite(tx.change_received_minor) ? tx.change_received_minor : 0,
      };
    }

    function getActiveWallet() {
      const visibleWallets = getWalletList();
      if (app.activeWalletId && app.state.wallets[app.activeWalletId]) {
        const visibleIds = new Set(visibleWallets.map((w) => w.id));
        if (visibleIds.has(app.activeWalletId)) return app.state.wallets[app.activeWalletId];
      }
      const fallback = visibleWallets[0] || getAllWallets()[0] || null;
      if (fallback) {
        normalizeWalletDenominations(fallback);
        app.activeWalletId = fallback.id;
      }
      return fallback;
    }

    function setAppearance(theme) {
      const nextTheme = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
    }

    function getPaymentContext() {
      const wallet = app.state.wallets[app.paymentDraft.walletId || ''] || null;
      if (!wallet) return null;
      const amountMinor = parseAmountToMinor(app.paymentDraft.amountInput, wallet.currency);
      if (!amountMinor) return { wallet, amountMinor: null };

      const strategy = app.paymentDraft.strategy;
      const denomOrder = app.state.settings.denomination_order || ORDER_LARGEST_FIRST;
      const coinsRule = app.state.settings.coins_rule || 'off';
      const plan = app.state.settings.payment_strategies
        ? computeOutgoingPlan(wallet.denominations, amountMinor, strategy, denomOrder, false, coinsRule)
        : { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
      const total = getWalletTotal(wallet);

      if (plan.status === 'exact') {
        return {
          wallet,
          amountMinor,
          status: 'EXACT_PAYABLE',
          breakdown: plan.breakdown,
        };
      }
      if (total < amountMinor) {
        return {
          wallet,
          amountMinor,
          status: 'INSUFFICIENT_FUNDS',
          breakdown: null,
          missingMinor: Math.max(0, amountMinor - total),
        };
      }
      return {
        wallet,
        amountMinor,
        status: 'NO_EXACT_SUGGESTION',
        breakdown: null,
      };
    }

    function render() {
      purgeRetention(app.state);
      Object.values(app.state.wallets).forEach((wallet) => normalizeWalletDenominations(wallet));
      saveState();
      setAppearance(app.state.settings.appearance);
      renderCashOnHand();
      renderPay();
      renderTransactions();
      renderSettings();
      setupTabs();
      renderModal();
    }

    function showModal({ title, message, actions, input, fields, changeEditor, showClose = false }) {
      const values = {};
      (fields || []).forEach((field) => {
        values[field.id] = field.defaultValue ?? '';
      });
      if (changeEditor) {
        (changeEditor.options || []).forEach((row) => {
          values[String(row.value_minor)] = String(changeEditor.initialAllocation?.[row.value_minor] || 0);
        });
      }
      return new Promise((resolve) => {
        app.modal = {
          title,
          message,
          actions,
          input,
          fields,
          changeEditor,
          changeTab: changeEditor?.defaultTab || 'bills',
          value: input?.defaultValue || '',
          values,
          showClose,
        };
        app.modalResolver = resolve;
        renderModal();
      });
    }

    async function modalAlert(message, title = 'Notice') {
      await showModal({
        title,
        message,
        actions: [{ id: 'ok', label: 'OK', style: 'primary' }],
      });
    }

    async function modalConfirm(message, title = 'Confirm') {
      const result = await showModal({
        title,
        message,
        actions: [
          { id: 'confirm', label: 'Confirm', style: 'primary' },
          { id: 'cancel', label: 'Cancel', style: 'secondary' },
        ],
      });
      return result === 'confirm';
    }

    async function modalPrompt(message, defaultValue = '', title = 'Input', placeholder = '', maxLength = null) {
      const result = await showModal({
        title,
        message,
        input: { defaultValue, placeholder, maxLength },
        actions: [
          { id: 'submit', label: 'Submit', style: 'primary' },
          { id: 'cancel', label: 'Cancel', style: 'secondary' },
        ],
      });
      if (!result || result.id !== 'submit') return null;
      return result.value?.trim() || '';
    }

    function closeModal(result) {
      const resolver = app.modalResolver;
      app.modal = null;
      app.modalResolver = null;
      renderModal();
      if (resolver) resolver(result);
    }

    function renderModal() {
      const root = document.getElementById('app-modal-root');
      if (!root) return;
      if (!app.modal) {
        root.innerHTML = '';
        return;
      }
      let html = '';
      const modal = app.modal;
      if (modal.changeEditor) {
        const ed = modal.changeEditor;
        const showToggle = ed.hasBills && ed.hasCoins;
        const tabType = app.modal.changeTab === 'coins' ? 'coin' : 'note';
        const visible = (ed.options || []).filter((row) => row.type === tabType);
        const total = visible.length;
        const rows = visible.map((row) => {
          const key = String(row.value_minor);
          const value = app.modal.values?.[key] ?? '0';
          return `<article class="denom-row">
            <p class="denom-value">${formatDenomValue(row.value_minor, ed.currency)}</p>
            <div class="denom-count-wrap">
              <button type="button" class="denom-step" data-modal-change-step="-1" data-value="${row.value_minor}">-</button>
              <input type="number" min="0" step="1" data-modal-change-value="${row.value_minor}" class="denom-input" value="${value}" />
              <button type="button" class="denom-step" data-modal-change-step="1" data-value="${row.value_minor}">+</button>
            </div>
            <p class="denom-subtotal">${formatMoney(row.value_minor * (Number.parseInt(value || '0', 10) || 0), ed.currency)}</p>
          </article>`;
        }).join('');
        const receivedTotal = Object.entries(app.modal.values || {}).reduce((sum, [value, count]) => sum + Number(value) * (Number.parseInt(String(count || '0'), 10) || 0), 0);
        const canConfirm = receivedTotal === ed.expectedChangeMinor;

        html += `
          <div class="modal-backdrop" id="modal-backdrop">
            <section class="modal-card" role="dialog" aria-modal="true" aria-label="${modal.title}">
              <div class="modal-header">
                <h3>${modal.title}</h3>
                ${modal.showClose ? '<button type="button" class="modal-close-btn" data-modal-close aria-label="Close">×</button>' : ''}
              </div>
              <p>${modal.message}</p>
              ${showToggle ? `<div class="segmented-control" role="tablist" aria-label="Change denomination type">
                <button type="button" class="segment ${app.modal.changeTab === 'bills' ? 'active' : ''}" data-modal-change-tab="bills">Bills</button>
                <button type="button" class="segment ${app.modal.changeTab === 'coins' ? 'active' : ''}" data-modal-change-tab="coins">Coins</button>
              </div>` : ''}
              <div class="modal-change-list">${total > 0 ? rows : '<p class="muted">No denominations available in this tab.</p>'}</div>
              <p class="muted">Received: ${formatMoney(receivedTotal, ed.currency)} / ${formatMoney(ed.expectedChangeMinor, ed.currency)}</p>
              <div class="inline-actions">
                <button type="button" data-modal-change-action="submit" class="btn-primary-soft" ${canConfirm ? '' : 'disabled'}>Confirm</button>
                <button type="button" data-modal-change-action="cancel" class="btn-secondary-soft">Cancel</button>
              </div>
            </section>
          </div>
        `;
        root.innerHTML = html;
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
          backdrop.addEventListener('click', (event) => {
            if (event.target !== backdrop) return;
            closeModal({ id: 'cancel' });
          });
        }
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeModal({ id: 'cancel' });
        }, { once: true });

        root.querySelectorAll('[data-modal-close]').forEach((btn) => {
          btn.addEventListener('click', () => closeModal({ id: 'cancel' }));
        });
        root.querySelectorAll('[data-modal-change-tab]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!app.modal) return;
            app.modal.changeTab = btn.dataset.modalChangeTab;
            renderModal();
          });
        });
        root.querySelectorAll('[data-modal-change-value]').forEach((el) => {
          el.addEventListener('input', (e) => {
            if (!app.modal) return;
            const key = String(e.target.dataset.modalChangeValue);
            app.modal.values[key] = String(Math.max(0, Number.parseInt(e.target.value || '0', 10) || 0));
            renderModal();
          });
        });
        root.querySelectorAll('[data-modal-change-step]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!app.modal) return;
            const key = String(btn.dataset.value);
            const step = Number(btn.dataset.modalChangeStep);
            const current = Number.parseInt(String(app.modal.values[key] || '0'), 10) || 0;
            app.modal.values[key] = String(Math.max(0, current + step));
            renderModal();
          });
        });
        root.querySelectorAll('[data-modal-change-action]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.dataset.modalChangeAction === 'submit') {
              closeModal({ id: 'submit', values: app.modal?.values || {} });
              return;
            }
            closeModal({ id: 'cancel' });
          });
        });
        return;
      }

      html += `
        <div class="modal-backdrop" id="modal-backdrop">
          <section class="modal-card" role="dialog" aria-modal="true" aria-label="${modal.title}">
            <div class="modal-header">
              <h3>${modal.title}</h3>
              ${modal.showClose ? '<button type="button" class="modal-close-btn" data-modal-close aria-label="Close">×</button>' : ''}
            </div>
            <p>${modal.message}</p>
            ${modal.input ? `<label>Value<input id="modal-input" type="text" value="${modal.value || ''}" placeholder="${modal.input.placeholder || ''}" ${modal.input.maxLength ? `maxlength="${modal.input.maxLength}"` : ''} /></label>${modal.input.maxLength ? `<p class="muted modal-field-hint" data-modal-hint="__input">Maximum ${modal.input.maxLength} characters.</p>` : ''}` : ''}
            ${(modal.fields || []).map((field) => {
              const value = modal.values?.[field.id] ?? '';
              if (field.type === 'select') {
                return `<label>${field.label}<select data-modal-field="${field.id}">${field.optionsHtml || ''}</select></label>`;
              }
              return `<label>${field.label}<input data-modal-field="${field.id}" type="${field.type || 'text'}" value="${value}" ${field.maxLength ? `maxlength="${field.maxLength}"` : ''} /></label>${field.maxLength ? `<p class="muted modal-field-hint" data-modal-hint="${field.id}">Maximum ${field.maxLength} characters.</p>` : ''}`;
            }).join('')}
            <div class="inline-actions">
              ${(modal.actions || []).map((action) => {
                const cls = action.style === 'primary' ? 'btn-primary-soft' : action.style === 'danger' ? 'btn-danger-soft' : 'btn-secondary-soft';
                return `<button type="button" data-modal-action="${action.id}" class="${cls}">${action.label}</button>`;
              }).join('')}
            </div>
          </section>
        </div>
      `;
      root.innerHTML = html;
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (event) => {
          if (event.target !== backdrop) return;
          closeModal('cancel');
        });
      }
      const input = document.getElementById('modal-input');
      if (input) {
        input.focus();
        input.addEventListener('input', (e) => {
          if (!app.modal) return;
          app.modal.value = e.target.value;
          const hint = root.querySelector('[data-modal-hint="__input"]');
          const max = app.modal?.input?.maxLength;
          if (hint && max) {
            hint.hidden = e.target.value.length < max;
          }
        });
      }
      root.querySelectorAll('[data-modal-field]').forEach((el) => {
        const handler = (e) => {
          if (!app.modal) return;
          const fieldId = e.target.dataset.modalField;
          app.modal.values[fieldId] = e.target.value;
          const hint = root.querySelector(`[data-modal-hint="${fieldId}"]`);
          const field = (app.modal.fields || []).find((f) => f.id === fieldId);
          if (hint && field?.maxLength) {
            hint.hidden = e.target.value.length < field.maxLength;
          }
        };
        const fieldId = el.dataset.modalField;
        if (app.modal?.values && Object.prototype.hasOwnProperty.call(app.modal.values, fieldId)) {
          el.value = app.modal.values[fieldId];
        }
        const hint = root.querySelector(`[data-modal-hint="${fieldId}"]`);
        const field = (app.modal.fields || []).find((f) => f.id === fieldId);
        if (hint && field?.maxLength) {
          hint.hidden = el.value.length < field.maxLength;
        }
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
      });
      root.querySelectorAll('[data-modal-close]').forEach((btn) => {
        btn.addEventListener('click', () => closeModal('cancel'));
      });
      root.querySelectorAll('[data-modal-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (modal.input) {
            closeModal({ id: btn.dataset.modalAction, value: app.modal?.value || '' });
          } else if (modal.fields) {
            closeModal({ id: btn.dataset.modalAction, values: app.modal?.values || {} });
          } else {
            closeModal(btn.dataset.modalAction);
          }
        });
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal('cancel');
      }, { once: true });
    }

    function setupTabs() {
      if (app.activeTab === 'payment') app.activeTab = 'pay';
      const gated = isAppGated();
      document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === app.activeTab);
        const blocked = gated && btn.dataset.tab !== 'settings';
        btn.disabled = Boolean(blocked);
      });
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `tab-${app.activeTab}`);
      });

      const meta = PAGE_META[app.activeTab] || PAGE_META.cash;
      const titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = meta.title;
    }

    function renderWalletCards(wallets, activeWalletId, selectorId, compact = false, options = {}) {
      const cls = compact ? 'wallet-card compact' : 'wallet-card';
      const showCreate = Boolean(options.showCreateCard);
      const showActions = Boolean(options.showActions);
      const createCard = showCreate
        ? `
          <button
            type="button"
            class="${cls} wallet-card-add"
            data-wallet-selector="${selectorId}"
            data-wallet-add="1"
            aria-label="Create wallet"
          >
            <span class="wallet-card-add-plus">+</span>
          </button>
        `
        : '';
      return `
        <div class="wallet-cards" role="radiogroup" aria-label="Wallet selector">
          ${wallets.map((wallet) => {
            const active = wallet.id === activeWalletId;
            return `
              <div class="wallet-card-wrap ${active ? 'active' : ''}">
                <button
                  type="button"
                  class="${cls} ${active ? 'active' : ''}"
                  data-wallet-selector="${selectorId}"
                  data-wallet-id="${wallet.id}"
                  data-wallet-draggable="true"
                  draggable="true"
                  role="radio"
                  aria-checked="${active ? 'true' : 'false'}"
                >
                  <p class="wallet-card-head">${CURRENCY_FLAGS[wallet.currency] || '🏳️'} ${wallet.currency}</p>
                  <p class="wallet-card-name">${wallet.name}</p>
                  <p class="wallet-card-total">${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
                </button>
                ${showActions && active ? `
                  <button type="button" class="wallet-card-action" data-wallet-action="1" aria-label="Wallet actions">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15.7 3.3 20.7 8.3 9.3 19.7l-5.5 1.1 1.1-5.5L15.7 3.3Zm-1.4 2.1-8.2 8.2-.5 2.6 2.6-.5 8.2-8.2-2.1-2.1ZM18 5.6l-2.1-2.1 1.1-1.1 2.1 2.1L18 5.6Z" fill="currentColor"/>
                    </svg>
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
          ${createCard}
        </div>
      `;
    }

    function bindWalletCards(selectorId, onSelect) {
      document.querySelectorAll(`[data-wallet-selector="${selectorId}"][data-wallet-id]`).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (app.walletDragActive) return;
          onSelect(btn.dataset.walletId);
        });
      });
    }

    function normalizeWalletOrderIds() {
      const ids = Object.keys(app.state.wallets || {});
      const order = Array.isArray(app.state.wallet_order) ? app.state.wallet_order : [];
      const normalized = [];
      const seen = new Set();
      order.forEach((id) => {
        if (app.state.wallets[id]) {
          normalized.push(id);
          seen.add(id);
        }
      });
      ids.forEach((id) => {
        if (!seen.has(id)) normalized.push(id);
      });
      app.state.wallet_order = normalized;
      return normalized;
    }

    function moveWalletInOrder(dragId, targetId) {
      if (!dragId || !targetId || dragId === targetId) return;
      const order = normalizeWalletOrderIds();
      const from = order.indexOf(dragId);
      const to = order.indexOf(targetId);
      if (from === -1 || to === -1) return;
      order.splice(from, 1);
      order.splice(to, 0, dragId);
      app.state.wallet_order = order;
      saveState();
    }

    function bindWalletReorder(selectorId) {
      const cards = Array.from(document.querySelectorAll(`[data-wallet-selector="${selectorId}"][data-wallet-id]`));
      if (cards.length < 2) return;
      let pointerDragId = null;
      let pointerTargetId = null;
      let pointerMoved = false;
      let startX = 0;
      let startY = 0;

      cards.forEach((card) => {
        card.addEventListener('dragstart', (e) => {
          app.walletDragActive = true;
          card.classList.add('dragging');
          const dragId = card.dataset.walletId;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dragId);
        });
        card.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
        card.addEventListener('drop', (e) => {
          e.preventDefault();
          const dragId = e.dataTransfer.getData('text/plain');
          const targetId = card.dataset.walletId;
          moveWalletInOrder(dragId, targetId);
          render();
        });
        card.addEventListener('dragend', () => {
          app.walletDragActive = false;
          card.classList.remove('dragging');
        });

        card.addEventListener('pointerdown', (e) => {
          pointerDragId = card.dataset.walletId;
          pointerTargetId = null;
          pointerMoved = false;
          startX = e.clientX;
          startY = e.clientY;
          card.setPointerCapture(e.pointerId);
          card.classList.add('dragging');
        });
        card.addEventListener('pointermove', (e) => {
          if (!pointerDragId) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          if (!pointerMoved && Math.hypot(dx, dy) < 6) return;
          pointerMoved = true;
          app.walletDragActive = true;
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const targetCard = target?.closest?.(`[data-wallet-selector="${selectorId}"][data-wallet-id]`);
          if (!targetCard) return;
          const targetId = targetCard.dataset.walletId;
          if (targetId && targetId !== pointerDragId) {
            pointerTargetId = targetId;
          }
        });
        const endPointerDrag = () => {
          if (!pointerDragId) return;
          card.classList.remove('dragging');
          if (pointerMoved && pointerTargetId) {
            moveWalletInOrder(pointerDragId, pointerTargetId);
            render();
          }
          pointerDragId = null;
          pointerTargetId = null;
          pointerMoved = false;
          setTimeout(() => { app.walletDragActive = false; }, 0);
        };
        card.addEventListener('pointerup', endPointerDrag);
        card.addEventListener('pointercancel', endPointerDrag);
      });
    }

    function getWalletDenomGroups(wallet) {
      const bills = wallet.denominations.filter((d) => d.type === 'note');
      const coins = wallet.denominations.filter((d) => d.type === 'coin');
      return { bills, coins };
    }

    function getDefaultCashTab(wallet) {
      const { bills, coins } = getWalletDenomGroups(wallet);
      if (bills.length > 0) return 'bills';
      if (coins.length > 0) return 'coins';
      return 'bills';
    }

    function getActiveCashTab(wallet) {
      const saved = app.cashDenomTabByWallet[wallet.id];
      const { bills, coins } = getWalletDenomGroups(wallet);
      if (saved === 'bills' && bills.length > 0) return 'bills';
      if (saved === 'coins' && coins.length > 0) return 'coins';
      return getDefaultCashTab(wallet);
    }

    function getActivePaymentTab(wallet) {
      const saved = app.paymentDenomTabByWallet[wallet.id];
      const { bills, coins } = getWalletDenomGroups(wallet);
      if (saved === 'bills' && bills.length > 0) return 'bills';
      if (saved === 'coins' && coins.length > 0) return 'coins';
      return getDefaultCashTab(wallet);
    }

    function breakdownHtml(wallet, breakdown) {
      if (!breakdown || breakdown.length === 0) return '<p class="muted">No breakdown.</p>';
      return `<ul class="breakdown">${breakdown.map((row) => `<li>${formatDenomValue(row.value_minor, wallet.currency)} x ${row.count}</li>`).join('')}</ul>`;
    }

    async function promptManualChangeAllocation(wallet, expectedChangeMinor, initialAllocation = {}) {
      const options = getSortedDenoms(wallet, 'largest_first')
        .filter((row) => row.value_minor <= expectedChangeMinor);
      const hasBills = options.some((row) => row.type === 'note');
      const hasCoins = options.some((row) => row.type === 'coin');
      const response = await showModal({
        title: 'Enter change received',
        message: `Expected change: ${formatMoney(expectedChangeMinor, wallet.currency)}`,
        changeEditor: {
          currency: wallet.currency,
          expectedChangeMinor,
          options,
          initialAllocation,
          hasBills,
          hasCoins,
          defaultTab: hasBills ? 'bills' : 'coins',
        },
      });
      if (!response || response.id !== 'submit') return null;
      const allocation = {};
      Object.entries(response.values || {}).forEach(([value, raw]) => {
        allocation[Number(value)] = Math.max(0, Number.parseInt(String(raw || '0'), 10) || 0);
      });
      const total = getAllocationTotal(allocation);
      if (total !== expectedChangeMinor) {
        await modalAlert(`Change must equal exactly ${formatMoney(expectedChangeMinor, wallet.currency)}.`);
        return null;
      }
      return allocation;
    }

    async function openCreateWalletModal() {
      if (app.editMode || isAppGated()) {
        await modalAlert('Finish or cancel the current allocation/edit before creating a wallet.');
        return;
      }
      if (Object.keys(app.state.wallets).length >= MAX_WALLETS) {
        await modalAlert('Maximum number of wallets reached (4).');
        return;
      }
      const result = await showModal({
        title: 'Create wallet',
        message: 'Enter a name and choose a currency.',
            fields: [
              { id: 'name', label: 'Name', type: 'text', defaultValue: '', maxLength: WALLET_NAME_MAX },
              { id: 'currency', label: 'Currency', type: 'select', defaultValue: 'EUR', optionsHtml: renderCurrencyOptions('EUR') },
            ],
        actions: [
          { id: 'create', label: 'Create wallet', style: 'primary' },
          { id: 'cancel', label: 'Cancel', style: 'secondary' },
        ],
      });
      if (!result || result.id !== 'create') return;
      const name = (result.values?.name || '').trim();
      const currency = result.values?.currency || 'EUR';
          if (!name) {
            await modalAlert('Wallet name is required.');
            return;
          }
          if (name.length > WALLET_NAME_MAX) {
            await modalAlert(`Wallet name must be ${WALLET_NAME_MAX} characters or fewer.`);
            return;
          }
          try {
            const id = createWallet(app.state, name, currency);
        app.activeWalletId = id;
        if (!app.paymentDraft.walletId) app.paymentDraft.walletId = id;
        saveState();
        render();
      } catch (err) {
        await modalAlert(err.message || 'Unable to create wallet.');
      }
    }

    function openPaymentModal() {}

    function closePaymentModal() {}

    function renderCashOnHand() {
      const el = document.getElementById('tab-cash');
      const wallet = getActiveWallet();
      const wallets = getWalletList();

      if (!wallet) {
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">No wallets yet. Create your first wallet to start tracking cash.</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet" class="btn-secondary-soft">Create wallet</button>
            </div>
          </section>
        `;
        const openCreateWalletBtn = document.getElementById('open-create-wallet');
        if (openCreateWalletBtn) {
          openCreateWalletBtn.addEventListener('click', openCreateWalletModal);
        }
        return;
      }

      const isEditMode = app.editMode && app.editMode.walletId === wallet.id;
      const expectedTotal = getExpectedWalletTotal(wallet.id);
      const currentTotal = getWalletDraftTotal(wallet);
      const difference = currentTotal - expectedTotal;
      const { bills, coins } = getWalletDenomGroups(wallet);
      const showToggle = bills.length > 0 && coins.length > 0;
      const activeTab = getActiveCashTab(wallet);
      app.cashDenomTabByWallet[wallet.id] = activeTab;
      const hideEmptyDenoms = app.state.settings.show_denominations_on_hand_only;
      const activeTabTotal = (activeTab === 'bills' ? bills : coins).reduce((sum, row) => sum + row.value_minor * getDenomCount(wallet, row.value_minor), 0);
      const activeTabCount = (activeTab === 'bills' ? bills : coins).reduce((sum, row) => sum + getDenomCount(wallet, row.value_minor), 0);

      const rows = getSortedDenoms(wallet, 'largest_first')
        .filter((row) => {
          if (activeTab === 'bills') return row.type === 'note';
          return row.type === 'coin';
        })
        .filter((row) => {
          if (!hideEmptyDenoms) return true;
          return getDenomCount(wallet, row.value_minor) > 0;
        })
        .map((row) => {
          const count = getDenomCount(wallet, row.value_minor);
          const presenceClass = count > 0 ? 'has-count' : 'missing-count deemphasis';
          const countCell = isEditMode
            ? `<div class="denom-count-wrap">
                <button type="button" class="denom-step" data-denom-step="-1" data-denom="${row.value_minor}" aria-label="Decrease count">-</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" data-denom="${row.value_minor}" value="${count}" class="denom-input" />
                <button type="button" class="denom-step" data-denom-step="1" data-denom="${row.value_minor}" aria-label="Increase count">+</button>
              </div>`
            : `<p class="denom-count-readonly">${count}</p>`;
          return `<article class="denom-row ${presenceClass}">
            <p class="denom-value">${formatDenomValue(row.value_minor, wallet.currency)} <span class="denom-presence ${count > 0 ? 'have' : 'missing'}">${count > 0 ? 'Have' : 'Missing'}</span></p>
            ${countCell}
            <p class="denom-subtotal">${formatMoney(row.value_minor * count, wallet.currency)}</p>
          </article>`;
        })
        .join('');

      el.innerHTML = `
        <section class="panel">
          <section class="card summary-card">
            <div class="summary-main">
              ${renderWalletCards(wallets, wallet.id, 'cash-wallet', false, { showCreateCard: true, showActions: !isEditMode })}
            </div>
            ${!isEditMode && currentTotal === 0 ? `
              <p class="status warn">Wallet is empty. Add money by creating an incoming payment in Pay.</p>
            ` : ''}
            ${isEditMode ? `
              <section class="edit-status">
                <p class="status warn">Edit mode active</p>
                <p class="muted">Payments and navigation are blocked until edit is finished or canceled (Settings remains available).</p>
                <p class="edit-reconciliation">Allocated: ${formatMoney(currentTotal, wallet.currency)} / Expected: ${formatMoney(expectedTotal, wallet.currency)}</p>
                <p class="edit-reconciliation-pill ${difference === 0 ? 'success' : 'danger'}">${difference === 0 ? 'Reconciled.' : (difference > 0 ? `You're over by ${formatMoney(Math.abs(difference), wallet.currency)}` : `You're short by ${formatMoney(Math.abs(difference), wallet.currency)}`)}</p>
                <label>Reason (optional)
                  <input id="edit-reason" type="text" maxlength="120" value="${app.editMode.reason || ''}" />
                </label>
                <div class="inline-actions edit-actions">
                  <button type="button" id="finish-edit-mode" class="btn-primary-soft" ${difference !== 0 ? 'disabled' : ''}>Finish edit</button>
                  <button type="button" id="cancel-edit-mode" class="btn-secondary-soft">Cancel edit</button>
                </div>
              </section>
            ` : ''}
          </section>

          <section class="card">
            <div class="denom-controls">
              ${showToggle ? `
                <div class="segmented-control" role="tablist" aria-label="Denomination type">
                  <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="segment-bills" role="tab" aria-selected="${activeTab === 'bills' ? 'true' : 'false'}">Bills</button>
                  <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="segment-coins" role="tab" aria-selected="${activeTab === 'coins' ? 'true' : 'false'}">Coins</button>
                </div>
              ` : '<span></span>'}
              <button type="button" id="toggle-denom-visibility" class="denom-filter-toggle ${hideEmptyDenoms ? 'active' : ''}" aria-pressed="${hideEmptyDenoms ? 'true' : 'false'}">Hide empty</button>
            </div>
            <div class="denom-header-row">
              <p>Denomination</p>
              <p>× Count</p>
              <p>= Subtotal</p>
            </div>
            <div class="denom-list">${rows}</div>
            <div class="denom-total-row">
              <p>${activeTab === 'bills' ? 'Bills total' : 'Coins total'}</p>
              <p>${activeTabCount}</p>
              <p>${formatMoney(activeTabTotal, wallet.currency)}</p>
            </div>
          </section>
        </section>
      `;

      bindWalletCards('cash-wallet', async (walletId) => {
        if (app.editMode && app.editMode.walletId !== walletId) {
          await modalAlert('Finish or cancel Edit denominations before switching wallets.');
          return;
        }
        app.activeWalletId = walletId;
        app.paymentDraft.walletId = app.activeWalletId;
        render();
      });
      bindWalletReorder('cash-wallet');

      const toggleDenomVisibilityBtn = document.getElementById('toggle-denom-visibility');
      if (toggleDenomVisibilityBtn) {
        toggleDenomVisibilityBtn.addEventListener('click', () => {
          app.state.settings.show_denominations_on_hand_only = !app.state.settings.show_denominations_on_hand_only;
          saveState();
          renderCashOnHand();
        });
      }

      const addWalletCardBtn = document.querySelector('[data-wallet-selector="cash-wallet"][data-wallet-add="1"]');
      if (addWalletCardBtn) {
        addWalletCardBtn.addEventListener('click', async () => {
          await openCreateWalletModal();
        });
      }

      const startEditMode = () => {
        app.editMode = {
          walletId: wallet.id,
          reason: '',
          snapshot: wallet.denominations.map((d) => ({ value_minor: d.value_minor, count: d.count })),
          draft: wallet.denominations.reduce((acc, d) => {
            acc[d.value_minor] = d.count;
            return acc;
          }, {}),
        };
        render();
      };

      const walletActionsBtn = document.querySelector('[data-wallet-action="1"]');
      if (walletActionsBtn) {
        walletActionsBtn.addEventListener('click', async () => {
          const choice = await showModal({
            title: 'Wallet actions',
            message: `Manage ${wallet.name}.`,
            showClose: true,
            actions: [
              { id: 'name', label: 'Edit name', style: 'secondary' },
              { id: 'denoms', label: 'Edit denominations', style: 'primary' },
              { id: 'delete', label: 'Delete wallet', style: 'danger' },
            ],
          });
          if (choice === 'name') {
            const name = await modalPrompt('New wallet name', wallet.name, 'Edit Wallet Name', '', WALLET_NAME_MAX);
            if (!name) return;
            if (name.length > WALLET_NAME_MAX) {
              await modalAlert(`Wallet name must be ${WALLET_NAME_MAX} characters or fewer.`);
              return;
            }
            wallet.name = name.trim();
            wallet.updated_at = nowIso();
            saveState();
            render();
            return;
          }
          if (choice === 'delete') {
            const ok = await modalConfirm(`Delete wallet ${wallet.name}? This removes its cash and transactions.`, 'Delete Wallet');
            if (!ok) return;
            const id = wallet.id;
            delete app.state.wallets[id];
            if (Array.isArray(app.state.wallet_order)) {
              app.state.wallet_order = app.state.wallet_order.filter((walletId) => walletId !== id);
            }
            app.state.transactions = app.state.transactions.filter((tx) => tx.wallet_id !== id);
            if (app.activeWalletId === id) {
              app.activeWalletId = getWalletList()[0]?.id || null;
            }
            if (app.paymentDraft.walletId === id) {
              app.paymentDraft.walletId = getWalletList()[0]?.id || null;
            }
            if (app.editMode && app.editMode.walletId === id) app.editMode = null;
            saveState();
            render();
            return;
          }
          if (choice !== 'denoms') return;
          const ok = await showModal({
            title: 'Edit denominations?',
            message: 'Edit denominations instead of entering a transaction?',
            actions: [
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
              { id: 'edit', label: 'Enter edit mode', style: 'primary' },
            ],
          });
          if (ok !== 'edit') return;
          startEditMode();
        });
      }

      const finishEdit = document.getElementById('finish-edit-mode');
      if (finishEdit) {
        finishEdit.addEventListener('click', async () => {
          if (!app.editMode || app.editMode.walletId !== wallet.id) return;
          const draftTotal = getWalletDraftTotal(wallet);
          if (draftTotal !== expectedTotal) {
            await modalAlert('Finish edit is disabled until allocated total matches expected total exactly.');
            return;
          }
          wallet.denominations.forEach((d) => {
            d.count = app.editMode.draft[d.value_minor] || 0;
          });
          wallet.updated_at = nowIso();
          const priorBreakdown = app.editMode.snapshot.map((row) => ({ value_minor: row.value_minor, count: row.count }));
          app.state.transactions.push({
            id: uid('tx'),
            created_at: nowIso(),
            wallet_id: wallet.id,
            wallet_name: wallet.name,
            currency: wallet.currency,
            type: 'denominations_edited',
            amount_minor: 0,
            delta_minor: 0,
            tag: 'denominations edited',
            note: app.editMode.reason?.trim() || undefined,
            prior_breakdown: priorBreakdown,
            breakdown: wallet.denominations.filter((d) => d.count > 0).map((d) => ({ value_minor: d.value_minor, count: d.count })),
          });
          app.editMode = null;
          saveState();
          render();
        });
      }

      const reasonInput = document.getElementById('edit-reason');
      if (reasonInput) {
        reasonInput.addEventListener('input', (e) => {
          if (!app.editMode || app.editMode.walletId !== wallet.id) return;
          app.editMode.reason = e.target.value;
        });
      }

      const cancelEdit = document.getElementById('cancel-edit-mode');
      if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
          if (!app.editMode || app.editMode.walletId !== wallet.id) return;
          app.editMode = null;
          render();
        });
      }

      const segmentBills = document.getElementById('segment-bills');
      const segmentCoins = document.getElementById('segment-coins');
      if (segmentBills) {
        segmentBills.addEventListener('click', () => {
          app.cashDenomTabByWallet[wallet.id] = 'bills';
          renderCashOnHand();
        });
      }
      if (segmentCoins) {
        segmentCoins.addEventListener('click', () => {
          app.cashDenomTabByWallet[wallet.id] = 'coins';
          renderCashOnHand();
        });
      }

      const updateDraftDenom = (valueMinor, next) => {
        if (!app.editMode || app.editMode.walletId !== wallet.id) return;
        app.editMode.draft[valueMinor] = Math.max(0, next);
        renderCashOnHand();
      };

      if (isEditMode) {
        el.querySelectorAll('input[data-denom]').forEach((input) => {
          input.addEventListener('input', (e) => {
            const valueMinor = Number(e.target.dataset.denom);
            const cleaned = String(e.target.value || '').replace(/[^\d]/g, '');
            if (cleaned !== e.target.value) e.target.value = cleaned;
            const next = Math.max(0, Number.parseInt(cleaned || '0', 10) || 0);
            updateDraftDenom(valueMinor, next);
          });
        });

        el.querySelectorAll('button[data-denom-step]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const valueMinor = Number(btn.dataset.denom);
            const step = Number(btn.dataset.denomStep);
            const count = app.editMode.draft[valueMinor] || 0;
            updateDraftDenom(valueMinor, count + step);
          });
        });
      }

    }

    function renderPay() {
      const el = document.getElementById('tab-pay');
      if (!el) return;
      const wallets = getWalletList();
      if (!wallets.length) {
        el.innerHTML = '<section class="panel"><p class="empty-notice">No wallets yet. Create a wallet in Cash to enter payments.</p></section>';
        return;
      }
      const hasEntry = Boolean(
        app.paymentDraft.amountInput.trim()
        || app.paymentDraft.note.trim()
        || Object.keys(app.paymentDraft.allocation || {}).length > 0
        || app.paymentDraft.manualEntry
        || app.paymentDraft.startedAllocation
      );
      if (!hasEntry) {
        app.paymentDraft.walletId = app.activeWalletId || wallets[0]?.id || null;
      }
      const wallet = app.state.wallets[app.paymentDraft.walletId || ''] || null;
      if (wallet && !hasEntry) {
        const walletTotal = getWalletTotal(wallet);
        app.paymentDraft.mode = walletTotal === 0 ? 'incoming' : 'outgoing';
      }
      renderNewPayment('tab-pay', { showWalletSelector: false });
    }

    function renderNewPayment(target = 'tab-payment', options = {}) {
      const el = typeof target === 'string' ? document.getElementById(target) : target;
      if (!el) return;
      const rerenderPayment = () => renderNewPayment(target, options);
      const showWalletSelector = Boolean(options.showWalletSelector);
      const wallets = getWalletList();
      if (wallets.length === 0) {
        el.innerHTML = '<section class="panel"><p>Create a wallet first.</p></section>';
        return;
      }

      if (app.editMode) {
        el.innerHTML = `
          <section class="panel">
            <section class="card">
              <p class="status warn">Payments are blocked while Edit denominations mode is active.</p>
              <p>Finish or cancel edit mode in Cash first.</p>
            </section>
          </section>
        `;
        return;
      }

      if (!app.paymentDraft.walletId || !app.state.wallets[app.paymentDraft.walletId]) {
        app.paymentDraft.walletId = app.activeWalletId || wallets[0].id;
      }
      if (!wallets.some((w) => w.id === app.paymentDraft.walletId)) app.paymentDraft.walletId = wallets[0].id;
      app.paymentDraft.strategy = app.state.settings.default_strategy || 'greedy';
      if (!['incoming', 'outgoing'].includes(app.paymentDraft.mode)) app.paymentDraft.mode = 'outgoing';
      if (!app.paymentDraft.allocation || typeof app.paymentDraft.allocation !== 'object') {
        app.paymentDraft.allocation = {};
      }
      if (typeof app.paymentDraft.manualEntry !== 'boolean') app.paymentDraft.manualEntry = false;
      if (typeof app.paymentDraft.showAllDenoms !== 'boolean') app.paymentDraft.showAllDenoms = false;

      if (app.pendingOutgoingChange && !app.state.wallets[app.pendingOutgoingChange.walletId]) {
        app.pendingOutgoingChange = null;
      }
      // Manual change entry now runs fully in modal popup flow.
      app.pendingOutgoingChange = null;

      if (app.pendingOutgoingChange) {
        const pending = app.pendingOutgoingChange;
        const pendingWallet = app.state.wallets[pending.walletId];
        app.paymentDraft.walletId = pending.walletId;
        app.paymentDraft.mode = 'outgoing';
        const changeRows = getSortedDenoms(pendingWallet, 'largest_first')
          .filter((row) => row.value_minor <= pending.expectedChangeMinor);
        const receivedTotal = getAllocationTotal(pending.receivedAllocation);
        const canFinalize = receivedTotal === pending.expectedChangeMinor;
        const changeRowHtml = changeRows.map((row) => {
          const count = pending.receivedAllocation[row.value_minor] || 0;
          return `<article class="denom-row">
            <p class="denom-value">${formatDenomValue(row.value_minor, pendingWallet.currency)}</p>
            <div class="denom-count-wrap">
              <button type="button" class="denom-step" data-change-step="-1" data-denom="${row.value_minor}">-</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" class="denom-input" data-change-denom="${row.value_minor}" value="${count}" />
              <button type="button" class="denom-step" data-change-step="1" data-denom="${row.value_minor}">+</button>
            </div>
            <p class="denom-subtotal">${formatMoney(row.value_minor * count, pendingWallet.currency)}</p>
          </article>`;
        }).join('');

        el.innerHTML = `
          <section class="panel">
            <section class="card">
              <h3>Confirm change received</h3>
              <p class="muted">Finalize outgoing payment for ${formatMoney(pending.requestedAmountMinor, pendingWallet.currency)}.</p>
              <p class="status warn">Expected change: ${formatMoney(pending.expectedChangeMinor, pendingWallet.currency)}</p>
              <div class="preview">
                <p class="muted">Suggested change</p>
                ${breakdownHtml(pendingWallet, pending.suggestedChangeBreakdown)}
              </div>
              <p class="muted">Received change breakdown</p>
              <div class="denom-header-row">
                <p>Denomination</p><p>Count</p><p>Subtotal</p>
              </div>
              <div class="denom-list">${changeRowHtml || '<p class="muted">No denominations available for this change amount.</p>'}</div>
              <div class="preview">
                <p class="muted">Received: ${formatMoney(receivedTotal, pendingWallet.currency)} / ${formatMoney(pending.expectedChangeMinor, pendingWallet.currency)}</p>
                ${canFinalize ? '<p class="status success">Change total reconciled.</p>' : '<p class="status danger">Received change must exactly match expected change.</p>'}
              </div>
              <div class="inline-actions edit-actions">
                <button type="button" id="confirm-outgoing-finalize" class="btn-primary-soft" ${canFinalize ? '' : 'disabled'}>Confirm and finalize</button>
                <button type="button" id="cancel-change-confirm" class="btn-secondary-soft">Cancel</button>
              </div>
            </section>
          </section>
        `;

        el.querySelectorAll('input[data-change-denom]').forEach((input) => {
          input.addEventListener('input', (evt) => {
            const denom = Number(evt.target.dataset.changeDenom);
            const cleaned = String(evt.target.value || '').replace(/[^\d]/g, '');
            if (cleaned !== evt.target.value) evt.target.value = cleaned;
            pending.receivedAllocation[denom] = Math.max(0, Number.parseInt(cleaned || '0', 10) || 0);
            rerenderPayment();
          });
        });

        el.querySelectorAll('button[data-change-step]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const denom = Number(btn.dataset.denom);
            const step = Number(btn.dataset.changeStep);
            const current = pending.receivedAllocation[denom] || 0;
            pending.receivedAllocation[denom] = Math.max(0, current + step);
            rerenderPayment();
          });
        });

        document.getElementById('cancel-change-confirm').addEventListener('click', () => {
          app.pendingOutgoingChange = null;
          rerenderPayment();
        });

        document.getElementById('confirm-outgoing-finalize').addEventListener('click', () => {
          const confirmedTotal = getAllocationTotal(pending.receivedAllocation);
          if (confirmedTotal !== pending.expectedChangeMinor) return;
          const paidBreakdown = pending.paidBreakdown;
          const confirmedChangeBreakdown = allocationToBreakdown(pending.receivedAllocation);
          applyBreakdownToWallet(pendingWallet, paidBreakdown, -1);
          if (confirmedChangeBreakdown.length > 0) {
            applyBreakdownToWallet(pendingWallet, confirmedChangeBreakdown, 1);
          }
          const tx = {
            id: uid('tx'),
            created_at: nowIso(),
            wallet_id: pendingWallet.id,
            wallet_name: pendingWallet.name,
            currency: pendingWallet.currency,
            type: 'outgoing',
            amount_minor: pending.requestedAmountMinor,
            delta_minor: -pending.requestedAmountMinor,
            strategy: pending.strategy,
            note: pending.note,
            breakdown: paidBreakdown,
            change_expected_minor: pending.expectedChangeMinor,
            change_received_minor: pending.expectedChangeMinor,
            change_breakdown: confirmedChangeBreakdown,
          };
          app.state.transactions.push(tx);
          app.pendingOutgoingChange = null;
          setPaymentSuccess(tx);
          app.paymentDraft.note = '';
          app.paymentDraft.amountInput = '';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          saveState();
          render();
        });
        return;
      }

      const mode = app.paymentDraft.mode;
      const wallet = app.state.wallets[app.paymentDraft.walletId];
      const walletTotalForHint = getWalletTotal(wallet);
      const zeroWalletHint = walletTotalForHint === 0 ? 'Wallet is empty. Start with an incoming payment.' : '';
      const amountMinor = parseAmountToMinor(app.paymentDraft.amountInput, wallet.currency);
      const noteText = app.paymentDraft.note.trim().slice(0, 30);
      const draftAllocated = getDraftAllocationTotal();
      const validAmount = amountMinor !== null && amountMinor > 0;
      const { bills, coins } = getWalletDenomGroups(wallet);
      const showToggle = bills.length > 0 && coins.length > 0;
      const activeTab = getActivePaymentTab(wallet);
      app.paymentDenomTabByWallet[wallet.id] = activeTab;
      const smallestByType = {
        bills: [...bills].sort((a, b) => a.value_minor - b.value_minor)[0] || null,
        coins: [...coins].sort((a, b) => a.value_minor - b.value_minor)[0] || null,
      };

      const ctx = mode === 'outgoing' ? getPaymentContext() : null;
      const denomOrder = app.state.settings.denomination_order || ORDER_LARGEST_FIRST;

      const suggestedBreakdown = (() => {
        if (!validAmount) return [];
        if (mode === 'outgoing') {
          if (ctx?.status === 'EXACT_PAYABLE') return ctx.breakdown || [];
          return [];
        }
        if (!app.state.settings.payment_strategies) return [];
        const incomingPlan = computeIncomingPlan(wallet.denominations, amountMinor, app.paymentDraft.strategy, denomOrder, app.state.settings.coins_rule || 'off');
        return incomingPlan.ok ? incomingPlan.breakdown : [];
      })();
      const strategiesEnabled = app.state.settings.payment_strategies;
      const suggestionAvailable = strategiesEnabled && suggestedBreakdown.length > 0;
      const usingSuggestion = suggestionAvailable && !app.paymentDraft.manualEntry;
      const effectiveAllocation = usingSuggestion ? breakdownToAllocation(suggestedBreakdown) : app.paymentDraft.allocation;
      const effectiveAllocated = getAllocationTotal(effectiveAllocation);
      const allocationReady = amountMinor !== null && (mode === 'outgoing' ? effectiveAllocated >= amountMinor : effectiveAllocated === amountMinor);
      app.paymentDraft.startedAllocation = Boolean(amountMinor !== null && (mode === 'outgoing' ? effectiveAllocated < amountMinor : draftAllocated !== amountMinor));
      const walletTotalMinor = getWalletTotal(wallet);
      const expectedChangeMinor = (mode === 'outgoing' && amountMinor !== null && effectiveAllocated >= amountMinor)
        ? (effectiveAllocated - amountMinor)
        : 0;
      let applyDisabled = !allocationReady;
      let suggestionStatusHtml = '';
      let suggestionToneClass = 'suggestion-success';
      const insufficientOutgoing = mode === 'outgoing'
        && validAmount
        && (amountMinor > walletTotalMinor || (strategiesEnabled && ctx && ctx.amountMinor !== null && ctx.status === 'INSUFFICIENT_FUNDS'));
      const hasDraftEntry = Boolean(
        app.paymentDraft.amountInput.trim()
        || app.paymentDraft.note.trim()
        || Object.keys(app.paymentDraft.allocation || {}).length > 0
        || app.paymentDraft.manualEntry
      );

      if (insufficientOutgoing) {
        applyDisabled = true;
        const missingMinor = Math.max(0, amountMinor - walletTotalMinor);
        suggestionToneClass = 'suggestion-danger';
        suggestionStatusHtml = `<p class="status danger">Missing: ${formatMoney(missingMinor, wallet.currency)}</p>`;
      }
      if (mode === 'outgoing' && ctx && ctx.amountMinor !== null && strategiesEnabled) {
        if (ctx.status === 'EXACT_PAYABLE') {
          suggestionStatusHtml = '<p class="status success">Exact suggestion</p>';
          suggestionToneClass = 'suggestion-success';
        } else if (ctx.status === 'INSUFFICIENT_FUNDS') {
          suggestionStatusHtml = `<p class="status danger">Missing: ${formatMoney(ctx.missingMinor, wallet.currency)}</p>`;
          suggestionToneClass = 'suggestion-danger';
        } else if (ctx.status === 'NO_EXACT_SUGGESTION') {
          suggestionStatusHtml = '<p class="status warn">No exact suggestion available.</p>';
          suggestionToneClass = 'suggestion-warn';
        }
      }

      const allRowsForTab = getSortedDenoms(wallet, 'largest_first')
        .filter((row) => (activeTab === 'bills' ? row.type === 'note' : row.type === 'coin'));
      const showAllDenoms = app.paymentDraft.showAllDenoms || !strategiesEnabled;
      const filteredRows = validAmount
        ? allRowsForTab.filter((row) => {
          if (mode === 'outgoing') {
            return row.count > 0 && row.value_minor <= amountMinor;
          }
          return row.value_minor <= amountMinor;
        })
        : [];
      const showManualEditor = app.paymentDraft.manualEntry || !suggestionAvailable;
      const rowsForTab = showAllDenoms ? allRowsForTab : filteredRows;
      const showAllLink = strategiesEnabled && !showAllDenoms && validAmount && filteredRows.length < allRowsForTab.length;

      const allocationRows = rowsForTab
        .map((row) => {
          const count = effectiveAllocation[row.value_minor] || 0;
          const willExceed = amountMinor !== null
            && (mode === 'incoming' ? (effectiveAllocated + row.value_minor > amountMinor) : (strategiesEnabled && (effectiveAllocated + row.value_minor > amountMinor)));
          const maxAvailable = mode === 'outgoing' ? row.count : Infinity;
          const atMaxAvailable = mode === 'outgoing' && count >= maxAvailable;
          const disableAdd = willExceed || atMaxAvailable;
          const remainingAvailable = mode === 'outgoing' ? Math.max(0, row.count - count) : row.count;
          return `<article class="denom-row ${willExceed ? 'denom-row-deemphasis' : ''}">
            <p class="denom-value">${formatDenomValue(row.value_minor, wallet.currency)} <span class="muted">(available ${remainingAvailable})</span></p>
            <div class="denom-count-wrap">
              <button type="button" class="denom-step" data-alloc-step="-1" data-denom="${row.value_minor}">-</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" class="denom-input" data-alloc-denom="${row.value_minor}" value="${count}" />
              <button type="button" class="denom-step ${disableAdd ? 'disabled' : ''}" data-alloc-step="1" data-denom="${row.value_minor}" ${disableAdd ? 'disabled' : ''}>+</button>
            </div>
            <p class="denom-subtotal">${formatMoney(row.value_minor * count, wallet.currency)}</p>
          </article>`;
        }).join('');
      const outgoingOveruse = mode === 'outgoing'
        ? getSortedDenoms(wallet, 'largest_first').some((row) => (effectiveAllocation[row.value_minor] || 0) > row.count)
        : false;
      if (outgoingOveruse) applyDisabled = true;
      const allocationPreviewHtml = `
        <div class="preview allocation-summary ${mode === 'outgoing' && amountMinor !== null && effectiveAllocated > amountMinor ? 'suggestion-warn' : ''}">
          ${mode === 'outgoing' && usingSuggestion ? `<p class="allocation-line">Allocated (suggested): ${formatMoney(effectiveAllocated, wallet.currency)} / Expected: ${formatMoney(amountMinor || 0, wallet.currency)}</p>` : ''}
          ${mode === 'outgoing' && usingSuggestion ? '' : `<p class="allocation-line">Allocated: ${formatMoney(effectiveAllocated, wallet.currency)}${amountMinor !== null ? ` / Expected: ${formatMoney(amountMinor, wallet.currency)}` : ''}</p>`}
          ${amountMinor !== null ? '<p class="allocation-hint">Reconcile Allocated to Expected to continue.</p>' : ''}
          ${mode === 'outgoing' && amountMinor !== null && effectiveAllocated > amountMinor ? `<p class="status warn">You surpassed the expected amount and will receive ${formatMoney(effectiveAllocated - amountMinor, wallet.currency)} back.</p>` : ''}
          ${mode === 'outgoing' && outgoingOveruse ? '<p class="status danger">Allocation exceeds available counts.</p>' : ''}
          ${hasIncompleteAllocation() ? '<p class="status warn">Allocation is incomplete.</p>' : ''}
        </div>
      `;

      const successSummary = app.paymentSuccessSummary;
      const successTone = successSummary?.type === 'outgoing' ? 'danger' : 'success';
      const successAmountLabel = successSummary
        ? `${successSummary.type === 'incoming' ? '+' : '-'}${formatMoney(successSummary.amount_minor, successSummary.currency)}`
        : '';
      const headerHtml = showWalletSelector ? `
        <section class="card payment-context-pill">
          <div class="payment-wallet-selector">
            ${renderWalletCards(wallets, wallet.id, 'pay-wallet', false)}
          </div>
          ${zeroWalletHint ? `<p class="muted">${zeroWalletHint}</p>` : ''}
          <div class="segmented-control" role="tablist" aria-label="Payment mode">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ Outgoing</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ Incoming</button>
          </div>
        </section>
      ` : `
        <section class="card payment-context-pill">
          <div class="payment-wallet-summary">
            <p class="muted">Selected wallet</p>
            <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${wallet.currency} · ${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
          </div>
          ${zeroWalletHint ? `<p class="muted">${zeroWalletHint}</p>` : ''}
          <div class="segmented-control" role="tablist" aria-label="Payment mode">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ Outgoing</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ Incoming</button>
          </div>
        </section>
      `;

      el.innerHTML = `
        <section class="panel">
          ${app.paymentSuccessSummary ? `
            <section class="card payment-context-pill">
              <div class="payment-wallet-summary">
                <p class="muted">Selected wallet</p>
                <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${wallet.currency} · ${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
              </div>
            </section>
            <section class="card">
              <p class="status ${successTone}">${app.paymentSuccessMessage}</p>
              <div class="tx-success-summary">
                <div class="tx-success-row"><span>Date</span><span>${formatDateTimeEU(successSummary.created_at)}</span></div>
                <div class="tx-success-row"><span>Wallet</span><span>${successSummary.wallet_name}</span></div>
                <div class="tx-success-row"><span>Amount</span><span class="tx-amount ${successSummary.type === 'incoming' ? 'incoming' : 'outgoing'}">${successAmountLabel}</span></div>
                <div class="tx-success-row"><span>Note</span><span>${truncateNote(successSummary.note || '', 30) || '-'}</span></div>
                ${successSummary.change_expected_minor > 0 ? `<div class="tx-success-row"><span>Change</span><span>${formatMoney(successSummary.change_expected_minor, successSummary.currency)} / ${formatMoney(successSummary.change_received_minor, successSummary.currency)}</span></div>` : ''}
              </div>
              <div class="inline-actions">
                <button type="button" id="go-transactions" class="btn-secondary-soft">Go to Transactions</button>
                <button type="button" id="new-transaction" class="btn-secondary-soft">New transaction</button>
              </div>
            </section>
          ` : `
            ${headerHtml}

            <form id="payment-form" class="panel">
            <section class="card payment-entry-pill">
              <div class="payment-entry-grid">
                <label class="payment-amount-field">Amount
                  <input id="payment-amount" class="payment-amount-input" type="number" inputmode="decimal" step="any" value="${app.paymentDraft.amountInput}" />
                </label>
                <label>Note/Reference (optional)
                  <input id="payment-note" type="text" maxlength="30" value="${app.paymentDraft.note}" />
                </label>
              </div>
              <div class="payment-divider" aria-hidden="true"></div>
              <section class="payment-breakdown-inline ${validAmount ? '' : 'disabled'}">
                ${validAmount ? `
                  ${insufficientOutgoing ? `
                    <div class="preview suggestion-danger">
                      <p class="status danger">Insufficient funds</p>
                      ${suggestionStatusHtml}
                      <p class="muted">Add funds to this wallet to enter a payment.</p>
                    </div>
                  ` : `
                    ${!strategiesEnabled ? allocationPreviewHtml : `
                    <div class="preview ${suggestionToneClass}">
                      <p class="muted">Suggested</p>
                      ${suggestedBreakdown.length > 0 ? breakdownHtml(wallet, suggestedBreakdown) : `<p class="muted">${mode === 'outgoing' ? 'No strategy suggestion for the current setup.' : 'No exact suggestion for the current setup.'}</p>`}
                      ${suggestionStatusHtml}
                      ${suggestionAvailable ? `<div class="inline-actions"><button type="button" id="payment-use-suggested" class="${usingSuggestion ? 'btn-primary-soft' : 'btn-secondary-soft'}">${mode === 'outgoing' ? (ctx?.status === 'EXACT_PAYABLE' ? 'Use and finalize' : 'Use suggested') : 'Use and finalize'}</button><button type="button" id="payment-edit-manual" class="btn-secondary-soft">Edit manually</button></div>` : ''}
                    </div>
                    `}
                    ${showManualEditor ? `
                      ${showToggle ? `
                        <div class="segmented-control" role="tablist" aria-label="Denomination type">
                          <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="payment-bills">Bills</button>
                          <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="payment-coins">Coins</button>
                        </div>
                      ` : ''}
                      <div class="denom-entry-header">
                        <p class="muted">Your entry</p>
                        ${showAllLink ? '<button type="button" id="show-all-denoms" class="link-button">Show all denominations</button>' : ''}
                      </div>
                      <div class="denom-header-row">
                        <p>Denomination</p><p>Count</p><p>Subtotal</p>
                      </div>
                      <div class="denom-list">${allocationRows || '<p class="muted">No denominations available in this tab for the amount.</p>'}</div>
                    ` : ''}
                    ${strategiesEnabled ? allocationPreviewHtml : ''}
                  `}
                ` : '<p class="muted">Enter an amount to allocate denominations.</p>'}
              </section>
              <div class="payment-actions">
                ${mode === 'incoming' && (app.paymentDraft.manualEntry || !suggestionAvailable) && !applyDisabled && validAmount
                  ? '<button type="submit" class="btn-primary-soft">Finalize incoming</button>'
                  : ''}
                ${mode === 'outgoing' && (app.paymentDraft.manualEntry || !suggestionAvailable) && !applyDisabled && validAmount
                  ? '<button type="submit" class="btn-primary-soft">Finalize outgoing</button>'
                  : ''}
                ${hasDraftEntry ? '<button type="button" id="payment-cancel-entry" class="btn-secondary-soft">Cancel</button>' : ''}
              </div>
            </section>
          </form>
          `}
        </section>
      `;

      if (showWalletSelector) {
        bindWalletCards('pay-wallet', (walletId) => {
          if (walletId === app.paymentDraft.walletId) return;
          app.activeWalletId = walletId;
          app.paymentDraft.walletId = walletId;
          app.paymentDraft.amountInput = '';
          app.paymentDraft.note = '';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.pendingOutgoingChange = null;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          const wallet = app.state.wallets[walletId];
          if (wallet) {
            app.paymentDraft.mode = getWalletTotal(wallet) === 0 ? 'incoming' : 'outgoing';
          }
          render();
        });
      }

      const goTransactions = document.getElementById('go-transactions');
      if (goTransactions) {
        goTransactions.addEventListener('click', () => {
          if (app.paymentSuccessSummary?.wallet_id && app.state.wallets[app.paymentSuccessSummary.wallet_id]) {
            app.activeWalletId = app.paymentSuccessSummary.wallet_id;
            app.txFilters.wallet = app.paymentSuccessSummary.wallet_id;
          }
          app.activeTab = 'transactions';
          closePaymentModal();
          render();
        });
      }
      const newTransactionBtn = document.getElementById('new-transaction');
      if (newTransactionBtn) {
        newTransactionBtn.addEventListener('click', () => {
          app.paymentDraft.amountInput = '';
          app.paymentDraft.note = '';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.pendingOutgoingChange = null;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          rerenderPayment();
        });
      }

      if (app.paymentSuccessSummary) {
        return;
      }

      const switchPaymentMode = (nextMode) => {
        app.paymentDraft.mode = nextMode;
        app.paymentSuccessMessage = '';
        app.paymentSuccessSummary = null;
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        app.paymentDraft.showAllDenoms = false;
        app.pendingOutgoingChange = null;
        rerenderPayment();
      };
      document.getElementById('mode-outgoing').addEventListener('click', () => {
        switchPaymentMode('outgoing');
      });
      document.getElementById('mode-incoming').addEventListener('click', () => {
        switchPaymentMode('incoming');
      });


      document.getElementById('payment-amount').addEventListener('input', (e) => {
        const cursorStart = e.target.selectionStart;
        const cursorEnd = e.target.selectionEnd;
        app.paymentDraft.amountInput = e.target.value;
        app.paymentSuccessMessage = '';
        app.paymentSuccessSummary = null;
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        app.paymentDraft.showAllDenoms = false;
        rerenderPayment();
        const amountInput = document.getElementById('payment-amount');
        if (amountInput) {
          amountInput.focus();
          if (cursorStart !== null && cursorEnd !== null) {
            const start = Math.min(cursorStart, amountInput.value.length);
            const end = Math.min(cursorEnd, amountInput.value.length);
            amountInput.setSelectionRange(start, end);
          }
        }
      });

      document.getElementById('payment-note').addEventListener('input', (e) => {
        const cursorStart = e.target.selectionStart;
        const cursorEnd = e.target.selectionEnd;
        app.paymentDraft.note = e.target.value;
        app.paymentSuccessMessage = '';
        app.paymentSuccessSummary = null;
        rerenderPayment();
        const noteInput = document.getElementById('payment-note');
        if (noteInput) {
          noteInput.focus();
          if (cursorStart !== null && cursorEnd !== null) {
            const start = Math.min(cursorStart, noteInput.value.length);
            const end = Math.min(cursorEnd, noteInput.value.length);
            noteInput.setSelectionRange(start, end);
          }
        }
      });
      const paymentBills = document.getElementById('payment-bills');
      const paymentCoins = document.getElementById('payment-coins');
      if (paymentBills) {
        paymentBills.addEventListener('click', () => {
          app.paymentDenomTabByWallet[wallet.id] = 'bills';
          rerenderPayment();
        });
      }
      if (paymentCoins) {
        paymentCoins.addEventListener('click', () => {
          app.paymentDenomTabByWallet[wallet.id] = 'coins';
          rerenderPayment();
        });
      }
      const paymentUseSuggested = document.getElementById('payment-use-suggested');
      if (paymentUseSuggested) {
        paymentUseSuggested.addEventListener('click', async () => {
          app.paymentDraft.allocation = breakdownToAllocation(suggestedBreakdown);
          app.paymentDraft.manualEntry = false;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          rerenderPayment();
          if (mode === 'incoming' && amountMinor !== null) {
            const suggestedAllocation = breakdownToAllocation(suggestedBreakdown);
            const suggestedTotal = getAllocationTotal(suggestedAllocation);
            if (suggestedTotal === amountMinor) {
              const breakdown = allocationToBreakdown(suggestedAllocation);
              applyBreakdownToWallet(wallet, breakdown, 1);
              const tx = {
                id: uid('tx'),
                created_at: nowIso(),
                wallet_id: wallet.id,
                wallet_name: wallet.name,
                currency: wallet.currency,
                type: 'incoming',
                amount_minor: amountMinor,
                delta_minor: amountMinor,
                note: noteText || undefined,
                breakdown,
              };
              app.state.transactions.push(tx);
              setPaymentSuccess(tx);
              app.paymentDraft.note = '';
              app.paymentDraft.amountInput = '';
              app.paymentDraft.allocation = {};
              app.paymentDraft.manualEntry = false;
              app.paymentDraft.startedAllocation = false;
              saveState();
              render();
              return;
            }
          }
          if (mode === 'outgoing' && amountMinor !== null) {
            const suggestedAllocation = breakdownToAllocation(suggestedBreakdown);
            const suggestedTotal = getAllocationTotal(suggestedAllocation);
            if (suggestedTotal >= amountMinor) {
              await handleOutgoingFinalize(allocationToBreakdown(suggestedAllocation), suggestedTotal);
            }
          }
        });
      }
      const paymentEditManual = document.getElementById('payment-edit-manual');
      if (paymentEditManual) {
        paymentEditManual.addEventListener('click', () => {
          app.paymentDraft.manualEntry = true;
          app.paymentDraft.allocation = {};
          rerenderPayment();
        });
      }
      const showAllDenomsBtn = document.getElementById('show-all-denoms');
      if (showAllDenomsBtn) {
        showAllDenomsBtn.addEventListener('click', () => {
          app.paymentDraft.showAllDenoms = true;
          rerenderPayment();
        });
      }
      const paymentCancelEntry = document.getElementById('payment-cancel-entry');
      if (paymentCancelEntry) {
        paymentCancelEntry.addEventListener('click', () => {
          app.paymentDraft.amountInput = '';
          app.paymentDraft.note = '';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.pendingOutgoingChange = null;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          rerenderPayment();
        });
      }

      const handleOutgoingFinalize = async (breakdown, allocatedTotalMinor) => {
        const invalid = breakdown.some((row) => row.count > (wallet.denominations.find((d) => d.value_minor === row.value_minor)?.count || 0));
        if (invalid) return;

        const changeExpectedMinor = Math.max(0, allocatedTotalMinor - amountMinor);
        const strategiesEnabled = app.state.settings.payment_strategies;
        const changeSuggestionsEnabled = app.state.settings.change_suggestions;
        const allowChangeSuggestion = strategiesEnabled && changeSuggestionsEnabled;
        const changeBreakdown = changeExpectedMinor > 0 && allowChangeSuggestion
          ? computeChangeBreakdown(defaultDenominations(wallet.currency), changeExpectedMinor)
          : [];
        if (changeExpectedMinor > 0) {
          if (!allowChangeSuggestion) {
            const manualAllocation = await promptManualChangeAllocation(wallet, changeExpectedMinor, {});
            if (!manualAllocation) return;
            const manualChangeBreakdown = allocationToBreakdown(manualAllocation);
            applyBreakdownToWallet(wallet, breakdown, -1);
            if (manualChangeBreakdown.length > 0) {
              applyBreakdownToWallet(wallet, manualChangeBreakdown, 1);
            }
            const tx = {
              id: uid('tx'),
              created_at: nowIso(),
              wallet_id: wallet.id,
              wallet_name: wallet.name,
              currency: wallet.currency,
              type: 'outgoing',
              amount_minor: amountMinor,
              delta_minor: -amountMinor,
              strategy: app.paymentDraft.strategy,
              note: noteText,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: manualChangeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.amountInput = '';
            app.paymentDraft.allocation = {};
            app.paymentDraft.manualEntry = false;
            app.paymentDraft.startedAllocation = false;
            saveState();
            render();
            return;
          }
          const suggestedLabel = changeBreakdown.length > 0
            ? changeBreakdown.map((row) => `${formatDenomValue(row.value_minor, wallet.currency)} x ${row.count}`).join('<br>')
            : 'No automatic suggestion';
          const changeAction = await showModal({
            title: 'Confirm change received',
            message: `<strong>Expected change:</strong> ${formatMoney(changeExpectedMinor, wallet.currency)}<br><strong>Suggested received:</strong><br>${suggestedLabel}`,
            actions: [
              { id: 'confirm_suggested', label: 'Confirm suggested', style: 'primary' },
              { id: 'manual_change', label: 'Enter manually', style: 'secondary' },
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
            ],
          });
          if (changeAction === 'confirm_suggested') {
            applyBreakdownToWallet(wallet, breakdown, -1);
            if (changeBreakdown.length > 0) {
              applyBreakdownToWallet(wallet, changeBreakdown, 1);
            }
            const tx = {
              id: uid('tx'),
              created_at: nowIso(),
              wallet_id: wallet.id,
              wallet_name: wallet.name,
              currency: wallet.currency,
              type: 'outgoing',
              amount_minor: amountMinor,
              delta_minor: -amountMinor,
              strategy: app.paymentDraft.strategy,
              note: noteText,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: changeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.amountInput = '';
            app.paymentDraft.allocation = {};
            app.paymentDraft.manualEntry = false;
            app.paymentDraft.startedAllocation = false;
            saveState();
            render();
            return;
          }
          if (changeAction === 'manual_change') {
            const manualAllocation = await promptManualChangeAllocation(wallet, changeExpectedMinor, {});
            if (!manualAllocation) return;
            const manualChangeBreakdown = allocationToBreakdown(manualAllocation);
            applyBreakdownToWallet(wallet, breakdown, -1);
            if (manualChangeBreakdown.length > 0) {
              applyBreakdownToWallet(wallet, manualChangeBreakdown, 1);
            }
            const tx = {
              id: uid('tx'),
              created_at: nowIso(),
              wallet_id: wallet.id,
              wallet_name: wallet.name,
              currency: wallet.currency,
              type: 'outgoing',
              amount_minor: amountMinor,
              delta_minor: -amountMinor,
              strategy: app.paymentDraft.strategy,
              note: noteText,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: manualChangeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.amountInput = '';
            app.paymentDraft.allocation = {};
            app.paymentDraft.manualEntry = false;
            app.paymentDraft.startedAllocation = false;
            saveState();
            render();
          }
          return;
        }

        applyBreakdownToWallet(wallet, breakdown, -1);
        const tx = {
          id: uid('tx'),
          created_at: nowIso(),
          wallet_id: wallet.id,
          wallet_name: wallet.name,
          currency: wallet.currency,
          type: 'outgoing',
          amount_minor: amountMinor,
          delta_minor: -amountMinor,
          strategy: app.paymentDraft.strategy,
          note: noteText,
          breakdown,
        };
        app.state.transactions.push(tx);
        setPaymentSuccess(tx);
        app.paymentDraft.note = '';
        app.paymentDraft.amountInput = '';
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        saveState();
        render();
      };

      document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (amountMinor === null) return;
        if (mode === 'outgoing' ? effectiveAllocated < amountMinor : effectiveAllocated !== amountMinor) return;
        const breakdown = allocationToBreakdown(effectiveAllocation);

        if (mode === 'outgoing') {
          await handleOutgoingFinalize(breakdown, effectiveAllocated);
          return;
        }

        applyBreakdownToWallet(wallet, breakdown, mode === 'incoming' ? 1 : -1);
        const tx = {
          id: uid('tx'),
          created_at: nowIso(),
          wallet_id: wallet.id,
          wallet_name: wallet.name,
          currency: wallet.currency,
          type: mode,
          amount_minor: amountMinor,
          delta_minor: mode === 'incoming' ? amountMinor : -amountMinor,
          strategy: mode === 'outgoing' ? app.paymentDraft.strategy : undefined,
          note: noteText,
          breakdown,
        };
        app.state.transactions.push(tx);
        setPaymentSuccess(tx);
        app.paymentDraft.note = '';
        app.paymentDraft.amountInput = '';
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        saveState();
        render();
      });

      if (showManualEditor) {
        el.querySelectorAll('input[data-alloc-denom]').forEach((input) => {
          input.addEventListener('input', (evt) => {
            const denom = Number(evt.target.dataset.allocDenom);
            const cleaned = String(evt.target.value || '').replace(/[^\d]/g, '');
            if (cleaned !== evt.target.value) evt.target.value = cleaned;
            const maxAvail = mode === 'outgoing'
              ? (wallet.denominations.find((d) => d.value_minor === denom)?.count || 0)
              : Infinity;
            const next = Math.max(0, Number.parseInt(cleaned || '0', 10) || 0);
            let capped = Math.min(next, maxAvail);
            if (mode === 'incoming' && amountMinor !== null) {
              const current = app.paymentDraft.allocation[denom] || 0;
              const totalWithout = effectiveAllocated - current * denom;
              const maxByAmount = Math.max(0, Math.floor((amountMinor - totalWithout) / denom));
              capped = Math.min(capped, maxByAmount);
            }
            app.paymentDraft.allocation[denom] = capped;
            app.paymentDraft.manualEntry = true;
            rerenderPayment();
          });
        });
        el.querySelectorAll('button[data-alloc-step]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const denom = Number(btn.dataset.denom);
            const step = Number(btn.dataset.allocStep);
            const current = app.paymentDraft.allocation[denom] || 0;
            const maxAvail = mode === 'outgoing'
              ? (wallet.denominations.find((d) => d.value_minor === denom)?.count || 0)
              : Infinity;
            let next = Math.max(0, Math.min(current + step, maxAvail));
            if (mode === 'incoming' && amountMinor !== null) {
              const totalWithout = effectiveAllocated - current * denom;
              const maxByAmount = Math.max(0, Math.floor((amountMinor - totalWithout) / denom));
              next = Math.min(next, maxByAmount);
            }
            app.paymentDraft.allocation[denom] = next;
            app.paymentDraft.manualEntry = true;
            rerenderPayment();
          });
        });
      }
    }

    function renderTransactions() {
      const el = document.getElementById('tab-transactions');
      const wallets = getWalletList();

      const ages = app.state.transactions.map((tx) => ageDays(tx.created_at));
      const oldestAge = ages.length ? Math.max(...ages) : 0;
      const scheduledNextDeletionCount = ages.length ? ages.filter((days) => days === oldestAge).length : 0;
      const nextCleanupDays = ages.length ? Math.max(0, RETENTION_DAYS - oldestAge) : RETENTION_DAYS;
      const latestByWallet = new Map();
      app.state.transactions.forEach((tx) => {
        if (!tx.wallet_id) return;
        const existing = latestByWallet.get(tx.wallet_id);
        if (!existing || new Date(tx.created_at) > new Date(existing.created_at)) {
          latestByWallet.set(tx.wallet_id, tx);
        }
      });

      const defaultWalletId = app.activeWalletId || wallets[0]?.id || null;
      const filters = app.txFilters || { wallet: defaultWalletId, currency: 'all' };
      app.txFilters = filters;
      if (app.activeWalletId && filters.wallet !== app.activeWalletId) {
        filters.wallet = app.activeWalletId;
      }
      if (!filters.wallet || !wallets.some((w) => w.id === filters.wallet)) {
        filters.wallet = defaultWalletId;
      }
      if (filters.wallet) app.activeWalletId = filters.wallet;

      const filtered = [...app.state.transactions]
        .filter((tx) => !filters.wallet || tx.wallet_id === filters.wallet)
        .sort((a, b) => {
          const timeDiff = new Date(b.created_at) - new Date(a.created_at);
          if (timeDiff !== 0) return timeDiff;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });

      const chronological = [...filtered].sort((a, b) => {
        const timeDiff = new Date(a.created_at) - new Date(b.created_at);
        if (timeDiff !== 0) return timeDiff;
        return String(a.id || '').localeCompare(String(b.id || ''));
      });
      const balanceById = new Map();
      let runningBalance = 0;
      chronological.forEach((tx) => {
        const deltaMinor = Number.isFinite(tx.delta_minor)
          ? tx.delta_minor
          : (tx.type === 'incoming' ? (tx.amount_minor || 0) : tx.type === 'outgoing' ? -(tx.amount_minor || 0) : (tx.amount_minor || 0));
        runningBalance += deltaMinor;
        balanceById.set(tx.id, runningBalance);
      });

      let lastGroupKey = null;
      const rows = filtered.map((tx) => {
        const groupKey = dayKey(tx.created_at);
        const groupHeader = groupKey !== lastGroupKey
          ? `<tr class="tx-group-row"><td colspan="3">${formatDayGroupLabel(tx.created_at)}</td></tr>`
          : '';
        lastGroupKey = groupKey;
        const detailPaid = formatBreakdownLine(tx.paid_breakdown || tx.breakdown || [], tx.currency);
        const detailChange = formatBreakdownLine(tx.change_breakdown || [], tx.currency);
        const amountMinor = Number.isFinite(tx.requested_amount_minor) ? tx.requested_amount_minor : (tx.amount_minor || 0);
        const amountLabel = tx.type === 'incoming' ? '+' : tx.type === 'outgoing' ? '-' : '±';
        const amountClass = tx.type === 'incoming' ? 'incoming' : tx.type === 'outgoing' ? 'outgoing' : '';
        const isLatestForWallet = latestByWallet.get(tx.wallet_id)?.id === tx.id;
        const noteText = String(tx.note || '').trim();
        const shortNote = truncateNote(noteText, 30);
        const useNoteAsTitle = noteText && noteText.length <= 24;
        const titleText = useNoteAsTitle
          ? noteText
          : (tx.type === 'incoming' ? 'Cash in' : tx.type === 'outgoing' ? 'Payment' : 'Adjustment');
        const secondaryText = `${formatTimeEU(tx.created_at)}${(!useNoteAsTitle && shortNote) ? ` · ${shortNote}` : ''}`;
        const changeSummary = tx.change_expected_minor
          ? `${formatMoney(tx.change_expected_minor, tx.currency)} / ${formatMoney(tx.change_received_minor || 0, tx.currency)}${detailChange !== '-' ? ` (${detailChange})` : ''}`
          : '-';
        const balanceLabel = formatMoney(balanceById.get(tx.id) || 0, tx.currency);
        return `
          ${groupHeader}
          <tr class="tx-row ${amountClass}" data-tx-id="${tx.id}" role="button" tabindex="0">
            <td class="tx-desc">
              <div class="tx-desc-main">${titleText}</div>
              <div class="tx-desc-sub">${secondaryText}</div>
            </td>
            <td class="tx-amount ${amountClass}">${amountLabel}${formatMoney(amountMinor, tx.currency)}</td>
            <td class="tx-balance">${balanceLabel}</td>
          </tr>
          <tr class="tx-details-row" data-tx-details="${tx.id}">
            <td colspan="3">
              <div class="tx-details-body">
                <div class="tx-detail"><span>Timestamp</span><span>${formatDateTimeEU(tx.created_at)}</span></div>
                <div class="tx-detail"><span>Direction</span><span>${tx.type || '-'}</span></div>
                <div class="tx-detail"><span>Strategy</span><span>${tx.strategy || '-'}</span></div>
                <div class="tx-detail"><span>Breakdown</span><span>${detailPaid}</span></div>
                <div class="tx-detail"><span>Change</span><span>${changeSummary}</span></div>
                <div class="tx-detail"><span>Note</span><span>${noteText || '-'}</span></div>
                ${isLatestForWallet ? `<button type="button" class="btn-danger-soft tx-revert-btn" data-revert-tx-id="${tx.id}">Revert transaction</button>` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      const bannerKey = 'kontana_tx_banner_dismissed_at';
      const dismissedAt = Number(localStorage.getItem(bannerKey) || 0);
      const bannerHidden = dismissedAt && Date.now() - dismissedAt < 5 * 24 * 60 * 60 * 1000;

      el.innerHTML = `
        <section class="panel">
          ${!bannerHidden ? `
            <div class="banner tx-banner">
              <button type="button" class="banner-close-pill" id="tx-banner-close" aria-label="Don't show again for 5 days">Don't show again for 5 days</button>
              <p>Transactions older than 30 days are deleted automatically.</p>
              <p><strong>${scheduledNextDeletionCount} transactions will be deleted next.</strong></p>
              <p><strong>${nextCleanupDays} days remaining until the next deletion window.</strong></p>
              <p>Back up your history from Settings.</p>
            </div>
          ` : ''}
          <section class="card summary-card">
            <div class="summary-main">
              ${wallets.length > 0 ? renderWalletCards(wallets, filters.wallet, 'tx-wallet', false) : '<p class="muted">No wallets yet.</p>'}
            </div>
          </section>
          ${filters.wallet && app.state.wallets[filters.wallet] ? `
            <section class="card tx-wallet-header">
              <div class="tx-wallet-header-main">
                <div>
                  <p class="muted">Selected wallet</p>
                  <p><strong>${app.state.wallets[filters.wallet].name}</strong> · ${app.state.wallets[filters.wallet].currency}</p>
                </div>
                <div class="tx-wallet-header-balance">
                  <p class="muted">Balance</p>
                  <p><strong>${formatMoney(getWalletTotal(app.state.wallets[filters.wallet]), app.state.wallets[filters.wallet].currency)}</strong></p>
                </div>
              </div>
            </section>
          ` : ''}
          ${filtered.length === 0
            ? '<p>No transactions yet.</p>'
            : `<table class="tx-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
          }
        </section>
      `;

      const closeBannerBtn = document.getElementById('tx-banner-close');
      if (closeBannerBtn) {
        closeBannerBtn.addEventListener('click', () => {
          localStorage.setItem(bannerKey, String(Date.now()));
          renderTransactions();
        });
      }

      document.querySelectorAll('.tx-row').forEach((row) => {
        const toggle = () => {
          const detailsRow = row.nextElementSibling;
          if (!detailsRow || !detailsRow.classList.contains('tx-details-row')) return;
          const willOpen = !detailsRow.classList.contains('open');
          detailsRow.classList.toggle('open', willOpen);
          row.classList.toggle('is-expanded', willOpen);
        };
        row.addEventListener('click', toggle);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        });
      });

      document.querySelectorAll('[data-revert-tx-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const txId = btn.dataset.revertTxId;
          const tx = app.state.transactions.find((row) => row.id === txId);
          if (!tx) return;
          const latestForWallet = latestByWallet.get(tx.wallet_id);
          if (!latestForWallet || latestForWallet.id !== tx.id) return;
          const confirmResult = await showModal({
            title: 'Revert Transaction',
            message: 'This will remove the transaction and restore the wallet cash state.',
            actions: [
              { id: 'revert', label: 'Revert', style: 'danger' },
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
            ],
          });
          if (confirmResult !== 'revert') return;
          const txWallet = app.state.wallets[tx.wallet_id];
          if (!txWallet) return;
          if (tx.type === 'incoming') {
            applyBreakdownToWallet(txWallet, tx.breakdown || [], -1);
          } else if (tx.type === 'outgoing') {
            applyBreakdownToWallet(txWallet, tx.breakdown || [], 1);
            if (Array.isArray(tx.change_breakdown) && tx.change_breakdown.length > 0) {
              applyBreakdownToWallet(txWallet, tx.change_breakdown, -1);
            }
          } else if (tx.type === 'denominations_edited' && Array.isArray(tx.prior_breakdown)) {
            setWalletCounts(txWallet, tx.prior_breakdown);
          } else if (tx.type === 'adjustment') {
            // Adjustments do not directly mutate denomination counts.
          } else {
            await modalAlert('Unable to revert this transaction.');
            return;
          }
          app.state.transactions = app.state.transactions.filter((row) => row.id !== tx.id);
          saveState();
          render();
        });
      });
      bindWalletCards('tx-wallet', (walletId) => {
        app.txFilters.wallet = walletId;
        app.activeWalletId = walletId;
        app.paymentDraft.walletId = walletId;
        renderTransactions();
      });
      bindWalletReorder('tx-wallet');

    }

    function renderSettings() {
      const el = document.getElementById('settings-overlay-root');
      if (!el) return;
      if (!app.settingsOpen) {
        el.innerHTML = '';
        return;
      }
      const coinsRule = app.state.settings.coins_rule || 'off';
      const coinsEnabled = coinsRule !== 'off';
      const coinsMode = coinsRule === 'avoid' ? 'avoid' : 'prefer';
      const strategiesEnabled = app.state.settings.payment_strategies;
      const changeSuggestionsEnabled = app.state.settings.change_suggestions;

      el.innerHTML = `
        <div class="modal-backdrop" id="settings-backdrop">
          <section class="modal-card settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
            <div class="modal-header">
              <div>
                <h3>Settings</h3>
                <p class="muted">Adjust preferences for suggestions, coins, and appearance.</p>
              </div>
              <button type="button" class="modal-close-btn" id="settings-close" aria-label="Close">×</button>
            </div>
            <section class="subpanel">
              <h3>Suggestions</h3>
              <p class="muted">Suggestions show recommended denominations; you still confirm or edit manually.</p>
              <div class="segmented-control" role="group" aria-label="Payment strategies">
                <button type="button" class="segment ${!strategiesEnabled ? 'active' : ''}" data-strategy-toggle="off">Off</button>
                <button type="button" class="segment ${strategiesEnabled ? 'active' : ''}" data-strategy-toggle="on">On</button>
              </div>
              ${strategiesEnabled ? `
                <p class="muted"><strong>Payment strategies</strong></p>
                <p class="muted">How suggestions are calculated.</p>
                <div class="strategy-grid" role="group" aria-label="Default strategy">
                  <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'greedy' ? 'active' : ''}" data-strategy="greedy">
                    <h4>Greedy</h4>
                    <p>Uses larger denominations first to reduce item count.</p>
                  </button>
                  <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'lex' ? 'active' : ''}" data-strategy="lex">
                    <h4>Lex</h4>
                    <p>Prefers higher denominations first when multiple exact options exist.</p>
                  </button>
                  <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'equalisation' ? 'active' : ''}" data-strategy="equalisation">
                    <h4>Equalisation</h4>
                    <p>Prefers surplus denominations to keep wallet mix balanced.</p>
                  </button>
                </div>
                <div class="subpanel-divider"></div>
                <div class="stack-form">
                  <p class="muted"><strong>Change suggestions</strong> (for overpay)</p>
                  <p class="muted">Show a suggested change breakdown, or go manual-only when Off.</p>
                  <div class="segmented-control" role="group" aria-label="Change suggestions">
                    <button type="button" class="segment ${!changeSuggestionsEnabled ? 'active' : ''}" data-change-suggest="off">Off</button>
                    <button type="button" class="segment ${changeSuggestionsEnabled ? 'active' : ''}" data-change-suggest="on">On</button>
                  </div>
                </div>
                <div class="subpanel-divider"></div>
                <div class="stack-form">
                  <p class="muted"><strong>Coins rules</strong></p>
                  <p class="muted">Control whether coins are used in suggested breakdowns.</p>
                  <div class="segmented-control" role="group" aria-label="Coins rules">
                    <button type="button" class="segment ${coinsEnabled ? '' : 'active'}" data-coins-toggle="off">Off</button>
                    <button type="button" class="segment ${coinsEnabled ? 'active' : ''}" data-coins-toggle="on">On</button>
                  </div>
                  ${coinsEnabled ? `
                    <div class="strategy-grid" role="group" aria-label="Coins mode">
                      <button type="button" class="strategy-card ${coinsMode === 'avoid' ? 'active' : ''}" data-coins-mode="avoid">
                        <h4>Avoid coins entirely</h4>
                        <p>Notes only. If notes cannot pay the amount, the payment is insufficient.</p>
                      </button>
                      <button type="button" class="strategy-card ${coinsMode === 'prefer' ? 'active' : ''}" data-coins-mode="prefer">
                        <h4>Prefer notes</h4>
                        <p>Coins used only if needed to pay exactly (or to make change).</p>
                      </button>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </section>

            <section class="subpanel">
              <h3>Appearance</h3>
              <p class="muted">Match the app theme to the website.</p>
              <div class="segmented-control appearance-control" role="group" aria-label="Theme">
                <button type="button" class="segment ${app.state.settings.appearance === 'light' ? 'active' : ''}" data-appearance="light">Light</button>
                <button type="button" class="segment ${app.state.settings.appearance === 'dark' ? 'active' : ''}" data-appearance="dark">Dark</button>
              </div>
            </section>

            <section class="subpanel">
              <h3>Export</h3>
              <div class="inline-actions">
                <button type="button" id="export-json" class="btn-secondary-soft">Export JSON</button>
                <button type="button" id="export-pdf" class="btn-secondary-soft">Export PDF</button>
              </div>
            </section>

            <section class="subpanel">
              <h3>Delete all data</h3>
              <p>This removes wallets, denominations, transactions, and settings.</p>
              <button class="btn-danger-soft" type="button" id="delete-all-data">Delete all data</button>
            </section>

            <section class="subpanel">
              <h3>Launch updates</h3>
              <p>Optional. Email only. Stored locally now; server sync can be added later.</p>
              <form id="launch-updates-form" class="stack-form">
                <label>Email <input type="email" id="launch-email" required /></label>
                <label class="check-row"><input type="checkbox" id="launch-consent" /> Email me launch updates</label>
                <button type="submit" class="btn-secondary-soft">Notify me</button>
              </form>
              ${app.launchSignupMessage ? `<p>${app.launchSignupMessage}</p>` : ''}
            </section>
            <p class="muted app-version">Version ${APP_VERSION}</p>
          </section>
        </div>
      `;

      el.querySelectorAll('button[data-strategy]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.strategy;
          if (!['greedy', 'lex', 'equalisation'].includes(next)) return;
          app.state.settings.default_strategy = next;
          app.paymentDraft.strategy = next;
          saveState();
          renderSettings();
        });
      });

      el.querySelectorAll('button[data-strategy-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.strategyToggle === 'on';
          if (app.state.settings.payment_strategies === next) return;
          app.state.settings.payment_strategies = next;
          if (!next) {
            app.state.settings.coins_rule = 'off';
            app.state.settings.change_suggestions = false;
          }
          saveState();
          renderSettings();
        });
      });

      el.querySelectorAll('button[data-appearance]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.appearance === 'dark' ? 'dark' : 'light';
          if (app.state.settings.appearance === next) return;
          app.state.settings.appearance = next;
          setAppearance(next);
          saveState();
          renderSettings();
        });
      });

      const closeSettings = () => {
        app.settingsOpen = false;
        renderSettings();
      };
      const closeBtn = document.getElementById('settings-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
      }
      const backdrop = document.getElementById('settings-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (event) => {
          if (event.target !== backdrop) return;
          closeSettings();
        });
      }
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSettings();
      }, { once: true });


      if (app.state.settings.payment_strategies) {
        el.querySelectorAll('button[data-change-suggest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const next = btn.dataset.changeSuggest === 'on';
            if (app.state.settings.change_suggestions === next) return;
            app.state.settings.change_suggestions = next;
            saveState();
            renderSettings();
          });
        });

        el.querySelectorAll('button[data-coins-toggle]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const next = btn.dataset.coinsToggle === 'on' ? 'prefer' : 'off';
            if (app.state.settings.coins_rule === next) return;
            app.state.settings.coins_rule = next;
            saveState();
            renderSettings();
          });
        });

        el.querySelectorAll('button[data-coins-mode]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const next = btn.dataset.coinsMode === 'avoid' ? 'avoid' : 'prefer';
            if (app.state.settings.coins_rule === next) return;
            app.state.settings.coins_rule = next;
            saveState();
            renderSettings();
          });
        });
      }

      document.getElementById('export-json').addEventListener('click', () => exportJson(app.state));
      document.getElementById('export-pdf').addEventListener('click', () => openPdfReport(app.state));

      document.getElementById('delete-all-data').addEventListener('click', async () => {
        const token = await modalPrompt('Type DELETE ALL DATA to confirm.', '', 'Delete All Data', 'DELETE ALL DATA');
        if (token !== 'DELETE ALL DATA') {
          await modalAlert('Confirmation text did not match.');
          return;
        }
        app.state = makeDefaultState();
        app.activeWalletId = null;
        app.pendingOutgoingChange = null;
        app.paymentDraft = {
          walletId: null,
          amountInput: '',
          strategy: app.state.settings.default_strategy,
          mode: 'outgoing',
          note: '',
          allocation: {},
          manualEntry: false,
          startedAllocation: false,
        };
        saveState();
        render();
      });

      document.getElementById('launch-updates-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('launch-email').value.trim();
        const consent = document.getElementById('launch-consent').checked;
        if (!email || !consent) {
          app.launchSignupMessage = 'Enter a valid email and provide explicit consent.';
          renderSettings();
          return;
        }

        app.state.settings.launch_updates_signups.push({
          email,
          consent: true,
          created_at: nowIso(),
          sync_status: 'pending',
        });
        saveState();

        const endpoint = app.state.settings.launch_updates_endpoint;
        if (!endpoint) {
          app.launchSignupMessage = 'Saved locally. Future sync is not configured yet.';
          renderSettings();
          return;
        }

        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, consent }),
          });
          app.launchSignupMessage = 'Saved locally and sent to updates endpoint.';
        } catch {
          app.launchSignupMessage = 'Saved locally. Sync failed and can be retried later.';
        }
        renderSettings();
      });
    }

    let previousTab = app.activeTab;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isAppGated() && btn.dataset.tab !== 'settings') {
          return;
        }
        previousTab = app.activeTab;
        app.activeTab = btn.dataset.tab;
        setupTabs();
        if (app.activeTab === 'cash') renderCashOnHand();
        if (app.activeTab === 'pay') renderPay();
        if (app.activeTab === 'transactions') renderTransactions();
      });
    });

    const settingsBtn = document.getElementById('open-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        app.settingsOpen = true;
        renderSettings();
      });
    }

    if (Object.keys(app.state.wallets).length === 0) {
      app.activeTab = 'cash';
    }

    app.paymentDraft.walletId = getActiveWallet()?.id || null;
    app.paymentDraft.strategy = app.state.settings.default_strategy;
    render();
