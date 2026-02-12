(function attachKontanaMigrate(global) {
  const LATEST_SCHEMA_VERSION = 2;
  const ZERO_DECIMAL_CURRENCIES = new Set([
    'CLP', 'SEK', 'HUF', 'NOK', 'ARS', 'JPY', 'KRW', 'XOF',
    'VND', 'UYU', 'ISK', 'BIF', 'DJF', 'GNF', 'KPW', 'LAK',
    'MGA', 'MMK', 'PGK', 'RWF', 'SLL', 'SOS', 'TZS', 'UZS',
    'XAF', 'CDF', 'GYD', 'IRR', 'IQD', 'KES', 'LRD', 'MKD',
    'YER', 'SSP', 'SYP', 'COP', 'IDR', 'PKR',
  ]);
  const DEFAULT_SETTINGS_BUDGET = {
    default_cadence: 'weekly',
    week_start: 'mon',
    drift_alerts: {
      enabled: true,
      abs_minor: 2000,
      pct: 0.1,
    },
    default_tracking_level: 'big_only',
    default_big_spend_threshold_minor: 2000,
  };

  function normalizeSchemaVersion(value) {
    if (value == null) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Math.trunc(parsed);
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function cloneJsonLike(value) {
    if (Array.isArray(value)) return value.map((entry) => cloneJsonLike(entry));
    if (isPlainObject(value)) {
      const output = {};
      Object.keys(value).forEach((key) => {
        output[key] = cloneJsonLike(value[key]);
      });
      return output;
    }
    return value;
  }

  function toNonNegativeInt(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    if (parsed <= 0) return 0;
    return Math.trunc(parsed);
  }

  function getMinorScale(currency) {
    return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
  }

  function parseMajorTokenToMinor(token, scale) {
    const raw = String(token || '').trim();
    if (!raw) return null;
    const m = raw.match(/^(\d+)(?:[.,](\d+))?$/);
    if (!m) return null;
    const whole = Number(m[1]);
    if (!Number.isFinite(whole) || whole < 0) return null;
    const frac = m[2] || '';
    if (scale === 1) {
      if (frac.length > 0) return null;
      return whole;
    }
    if (frac.length > 2) return null;
    const fracMinor = Number((frac + '00').slice(0, 2));
    if (!Number.isFinite(fracMinor) || fracMinor < 0) return null;
    return (whole * scale) + fracMinor;
  }

  function deriveBalanceFromDenominations(wallet) {
    if (!isPlainObject(wallet)) return 0;
    const scale = getMinorScale(wallet.currency);
    let total = 0;

    if (Array.isArray(wallet.denominations)) {
      wallet.denominations.forEach((row) => {
        if (!isPlainObject(row)) return;
        let valueMinor = toNonNegativeInt(row.value_minor);
        if (valueMinor === 0 && row.value != null) {
          valueMinor = toNonNegativeInt(parseMajorTokenToMinor(row.value, scale));
        }
        const count = toNonNegativeInt(row.count);
        total += valueMinor * count;
      });
    }

    if (Array.isArray(wallet.denoms)) {
      wallet.denoms.forEach((row) => {
        if (!isPlainObject(row)) return;
        const valueMinor = toNonNegativeInt(
          row.value_minor != null ? row.value_minor : parseMajorTokenToMinor(row.value, scale),
        );
        const count = toNonNegativeInt(row.count);
        total += valueMinor * count;
      });
    } else if (isPlainObject(wallet.denoms)) {
      Object.keys(wallet.denoms).forEach((token) => {
        const count = toNonNegativeInt(wallet.denoms[token]);
        const valueMinor = toNonNegativeInt(parseMajorTokenToMinor(token, scale));
        total += valueMinor * count;
      });
    }

    return toNonNegativeInt(total);
  }

  function buildSettingsBudget(existingBudget) {
    const source = isPlainObject(existingBudget) ? existingBudget : {};
    return {
      ...DEFAULT_SETTINGS_BUDGET,
      ...source,
      drift_alerts: {
        ...DEFAULT_SETTINGS_BUDGET.drift_alerts,
        ...(isPlainObject(source.drift_alerts) ? source.drift_alerts : {}),
      },
    };
  }

  function buildWalletBudget(existingBudget, settingsBudget) {
    const source = isPlainObject(existingBudget) ? existingBudget : {};
    const cadence = typeof settingsBudget.default_cadence === 'string'
      ? settingsBudget.default_cadence
      : DEFAULT_SETTINGS_BUDGET.default_cadence;
    const weekStart = typeof settingsBudget.week_start === 'string'
      ? settingsBudget.week_start
      : DEFAULT_SETTINGS_BUDGET.week_start;
    const periodAnchor = isPlainObject(source.period_anchor) ? source.period_anchor : {};
    return {
      enabled: false,
      cadence,
      envelopes: [],
      period_anchor: { week_start: weekStart },
      ...source,
      envelopes: Array.isArray(source.envelopes) ? source.envelopes : [],
      period_anchor: {
        week_start: weekStart,
        ...periodAnchor,
      },
    };
  }

  function migrateV1toV2(stateV1) {
    if (!isPlainObject(stateV1)) {
      throw new Error('Cannot migrate non-object state');
    }

    const stateV2 = cloneJsonLike(stateV1);
    const settingsSource = isPlainObject(stateV2.settings) ? stateV2.settings : {};
    const settingsBudget = buildSettingsBudget(settingsSource.budget);

    stateV2.schema_version = 2;
    stateV2.settings = {
      ...settingsSource,
      app_mode: 'precise',
      budget: settingsBudget,
    };
    stateV2.checkins = Array.isArray(stateV2.checkins) ? stateV2.checkins : [];

    if (Array.isArray(stateV2.wallets)) {
      stateV2.wallets = stateV2.wallets.map((wallet) => {
        if (!isPlainObject(wallet)) return wallet;
        return {
          ...wallet,
          balance_minor: deriveBalanceFromDenominations(wallet),
          count_mode: 'denoms',
          budget: buildWalletBudget(wallet.budget, settingsBudget),
        };
      });
    } else if (isPlainObject(stateV2.wallets)) {
      Object.keys(stateV2.wallets).forEach((walletId) => {
        const wallet = stateV2.wallets[walletId];
        if (!isPlainObject(wallet)) return;
        stateV2.wallets[walletId] = {
          ...wallet,
          balance_minor: deriveBalanceFromDenominations(wallet),
          count_mode: 'denoms',
          budget: buildWalletBudget(wallet.budget, settingsBudget),
        };
      });
    }

    return stateV2;
  }

  function migrateToLatest(state, options = {}) {
    const latestVersion = normalizeSchemaVersion(options.latestVersion) || LATEST_SCHEMA_VERSION;
    if (!isPlainObject(state)) {
      throw new Error('Cannot migrate non-object state');
    }
    const schemaVersion = normalizeSchemaVersion(state.schema_version);
    let current = state;
    let currentVersion = (schemaVersion == null || schemaVersion < 1) ? 1 : schemaVersion;

    while (currentVersion < latestVersion) {
      if (currentVersion === 1) {
        current = migrateV1toV2(current);
        currentVersion = 2;
      } else {
        throw new Error(`No migration path from schema ${currentVersion} to ${latestVersion}`);
      }
    }

    return current;
  }

  function migrateIfNeeded(state, options = {}) {
    const latestVersion = normalizeSchemaVersion(options.latestVersion) || LATEST_SCHEMA_VERSION;
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return { needsMigration: false, state };
    }
    const schemaVersion = normalizeSchemaVersion(state.schema_version);
    if (schemaVersion == null) {
      return { needsMigration: true, from: 1, to: latestVersion, state };
    }
    if (schemaVersion < latestVersion) {
      return { needsMigration: true, from: schemaVersion, to: latestVersion, state };
    }
    if (schemaVersion > latestVersion) {
      return { needsMigration: false, appTooOld: true, from: schemaVersion, to: latestVersion, state };
    }
    return { needsMigration: false, state };
  }

  global.KontanaMigrate = {
    LATEST_SCHEMA_VERSION,
    migrateIfNeeded,
    migrateToLatest,
    migrateV1toV2,
  };
}(window));
