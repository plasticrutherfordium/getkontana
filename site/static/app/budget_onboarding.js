(function attachKontanaBudgetOnboarding(global) {
  const TEMPLATE_ENVELOPES = ['Food', 'Transport', 'Bills', 'Fun', 'Savings', 'Misc'];
  const VALID_CADENCE = new Set(['weekly', 'fortnightly', 'monthly']);
  const VALID_TRACKING_LEVEL = new Set(['none', 'big_only', 'all']);

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function toNonNegativeInt(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return Math.trunc(parsed);
  }

  function sanitizeEnvelopeName(name) {
    return String(name || '').trim();
  }

  function normalizeCadence(value, fallback = 'weekly') {
    if (VALID_CADENCE.has(value)) return value;
    return fallback;
  }

  function normalizeTrackingLevel(value, fallback = 'big_only') {
    if (VALID_TRACKING_LEVEL.has(value)) return value;
    return fallback;
  }

  function makeEnvelopeId(generateId) {
    if (typeof generateId === 'function') {
      const generated = String(generateId() || '').trim();
      if (generated) return generated;
    }
    return `env_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  }

  function parseTargetMinor(targetInput, options = {}) {
    const text = String(targetInput == null ? '' : targetInput).trim();
    if (!text) return { ok: true, value: 0 };

    const moneyHelper = options.moneyHelper || global.KontanaMoney;
    if (!moneyHelper || typeof moneyHelper.toMinor !== 'function') {
      return { ok: false, error: 'money_helper_unavailable' };
    }

    try {
      const parsed = moneyHelper.toMinor(text, { currency: options.currency });
      if (!Number.isFinite(parsed) || parsed < 0) {
        return { ok: false, error: 'invalid_target' };
      }
      return { ok: true, value: Math.trunc(parsed) };
    } catch {
      return { ok: false, error: 'invalid_target' };
    }
  }

  function validateEnvelopeInput(input, options = {}) {
    const name = sanitizeEnvelopeName(input?.name);
    if (!name) {
      return { ok: false, error: 'name_required' };
    }

    const parsedTarget = parseTargetMinor(input?.targetInput, options);
    if (!parsedTarget.ok) {
      return { ok: false, error: parsedTarget.error };
    }

    return {
      ok: true,
      value: {
        name,
        target_minor: parsedTarget.value,
      },
    };
  }

  function normalizeEnvelopeRows(rows, options = {}) {
    const inputRows = Array.isArray(rows) ? rows : [];
    const generateId = options.generateId;
    const trackingLevel = normalizeTrackingLevel(options.trackingLevel, 'big_only');
    const bigSpendThresholdMinor = toNonNegativeInt(options.bigSpendThresholdMinor, 2000);

    return inputRows
      .filter((row) => isPlainObject(row))
      .map((row) => {
        const name = sanitizeEnvelopeName(row.name);
        if (!name) return null;
        return {
          id: typeof row.id === 'string' && row.id ? row.id : makeEnvelopeId(generateId),
          name,
          target_minor: toNonNegativeInt(row.target_minor, 0),
          tracking_level: trackingLevel,
          big_spend_threshold_minor: bigSpendThresholdMinor,
        };
      })
      .filter(Boolean);
  }

  function buildWalletBudget(existingBudget, options = {}) {
    const source = isPlainObject(existingBudget) ? existingBudget : {};
    const periodAnchor = isPlainObject(source.period_anchor) ? source.period_anchor : {};
    const cadence = normalizeCadence(options.cadence, normalizeCadence(source.cadence, 'weekly'));
    const weekStart = typeof options.weekStart === 'string' && options.weekStart
      ? options.weekStart
      : (typeof periodAnchor.week_start === 'string' && periodAnchor.week_start ? periodAnchor.week_start : 'mon');
    const trackingLevel = normalizeTrackingLevel(options.trackingLevel, 'big_only');
    const bigSpendThresholdMinor = toNonNegativeInt(options.bigSpendThresholdMinor, 2000);
    const envelopes = normalizeEnvelopeRows(options.envelopes, {
      trackingLevel,
      bigSpendThresholdMinor,
      generateId: options.generateId,
    });

    return {
      ...source,
      enabled: true,
      cadence,
      envelopes,
      period_anchor: {
        ...periodAnchor,
        week_start: weekStart,
      },
    };
  }

  global.KontanaBudgetOnboarding = {
    TEMPLATE_ENVELOPES,
    normalizeCadence,
    normalizeTrackingLevel,
    parseTargetMinor,
    validateEnvelopeInput,
    buildWalletBudget,
    makeEnvelopeId,
  };
}(window));
