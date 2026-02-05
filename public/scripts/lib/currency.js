const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'SEK', 'HUF', 'NOK', 'ARS', 'JPY', 'KRW', 'XOF']);

const CURRENCY_DENOMINATIONS_MAJOR = {
  EUR: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  USD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  GBP: [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  CLP: [20000, 10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  SEK: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  CHF: [1000, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  HUF: [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5],
  DKK: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  NOK: [1000, 500, 200, 100, 50, 20, 10, 5, 1],
  PLN: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  CAD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  ARS: [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  PEN: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  BRL: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  MXN: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  CZK: [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  RON: [500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.1, 0.05, 0.01],
  CNY: [100, 50, 20, 10, 5, 1, 0.5, 0.1],
  JPY: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  INR: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  SGD: [1000, 100, 50, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  KRW: [50000, 10000, 5000, 1000, 500, 100, 50, 10],
  EGP: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25],
  ZAR: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  NGN: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  XOF: [10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5, 1],
  AUD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  NZD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
};

const CURRENCY_NOTE_VALUES_MAJOR = {
  EUR: [500, 200, 100, 50, 20, 10, 5],
  USD: [100, 50, 20, 10, 5, 2, 1],
  GBP: [50, 20, 10, 5],
  CLP: [20000, 10000, 5000, 2000, 1000],
  SEK: [1000, 500, 200, 100, 50, 20],
  CHF: [1000, 200, 100, 50, 20, 10],
  HUF: [20000, 10000, 5000, 2000, 1000, 500],
  DKK: [1000, 500, 200, 100, 50],
  NOK: [1000, 500, 200, 100, 50],
  PLN: [500, 200, 100, 50, 20, 10],
  CAD: [100, 50, 20, 10, 5],
  ARS: [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20],
  PEN: [200, 100, 50, 20, 10],
  BRL: [200, 100, 50, 20, 10, 5, 2],
  MXN: [1000, 500, 200, 100, 50, 20],
  CZK: [5000, 2000, 1000, 500, 200, 100],
  RON: [500, 200, 100, 50, 20, 10, 5, 1],
  CNY: [100, 50, 20, 10, 5, 1],
  JPY: [10000, 5000, 2000, 1000],
  INR: [500, 200, 100, 50, 20, 10],
  SGD: [1000, 100, 50, 10, 5, 2],
  KRW: [50000, 10000, 5000, 1000],
  EGP: [200, 100, 50, 20, 10, 5, 1],
  ZAR: [200, 100, 50, 20, 10],
  NGN: [1000, 500, 200, 100, 50, 20, 10, 5],
  XOF: [10000, 5000, 2000, 1000, 500],
  AUD: [100, 50, 20, 10, 5],
  NZD: [100, 50, 20, 10, 5],
};

function getMinorScale(currency) {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
}

function getCurrencyDenominations(currency) {
  const majorValues = CURRENCY_DENOMINATIONS_MAJOR[currency] || [];
  const scale = getMinorScale(currency);
  const noteValues = new Set((CURRENCY_NOTE_VALUES_MAJOR[currency] || []).map((value) => Math.round(value * scale)));
  return majorValues.map((major) => {
    const valueMinor = Math.round(major * scale);
    return {
      value_minor: valueMinor,
      label: String(major),
      type: noteValues.has(valueMinor) ? 'note' : 'coin',
    };
  });
}

function defaultDenominations(currency) {
  return getCurrencyDenominations(currency).map((d) => ({ ...d, count: 0 }));
}

export {
  ZERO_DECIMAL_CURRENCIES,
  CURRENCY_DENOMINATIONS_MAJOR,
  CURRENCY_NOTE_VALUES_MAJOR,
  getMinorScale,
  getCurrencyDenominations,
  defaultDenominations,
};
