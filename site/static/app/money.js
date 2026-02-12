(function attachKontanaMoney(global) {
  const ZERO_DECIMAL_CURRENCIES = new Set([
    'CLP', 'SEK', 'HUF', 'NOK', 'ARS', 'JPY', 'KRW', 'XOF',
    'VND', 'UYU', 'ISK', 'BIF', 'DJF', 'GNF', 'KPW', 'LAK',
    'MGA', 'MMK', 'PGK', 'RWF', 'SLL', 'SOS', 'TZS', 'UZS',
    'XAF', 'CDF', 'GYD', 'IRR', 'IQD', 'KES', 'LRD', 'MKD',
    'YER', 'SSP', 'SYP', 'COP', 'IDR', 'PKR',
  ]);

  function getMinorScale(currency) {
    return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
  }

  function parseMajorToMinor(value, scale = 100) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError('Money input must be a string or number');
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new TypeError('Money input must be finite');
    }

    const raw = String(value).trim();
    if (!raw) throw new TypeError('Money input is empty');

    const sign = raw.startsWith('-') ? -1 : 1;
    const unsignedRaw = raw.replace(/^[+-]/, '');
    const cleaned = unsignedRaw.replace(/[^0-9.,]/g, '');
    if (!cleaned) throw new TypeError('Money input is invalid');

    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    const decimalIdx = Math.max(lastDot, lastComma);
    const hasDecimal = decimalIdx >= 0;

    const intPartRaw = hasDecimal ? cleaned.slice(0, decimalIdx) : cleaned;
    const fracPartRaw = hasDecimal ? cleaned.slice(decimalIdx + 1) : '';
    const intDigits = intPartRaw.replace(/[.,]/g, '');
    const fracDigits = fracPartRaw.replace(/[.,]/g, '');

    if (!intDigits && !fracDigits) throw new TypeError('Money input is invalid');
    if (scale === 1 && fracDigits.length > 0) throw new TypeError('Fractional values are not valid for this currency');
    if (scale === 100 && fracDigits.length > 2) throw new TypeError('Too many decimal places');

    const whole = Number(intDigits || '0');
    const frac = scale === 1 ? 0 : Number((fracDigits + '00').slice(0, 2));
    if (!Number.isFinite(whole) || !Number.isFinite(frac)) {
      throw new TypeError('Money input is invalid');
    }

    return sign * ((whole * scale) + frac);
  }

  function resolveScaleFromOptions(options) {
    if (typeof options === 'string') {
      return getMinorScale(options);
    }
    if (options && typeof options === 'object') {
      if (Number.isFinite(options.scale)) {
        const explicitScale = Math.trunc(Number(options.scale));
        if (explicitScale === 1 || explicitScale === 100) return explicitScale;
        throw new TypeError('Unsupported minor scale');
      }
      if (typeof options.currency === 'string' && options.currency) {
        return getMinorScale(options.currency);
      }
    }
    return 100;
  }

  function toMinor(inputStringOrNumber, options = {}) {
    const scale = resolveScaleFromOptions(options);
    return parseMajorToMinor(inputStringOrNumber, scale);
  }

  function fromMinor(minorInt, options = {}) {
    const parsedMinor = Number(minorInt);
    if (!Number.isFinite(parsedMinor)) {
      throw new TypeError('minorInt must be finite');
    }
    const minor = Math.trunc(parsedMinor);
    const currency = String(options.currency || 'USD');
    const showCents = Boolean(options.showCents);
    const scale = Number.isFinite(options.scale) ? Number(options.scale) : getMinorScale(currency);
    const symbol = String(options.symbol || currency);
    const locale = options.locale || undefined;
    const amount = minor / scale;
    const sign = amount < 0 ? '-' : '';
    const absMinor = Math.abs(minor);

    if (scale === 1) {
      const num = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.abs(amount));
      return `${sign}${symbol}${num}`;
    }

    const hasCents = absMinor % scale !== 0;
    const digits = (showCents || hasCents) ? 2 : 0;
    const num = new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Math.abs(amount));
    return `${sign}${symbol}${num}`;
  }

  function sumDenomsToMinor(denoms, currency) {
    const scale = getMinorScale(currency);
    let total = 0;

    if (Array.isArray(denoms)) {
      denoms.forEach((row) => {
        if (!row || typeof row !== 'object') return;
        const count = Math.max(0, Math.trunc(Number(row.count) || 0));
        let valueMinor = Number(row.value_minor);
        if (!Number.isFinite(valueMinor) && row.value != null) {
          try {
            valueMinor = parseMajorToMinor(row.value, scale);
          } catch {
            valueMinor = 0;
          }
        }
        if (!Number.isFinite(valueMinor)) valueMinor = 0;
        total += Math.trunc(valueMinor) * count;
      });
      return Math.trunc(total);
    }

    if (denoms && typeof denoms === 'object') {
      Object.keys(denoms).forEach((token) => {
        const count = Math.max(0, Math.trunc(Number(denoms[token]) || 0));
        let valueMinor = 0;
        try {
          valueMinor = parseMajorToMinor(token, scale);
        } catch {
          valueMinor = 0;
        }
        total += valueMinor * count;
      });
      return Math.trunc(total);
    }

    return 0;
  }

  global.KontanaMoney = {
    toMinor,
    fromMinor,
    sumDenomsToMinor,
  };
}(window));
