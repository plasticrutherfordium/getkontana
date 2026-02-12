(function attachKontanaImportExport(global) {
  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function cloneJsonLike(value) {
    if (Array.isArray(value)) return value.map((entry) => cloneJsonLike(entry));
    if (isPlainObject(value)) {
      const out = {};
      Object.keys(value).forEach((key) => {
        out[key] = cloneJsonLike(value[key]);
      });
      return out;
    }
    return value;
  }

  function normalizeSchemaVersion(value) {
    if (value == null) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Math.trunc(parsed);
  }

  function parseJsonText(text) {
    if (typeof text !== 'string') {
      return { ok: false, errors: ['Invalid import payload.'] };
    }
    if (!text.trim()) {
      return { ok: false, errors: ['The selected file is empty.'] };
    }
    try {
      const value = JSON.parse(text);
      if (!isPlainObject(value)) {
        return { ok: false, errors: ['JSON root must be an object.'] };
      }
      return { ok: true, value };
    } catch {
      return { ok: false, errors: ['Invalid JSON file.'] };
    }
  }

  function looksLikeV1(state) {
    if (!isPlainObject(state)) return false;
    if (normalizeSchemaVersion(state.schema_version) != null) return false;
    return Object.prototype.hasOwnProperty.call(state, 'wallets')
      || Object.prototype.hasOwnProperty.call(state, 'transactions')
      || Object.prototype.hasOwnProperty.call(state, 'settings')
      || Object.prototype.hasOwnProperty.call(state, 'wallet_order');
  }

  function detectImportVersion(state) {
    if (!isPlainObject(state)) {
      return { ok: false, version: 'unknown', errors: ['Import payload must be a JSON object.'] };
    }
    const schemaVersion = normalizeSchemaVersion(state.schema_version);
    if (schemaVersion === 2) {
      return { ok: true, version: 'v2' };
    }
    if (schemaVersion != null) {
      return {
        ok: false,
        version: 'unknown',
        errors: [`Unsupported schema_version: ${String(state.schema_version)}.`],
      };
    }
    if (looksLikeV1(state)) {
      return { ok: true, version: 'v1' };
    }
    return {
      ok: false,
      version: 'unknown',
      errors: ['Could not identify JSON schema. Expected v1 or v2 export format.'],
    };
  }

  function normalizeWalletMap(wallets) {
    if (isPlainObject(wallets)) {
      return cloneJsonLike(wallets);
    }
    if (!Array.isArray(wallets)) return {};
    const map = {};
    wallets.forEach((wallet) => {
      if (!isPlainObject(wallet)) return;
      if (typeof wallet.id !== 'string' || !wallet.id) return;
      map[wallet.id] = cloneJsonLike(wallet);
    });
    return map;
  }

  function normalizeWalletOrder(inputOrder, wallets) {
    const ids = Object.keys(wallets || {});
    const seen = new Set();
    const order = [];
    if (Array.isArray(inputOrder)) {
      inputOrder.forEach((id) => {
        if (typeof id !== 'string') return;
        if (!wallets[id]) return;
        if (seen.has(id)) return;
        seen.add(id);
        order.push(id);
      });
    }
    ids.forEach((id) => {
      if (seen.has(id)) return;
      seen.add(id);
      order.push(id);
    });
    return order;
  }

  function coerceToV2Candidate(state) {
    const source = isPlainObject(state) ? state : {};
    const wallets = normalizeWalletMap(source.wallets);
    const candidate = cloneJsonLike(source);
    candidate.schema_version = 2;
    candidate.settings = isPlainObject(source.settings) ? cloneJsonLike(source.settings) : {};
    candidate.wallets = wallets;
    candidate.wallet_order = normalizeWalletOrder(source.wallet_order, wallets);
    candidate.transactions = Array.isArray(source.transactions) ? cloneJsonLike(source.transactions) : [];
    candidate.checkins = Array.isArray(source.checkins) ? cloneJsonLike(source.checkins) : [];
    return candidate;
  }

  function validateV2Candidate(state) {
    const errors = [];
    if (!isPlainObject(state)) {
      return { ok: false, errors: ['State must be an object.'] };
    }
    if (normalizeSchemaVersion(state.schema_version) !== 2) {
      errors.push('schema_version must be 2.');
    }
    if (!isPlainObject(state.settings)) {
      errors.push('settings must be an object.');
    }
    if (!isPlainObject(state.wallets)) {
      errors.push('wallets must be an object keyed by id.');
    }
    if (!Array.isArray(state.wallet_order)) {
      errors.push('wallet_order must be an array.');
    }
    if (!Array.isArray(state.transactions)) {
      errors.push('transactions must be an array.');
    }
    if (!Array.isArray(state.checkins)) {
      errors.push('checkins must be an array.');
    }
    return { ok: errors.length === 0, errors };
  }

  function hasBudgetsOrEnvelopes(state) {
    if (!isPlainObject(state)) return false;
    const wallets = isPlainObject(state.wallets) ? state.wallets : {};
    return Object.values(wallets).some((wallet) => {
      if (!isPlainObject(wallet)) return false;
      if (!isPlainObject(wallet.budget)) return false;
      if (wallet.budget.enabled === true) return true;
      return Array.isArray(wallet.budget.envelopes) && wallet.budget.envelopes.length > 0;
    });
  }

  function buildPreview(state) {
    const wallets = isPlainObject(state?.wallets) ? state.wallets : {};
    const walletCount = Object.keys(wallets).length;
    const txCount = Array.isArray(state?.transactions) ? state.transactions.length : 0;
    const checkinsCount = Array.isArray(state?.checkins) ? state.checkins.length : 0;
    return {
      walletCount,
      txCount,
      checkinsCount,
      hasBudgetsOrEnvelopes: hasBudgetsOrEnvelopes(state),
    };
  }

  function makeImportedWalletId(baseId, existingIds) {
    const safeBase = typeof baseId === 'string' && baseId ? baseId : 'wallet';
    let nextId = `${safeBase}-imported`;
    let idx = 2;
    while (existingIds.has(nextId)) {
      nextId = `${safeBase}-imported-${idx}`;
      idx += 1;
    }
    return nextId;
  }

  function buildWalletMergePlan(currentWallets, importedWallets) {
    const mergedWallets = cloneJsonLike(currentWallets || {});
    const existingIds = new Set(Object.keys(mergedWallets));
    const importedIdMap = {};
    const collisions = [];

    Object.keys(importedWallets || {}).forEach((walletId) => {
      const wallet = importedWallets[walletId];
      if (!isPlainObject(wallet)) return;

      if (!existingIds.has(walletId)) {
        mergedWallets[walletId] = cloneJsonLike(wallet);
        existingIds.add(walletId);
        importedIdMap[walletId] = walletId;
        return;
      }

      collisions.push(walletId);
      const nextId = makeImportedWalletId(walletId, existingIds);
      const cloned = cloneJsonLike(wallet);
      cloned.id = nextId;
      mergedWallets[nextId] = cloned;
      existingIds.add(nextId);
      importedIdMap[walletId] = nextId;
    });

    return { mergedWallets, importedIdMap, collisions };
  }

  function remapImportedWalletOrder(order, idMap) {
    if (!Array.isArray(order)) return [];
    const seen = new Set();
    const remapped = [];
    order.forEach((id) => {
      if (typeof id !== 'string') return;
      const mapped = idMap[id];
      if (typeof mapped !== 'string' || !mapped) return;
      if (seen.has(mapped)) return;
      seen.add(mapped);
      remapped.push(mapped);
    });
    return remapped;
  }

  function remapImportedRowsWalletId(rows, idMap) {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const cloned = cloneJsonLike(row);
      if (!isPlainObject(cloned)) return cloned;
      if (typeof cloned.wallet_id === 'string' && idMap[cloned.wallet_id]) {
        cloned.wallet_id = idMap[cloned.wallet_id];
      }
      return cloned;
    });
  }

  function dedupeRowsById(existingRows, importedRows) {
    const result = [];
    const seen = new Set();
    const append = (row) => {
      const cloned = cloneJsonLike(row);
      const id = typeof cloned?.id === 'string' ? cloned.id : '';
      if (id) {
        if (seen.has(id)) return;
        seen.add(id);
      }
      result.push(cloned);
    };
    (Array.isArray(existingRows) ? existingRows : []).forEach(append);
    (Array.isArray(importedRows) ? importedRows : []).forEach(append);
    return result;
  }

  function chooseMergedSettings(currentState, importedState) {
    const currentVersion = normalizeSchemaVersion(currentState?.schema_version) || 1;
    const importedVersion = normalizeSchemaVersion(importedState?.schema_version) || 1;
    if (importedVersion > currentVersion && isPlainObject(importedState?.settings)) {
      return cloneJsonLike(importedState.settings);
    }
    if (isPlainObject(currentState?.settings)) {
      return cloneJsonLike(currentState.settings);
    }
    return {};
  }

  function mergeStates(currentState, importedState) {
    const current = coerceToV2Candidate(currentState);
    const imported = coerceToV2Candidate(importedState);
    const walletPlan = buildWalletMergePlan(current.wallets, imported.wallets);
    const importedOrder = remapImportedWalletOrder(imported.wallet_order, walletPlan.importedIdMap);
    const remappedImportedTx = remapImportedRowsWalletId(imported.transactions, walletPlan.importedIdMap);
    const remappedImportedCheckins = remapImportedRowsWalletId(imported.checkins, walletPlan.importedIdMap);

    return {
      ...current,
      schema_version: 2,
      settings: chooseMergedSettings(current, imported),
      wallets: walletPlan.mergedWallets,
      wallet_order: normalizeWalletOrder(
        [...(current.wallet_order || []), ...importedOrder],
        walletPlan.mergedWallets,
      ),
      transactions: dedupeRowsById(current.transactions, remappedImportedTx),
      checkins: dedupeRowsById(current.checkins, remappedImportedCheckins),
    };
  }

  function getWalletIdCollisions(currentState, importedState) {
    const current = coerceToV2Candidate(currentState);
    const imported = coerceToV2Candidate(importedState);
    const walletPlan = buildWalletMergePlan(current.wallets, imported.wallets);
    return walletPlan.collisions;
  }

  global.KontanaImportExport = {
    parseJsonText,
    detectImportVersion,
    coerceToV2Candidate,
    validateV2Candidate,
    buildPreview,
    mergeStates,
    getWalletIdCollisions,
  };
}(window));
