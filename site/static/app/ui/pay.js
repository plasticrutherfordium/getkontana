(function attachKontanaPayUI(global) {
  function runPayRender(ctx) {
    if (!ctx || typeof ctx !== 'object') return;
    const {
      app,
      t,
      document,
      console,
      window,
      ORDER_LARGEST_FIRST,
      PAYMENT_CATEGORIES,
      CURRENCY_NAMES,
      CURRENCY_FLAGS,
      WALLET_NAME_MAX,
      getWalletList,
      getWalletTotal,
      getWalletDisplayTotal,
      getWalletDenomGroups,
      getActivePaymentTab,
      getPaymentContext,
      getAppMode,
      getDraftAllocationTotal,
      getSortedDenoms,
      getAllocationTotal,
      breakdownToAllocation,
      allocationToBreakdown,
      breakdownHtml,
      parseAmountToMinor,
      formatMoney,
      formatDenomValue,
      formatAmountDisplay,
      formatDateTimeEU,
      truncateNote,
      categoryLabel,
      renderCategoryOptions,
      renderWalletCards,
      switchPaymentMode,
      openCreateWalletModal,
      defaultDenominations,
      computeChangeBreakdown,
      promptManualChangeAllocation,
      showModal,
      modalAlert,
      modalConfirm,
      modalPrompt,
      applyBreakdownToWallet,
      setPaymentSuccess,
      uid,
      nowIso,
      saveState,
      render,
      bindWalletCards,
      bindWalletReorder,
      warnIfDenomsStale,
      startBudgetQuickSpendFlow,
      startBudgetTransferFlow,
      startBudgetAdjustmentFlow,
    } = ctx;
    function renderPay() {
      const el = document.getElementById('tab-pay');
      if (!el) return;
      const wallets = getWalletList();
      if (!wallets.length) {
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">${t('cash.no_wallets')}</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet-pay" class="btn-secondary-soft">${t('cash.create_wallet')}</button>
            </div>
          </section>
        `;
        const openCreateWalletBtn = document.getElementById('open-create-wallet-pay');
        if (openCreateWalletBtn) {
          openCreateWalletBtn.addEventListener('click', openCreateWalletModal);
        }
        return;
      }
      const hasEntry = Boolean(
        app.paymentDraft.amountInput.trim()
        || app.paymentDraft.note.trim()
        || (app.paymentDraft.category && app.paymentDraft.category !== 'uncategorized')
        || Object.keys(app.paymentDraft.allocation || {}).length > 0
        || app.paymentDraft.manualEntry
        || app.paymentDraft.startedAllocation
        || app.paymentDraft.incomingEntryMode
      );
      if (!hasEntry) {
        app.paymentDraft.walletId = app.activeWalletId || wallets[0]?.id || null;
      }
      const wallet = app.state.wallets[app.paymentDraft.walletId || ''] || null;
      if (wallet && !hasEntry) {
        const walletTotal = getWalletTotal(wallet);
        app.paymentDraft.mode = walletTotal === 0 ? 'incoming' : 'outgoing';
      }
      renderNewPayment('tab-pay', { showWalletSelector: true });
    }
    
    function renderNewPayment(target = 'tab-payment', options = {}) {
      const el = typeof target === 'string' ? document.getElementById(target) : target;
      if (!el) return;
      const rerenderPayment = () => renderNewPayment(target, options);
      const showWalletSelector = Boolean(options.showWalletSelector);
      const wallets = getWalletList();
      console.debug('[renderNewPayment] wallets.length', wallets.length, 'app.editMode', app.editMode);
      if (wallets.length === 0) {
        console.debug('[renderNewPayment] early exit: no wallets');
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">${t('cash.no_wallets')}</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet-payment" class="btn-secondary-soft">${t('cash.create_wallet')}</button>
            </div>
          </section>
        `;
        const openCreateWalletBtn = document.getElementById('open-create-wallet-payment');
        if (openCreateWalletBtn) {
          openCreateWalletBtn.addEventListener('click', openCreateWalletModal);
        }
        return;
      }
    
      if (app.editMode) {
        console.debug('[renderNewPayment] early exit: edit mode active', app.editMode);
        el.innerHTML = `
          <section class="panel">
            <section class="card">
              <p class="status warn">${t('pay.blocked_title')}</p>
              <p>${t('pay.blocked_body')}</p>
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
      if (!PAYMENT_CATEGORIES.includes(app.paymentDraft.category)) app.paymentDraft.category = 'uncategorized';
      if (!app.paymentDraft.allocation || typeof app.paymentDraft.allocation !== 'object') {
        app.paymentDraft.allocation = {};
      }
      if (typeof app.paymentDraft.manualEntry !== 'boolean') app.paymentDraft.manualEntry = false;
      if (typeof app.paymentDraft.showAllDenoms !== 'boolean') app.paymentDraft.showAllDenoms = false;
      if (app.paymentDraft.incomingEntryMode === undefined) app.paymentDraft.incomingEntryMode = null;
      
      // Auto-set incoming transactions to manual-direct mode
      if (app.paymentDraft.mode === 'incoming' && app.paymentDraft.incomingEntryMode === null) {
        app.paymentDraft.incomingEntryMode = 'manual';
        app.paymentDraft.manualEntry = true;
      }
    
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
              <h3>${t('pay.confirm_change_received')}</h3>
              <p class="muted">${t('pay.finalize_outgoing_for', { amount: formatMoney(pending.requestedAmountMinor, pendingWallet.currency) })}</p>
              <p class="status warn">${t('pay.expected_change', { amount: formatMoney(pending.expectedChangeMinor, pendingWallet.currency) })}</p>
              <div class="preview">
                <p class="muted">${t('pay.suggested_change')}</p>
                ${breakdownHtml(pendingWallet, pending.suggestedChangeBreakdown)}
              </div>
              <p class="muted">${t('pay.received_change_breakdown')}</p>
              <div class="denom-header-row">
                <p>${t('pay.denomination')}</p><p>${t('pay.count')}</p><p>${t('pay.subtotal')}</p>
              </div>
              <div class="denom-list">${changeRowHtml || `<p class="muted">${t('pay.no_denoms_for_change')}</p>`}</div>
              <div class="preview">
                <p class="muted">${t('pay.received_vs_expected', { received: formatMoney(receivedTotal, pendingWallet.currency), expected: formatMoney(pending.expectedChangeMinor, pendingWallet.currency) })}</p>
                ${canFinalize ? `<p class="status success">${t('pay.change_total_reconciled')}</p>` : `<p class="status danger">${t('pay.change_total_must_match')}</p>`}
              </div>
              <div class="inline-actions edit-actions">
                <button type="button" id="confirm-outgoing-finalize" class="btn-primary-soft" ${canFinalize ? '' : 'disabled'}>${t('pay.confirm_and_finalize')}</button>
                <button type="button" id="cancel-change-confirm" class="btn-secondary-soft">${t('common.cancel')}</button>
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
            category: pending.category || 'uncategorized',
            breakdown: paidBreakdown,
            change_expected_minor: pending.expectedChangeMinor,
            change_received_minor: pending.expectedChangeMinor,
            change_breakdown: confirmedChangeBreakdown,
          };
          app.state.transactions.push(tx);
          app.pendingOutgoingChange = null;
          setPaymentSuccess(tx);
          app.paymentDraft.note = '';
          app.paymentDraft.category = 'uncategorized';
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
      const isBudgetMode = getAppMode() === 'budget';
      const budgetPrimaryActionsHtml = isBudgetMode ? `
        <section class="card">
          <p class="muted"><strong>${t('pay.primary_actions')}</strong></p>
          <div class="inline-actions">
            <button type="button" id="budget-pay-quick-spend" class="btn-secondary-soft">${t('pay.quick_spend.cta')}</button>
            <button type="button" id="budget-pay-transfer" class="btn-secondary-soft">${t('pay.transfer.cta')}</button>
            <button type="button" id="budget-pay-adjustment" class="btn-secondary-soft">${t('pay.adjustment.cta')}</button>
          </div>
        </section>
      ` : '';
      const advancedDividerHtml = isBudgetMode
        ? `<p class="payment-advanced-divider">${t('pay.advanced_divider')}</p>`
        : '';
      const walletTotalForHint = getWalletTotal(wallet);
      const zeroWalletHint = walletTotalForHint === 0 ? t('pay.wallet_empty_hint') : '';
      const amountMinor = parseAmountToMinor(app.paymentDraft.amountInput, wallet.currency);
      const noteText = app.paymentDraft.note.trim().slice(0, 30);
      const category = PAYMENT_CATEGORIES.includes(app.paymentDraft.category) ? app.paymentDraft.category : 'uncategorized';
      const draftAllocated = getDraftAllocationTotal();
      const validAmount = amountMinor !== null && amountMinor > 0;
      const { bills, coins } = getWalletDenomGroups(wallet);
      const divideBillsCoins = app.state.settings.show_bills_coins;
      const showToggle = divideBillsCoins && bills.length > 0 && coins.length > 0;
      const activeTab = divideBillsCoins ? getActivePaymentTab(wallet) : 'all';
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
          if (ctx?.status === 'EXACT_PAYABLE' || ctx?.status === 'COVER_PAYABLE') return ctx.breakdown || [];
          return [];
        }
        // Incoming transactions don't use suggestions - always return empty
        return [];
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
        || category !== 'uncategorized'
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
        } else if (ctx.status === 'COVER_PAYABLE') {
          suggestionStatusHtml = `<p class="status warn">Change expected: ${formatMoney(ctx.overpay || 0, wallet.currency)}</p>`;
          suggestionToneClass = 'suggestion-warn';
        } else if (ctx.status === 'INSUFFICIENT_FUNDS') {
          suggestionStatusHtml = `<p class="status danger">Missing: ${formatMoney(ctx.missingMinor, wallet.currency)}</p>`;
          suggestionToneClass = 'suggestion-danger';
        } else if (ctx.status === 'NO_EXACT_SUGGESTION') {
          suggestionStatusHtml = '<p class="status warn">No exact suggestion available.</p>';
          suggestionToneClass = 'suggestion-warn';
        }
      }
    
      const noExactSuggestionState = mode === 'outgoing'
        && strategiesEnabled
        && !insufficientOutgoing
        && ctx
        && ctx.amountMinor !== null
        && ctx.status === 'NO_EXACT_SUGGESTION';
      const exactSuggestionState = mode === 'outgoing'
        && strategiesEnabled
        && !insufficientOutgoing
        && ctx
        && ctx.amountMinor !== null
        && ctx.status === 'EXACT_PAYABLE';
      const coverSuggestionState = mode === 'outgoing'
        && strategiesEnabled
        && !insufficientOutgoing
        && ctx
        && ctx.amountMinor !== null
        && ctx.status === 'COVER_PAYABLE';
    
      const incomingManualDirect = mode === 'incoming' && app.paymentDraft.incomingEntryMode === 'manual';
      const manualDirect = app.paymentDraft.incomingEntryMode === 'manual';
      const allRowsForTab = getSortedDenoms(wallet, denomOrder)
        .filter((row) => (activeTab === 'all' ? true : (activeTab === 'bills' ? row.type === 'note' : row.type === 'coin')));
      const rowsForTab = manualDirect
        ? allRowsForTab
        : (validAmount
          ? allRowsForTab.filter((row) => {
            if (mode === 'outgoing') {
              if (row.count <= 0) return false;
              if (strategiesEnabled) return row.value_minor <= amountMinor;
              return true;
            }
            return row.value_minor <= amountMinor;
          })
          : []);
      const showManualEditor = manualDirect || (validAmount && app.paymentDraft.manualEntry);
    
      const allocationRows = rowsForTab
        .map((row) => {
          const count = effectiveAllocation[row.value_minor] || 0;
          const willExceed = !incomingManualDirect && amountMinor !== null
            && mode === 'incoming' && (effectiveAllocated + row.value_minor > amountMinor);
          const maxAvailable = mode === 'outgoing' ? row.count : Infinity;
          const atMaxAvailable = mode === 'outgoing' && count >= maxAvailable;
          const disableAdd = atMaxAvailable;
          const remainingAvailable = mode === 'outgoing' ? Math.max(0, row.count - count) : row.count;
          const showRemaining = mode === 'outgoing';
          return `<article class="denom-row ${willExceed ? 'denom-row-deemphasis' : ''}">
            <p class="denom-value">${formatDenomValue(row.value_minor, wallet.currency)}${showRemaining ? ` <span class="muted">[${remainingAvailable}]</span>` : ''}</p>
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
      const allocNotEqual = amountMinor !== null && effectiveAllocated !== amountMinor;
      const allocOverOutgoing = mode === 'outgoing' && amountMinor !== null && effectiveAllocated > amountMinor;
      const allocToneClass = (() => {
        if (mode === 'outgoing' && outgoingOveruse) return 'suggestion-danger';
        if (mode === 'outgoing' && insufficientOutgoing) return 'suggestion-danger';
        if (allocNotEqual) return 'suggestion-warn';
        return '';
      })();
      const allocationPreviewHtml = manualDirect
        ? `<div class="preview allocation-summary"><p class="allocation-line">Allocated count: ${formatMoney(effectiveAllocated, wallet.currency)}</p></div>`
        : `
        <div class="preview allocation-summary ${allocToneClass}">
          ${mode === 'outgoing' && usingSuggestion ? `<p class="allocation-line">Allocated (suggested): ${formatMoney(effectiveAllocated, wallet.currency)} / Expected: ${formatMoney(amountMinor || 0, wallet.currency)}</p>` : ''}
          ${mode === 'outgoing' && usingSuggestion ? '' : `<p class="allocation-line">Allocated: ${formatMoney(effectiveAllocated, wallet.currency)}${amountMinor !== null ? ` / Expected: ${formatMoney(amountMinor, wallet.currency)}` : ''}</p>`}
          ${allocOverOutgoing ? `<p class="status warn">Change: ${formatMoney(effectiveAllocated - amountMinor, wallet.currency)}</p>` : ''}
          ${mode === 'outgoing' && outgoingOveruse ? '<p class="status danger">Allocation exceeds available counts.</p>' : ''}
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
            ${renderWalletCards(wallets, wallet.id, 'pay-wallet', false, { showCreateCard: true, showActions: true })}
          </div>
          <div class="segmented-control" role="tablist" aria-label="${t('pay.payment_mode')}">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ ${t('pay.mode_outgoing')}</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ ${t('pay.mode_incoming')}</button>
          </div>
          ${zeroWalletHint ? `<p class="status warn">${zeroWalletHint}</p>` : ''}
        </section>
      ` : `
        <section class="card payment-context-pill">
          <div class="payment-wallet-summary">
            <p class="muted">${t('pay.selected_wallet')}</p>
            <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${CURRENCY_NAMES[wallet.currency] || wallet.currency} · ${formatMoney(getWalletDisplayTotal(wallet), wallet.currency)}</p>
          </div>
          <div class="segmented-control" role="tablist" aria-label="${t('pay.payment_mode')}">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ ${t('pay.mode_outgoing')}</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ ${t('pay.mode_incoming')}</button>
          </div>
          ${zeroWalletHint ? `<p class="status warn">${zeroWalletHint}</p>` : ''}
        </section>
      `;
    
      el.innerHTML = `
        <section class="panel">
          ${app.paymentSuccessSummary ? `
            <section class="card payment-context-pill">
              <div class="payment-wallet-summary">
                <p class="muted">${t('pay.selected_wallet')}</p>
                <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${CURRENCY_NAMES[wallet.currency] || wallet.currency} · ${formatMoney(getWalletDisplayTotal(wallet), wallet.currency)}</p>
              </div>
            </section>
            <section class="card">
              <p class="status ${successTone}">${app.paymentSuccessMessage}</p>
              <div class="tx-success-summary">
                <div class="tx-success-row"><span>${t('common.date')}</span><span>${formatDateTimeEU(successSummary.created_at)}</span></div>
                <div class="tx-success-row"><span>${t('common.wallet')}</span><span>${successSummary.wallet_name}</span></div>
                <div class="tx-success-row"><span>${t('common.amount')}</span><span class="tx-amount ${successSummary.type === 'incoming' ? 'incoming' : 'outgoing'}">${successAmountLabel}</span></div>
                <div class="tx-success-row"><span>${t('common.note')}</span><span>${truncateNote(successSummary.note || '', 30) || '-'}</span></div>
                <div class="tx-success-row"><span>${t('common.category')}</span><span>${categoryLabel(successSummary.category)}</span></div>
                ${successSummary.change_expected_minor > 0 ? `<div class="tx-success-row"><span>${t('common.change')}</span><span>${formatMoney(successSummary.change_expected_minor, successSummary.currency)} / ${formatMoney(successSummary.change_received_minor, successSummary.currency)}</span></div>` : ''}
              </div>
              <div class="inline-actions">
                <button type="button" id="new-transaction" class="btn-secondary-soft">${t('pay.new_transaction')}</button>
                <button type="button" id="revert-last-transaction" class="btn-danger-soft">${t('pay.revert_transaction')}</button>
              </div>
            </section>
          ` : `
            ${headerHtml}
            ${budgetPrimaryActionsHtml}
    
            <form id="payment-form" class="panel">
            <section class="card payment-entry-pill">
              ${manualDirect ? `
              <div class="payment-entry-grid">
                ${mode === 'outgoing' ? `
                <label class="payment-amount-field">${t('pay.amount_label')}
                  <input id="payment-amount" class="payment-amount-input" type="text" inputmode="decimal" value="${app.paymentDraft.amountDisplay || ''}" autocomplete="off" />
                </label>
                ` : ''}
                <label>${t('pay.note_label')}
                  <input id="payment-note" type="text" maxlength="30" value="${app.paymentDraft.note}" />
                </label>
                <label>${t('pay.category_label')}
                  <select id="payment-category">${renderCategoryOptions(category)}</select>
                </label>
                ${app.paymentDraft.note.length >= 25 ? `<p class="muted note-limit-hint">${t('pay.note_limit', { count: app.paymentDraft.note.length, suffix: app.paymentDraft.note.length >= 30 ? t('pay.note_limit_reached') : '' })}</p>` : ''}
              </div>
              <div class="payment-divider" aria-hidden="true"></div>
              ${advancedDividerHtml}
              <section class="payment-breakdown-inline">
                ${allocationPreviewHtml}
                ${showToggle ? `
                  <div class="segmented-control" role="tablist" aria-label="${t('cash.denomination_type')}">
                    <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="payment-bills">${t('cash.bills')}</button>
                    <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="payment-coins">${t('cash.coins')}</button>
                  </div>
                ` : ''}
                <div class="denom-list">${allocationRows || `<p class="muted">${t('pay.no_denoms_available')}</p>`}</div>
              </section>
              <div class="payment-actions">
                ${mode === 'incoming' ? (effectiveAllocated > 0 ? `<button type="submit" class="btn-primary-soft">${t('pay.confirm_and_finalize')}</button>` : '') : ''}
                ${mode === 'outgoing' && validAmount && !applyDisabled ? `<button type="submit" class="btn-primary-soft">${t('pay.confirm_and_finalize')}</button>` : ''}
                <button type="button" id="payment-cancel-entry" class="btn-secondary-soft">${t('common.cancel')}</button>
              </div>
              ` : `
              <div class="payment-entry-grid">
                <label class="payment-amount-field">${t('pay.amount_label')}
                  <input id="payment-amount" class="payment-amount-input" type="text" inputmode="decimal" value="${app.paymentDraft.amountDisplay || ''}" autocomplete="off" />
                </label>
                <label>${t('pay.note_label')}
                  <input id="payment-note" type="text" maxlength="30" value="${app.paymentDraft.note}" />
                </label>
                <label>${t('pay.category_label')}
                  <select id="payment-category">${renderCategoryOptions(category)}</select>
                </label>
                ${app.paymentDraft.note.length >= 25 ? `<p class="muted note-limit-hint">${t('pay.note_limit', { count: app.paymentDraft.note.length, suffix: app.paymentDraft.note.length >= 30 ? t('pay.note_limit_reached') : '' })}</p>` : ''}
              </div>
              <div class="payment-divider" aria-hidden="true"></div>
              ${advancedDividerHtml}
              <section class="payment-breakdown-inline ${validAmount ? '' : 'disabled'}">
                ${validAmount ? `
                  ${insufficientOutgoing ? `
                    <div class="preview suggestion-danger">
                      <p class="status danger">${t('pay.insufficient_funds')}</p>
                      ${suggestionStatusHtml}
                    </div>
                  ` : `
                    ${!strategiesEnabled && mode === 'outgoing' ? `
                      <div class="preview suggestion-warn">
                        <p class="status warn">${t('pay.suggestions_off')}</p>
                      </div>
                      ${allocationPreviewHtml}
                      ${!showManualEditor ? `<div class="inline-actions"><button type="button" id="payment-edit-manual" class="btn-secondary-soft">${t('pay.edit_manually')}</button></div>` : ''}
                    ` : ''}
                    ${!strategiesEnabled && mode !== 'outgoing' ? `
                      ${allocationPreviewHtml}
                      ${!showManualEditor ? `<div class="inline-actions"><button type="button" id="payment-edit-manual" class="btn-secondary-soft">${t('pay.edit_manually')}</button></div>` : ''}
                    ` : ''}
    
                    ${strategiesEnabled ? `
                    ${noExactSuggestionState ? `
                      <div class="preview suggestion-warn">
                        ${suggestionStatusHtml}
                      </div>
                      ${allocationPreviewHtml}
                      <div class="inline-actions">
                        <button type="button" id="payment-edit-manual" class="btn-secondary-soft">${t('pay.edit_manually')}</button>
                      </div>
                    ` : `
                    <div class="preview ${suggestionToneClass}">
                      ${suggestedBreakdown.length > 0 ? breakdownHtml(wallet, suggestedBreakdown) : ''}
                      ${suggestionStatusHtml}
                      ${allocationPreviewHtml}
                      ${suggestionAvailable ? `<div class="inline-actions"><button type="button" id="payment-use-suggested" class="${usingSuggestion ? 'btn-primary-soft' : 'btn-secondary-soft'}">${mode === 'outgoing' ? (ctx?.status === 'EXACT_PAYABLE' ? t('pay.use_and_finalize') : t('pay.use_suggested')) : t('pay.use_and_finalize')}</button><button type="button" id="payment-edit-manual" class="btn-secondary-soft">${t('pay.edit_manually')}</button></div>` : ''}
                    </div>
                    `}
                    ` : ''}
                    ${showManualEditor ? `
                      ${showToggle ? `
                        <div class="segmented-control" role="tablist" aria-label="${t('cash.denomination_type')}">
                          <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="payment-bills">${t('cash.bills')}</button>
                          <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="payment-coins">${t('cash.coins')}</button>
                        </div>
                      ` : ''}
                      <div class="denom-list">${allocationRows || `<p class="muted">${t('pay.no_denoms_available_for_amount')}</p>`}</div>
                    ` : ''}
                    ${strategiesEnabled && !exactSuggestionState && !noExactSuggestionState && !coverSuggestionState ? '' : ''}
                  `}
                ` : `<p class="muted">${t('pay.enter_amount_to_allocate')}</p>`}
              </section>
              <div class="payment-actions">
                ${mode === 'incoming' && (app.paymentDraft.manualEntry || !suggestionAvailable) && !applyDisabled && validAmount
                  ? `<button type="submit" class="btn-primary-soft">${t('pay.finalize_incoming')}</button>`
                  : ''}
                ${mode === 'outgoing' && (app.paymentDraft.manualEntry || !suggestionAvailable) && !applyDisabled && validAmount
                  ? `<button type="submit" class="btn-primary-soft">${t('pay.confirm_and_finalize')}</button>`
                  : ''}
                ${hasDraftEntry ? `<button type="button" id="payment-cancel-entry" class="btn-secondary-soft">${t('common.cancel')}</button>` : ''}
              </div>
              `}
            </section>
          </form>
          `}
        </section>
      `;
      console.debug('[renderNewPayment] rendered payment form, includes category select');
    
      if (showWalletSelector) {
        bindWalletCards('pay-wallet', (walletId) => {
          if (walletId === app.paymentDraft.walletId) return;
          app.activeWalletId = walletId;
          app.paymentDraft.walletId = walletId;
          app.paymentDraft.amountInput = '';
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
          app.paymentDraft.category = 'uncategorized';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.paymentDraft.incomingEntryMode = null;
          app.pendingOutgoingChange = null;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          const wallet = app.state.wallets[walletId];
          if (wallet) {
            app.paymentDraft.mode = getWalletTotal(wallet) === 0 ? 'incoming' : 'outgoing';
          }
          render();
        });
        bindWalletReorder('pay-wallet');
    
        const addWalletCardBtn = document.querySelector('[data-wallet-selector="pay-wallet"][data-wallet-add="1"]');
        if (addWalletCardBtn) {
          addWalletCardBtn.addEventListener('click', async () => {
            await openCreateWalletModal();
          });
        }
      }
    
      const revertBtn = document.getElementById('revert-last-transaction');
      if (revertBtn) {
        revertBtn.addEventListener('click', async () => {
          const confirmed = await modalConfirm(t('pay.revert_confirm'));
          if (!confirmed) return;
          const summary = app.paymentSuccessSummary;
          if (!summary) return;
          const txIdx = app.state.transactions.findIndex((tx) => tx.wallet_id === summary.wallet_id && tx.created_at === summary.created_at);
          if (txIdx !== -1) {
            const tx = app.state.transactions[txIdx];
            const wallet = app.state.wallets[tx.wallet_id];
            if (wallet && tx.breakdown) {
              const direction = tx.type === 'incoming' ? -1 : 1;
              applyBreakdownToWallet(wallet, tx.breakdown, direction);
            }
            if (wallet && tx.change_breakdown) {
              applyBreakdownToWallet(wallet, tx.change_breakdown, -1);
            }
            app.state.transactions.splice(txIdx, 1);
          }
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          app.paymentDraft.amountInput = '';
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
          app.paymentDraft.category = 'uncategorized';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.paymentDraft.incomingEntryMode = null;
          app.pendingOutgoingChange = null;
          render();
        });
      }
      const newTransactionBtn = document.getElementById('new-transaction');
      if (newTransactionBtn) {
        newTransactionBtn.addEventListener('click', () => {
          app.paymentDraft.amountInput = '';
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
          app.paymentDraft.category = 'uncategorized';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.showAllDenoms = false;
          app.paymentDraft.incomingEntryMode = null;
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
        app.paymentDraft.incomingEntryMode = null;
        app.pendingOutgoingChange = null;
        rerenderPayment();
      };
      document.getElementById('mode-outgoing').addEventListener('click', () => {
        switchPaymentMode('outgoing');
      });
      document.getElementById('mode-incoming').addEventListener('click', () => {
        switchPaymentMode('incoming');
      });
    
    
            
      const paymentAmountEl = document.getElementById('payment-amount');
      if (paymentAmountEl) {
        paymentAmountEl.addEventListener('input', (e) => {
          const raw = e.target.value.replace(/[^0-9.,]/g, '');
          app.paymentDraft.amountInput = raw;
          const formatted = formatAmountDisplay(raw, wallet.currency);
          app.paymentDraft.amountDisplay = formatted;
          const cursorPos = e.target.selectionStart;
          const lenDiff = formatted.length - e.target.value.length;
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
            const newPos = Math.max(0, Math.min((cursorPos || 0) + lenDiff, amountInput.value.length));
            amountInput.setSelectionRange(newPos, newPos);
          }
        });
      }
    
      const paymentNoteEl = document.getElementById('payment-note');
      if (paymentNoteEl) {
        paymentNoteEl.addEventListener('input', (e) => {
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
      }
      const paymentCategoryEl = document.getElementById('payment-category');
      if (paymentCategoryEl) {
        paymentCategoryEl.addEventListener('change', (e) => {
          const next = PAYMENT_CATEGORIES.includes(e.target.value) ? e.target.value : 'uncategorized';
          app.paymentDraft.category = next;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          rerenderPayment();
        });
      }
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
                category,
                breakdown,
              };
              app.state.transactions.push(tx);
              setPaymentSuccess(tx);
              app.paymentDraft.note = '';
              app.paymentDraft.category = 'uncategorized';
              app.paymentDraft.amountInput = '';
              app.paymentDraft.allocation = {};
              app.paymentDraft.manualEntry = false;
              app.paymentDraft.startedAllocation = false;
              app.paymentDraft.incomingEntryMode = null;
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
      const paymentCancelEntry = document.getElementById('payment-cancel-entry');
      if (paymentCancelEntry) {
        paymentCancelEntry.addEventListener('click', () => {
          app.paymentDraft.amountInput = '';
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
          app.paymentDraft.category = 'uncategorized';
          app.paymentDraft.allocation = {};
          app.paymentDraft.manualEntry = false;
          app.paymentDraft.startedAllocation = false;
          app.paymentDraft.incomingEntryMode = null;
          app.pendingOutgoingChange = null;
          app.paymentSuccessMessage = '';
          app.paymentSuccessSummary = null;
          rerenderPayment();
        });
      }
      const budgetQuickSpendBtn = document.getElementById('budget-pay-quick-spend');
      if (budgetQuickSpendBtn) {
        budgetQuickSpendBtn.addEventListener('click', async () => {
          await startBudgetQuickSpendFlow(wallet.id);
        });
      }
      const budgetTransferBtn = document.getElementById('budget-pay-transfer');
      if (budgetTransferBtn) {
        budgetTransferBtn.addEventListener('click', async () => {
          await startBudgetTransferFlow(wallet.id);
        });
      }
      const budgetAdjustmentBtn = document.getElementById('budget-pay-adjustment');
      if (budgetAdjustmentBtn) {
        budgetAdjustmentBtn.addEventListener('click', async () => {
          await startBudgetAdjustmentFlow(wallet.id);
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
              category,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: manualChangeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.category = 'uncategorized';
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
          : t('pay.no_auto_suggestion');
        const changeAction = await showModal({
          title: t('pay.confirm_change_received'),
          message: `<strong>${t('pay.expected_change', { amount: '' }).replace(/:\s*$/, '')}:</strong> ${formatMoney(changeExpectedMinor, wallet.currency)}<br><strong>${t('pay.suggested_change')}:</strong><br>${suggestedLabel}`,
          actions: [
            { id: 'confirm_suggested', label: t('pay.confirm_suggested'), style: 'primary' },
            { id: 'manual_change', label: t('pay.enter_manually'), style: 'secondary' },
            { id: 'cancel', label: t('common.cancel'), style: 'secondary' },
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
              category,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: changeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.category = 'uncategorized';
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
              category,
              breakdown,
              change_expected_minor: changeExpectedMinor,
              change_received_minor: changeExpectedMinor,
              change_breakdown: manualChangeBreakdown,
            };
            app.state.transactions.push(tx);
            setPaymentSuccess(tx);
            app.paymentDraft.note = '';
            app.paymentDraft.category = 'uncategorized';
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
          category,
          breakdown,
        };
        app.state.transactions.push(tx);
        setPaymentSuccess(tx);
        app.paymentDraft.note = '';
        app.paymentDraft.category = 'uncategorized';
        app.paymentDraft.amountInput = '';
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        saveState();
        render();
      };
    
      document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const finalAmountMinor = manualDirect ? (mode === 'incoming' ? effectiveAllocated : amountMinor) : amountMinor;
        if (manualDirect) {
          if (mode === 'incoming' && effectiveAllocated <= 0) return;
          if (mode === 'outgoing' && finalAmountMinor === null) return;
        } else {
          if (finalAmountMinor === null) return;
          if (mode === 'outgoing' ? effectiveAllocated < finalAmountMinor : effectiveAllocated !== finalAmountMinor) return;
        }
        const breakdown = allocationToBreakdown(effectiveAllocation);
    
        if (mode === 'outgoing') {
          await handleOutgoingFinalize(breakdown, effectiveAllocated);
          return;
        }
    
        applyBreakdownToWallet(wallet, breakdown, 1);
        const tx = {
          id: uid('tx'),
          created_at: nowIso(),
          wallet_id: wallet.id,
          wallet_name: wallet.name,
          currency: wallet.currency,
          type: 'incoming',
          amount_minor: finalAmountMinor,
          delta_minor: finalAmountMinor,
          strategy: undefined,
          note: noteText,
          category,
          breakdown,
        };
        app.state.transactions.push(tx);
        setPaymentSuccess(tx);
        app.paymentDraft.note = '';
        app.paymentDraft.category = 'uncategorized';
        app.paymentDraft.amountInput = '';
        app.paymentDraft.allocation = {};
        app.paymentDraft.manualEntry = false;
        app.paymentDraft.startedAllocation = false;
        app.paymentDraft.incomingEntryMode = null;
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
    
      // Add wallet action event handler
      const payWalletActionsBtn = el.querySelector('[data-wallet-action="1"]');
      if (payWalletActionsBtn) {
        payWalletActionsBtn.addEventListener('click', async () => {
          const choice = await showModal({
            title: t('wallet.actions_title'),
            message: t('wallet.manage', { name: wallet.name }),
            showClose: true,
            actions: [
              { id: 'name', label: t('wallet.edit_name'), style: 'secondary' },
              { id: 'denoms', label: t('wallet.edit_denoms'), style: 'secondary' },
              { id: 'delete', label: t('wallet.delete'), style: 'danger' },
            ],
          });
          if (choice === 'name') {
            const name = await modalPrompt(t('wallet.new_name_prompt'), wallet.name, t('wallet.edit_name_title'), '', WALLET_NAME_MAX);
            if (!name) return;
            if (name.length > WALLET_NAME_MAX) {
              await modalAlert(t('wallet.name_too_long', { max: WALLET_NAME_MAX }));
              return;
            }
            wallet.name = name.trim();
            wallet.updated_at = nowIso();
            saveState();
            rerenderPayment();
            return;
          }
          if (choice === 'delete') {
            const ok = await modalConfirm(t('wallet.delete_confirm', { name: wallet.name }), t('wallet.delete_title'));
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
            rerenderPayment();
            return;
          }
          if (choice !== 'denoms') return;
          const ok = await showModal({
            title: t('wallet.edit_denoms_question'),
            message: t('wallet.edit_denoms_instead'),
            actions: [
              { id: 'edit', label: t('wallet.enter_edit_mode'), style: 'secondary' },
              { id: 'cancel', label: t('common.cancel'), style: 'secondary' },
            ],
          });
          if (ok !== 'edit') return;
          await warnIfDenomsStale(wallet);
          app.editMode = {
            walletId: wallet.id,
            snapshot: wallet.denominations.map((d) => ({ value_minor: d.value_minor, count: d.count })),
            draft: wallet.denominations.reduce((acc, d) => {
              acc[d.value_minor] = d.count;
              return acc;
            }, {}),
          };
          app.activeWalletId = wallet.id;
          app.activeTab = 'cash';
          render();
        });
      }
    }
    

    return renderPay();
  }

  global.KontanaPayUI = {
    renderPay: runPayRender,
  };
})(window);
