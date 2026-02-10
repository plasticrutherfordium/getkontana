const APP_VERSION = '0.0.1';
const ZERO_DECIMAL_CURRENCIES = new Set([
  'CLP', 'SEK', 'HUF', 'NOK', 'ARS', 'JPY', 'KRW', 'XOF',
  'VND', 'UYU', 'ISK', 'BIF', 'DJF', 'GNF', 'KPW', 'LAK',
  'MGA', 'MMK', 'PGK', 'RWF', 'SLL', 'SOS', 'TZS', 'UZS',
  'XAF', 'CDF', 'GYD', 'IRR', 'IQD', 'KES', 'LRD', 'MKD',
  'YER', 'SSP', 'SYP', 'COP', 'IDR', 'PKR',
]);

const CURRENCY_SYMBOLS = {
  EUR: '€', USD: '$', GBP: '£', CLP: '$', SEK: 'kr', CHF: 'CHF',
  HUF: 'Ft', DKK: 'kr', NOK: 'kr', PLN: 'zł', CAD: '$',
  ARS: '$', PEN: 'S/', BRL: 'R$', MXN: '$',
  CZK: 'Kč', RON: 'lei', CNY: '¥', JPY: '¥', INR: '₹',
  SGD: 'S$', KRW: '₩', EGP: '£', ZAR: 'R', NGN: '₦',
  XOF: 'CFA', AUD: '$', NZD: '$', ILS: '₪', TRY: '₺',
  VND: '₫', UYU: '$', MAD: 'DH', MVR: 'Rf', NAD: 'N$',
  NPR: 'रू', PGK: 'K', PHP: '₱', PKR: '₨', QAR: 'QR',
  RUB: '₽', MGA: 'Ar', RWF: 'FRw', SCR: 'SR', SLL: 'Le',
  SOS: 'Sh', SRD: 'Sr$', SSP: 'SS£', STN: 'Db', SYP: 'LS',
  THB: '฿', TJS: 'SM', TOP: 'T$', TND: 'DT', TTD: 'TT$',
  TWD: 'NT$', TZS: 'TSh', UAH: '₴', UZS: 'soʻm', VES: 'Bs.',
  WST: 'WS$', YER: '﷼', KPW: '₩', LYD: 'LD', BSD: 'B$',
  AED: 'Dh', AMD: '֏',
  AOA: 'Kz', ALL: 'L', AZN: '₼', BHD: 'BD', BIF: 'FBu',
  BND: 'B$', COP: '$', CRC: '₡', CUP: '$', GEL: '₾',
  HKD: 'HK$', HNL: 'L', IDR: 'Rp', JOD: 'JD', KES: 'KSh',
  IQD: 'ع.د', ISK: 'kr', JMD: 'J$', IRR: '﷼', XAF: 'FCFA',
  BWP: 'P', DJF: 'Fdj', DZD: 'د.ج', ETB: 'Br', GMD: 'D',
  GHS: 'GH₵', GNF: 'FG', GYD: 'G$', CDF: 'FC', KWD: 'KD',
  LAK: '₭', LRD: 'L$', MKD: 'ден', MMK: 'K', MRU: 'UM',
  MUR: '₨',
};

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
  PLN: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  CAD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  ARS: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  PEN: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  BRL: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  MXN: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  CZK: [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  RON: [500, 200, 100, 50, 10, 5, 1, 0.5, 0.1, 0.05, 0.01],
  CNY: [100, 50, 20, 10, 5, 1, 0.5, 0.1],
  JPY: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  INR: [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  SGD: [10000, 1000, 100, 50, 25, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01],
  KRW: [50000, 10000, 5000, 1000, 500, 100, 50, 10, 1],
  EGP: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.01],
  ZAR: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  NGN: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  XOF: [10000, 5000, 2500, 1000, 500, 200, 100, 50, 25, 10, 5, 2, 1],
  AUD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  NZD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  ILS: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.1],
  TRY: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  VND: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  UYU: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  MAD: [200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  MVR: [500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
  NAD: [200, 100, 50, 30, 20, 10, 5, 1, 0.5, 0.1, 0.05],
  NPR: [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  PGK: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  PHP: [1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.25, 0.1, 0.05, 0.01],
  PKR: [5000, 1000, 500, 100, 50, 20, 10, 50, 20, 10, 5, 2, 1],
  QAR: [500, 200, 100, 50, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  RUB: [5000, 1000, 500, 200, 100, 50, 10, 5, 2, 1],
  MGA: [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 4, 2, 1],
  RWF: [5000, 2000, 1000, 500, 100, 50, 20, 10, 5, 2, 1],
  SCR: [500, 100, 50, 25, 10, 5, 1, 0.25, 0.1, 0.05, 0.01],
  SLL: [10000, 5000, 2000, 1000, 500, 100, 50],
  SOS: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  SRD: [500, 200, 100, 50, 20, 10, 5, 2.5, 1, 0.25, 0.1, 0.05, 0.01],
  SSP: [1000, 500, 100, 50, 25, 20, 10, 5, 1, 2, 1, 0.5, 0.2, 0.1],
  STN: [200, 100, 50, 20, 10, 5],
  SYP: [5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5, 2, 1],
  THB: [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
  TJS: [500, 200, 100, 50, 20, 10, 5, 3, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  TOP: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  TND: [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  TTD: [100, 50, 20, 10, 5, 1, 0.25, 0.1, 0.05],
  TWD: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 1],
  TZS: [10000, 5000, 2000, 1000, 500, 200, 100, 50],
  UAH: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.1],
  UZS: [200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50],
  VES: [500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.25, 0.125, 0.1, 0.05, 0.01],
  WST: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  YER: [1000, 500, 250, 200, 100, 50, 20, 10, 5, 1],
  KPW: [5000, 2000, 1000, 500, 200, 100, 50, 10, 5, 1, 0.1, 0.05, 0.01],
  LYD: [50, 20, 10, 5, 1, 0.5, 0.25, 1, 0.5, 0.25, 0.1, 0.05],
  BSD: [100, 50, 20, 10, 5, 3, 1, 0.25, 0.15, 0.1, 0.05],
  AED: [1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  AMD: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 3, 1, 0.5, 0.2, 0.1],
  HKD: [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
  AOA: [200, 100, 50, 20, 10, 5, 2, 1, 0.5],
  ALL: [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 1],
  AZN: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.2, 0.1, 0.05, 0.03, 0.01],
  BHD: [20, 10, 5, 1, 0.5, 0.1, 0.05, 0.025, 0.01, 0.005],
  BIF: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  BND: [10000, 1000, 500, 100, 50, 10, 5, 1, 0.5, 0.2, 0.1, 0.05, 0.01],
  COP: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50],
  CRC: [50000, 20000, 10000, 5000, 2000, 1000, 500, 100, 50, 25, 10, 5],
  CUP: [1000, 500, 200, 100, 50, 20, 10, 5, 3, 1, 0.2, 0.05, 0.02, 0.01],
  GEL: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  HNL: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  IDR: [100000, 75000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  JOD: [50, 20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01, 0.005],
  KES: [1000, 500, 200, 100, 50, 40, 20, 10, 5, 1],
  IQD: [50000, 25000, 10000, 5000, 1000, 500, 250, 100, 50, 25],
  ISK: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  JMD: [5000, 2000, 1000, 500, 100, 50, 20, 10, 5, 1],
  IRR: [1000000, 500000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 250, 100, 50],
  XAF: [10000, 5000, 2000, 1000, 500, 100, 50, 25, 10, 5, 2, 1],
  BWP: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
  DJF: [10000, 5000, 2000, 1000, 500, 250, 100, 50, 20, 10, 5, 2, 1],
  DZD: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  ETB: [200, 100, 50, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.01],
  GMD: [200, 100, 50, 25, 20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05],
  GHS: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01],
  GNF: [20000, 10000, 5000, 2000, 1000, 500, 100, 50, 25, 10, 5, 1],
  GYD: [5000, 1000, 500, 100, 20, 10, 5, 1],
  CDF: [20000, 10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5, 1],
  KWD: [20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05, 0.02, 0.01, 0.005],
  LAK: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100, 50, 20, 10],
  LRD: [500, 100, 50, 20, 10, 5, 1],
  MKD: [5000, 2000, 1000, 500, 200, 100, 50, 10, 5, 2, 1],
  MMK: [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5, 1],
  MRU: [200, 100, 50, 20, 10, 5, 2, 1, 0.2, 0.1, 0.05, 0.01],
  MUR: [2000, 1000, 500, 200, 100, 50, 25, 20, 10, 5, 1, 0.2, 0.05],
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
  PLN: [200, 100, 50, 20, 10],
  CAD: [100, 50, 20, 10, 5],
  ARS: [2000, 1000, 500, 200, 100, 50, 20, 10],
  PEN: [200, 100, 50, 20, 10],
  BRL: [100, 50, 20, 10, 5, 2],
  MXN: [1000, 500, 200, 100, 50, 20],
  CZK: [5000, 2000, 1000, 500, 200, 100],
  RON: [500, 200, 100, 50, 10, 5, 1],
  CNY: [100, 50, 20, 10, 5, 1],
  JPY: [10000, 5000, 2000, 1000],
  INR: [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  SGD: [10000, 1000, 100, 50, 25, 20, 10, 5, 2],
  KRW: [50000, 10000, 5000, 1000],
  EGP: [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25, 0.1, 0.05],
  ZAR: [200, 100, 50, 20, 10],
  NGN: [1000, 500, 200, 100, 50, 20, 10, 5],
  XOF: [10000, 5000, 2500, 1000, 500, 100, 50, 25, 10, 5],
  AUD: [100, 50, 20, 10, 5],
  NZD: [100, 50, 20, 10, 5],
  ILS: [200, 100, 50, 20],
  TRY: [200, 100, 50, 20, 10, 5],
  VND: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  UYU: [2000, 1000, 500, 200, 100, 50, 20],
  MAD: [200, 100, 50, 20],
  MVR: [500, 100, 50, 20, 10, 5],
  NAD: [200, 100, 50, 30, 20, 10],
  NPR: [1000, 500, 100, 50, 20, 10, 5, 2, 1],
  PGK: [100, 50, 20, 10, 5, 2],
  PHP: [1000, 500, 200, 100, 50, 20],
  PKR: [5000, 1000, 500, 100, 50, 20, 10],
  QAR: [500, 200, 100, 50, 10, 5, 1],
  RUB: [5000, 1000, 500, 200, 100, 50],
  MGA: [10000, 5000, 2000, 1000, 500, 200, 100],
  RWF: [5000, 2000, 1000, 500],
  SCR: [500, 100, 50, 25, 10],
  SLL: [10000, 5000, 2000, 1000, 500],
  SOS: [10000, 5000, 2000, 1000],
  SRD: [500, 200, 100, 50, 20, 10, 5],
  SSP: [1000, 500, 100, 50, 25, 20, 10, 5, 1],
  STN: [200, 100, 50, 20, 10, 5],
  SYP: [5000, 2000, 1000, 500, 200, 100, 50],
  THB: [1000, 500, 100, 50, 20],
  TJS: [500, 200, 100, 50, 20, 10, 5, 1],
  TOP: [100, 50, 20, 10, 5, 2],
  TND: [50, 20, 10, 5],
  TTD: [100, 50, 20, 10, 5, 1],
  TWD: [2000, 1000, 500, 200, 100],
  TZS: [10000, 5000, 2000, 1000, 500],
  UAH: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  UZS: [200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000],
  VES: [500, 200, 100, 50, 20, 10, 5],
  WST: [100, 50, 20, 10, 5],
  YER: [1000, 500, 250, 200, 100, 50],
  KPW: [5000, 2000, 1000, 500, 200, 100],
  LYD: [50, 20, 10, 5, 1],
  BSD: [100, 50, 20, 10, 5, 3, 1],
  AED: [1000, 500, 200, 100, 50, 20, 10, 5],
  AMD: [100000, 50000, 20000, 10000, 5000, 2000, 1000],
  HKD: [1000, 500, 100, 50, 20, 10],
  AOA: [200, 100, 50, 20, 10, 5, 2, 1],
  ALL: [5000, 2000, 1000, 500, 200],
  AZN: [200, 100, 50, 20, 10, 5, 1],
  BHD: [20, 10, 5, 1, 0.5],
  BIF: [10000, 5000, 2000, 1000, 500],
  BND: [10000, 1000, 500, 100, 50, 10, 5, 1],
  COP: [100000, 50000, 20000, 10000, 5000, 2000, 1000],
  CRC: [50000, 20000, 10000, 5000, 2000, 1000],
  CUP: [1000, 500, 200, 100, 50, 20, 10, 5, 3, 1],
  GEL: [200, 100, 50, 20, 10, 5],
  HNL: [500, 200, 100, 50, 20, 10, 5, 2, 1],
  IDR: [100000, 75000, 50000, 20000, 10000, 5000, 2000, 1000],
  JOD: [50, 20, 10, 5, 1],
  KES: [1000, 500, 200, 100, 50],
  IQD: [50000, 25000, 10000, 5000, 1000, 500, 250],
  ISK: [10000, 5000, 2000, 1000, 500],
  JMD: [5000, 2000, 1000, 500, 100, 50],
  IRR: [1000000, 500000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500],
  XAF: [10000, 5000, 2000, 1000, 500],
  BWP: [200, 100, 50, 20, 10],
  DJF: [10000, 5000, 2000, 1000],
  DZD: [2000, 1000, 500, 200, 100],
  ETB: [200, 100, 50, 10, 5, 1],
  GMD: [200, 100, 50, 25, 20, 10, 5],
  GHS: [200, 100, 50, 20, 10, 5, 2, 1],
  GNF: [20000, 10000, 5000, 2000, 1000, 500],
  GYD: [5000, 1000, 500, 100, 20],
  CDF: [20000, 10000, 5000, 1000, 500, 200, 100, 50],
  KWD: [20, 10, 5, 1, 0.5, 0.25],
  LAK: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500],
  LRD: [500, 100, 50, 20, 10, 5],
  MKD: [5000, 2000, 1000, 500, 200, 100],
  MMK: [10000, 5000, 1000, 500, 200, 100, 50],
  MRU: [200, 100, 50, 20],
  MUR: [2000, 1000, 500, 200, 100, 50, 25],
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

const ORDER_LARGEST_FIRST = 'largest_first';
const ORDER_SMALLEST_FIRST = 'smallest_first';

function orderDenoms(denoms, order) {
  const sorted = [...denoms].map((d, idx) => ({ ...d, _idx: idx }));
  sorted.sort((a, b) => {
    if (order === ORDER_SMALLEST_FIRST) return a.value_minor - b.value_minor || a._idx - b._idx;
    return b.value_minor - a.value_minor || a._idx - b._idx;
  });
  return sorted;
}

function lexPrefers(aCounts, bCounts) {
  for (let i = 0; i < aCounts.length; i += 1) {
    if (aCounts[i] !== bCounts[i]) {
      return aCounts[i] > bCounts[i];
    }
  }
  return false;
}

function varianceCost(counts) {
  const mean = counts.reduce((sum, c) => sum + c, 0) / (counts.length || 1);
  return counts.reduce((sum, c) => {
    const diff = c - mean;
    return sum + diff * diff;
  }, 0);
}

function remainingCounts(originalCounts, planCounts, direction) {
  if (direction === 'incoming') {
    return originalCounts.map((c, i) => c + planCounts[i]);
  }
  return originalCounts.map((c, i) => c - planCounts[i]);
}

function betterPlanSameSum(a, b, strategy, originalCounts, direction, coinMask = null) {
  if (coinMask) {
    if (a.coins !== b.coins) return a.coins < b.coins;
  }
  if (a.items !== b.items) return a.items < b.items;
  if (strategy === 'equalisation') {
    const costA = varianceCost(remainingCounts(originalCounts, a.counts, direction));
    const costB = varianceCost(remainingCounts(originalCounts, b.counts, direction));
    if (costA !== costB) return costA < costB;
  }
  return lexPrefers(a.counts, b.counts);
}

function buildBestPlansBySum(denomsOrdered, strategy, originalCounts, direction, coinMask = null) {
  const n = denomsOrdered.length;
  let map = new Map([[0, { counts: Array(n).fill(0), items: 0, coins: 0 }]]);

  denomsOrdered.forEach((denom, idx) => {
    const next = new Map(map);
    for (const [sum, plan] of map.entries()) {
      for (let k = 1; k <= denom.count; k += 1) {
        const newSum = sum + k * denom.value_minor;
        const newCounts = plan.counts.slice();
        newCounts[idx] += k;
        const coinAdd = coinMask ? (coinMask[idx] ? k : 0) : 0;
        const newPlan = { counts: newCounts, items: plan.items + k, coins: plan.coins + coinAdd };
        const existing = next.get(newSum);
        if (!existing || betterPlanSameSum(newPlan, existing, strategy, originalCounts, direction, coinMask)) {
          next.set(newSum, newPlan);
        }
      }
    }
    map = next;
  });
  return map;
}

function selectBestOverpayPlan(map, target, strategy, orderCounts, originalCounts, direction, allowOverpay, coinMask = null, coinFirstOverpay = false) {
  let best = null;
  for (const [sum, plan] of map.entries()) {
    if (sum < target) continue;
    const overpay = sum - target;
    if (!allowOverpay && overpay > 0) continue;
    if (!best) {
      best = { sum, plan };
      continue;
    }
    const bestOverpay = best.sum - target;
    if (coinMask && coinFirstOverpay) {
      if (plan.coins !== best.plan.coins) {
        if (plan.coins < best.plan.coins) best = { sum, plan };
        continue;
      }
    }
    if (overpay !== bestOverpay) {
      if (overpay < bestOverpay) best = { sum, plan };
      continue;
    }
    if (plan.items !== best.plan.items) {
      if (plan.items < best.plan.items) best = { sum, plan };
      continue;
    }
    if (strategy === 'equalisation') {
      const costA = varianceCost(remainingCounts(originalCounts, plan.counts, direction));
      const costB = varianceCost(remainingCounts(originalCounts, best.plan.counts, direction));
      if (costA !== costB) {
        if (costA < costB) best = { sum, plan };
        continue;
      }
    }
    if (lexPrefers(plan.counts, best.plan.counts)) best = { sum, plan };
  }
  return best;
}

function countsToBreakdown(denomsOrdered, counts) {
  return counts
    .map((count, idx) => ({
      value_minor: denomsOrdered[idx].value_minor,
      count,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value_minor - a.value_minor);
}

function greedyExact(denoms, target, order = ORDER_LARGEST_FIRST) {
  const ordered = orderDenoms(denoms, order);
  let remaining = target;
  const counts = Array(ordered.length).fill(0);
  ordered.forEach((row, idx) => {
    const take = Math.min(row.count, Math.floor(remaining / row.value_minor));
    if (take > 0) {
      counts[idx] = take;
      remaining -= take * row.value_minor;
    }
  });
  return {
    ok: remaining === 0,
    counts,
    sum: target - remaining,
    ordered,
    remaining,
  };
}

function greedyOverpay(denoms, target, order = ORDER_LARGEST_FIRST) {
  const base = greedyExact(denoms, target, order);
  if (base.ok) {
    return { ok: true, counts: base.counts, sum: target, ordered: base.ordered };
  }
  const ordered = base.ordered;
  const remaining = base.remaining;
  const available = ordered.map((d, idx) => ({ ...d, count: d.count - base.counts[idx] }));
  const originalCounts = available.map((d) => d.count);
  const map = buildBestPlansBySum(available, 'lex', originalCounts, 'outgoing');
  const bestExtra = selectBestOverpayPlan(map, remaining, 'lex', order, originalCounts, 'outgoing', true);
  if (!bestExtra) return { ok: false };
  const totalCounts = base.counts.map((c, idx) => c + bestExtra.plan.counts[idx]);
  const sum = target - remaining + bestExtra.sum;
  return { ok: true, counts: totalCounts, sum, ordered };
}

function optimalPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, direction = 'outgoing', originalCountsOverride = null, coinMask = null, coinFirstOverpay = false) {
  const ordered = orderDenoms(denoms, order);
  const originalCounts = originalCountsOverride || ordered.map((d) => d.count);
  const map = buildBestPlansBySum(ordered, strategy, originalCounts, direction, coinMask);
  const best = selectBestOverpayPlan(map, target, strategy, order, originalCounts, direction, allowOverpay, coinMask, coinFirstOverpay);
  if (!best) return null;
  return {
    sum: best.sum,
    counts: best.plan.counts,
    ordered,
  };
}

function computeOutgoingPlanBase(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, coinMask = null, coinFirstOverpay = false) {
  const effectiveOrder = order;
  const total = denoms.reduce((sum, d) => sum + d.value_minor * d.count, 0);
  if (total < target) {
    return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  }

  if (strategy === 'greedy') {
    const exact = greedyExact(denoms, target, effectiveOrder);
    if (exact.ok) {
      return {
        status: 'exact',
        breakdown: countsToBreakdown(exact.ordered, exact.counts),
        paidMinor: target,
        overpay: 0,
      };
    }
    if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    const over = greedyOverpay(denoms, target, effectiveOrder);
    if (!over.ok) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    return {
      status: 'sufficient_not_exact',
      breakdown: countsToBreakdown(over.ordered, over.counts),
      paidMinor: over.sum,
      overpay: Math.max(0, over.sum - target),
    };
  }

  if (strategy === 'lex' || strategy === 'equalisation') {
    const plan = optimalPlan(denoms, target, strategy, effectiveOrder, allowOverpay, 'outgoing', null, coinMask, coinFirstOverpay);
    if (!plan) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    const overpay = Math.max(0, plan.sum - target);
    return {
      status: overpay === 0 ? 'exact' : 'sufficient_not_exact',
      breakdown: countsToBreakdown(plan.ordered, plan.counts),
      paidMinor: plan.sum,
      overpay,
    };
  }

  return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
}

function computeOutgoingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, coinsRule = 'off') {
  if (coinsRule === 'off') return computeOutgoingPlanBase(denoms, target, strategy, order, allowOverpay);

  const notesOnly = denoms.filter((d) => d.type !== 'coin');

  if (coinsRule === 'avoid') {
    return computeOutgoingPlanBase(notesOnly, target, strategy, order, allowOverpay);
  }

  const exactNotes = computeOutgoingPlanBase(notesOnly, target, strategy, order, false);
  if (exactNotes.status === 'exact') return exactNotes;

  const coinMask = denoms.map((d) => d.type === 'coin');
  const exactAny = computeOutgoingPlanBase(denoms, target, strategy, order, false, coinMask);
  if (exactAny.status === 'exact') return exactAny;

  if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  return computeOutgoingPlanBase(denoms, target, 'lex', order, true, coinMask, true);
}

function computeIncomingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, coinsRule = 'off') {
  if (target <= 0) return { ok: false, breakdown: [] };
  const ordered = orderDenoms(denoms, order);
  const n = ordered.length;
  const originalCounts = ordered.map((d) => d.count);

  if (coinsRule !== 'off') {
    const notesOnly = ordered.filter((d) => d.type !== 'coin');
    const notesPlan = computeIncomingPlan(notesOnly, target, strategy, order, 'off');
    if (notesPlan.ok || coinsRule === 'avoid') return notesPlan;
  }

  if (strategy === 'greedy') {
    const unlimited = ordered.map((d) => ({
      ...d,
      count: Math.floor(target / d.value_minor),
    }));
    const exact = greedyExact(unlimited, target, order);
    return exact.ok
      ? { ok: true, breakdown: countsToBreakdown(exact.ordered, exact.counts) }
      : { ok: false, breakdown: [] };
  }

  const dp = Array(target + 1).fill(null);
  dp[0] = { items: 0, counts: Array(n).fill(0) };
  const coinMask = coinsRule === 'prefer' ? ordered.map((d) => d.type === 'coin') : null;

  for (let sum = 0; sum <= target; sum += 1) {
    const plan = dp[sum];
    if (!plan) continue;
    for (let i = 0; i < n; i += 1) {
      const value = ordered[i].value_minor;
      const nextSum = sum + value;
      if (nextSum > target) continue;
      const counts = plan.counts.slice();
      counts[i] += 1;
      const coinAdd = coinMask ? (coinMask[i] ? 1 : 0) : 0;
      const candidate = { items: plan.items + 1, counts, coins: (plan.coins || 0) + coinAdd };
      const existing = dp[nextSum];
      if (!existing) {
        dp[nextSum] = candidate;
        continue;
      }
      if (coinMask && candidate.coins !== existing.coins) {
        if (candidate.coins < existing.coins) dp[nextSum] = candidate;
        continue;
      }
      if (candidate.items !== existing.items) {
        if (candidate.items < existing.items) dp[nextSum] = candidate;
        continue;
      }
      if (strategy === 'equalisation') {
        const costA = varianceCost(remainingCounts(originalCounts, candidate.counts, 'incoming'));
        const costB = varianceCost(remainingCounts(originalCounts, existing.counts, 'incoming'));
        if (costA !== costB) {
          if (costA < costB) dp[nextSum] = candidate;
          continue;
        }
      }
      if (lexPrefers(candidate.counts, existing.counts)) {
        dp[nextSum] = candidate;
      }
    }
  }

  const best = dp[target];
  if (!best) return { ok: false, breakdown: [] };
  return { ok: true, breakdown: countsToBreakdown(ordered, best.counts) };
}

    function computeChangeBreakdown(denoms, changeMinor) {
      if (!changeMinor || changeMinor <= 0) return [];
      const unlimited = denoms.map((d) => ({ ...d, count: Math.floor(changeMinor / d.value_minor) + 1 }));
      const exact = greedyExact(unlimited, changeMinor, ORDER_LARGEST_FIRST);
      return exact.ok ? countsToBreakdown(exact.ordered, exact.counts) : [];
    }

const STORAGE_KEY = 'kontana_state_v1';
    const MAX_WALLETS = 4;
    const RETENTION_DAYS = 30;

    const SUPPORTED_CURRENCIES = [
      'EUR', 'USD', 'GBP', 'CLP',
      'SEK', 'CHF', 'HUF', 'DKK', 'NOK', 'PLN', 'CAD',
      'ARS', 'PEN', 'BRL', 'MXN',
      'CZK', 'RON', 'CNY', 'JPY', 'INR', 'SGD', 'KRW',
      'EGP', 'ZAR', 'NGN', 'XOF', 'AUD', 'NZD', 'ILS', 'TRY', 'VND', 'UYU', 'AOA', 'ALL', 'AZN', 'BHD', 'BIF', 'BND', 'COP', 'CRC', 'CUP', 'GEL', 'HKD', 'HNL', 'IDR', 'JOD', 'KES', 'IQD', 'ISK', 'JMD', 'IRR', 'XAF', 'BWP', 'DJF', 'DZD', 'ETB', 'GMD', 'GHS', 'GNF', 'GYD', 'CDF', 'KWD', 'LAK', 'LRD', 'LYD', 'MAD', 'MGA', 'MKD', 'MMK', 'MRU', 'MUR', 'MVR', 'NAD', 'NPR',
      'PGK', 'PHP', 'PKR', 'QAR', 'RUB', 'RWF', 'SCR', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'THB', 'TJS', 'TOP', 'TND', 'TTD', 'TWD', 'TZS', 'UAH', 'UZS', 'VES', 'WST', 'YER', 'KPW', 'BSD', 'AED', 'AMD',
    ];

    const CURRENCY_FLAGS = {
      EUR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24" style="opacity:1;"><defs><g id="SVGbHYmecam"><g id="SVGIFZ6telI"><path id="SVGrXl6lbBN" d="m0-1l-.3 1l.5.1z"/><use href="#SVGrXl6lbBN" transform="scale(-1 1)"/></g><g id="SVGcPAWMlAK"><use href="#SVGIFZ6telI" transform="rotate(72)"/><use href="#SVGIFZ6telI" transform="rotate(144)"/></g><use href="#SVGcPAWMlAK" transform="scale(-1 1)"/></g></defs><path fill="#039" d="M0 0h640v480H0z"/><g fill="#fc0" transform="translate(320 242.3)scale(23.7037)"><use width="100%" height="100%" y="-6" href="#SVGbHYmecam"/><use width="100%" height="100%" y="6" href="#SVGbHYmecam"/><g id="SVGDo9IZUDi"><use width="100%" height="100%" x="-6" href="#SVGbHYmecam"/><use width="100%" height="100%" href="#SVGbHYmecam" transform="rotate(-144 -2.3 -2.1)"/><use width="100%" height="100%" href="#SVGbHYmecam" transform="rotate(144 -2.1 -2.3)"/><use width="100%" height="100%" href="#SVGbHYmecam" transform="rotate(72 -4.7 -2)"/><use width="100%" height="100%" href="#SVGbHYmecam" transform="rotate(72 -5 .5)"/></g><use width="100%" height="100%" href="#SVGDo9IZUDi" transform="scale(-1 1)"/></g></svg>', USD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#bd3d44" d="M0 0h640v480H0"/><path stroke="#fff" stroke-width="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/><path fill="#192f5d" d="M0 0h364.8v258.5H0"/><marker id="SVGIRconeNR" markerHeight="30" markerWidth="30"><path fill="#fff" d="m14 0l9 27L0 10h28L5 27z"/></marker><path fill="none" marker-mid="url(#SVGIRconeNR)" d="m0 0l16 11h61h61h61h61h60L47 37h61h61h60h61L16 63h61h61h61h61h60L47 89h61h61h60h61L16 115h61h61h61h61h60L47 141h61h61h60h61L16 166h61h61h61h61h60L47 192h61h61h60h61L16 218h61h61h61h61h60z"/></svg>', GBP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#012169" d="M0 0h640v480H0z"/><path fill="#FFF" d="m75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301L81 480H0v-60l239-178L0 64V0z"/><path fill="#C8102E" d="m424 281l216 159v40L369 281zm-184 20l6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"/><path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z"/><path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z"/></svg>', CLP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24" style="opacity:1;"><defs><clipPath id="SVGo1QMTd8m"><path fill-opacity=".7" d="M0 0h682.7v512H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGo1QMTd8m)" transform="scale(.9375)"><path fill="#fff" d="M256 0h512v256H256z"/><path fill="#0039a6" d="M0 0h256v256H0z"/><path fill="#fff" d="M167.8 191.7L128.2 162l-39.5 30l14.7-48.8L64 113.1l48.7-.5L127.8 64l15.5 48.5l48.7.1l-39.2 30.4z"/><path fill="#d52b1e" d="M0 256h768v256H0z"/></g></svg>',
      BRL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g stroke-width="1pt"><path fill="#229e45" fill-rule="evenodd" d="M0 0h640v480H0z"/><path fill="#f8e509" fill-rule="evenodd" d="m321.4 436l301.5-195.7L319.6 44L17.1 240.7z"/><path fill="#2b49a3" fill-rule="evenodd" d="M452.8 240c0 70.3-57.1 127.3-127.6 127.3A127.4 127.4 0 1 1 452.8 240"/><path fill="#ffffef" fill-rule="evenodd" d="m283.3 316.3l-4-2.3l-4 2l.9-4.5l-3.2-3.4l4.5-.5l2.2-4l1.9 4.2l4.4.8l-3.3 3m86 26.3l-3.9-2.3l-4 2l.8-4.5l-3.1-3.3l4.5-.5l2.1-4.1l2 4.2l4.4.8l-3.4 3.1m-36.2-30l-3.4-2l-3.5 1.8l.8-3.9l-2.8-2.9l4-.4l1.8-3.6l1.6 3.7l3.9.7l-3 2.7m87-8.5l-3.4-2l-3.5 1.8l.8-3.9l-2.7-2.8l3.9-.4l1.8-3.5l1.6 3.6l3.8.7l-2.9 2.6m-87.3-22l-4-2.2l-4 2l.8-4.6l-3.1-3.3l4.5-.5l2.1-4.1l2 4.2l4.4.8l-3.4 3.2m-104.6-35l-4-2.2l-4 2l1-4.6l-3.3-3.3l4.6-.5l2-4.1l2 4.2l4.4.8l-3.3 3.1m13.3 57.2l-4-2.3l-4 2l.9-4.5l-3.2-3.3l4.5-.6l2.1-4l2 4.2l4.4.8l-3.3 3.1m132-67.3l-3.6-2l-3.6 1.8l.8-4l-2.8-3l4-.5l1.9-3.6l1.7 3.8l4 .7l-3 2.7m-6.7 38.3l-2.7-1.6l-2.9 1.4l.6-3.2l-2.2-2.3l3.2-.4l1.5-2.8l1.3 3l3 .5l-2.2 2.2m-142.2 50.4l-2.7-1.5l-2.7 1.3l.6-3l-2.1-2.2l3-.4l1.4-2.7l1.3 2.8l3 .6l-2.3 2M419 299.8l-2.2-1.1l-2.2 1l.5-2.3l-1.7-1.6l2.4-.3l1.2-2l1 2l2.5.5l-1.9 1.5"/><path fill="#ffffef" fill-rule="evenodd" d="m219.3 287.6l-2.7-1.5l-2.7 1.3l.6-3l-2.1-2.2l3-.4l1.4-2.7l1.3 2.8l3 .6l-2.3 2"/><path fill="#ffffef" fill-rule="evenodd" d="m219.3 287.6l-2.7-1.5l-2.7 1.3l.6-3l-2.1-2.2l3-.4l1.4-2.7l1.3 2.8l3 .6l-2.3 2m42.3 3l-2.6-1.4l-2.7 1.3l.6-3l-2.1-2.2l3-.4l1.4-2.7l1.3 2.8l3 .5l-2.3 2.1m-4.8 17l-2.6-1.5l-2.7 1.4l.6-3l-2.1-2.3l3-.4l1.4-2.7l1.3 2.8l3 .6l-2.3 2m87.4-22.2l-2.6-1.6l-2.8 1.4l.6-3l-2-2.3l3-.3l1.4-2.7l1.2 2.8l3 .5l-2.2 2.1m-25.1 3l-2.7-1.5l-2.7 1.4l.6-3l-2-2.3l3-.3l1.4-2.8l1.2 2.9l3 .5l-2.2 2.1m-68.8-5.8l-1.7-1l-1.7.8l.4-1.9l-1.3-1.4l1.9-.2l.8-1.7l.8 1.8l1.9.3l-1.4 1.3m167.8 45.4l-2.6-1.5l-2.7 1.4l.6-3l-2.1-2.3l3-.4l1.4-2.7l1.3 2.8l3 .6l-2.3 2m-20.8 6l-2.2-1.4l-2.3 1.2l.5-2.6l-1.7-1.8l2.5-.3l1.2-2.3l1 2.4l2.5.4l-1.9 1.8m10.4 2.3l-2-1.2l-2.1 1l.4-2.3l-1.6-1.7l2.3-.3l1.1-2l1 2l2.3.5l-1.7 1.6m29.1-22.8l-2-1l-2 1l.5-2.3l-1.6-1.7l2.3-.3l1-2l1 2.1l2.1.4l-1.6 1.6m-38.8 41.8l-2.5-1.4l-2.7 1.2l.6-2.8l-2-2l3-.3l1.3-2.5l1.2 2.6l3 .5l-2.3 1.9m.6 14.2l-2.4-1.4l-2.4 1.3l.6-2.8l-1.9-2l2.7-.4l1.2-2.5l1.1 2.6l2.7.5l-2 2m-19-23.1l-1.9-1.2l-2 1l.4-2.2l-1.5-1.7l2.2-.2l1-2l1 2l2.2.4l-1.6 1.6m-17.8 2.3l-2-1.2l-2 1l.5-2.2l-1.6-1.7l2.3-.2l1-2l1 2l2.1.4l-1.6 1.6m-30.4-24.6l-2-1.1l-2 1l.5-2.3l-1.6-1.6l2.2-.3l1-2l1 2l2.2.5l-1.6 1.5m3.7 57l-1.6-.9l-1.8.9l.4-2l-1.3-1.4l1.9-.2l.9-1.7l.8 1.8l1.9.3l-1.4 1.3m-46.2-86.6l-4-2.3l-4 2l.9-4.5l-3.2-3.3l4.5-.6l2.2-4l1.9 4.2l4.4.8l-3.3 3.1"/><path fill="#fff" fill-rule="evenodd" d="M444.4 285.8a125 125 0 0 0 5.8-19.8c-67.8-59.5-143.3-90-238.7-83.7a125 125 0 0 0-8.5 20.9c113-10.8 196 39.2 241.4 82.6"/><path fill="#309e3a" d="m414 252.4l2.3 1.3a3 3 0 0 0-.3 2.2a3 3 0 0 0 1.4 1.7q1 .8 2 .7q.9 0 1.3-.7l.2-.9l-.5-1l-1.5-1.8a8 8 0 0 1-1.8-3a4 4 0 0 1 2-4.4a4 4 0 0 1 2.3-.2a7 7 0 0 1 2.6 1.2q2.1 1.5 2.6 3.2a4 4 0 0 1-.6 3.3l-2.4-1.5q.5-1 .2-1.7q-.2-.8-1.2-1.4a3 3 0 0 0-1.8-.7a1 1 0 0 0-.9.5q-.3.4-.1 1q.2.8 1.6 2.2t2 2.5a4 4 0 0 1-.3 4.2a4 4 0 0 1-1.9 1.5a4 4 0 0 1-2.4.3q-1.3-.3-2.8-1.3q-2.2-1.5-2.7-3.3a5 5 0 0 1 .6-4zm-11.6-7.6l2.5 1.3a3 3 0 0 0-.2 2.2a3 3 0 0 0 1.4 1.6q1.1.8 2 .6q.9 0 1.3-.8l.2-.8q0-.5-.5-1l-1.6-1.8q-1.7-1.6-2-2.8a4 4 0 0 1 .4-3.1a4 4 0 0 1 1.6-1.4a4 4 0 0 1 2.2-.3a7 7 0 0 1 2.6 1q2.3 1.5 2.7 3.1a4 4 0 0 1-.4 3.4l-2.5-1.4q.5-1 .2-1.7q-.4-1-1.3-1.4a3 3 0 0 0-1.9-.6a1 1 0 0 0-.8.5q-.3.4-.1 1q.3.8 1.7 2.2q1.5 1.5 2 2.4a4 4 0 0 1 0 4.2a4 4 0 0 1-1.8 1.6a4 4 0 0 1-2.4.3a8 8 0 0 1-2.9-1.1a6 6 0 0 1-2.8-3.2a5 5 0 0 1 .4-4m-14.2-3.8l7.3-12l8.8 5.5l-1.2 2l-6.4-4l-1.6 2.7l6 3.7l-1.3 2l-6-3.7l-2 3.3l6.7 4l-1.2 2zm-20.7-17l1.1-2l5.4 2.7l-2.5 5q-1.2.3-3 .2a9 9 0 0 1-3.3-1a8 8 0 0 1-3-2.6a6 6 0 0 1-1-3.5a9 9 0 0 1 1-3.7a8 8 0 0 1 2.6-3a6 6 0 0 1 3.6-1.1q1.4 0 3.2 1q2.4 1.1 3.1 2.8a5 5 0 0 1 .3 3.5l-2.7-.8a3 3 0 0 0-.2-2q-.4-.9-1.6-1.4a4 4 0 0 0-3.1-.3q-1.5.5-2.6 2.6t-.7 3.8a4 4 0 0 0 2 2.4q.8.5 1.7.5h1.8l.8-1.6zm-90.2-22.3l2-14l4.2.7l1.1 9.8l3.9-9l4.2.6l-2 13.8l-2.7-.4l1.7-10.9l-4.4 10.5l-2.7-.4l-1.1-11.3l-1.6 11zm-14.1-1.7l1.3-14l10.3 1l-.2 2.4l-7.5-.7l-.3 3l7 .7l-.3 2.4l-7-.7l-.3 3.8l7.8.7l-.2 2.4z"/><g stroke-opacity=".5"><path fill="#309e3a" d="M216.5 191.3q0-2.2.7-3.6a7 7 0 0 1 1.4-1.9a5 5 0 0 1 1.8-1.2q1.5-.5 3-.5q3.1.1 5 2a7 7 0 0 1 1.6 5.5q0 3.3-2 5.3a7 7 0 0 1-5 1.7a7 7 0 0 1-4.8-2a7 7 0 0 1-1.7-5.3"/><path fill="#f7ffff" d="M219.4 191.3q0 2.3 1 3.6t2.8 1.3a4 4 0 0 0 2.8-1.1q1-1.2 1.1-3.7q.1-2.4-1-3.6a4 4 0 0 0-2.7-1.3a4 4 0 0 0-2.8 1.2q-1.1 1.2-1.2 3.6"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="m233 198.5l.2-14h6q2.2 0 3.2.5q1 .3 1.6 1.3c.6 1 .6 1.4.6 2.3a4 4 0 0 1-1 2.6a5 5 0 0 1-2.7 1.2l1.5 1.2q.6.6 1.5 2.3l1.7 2.8h-3.4l-2-3.2l-1.4-2l-.9-.6l-1.4-.2h-.6v5.8z"/><path fill="#fff" d="M236 190.5h2q2.1 0 2.6-.2q.5-.1.8-.5q.4-.6.3-1q0-.9-.4-1.2q-.3-.4-1-.6h-2l-2.3-.1z"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="m249 185.2l5.2.3q1.7 0 2.6.3a5 5 0 0 1 2 1.4a6 6 0 0 1 1.2 2.4q.4 1.4.3 3.3a9 9 0 0 1-.5 3q-.6 1.5-1.7 2.4a5 5 0 0 1-2 1q-1 .3-2.5.2l-5.3-.3z"/><path fill="#fff" d="m251.7 187.7l-.5 9.3h3.8q.8 0 1.2-.5q.5-.4.8-1.3t.4-2.6l-.1-2.5a3 3 0 0 0-.8-1.4l-1.2-.7l-2.3-.3z"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="m317.6 210.2l3.3-13.6l4.4 1l3.2 1q1.1.6 1.6 1.9t.2 2.8q-.3 1.2-1 2a4 4 0 0 1-3 1.4q-1 0-3-.5l-1.7-.5l-1.2 5.2z"/><path fill="#fff" d="m323 199.6l-.8 3.8l1.5.4q1.6.4 2.2.3a2 2 0 0 0 1.6-1.5q0-.7-.2-1.3a2 2 0 0 0-1-.9l-1.9-.5l-1.3-.3z"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="m330.6 214.1l4.7-13.2l5.5 2q2.2.8 3 1.4q.8.7 1 1.8c.2 1.1.2 1.5 0 2.3q-.6 1.5-1.8 2.2q-1.2.6-3 .3q.6.7 1 1.6l.8 2.7l.6 3.1l-3.1-1.1l-1-3.6l-.7-2.4l-.6-.8q-.3-.4-1.3-.7l-.5-.2l-2 5.6z"/><path fill="#fff" d="m336 207.4l1.9.7q2 .7 2.5.7s.9-.3 1-.3q.5-.3.6-.9q.3-.6 0-1.2l-.8-.9l-2-.7l-2-.7l-1.2 3.3z"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="M347 213.6a9 9 0 0 1 1.7-3.2l1.8-1.5l2-.7q1.5-.1 3.1.4a7 7 0 0 1 4.2 3.3q1.2 2.4.2 5.7a7 7 0 0 1-3.4 4.5q-2.3 1.3-5.2.4a7 7 0 0 1-4.2-3.3a7 7 0 0 1-.2-5.6"/><path fill="#fff" d="M349.8 214.4q-.7 2.3 0 3.8c.7 1.5 1.2 1.6 2.3 2q1.5.5 3-.4q1.4-.8 2.1-3.2q.8-2.2 0-3.7a4 4 0 0 0-2.2-2a4 4 0 0 0-3 .3q-1.5.8-2.2 3.2"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="m374.3 233.1l6.4-12.4l5.3 2.7a10 10 0 0 1 2.7 1.9q.8.7.8 1.9c0 1.2 0 1.5-.4 2.2a4 4 0 0 1-2 2q-1.5.4-3.1-.2q.6 1 .8 1.7q.3.9.4 2.8l.2 3.2l-3-1.5l-.4-3.7l-.3-2.5l-.5-1l-1.2-.7l-.5-.3l-2.7 5.2z"/><path fill="#fff" d="m380.5 227.2l1.9 1q1.8 1 2.3 1t1-.2q.4-.2.7-.8t.2-1.2l-.7-1l-1.8-1l-2-1z"/></g><g stroke-opacity=".5"><path fill="#309e3a" d="M426.1 258.7a9 9 0 0 1 2.5-2.6a7 7 0 0 1 2.2-.9a6 6 0 0 1 2.2 0q1.5.3 2.8 1.2a7 7 0 0 1 3 4.4q.4 2.6-1.4 5.5a7 7 0 0 1-4.5 3.3a7 7 0 0 1-5.2-1.1a7 7 0 0 1-3-4.4q-.4-2.7 1.4-5.4"/><path fill="#fff" d="M428.6 260.3q-1.4 2-1.1 3.6a4 4 0 0 0 1.6 2.5q1.5 1 3 .6t2.9-2.4q1.4-2.1 1.1-3.6t-1.6-2.6c-1.4-1.1-2-.8-3-.5q-1.5.3-3 2.4z"/></g><path fill="#309e3a" d="m301.8 204.5l2.3-9.8l7.2 1.7l-.3 1.6l-5.3-1.2l-.5 2.2l4.9 1.1l-.4 1.7l-4.9-1.2l-.6 2.7l5.5 1.3l-.4 1.6z"/></g></svg>', MXN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><radialGradient id="SVGGwvw4bmq" cx="842.3" cy="103.7" r="25.9" gradientTransform="matrix(.14152 .03595 -.03453 .14198 213.1 162.4)" gradientUnits="userSpaceOnUse" href="#SVGRJvGBduL"/><radialGradient id="SVGfgRchdGm" cx="651.5" cy="550.5" r="25.9" gradientTransform="matrix(-.13441 -.05384 .04964 -.12489 397.9 -24.3)" gradientUnits="userSpaceOnUse" href="#SVGRJvGBduL"/><radialGradient id="SVGNKgEGbkG" cx="380.8" cy="740.4" r="25.9" gradientTransform="matrix(.07536 .00282 -.00343 .14804 412.4 -203.6)" gradientUnits="userSpaceOnUse" href="#SVGRJvGBduL"/><linearGradient id="SVGRJvGBduL"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f15770"/></linearGradient></defs><path fill="#ce1126" d="M426.7 0H640v480H426.7z"/><path fill="#fff" d="M213.3 0h213.4v480H213.3z"/><path fill="#006847" d="M0 0h213.3v480H0z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m355.8 289.4l.2 4.5l1.7-1.1l-1.3-3.7z"/><circle cx="355.6" cy="288.2" r="1.4" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m361.1 296.4l-3.2-3.1l-1.5 1.2l4.5 2.6z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M360.9 298.2q-.7-1 .3-2q1.2-.7 2 .2q.7 1-.3 2q-1.2.7-2-.2z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m386.3 249.6l3.4 3.3l.4-1.7l-3.1-2z"/><circle cx="385.9" cy="248.7" r="1.4" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="M395.2 251.6L390 253l.5-1.7l4.4-.4z"/><circle cx="396" cy="250.8" r="1.4" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m378 276.8l-3.2-4.8l.5-.3l3.5 4.2z"/><circle cx="374.5" cy="270.8" r="1.4" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m378.1 277l4 .7l.1-.5l-3.3-1.4z"/><circle cx="383.3" cy="277.7" r="1.4" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M284.6 288q-.1 1.2-1 1.2q-1.2 0-1-1.2c.2-1.2.5-1.3 1-1.3s1 .7 1 1.4z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m284.6 290.3l1 5l-1.3-.5l-.4-4.3z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M285.7 288.6c.6.7-.4 1.9-1.4 2.2s-2.4-.2-2.4-1.2s1.6-.5 2-.6c.6-.2 1.2-1.2 1.8-.4z"/><ellipse cx="277" cy="296.3" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" rx="1.6" ry="1.1"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m279.6 296l4.8-.2l-.8-1l-4 .4z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M280 295.4c.5 1.3.5 3-.9 2.7c-1.4-.1-1-1.4-1.2-1.8c-.2-.9-1-1.7-.2-2.5s2 .4 2.3 1.6z"/><ellipse cx="264.4" cy="269.2" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" rx=".9" ry="1.4"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m264.4 272.4l.1 4.6l-1.2-1v-3.8z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M266.2 271c.3 1-1.3 1.6-2.4 1.4s-1.9-.7-1.7-1.7s1.5-.8 2-.5s1.8-.8 2.1.7z"/><ellipse cx="256.2" cy="276.5" fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" rx="1.6" ry=".7"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m259.1 276.5l3.6-.3l1.6 1.2l-5.3-.2z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M257.8 274.5c1 0 1.6 1.1 1.5 2.3q-.4 1.8-2 2c-.9-.2-.8-1-.8-1.2c0-.3.5-.7.6-1s-.3-1.3-.1-1.6q0-.5.8-.5zm-3-28.3c-.4.6-1.2 1.1-1.6.9s-.2-1.2.2-1.8q.7-1 1.4-.8q.6.6 0 1.7z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m250.7 253.5l2-4.8l-.2-.3l-2.4 3.4z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M252.4 248.7q-1.4-1-1-2.3c.4-.7 1.2-.2 1.2-.2l.8.7c.4.2 1 0 1.4.6c.5.6.2 1.2-.1 1.4s-1.5.4-2.3-.2zm-8.5-.6q1.1.7.9 1.5q-.5.7-1.8 0q-1-.6-.8-1.5q.5-.7 1.7 0z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".3" d="m246 250.2l3.8 2.2l-.1 1.8l-4.1-3.5z"/><path fill="#fcca3e" stroke="#aa8c30" stroke-width=".2" d="M246 250.6q-1.2 1.3-2.3.7c-.7-.5-.1-1.2-.1-1.2l.8-.7c.2-.4 0-1 .7-1.4s1.2 0 1.3.3c.1.4.3 1.5-.4 2.3z"/>', CZK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v240H0z"/><path fill="#d7141a" d="M0 240h640v240H0z"/><path fill="#11457e" d="M360 240L0 0v480z"/></svg>', RON: '🇷🇴', CNY: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><path id="SVGMKMqY6jk" fill="#ff0" d="M-.6.8L0-1L.6.8L-1-.3h2z"/></defs><path fill="#ee1c25" d="M0 0h640v480H0z"/><use width="30" height="20" href="#SVGMKMqY6jk" transform="matrix(71.9991 0 0 72 120 120)"/><use width="30" height="20" href="#SVGMKMqY6jk" transform="matrix(-12.33562 -20.5871 20.58684 -12.33577 240.3 48)"/><use width="30" height="20" href="#SVGMKMqY6jk" transform="matrix(-3.38573 -23.75998 23.75968 -3.38578 288 95.8)"/><use width="30" height="20" href="#SVGMKMqY6jk" transform="matrix(6.5991 -23.0749 23.0746 6.59919 288 168)"/><use width="30" height="20" href="#SVGMKMqY6jk" transform="matrix(14.9991 -18.73557 18.73533 14.99929 240 216)"/></svg>',
      JPY: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG0TFcTbeI"><path fill-opacity=".7" d="M-88 32h640v480H-88z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVG0TFcTbeI)" transform="translate(88 -32)"><path fill="#fff" d="M-128 32h720v480h-720z"/><circle cx="523.1" cy="344.1" r="194.9" fill="#bc002d" transform="translate(-168.4 8.6)scale(.76554)"/></g></svg>', INR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#f93" d="M0 0h640v160H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#128807" d="M0 320h640v160H0z"/><g transform="matrix(3.2 0 0 3.2 320 240)"><circle r="20" fill="#008"/><circle r="17.5" fill="#fff"/><circle r="3.5" fill="#008"/><g id="SVGsddZneDV"><g id="SVGAVM73aZm"><g id="SVG0GvM9deV"><g id="SVGia4JHdHE" fill="#008"><circle r=".9" transform="rotate(7.5 -8.8 133.5)"/><path d="M0 17.5L.6 7L0 2l-.6 5z"/></g><use width="100%" height="100%" href="#SVGia4JHdHE" transform="rotate(15)"/></g><use width="100%" height="100%" href="#SVG0GvM9deV" transform="rotate(30)"/></g><use width="100%" height="100%" href="#SVGAVM73aZm" transform="rotate(60)"/></g><use width="100%" height="100%" href="#SVGsddZneDV" transform="rotate(120)"/><use width="100%" height="100%" href="#SVGsddZneDV" transform="rotate(-120)"/></g></svg>', SGD: '🇸🇬', KRW: '🇰🇷', EGP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#000001" d="M0 320h640v160H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#ce1126" d="M0 0h640v160H0z"/><g fill="#fff" stroke="#c09300" transform="translate(-40)scale(.8)"><path stroke-linejoin="round" stroke-width="1.3" d="m450.8 302.4l68.5 63.6l-4.9-115.5c-.7-17.5-15.9-13.5-27-7.2c-11.1 7.2-24 7.2-37.4 2.5c-13.5 4.7-26.3 4.7-37.4-2.5c-11-6.3-26.3-10.3-27 7.2L380.7 366z"/><path id="SVGhAbPmcew" fill="#c09300" stroke="none" d="m393.5 246.5l-4.8 112.3l-8 7.2l4.9-115.5a24 24 0 0 1 7.9-4m9.6 8l-4 94l-8 8.2l4.8-108.5c1.6 1.6 6.3 5.5 7.2 6.3m8.7 7.2l-3.1 78.4l-6.5 6.3l4-89.4c1.6 1.5 4.8 3.8 5.6 4.7m9.5 4l-3.1 66.8l-6.3 5.1l3.1-74.3c1.6.7 4.7 2.4 6.3 2.4m8.8 0l-2.3 55.7l-6.5 6.3l2.5-61.3c1.5 0 5.6 0 6.3-.7"/><use width="100%" height="100%" href="#SVGhAbPmcew" transform="matrix(-1 0 0 1 900 0)"/><path fill="#c09300" stroke-width="1.1" d="m453.2 315l9.6 43.8l-3.2 3.2l-3.3-2.5l-5.4-39l2.3 39l-3.2 4l-3.1-4l2.3-39l-5.5 39l-3.3 2.5l-3.2-3.2l9.6-43.7h6.4z"/><g id="SVGzGpI82YC" fill="none" stroke-linejoin="round" stroke-width="1.3"><path fill="#fff" stroke-width="1.2" d="m428.5 295.8l-19.1 67.7l26.3 4l11.1-50.9z"/><path d="m422.2 319l2.3 5.5l12.4-11.8"/><path d="m430.8 305l2.6 24.3l7.9-10.4m-3.2 4l4.3 15m1.7-5.5l-8.7 13.2m2.7 13.2l-2.8-13.2l-2.4-13.4l-5.9 7.9l-2.5-9.1l-8.2 8.4l4.1 15.2l5.8-9.4l3.1 9.6l6-9.2"/><path d="m415 362l5.3-7.5l3.4 11.5l4.8-8l3.1 9.6"/></g><use width="100%" height="100%" href="#SVGzGpI82YC" transform="matrix(-1 0 0 1 900 0)"/><g stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3"><path stroke-width="2.4" d="M450 393.8c20 0 39-1.6 50.2-4.7c4.7-.9 4.7-3.3 4.7-6.5c4.8-1.6 2.4-7.2 5.7-7.2c-3.4 1-4-5.5-8-4.7c0-5.6-5.7-6.3-10.4-4.7c-9.5 3.1-26.3 3.9-42.2 3.9c-16-.8-32.6-.8-42.2-4c-4.7-1.5-10.3-.8-10.3 4.8c-4-.8-4.7 5.6-8 4.7c3.3 0 .8 5.7 5.6 7.2c0 3.2 0 5.6 4.8 6.5c11 3.1 30.2 4.7 50.1 4.7"/><path d="M422.9 363.5c6.4.9 13.6 1.6 19.2.9c3.2 0 5.5 5.5-.9 6.3c-5.5.7-14.3 0-19-.8a231 231 0 0 1-18.4-4c-5.6-2.4-1.6-7 1.6-6.4a105 105 0 0 0 17.5 4m54.2 0c-6.4.9-13.6 1.6-19 .9c-3.4 0-5.7 5.5.7 6.3c5.6.7 14.3 0 19-.8c4-.8 12.8-2.3 18.4-4c5.6-2.4 1.6-7-1.6-6.4a105 105 0 0 1-17.5 4"/><path d="M403 360.4c-4.8-.9-7 4.7-5.5 7.9c.7-1.6 4-1.6 4.7-3.2c.9-2.4-.7-2.4.9-4.7zm19.2 14.7c0-3.2 3.1-2.8 3.1-6c0-1.5-.8-4-2.4-4a3.4 3.4 0 0 0-3.2 3.2c-.7 3.1 2.5 3.6 2.5 6.8m22.7-9.1c4.7 0 4.2 6.3 2 9.5c0-2.3-4-3.2-4-4.8c0-2.4 3.6-2.4 2-4.7m52-5.6c4.9-.9 7.2 4.7 5.6 7.9c-.7-1.6-4-1.6-4.7-3.2c-.9-2.4.7-2.4-.9-4.7M478 375c0-3.2-3.2-2.8-3.2-6c0-1.5.8-4 2.4-4a3.4 3.4 0 0 1 3.2 3.2c.7 3.1-2.5 3.6-2.5 6.8zm-23-9c-4.7 0-4.2 6.3-2 9.5c0-2.3 4-3.2 4-4.8c0-2.4-3.6-2.4 2-4.7"/><path stroke-width=".9" d="M404.7 362c1.6 0 4 .7 4.7 1.6zm7.9 2.4c.8 0 4 .7 5.5 1.6zm28.6 3.2c-1.5 0-4.7 0-5.5.7l5.5-.8zm-8.7 0c-.9-.9-4-.9-5.6 0zm62.8-5.6a8 8 0 0 0-4.7 1.6zm-7.8 2.4c-1 0-4 .7-5.6 1.6zm-28.7 3.2c1.5 0 4.7 0 5.6.7l-5.6-.8zm8.7 0c.9-.9 4-.9 5.6 0z"/></g></g></g></svg>',
      ZAR: '🇿🇦', NGN: '🇳🇬', XOF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#039" d="M0 0h640v480H0z"/><circle cx="320" cy="249.8" r="30.4" fill="none" stroke="#fc0" stroke-width="27.5"/><circle cx="320" cy="249.8" r="88.3" fill="none" stroke="#fc0" stroke-width="27.5"/><path fill="#039" d="m404.7 165.1l84.7 84.7l-84.7 84.7l-84.7-84.7z"/><path fill="#fc0" d="M175.7 236.1h59.2v27.5h-59.2zm259.1 0h88.3v27.5h-88.3zM363 187.4l38.8-38.8l19.4 19.5l-38.7 38.7zM306.3 48.6h27.5v107.1h-27.5z"/><circle cx="225.1" cy="159.6" r="13.7" fill="#fc0"/><circle cx="144.3" cy="249.8" r="13.7" fill="#fc0"/><circle cx="320" cy="381.4" r="13.7" fill="#fc0"/><circle cx="320" cy="425.5" r="13.7" fill="#fc0"/><circle cx="408.3" cy="249.8" r="13.7" fill="#fc0"/><path fill="#fc0" d="m208.3 341.5l19.5-19.4l19.4 19.4l-19.4 19.5zm204.7 21l19.5-19.5l19.5 19.5l-19.5 19.4z"/></svg>', AUD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#00008B" d="M0 0h640v480H0z"/><path fill="#fff" d="m37.5 0l122 90.5L281 0h39v31l-120 89.5l120 89V240h-40l-120-89.5L40.5 240H0v-30l119.5-89L0 32V0z"/><path fill="red" d="M212 140.5L320 220v20l-135.5-99.5zm-92 10l3 17.5l-96 72H0zM320 0v1.5l-124.5 94l1-22L295 0zM0 0l119.5 88h-30L0 21z"/><path fill="#fff" d="M120.5 0v240h80V0zM0 80v80h320V80z"/><path fill="red" d="M0 96.5v48h320v-48zM136.5 0v240h48V0z"/><path fill="#fff" d="m527 396.7l-20.5 2.6l2.2 20.5l-14.8-14.4l-14.7 14.5l2-20.5l-20.5-2.4l17.3-11.2l-10.9-17.5l19.6 6.5l6.9-19.5l7.1 19.4l19.5-6.7l-10.7 17.6zm-3.7-117.2l2.7-13l-9.8-9l13.2-1.5l5.5-12.1l5.5 12.1l13.2 1.5l-9.8 9l2.7 13l-11.6-6.6zm-104.1-60l-20.3 2.2l1.8 20.3l-14.4-14.5l-14.8 14.1l2.4-20.3l-20.2-2.7l17.3-10.8l-10.5-17.5l19.3 6.8L387 178l6.7 19.3l19.4-6.3l-10.9 17.3l17.1 11.2ZM623 186.7l-20.9 2.7l2.3 20.9l-15.1-14.7l-15 14.8l2.1-21l-20.9-2.4l17.7-11.5l-11.1-17.9l20 6.7l7-19.8l7.2 19.8l19.9-6.9l-11 18zm-96.1-83.5l-20.7 2.3l1.9 20.8l-14.7-14.8l-15.1 14.4l2.4-20.7l-20.7-2.8l17.7-11L467 73.5l19.7 6.9l7.3-19.5l6.8 19.7l19.8-6.5l-11.1 17.6zM234 385.7l-45.8 5.4l4.6 45.9l-32.8-32.4l-33 32.2l4.9-45.9l-45.8-5.8l38.9-24.8l-24-39.4l43.6 15l15.8-43.4l15.5 43.5l43.7-14.7l-24.3 39.2l38.8 25.1Z"/></svg>', NZD: '🇳🇿',
      ILS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGf5Rs5bjO"><path fill-opacity=".7" d="M-87.6 0H595v512H-87.6z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGf5Rs5bjO)" transform="translate(82.1)scale(.94)"><path fill="#fff" d="M619.4 512H-112V0h731.4z"/><path fill="#0038b8" d="M619.4 115.2H-112V48h731.4zm0 350.5H-112v-67.2h731.4zm-483-275l110.1 191.6L359 191.6z"/><path fill="#fff" d="m225.8 317.8l20.9 35.5l21.4-35.3z"/><path fill="#0038b8" d="M136 320.6L246.2 129l112.4 190.8z"/><path fill="#fff" d="m225.8 191.6l20.9-35.5l21.4 35.4zM182 271.1l-21.7 36l41-.1l-19.3-36zm-21.3-66.5l41.2.3l-19.8 36.3zm151.2 67l20.9 35.5l-41.7-.5zm20.5-67l-41.2.3l19.8 36.3zm-114.3 0L189.7 256l28.8 50.3l52.8 1.2l32-51.5l-29.6-52z"/></g></svg>', TRY: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#e30a17" d="M0 0h640v480H0z"/><path fill="#fff" d="M407 247.5c0 66.2-54.6 119.9-122 119.9s-122-53.7-122-120s54.6-119.8 122-119.8s122 53.7 122 119.9"/><path fill="#e30a17" d="M413 247.5c0 53-43.6 95.9-97.5 95.9s-97.6-43-97.6-96s43.7-95.8 97.6-95.8s97.6 42.9 97.6 95.9z"/><path fill="#fff" d="m430.7 191.5l-1 44.3l-41.3 11.2l40.8 14.5l-1 40.7l26.5-31.8l40.2 14l-23.2-34.1l28.3-33.9l-43.5 12l-25.8-37z"/></g></svg>', VND: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGMXVQpcWp"><path fill-opacity=".7" d="M-85.3 0h682.6v512H-85.3z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGMXVQpcWp)" transform="translate(80)scale(.9375)"><path fill="#da251d" d="M-128 0h768v512h-768z"/><path fill="#ff0" d="M349.6 381L260 314.3l-89 67.3L204 272l-89-67.7l110.1-1l34.2-109.4L294 203l110.1.1l-88.5 68.4l33.9 109.6z"/></g></svg>', UYU: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#0038a8" d="M266 53.3h374v53.4H266zm0 106.7h374v53.3H266zM0 266.7h640V320H0zm0 106.6h640v53.4H0z"/><g fill="#fcd116" stroke="#000" stroke-miterlimit="20" stroke-width=".6" transform="translate(133.3 133.3)scale(2.93333)"><g id="SVGufrQ4dNJ"><g id="SVG4Tej4c0t"><g id="SVG8MHJ2bWJ"><path stroke-linecap="square" d="m-2 8.9l3 4.5c-12.4 9-4.9 14.2-13.6 17c5.4-5.2-.9-5.7 3.7-16.8"/><path fill="none" d="M-4.2 10.2c-6.8 11.2-2.4 17.4-8.4 20.3"/><path d="M0 0h6L0 33L-6 0h6v33"/></g><use width="100%" height="100%" href="#SVG8MHJ2bWJ" transform="rotate(45)"/></g><use width="100%" height="100%" href="#SVG4Tej4c0t" transform="rotate(90)"/></g><use width="100%" height="100%" href="#SVGufrQ4dNJ" transform="scale(-1)"/><circle r="11"/></g><g transform="translate(133.3 133.3)scale(2.93333)"><g fill="#fcd116" stroke="#000" stroke-miterlimit="20" stroke-width=".6"><g id="SVGgZrLqYfW"><g id="SVG5N1Q5N6D"><g id="SVG5N1Q5N6D"><path stroke-linecap="square" d="m-2 8.9l3 4.5c-12.4 9-4.9 14.2-13.6 17c5.4-5.2-.9-5.7 3.7-16.8"/><path fill="none" d="M-4.2 10.2c-6.8 11.2-2.4 17.4-8.4 20.3"/><path d="M0 0h6L0 33L-6 0h6v33"/></g><use width="100%" height="100%" href="#SVG5N1Q5N6D" transform="rotate(45)"/></g><use width="100%" height="100%" href="#SVG5N1Q5N6D" transform="rotate(90)"/></g><use width="100%" height="100%" href="#SVGgZrLqYfW" transform="scale(-1)"/><circle r="11"/></g></g></svg>', AOA: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h640v243.6H0z"/><path fill="#000001" d="M0 236.4h640V480H0z"/></g><path fill="#ffec00" fill-rule="evenodd" d="M228.7 148.2c165.2 43.3 59 255.6-71.3 167.2l-8.8 13.6c76.7 54.6 152.6 10.6 174-46.4c22.2-58.8-7.6-141.5-92.6-150z"/><path fill="#ffec00" fill-rule="evenodd" d="m170 330.8l21.7 10.1l-10.2 21.8l-21.7-10.2zm149-99.5h24v24h-24zm-11.7-38.9l22.3-8.6l8.7 22.3l-22.3 8.7zm-26-29.1l17.1-16.9l16.9 17l-17 16.9zm-26.2-39.8l22.4 8.4l-8.5 22.4l-22.4-8.4zM316 270l22.3 8.9l-9 22.2l-22.2-8.9zm-69.9 70l22-9.3l9.5 22l-22 9.4zm-39.5 2.8h24v24h-24zm41.3-116l-20.3-15l-20.3 14.6l8-23l-20.3-15h24.5l8.5-22.6l7.8 22.7l24.7-.3l-19.6 15.3z"/><path fill="#fe0" fill-rule="evenodd" d="M336 346.4c-1.2.4-6.2 12.4-9.7 18.2l3.7 1c13.6 4.8 20.4 9.2 26.2 17.5a8 8 0 0 0 10.2.7s2.8-1 6.4-5c3-4.5 2.2-8-1.4-11.1c-11-8-22.9-14-35.4-21.3"/><path fill="#000001" fill-rule="evenodd" d="M365.3 372.8a4.3 4.3 0 1 1-8.7 0a4.3 4.3 0 0 1 8.6 0zm-21.4-13.6a4.3 4.3 0 1 1-8.7 0a4.3 4.3 0 0 1 8.7 0m10.9 7a4.3 4.3 0 1 1-8.7 0a4.3 4.3 0 0 1 8.7 0"/><path fill="#fe0" fill-rule="evenodd" d="M324.5 363.7c-42.6-24.3-87.3-50.5-130-74.8c-18.7-11.7-19.6-33.4-7-49.9c1.2-2.3 2.8-1.8 3.4-.5c1.5 8 6 16.3 11.4 21.5A5288 5288 0 0 1 334 345.6c-3.4 5.8-6 12.3-9.5 18z"/><path fill="#ffec00" fill-rule="evenodd" d="m297.2 305.5l17.8 16l-16 17.8l-17.8-16z"/><path fill="none" stroke="#000" stroke-width="3" d="m331.5 348.8l-125-75.5m109.6 58.1L274 304.1m18.2 42.7L249.3 322"/></svg>', ALL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="red" d="M0 0h640v480H0z"/><path id="SVGSngwjdTL" fill="#000001" d="M272 93.3c-4.6 0-12.3 1.5-12.2 5c-13-2.1-14.3 3.2-13.5 8q2-2.9 3.9-3.1q2.5-.3 5.4 1.4a22 22 0 0 1 4.8 4.1c-4.6 1.1-8.2.4-11.8-.2a17 17 0 0 1-5.7-2.4c-1.5-1-2-2-4.3-4.3c-2.7-2.8-5.6-2-4.7 2.3c2.1 4 5.6 5.8 10 6.6c2.1.3 5.3 1 8.9 1s7.6-.5 9.8 0c-1.3.8-2.8 2.3-5.8 2.8s-7.5-1.8-10.3-2.4c.3 2.3 3.3 4.5 9.1 5.7c9.6 2 17.5 3.6 22.8 6.5a37 37 0 0 1 10.9 9.2c4.7 5.5 5 9.8 5.2 10.8c1 8.8-2.1 13.8-7.9 15.4c-2.8.7-8-.7-9.8-2.9c-2-2.2-3.7-6-3.2-12c.5-2.2 3.1-8.3.9-9.5a274 274 0 0 0-32.3-15.1c-2.5-1-4.5 2.4-5.3 3.8a50 50 0 0 1-36-23.7c-4.2-7.6-11.3 0-10.1 7.3c1.9 8 8 13.8 15.4 18s17 8.2 26.5 8c5.2 1 5.1 7.6-1 8.9c-12.1 0-21.8-.2-30.9-9c-6.9-6.3-10.7 1.2-8.8 5.4c3.4 13.1 22.1 16.8 41 12.6c7.4-1.2 3 6.6 1 6.7c-8 5.7-22.1 11.2-34.6 0c-5.7-4.4-9.6-.8-7.4 5.5c5.5 16.5 26.7 13 41.2 5c3.7-2.1 7.1 2.7 2.6 6.4c-18.1 12.6-27.1 12.8-35.3 8c-10.2-4.1-11 7.2-5 11c6.7 4 23.8 1 36.4-7c5.4-4 5.6 2.3 2.2 4.8c-14.9 12.9-20.8 16.3-36.3 14.2c-7.7-.6-7.6 8.9-1.6 12.6c8.3 5.1 24.5-3.3 37-13.8c5.3-2.8 6.2 1.8 3.6 7.3a54 54 0 0 1-21.8 18c-7 2.7-13.6 2.3-18.3.7c-5.8-2-6.5 4-3.3 9.4c1.9 3.3 9.8 4.3 18.4 1.3s17.8-10.2 24.1-18.5c5.5-4.9 4.9 1.6 2.3 6.2c-12.6 20-24.2 27.4-39.5 26.2c-6.7-1.2-8.3 4-4 9c7.6 6.2 17 6 25.4-.2c7.3-7 21.4-22.4 28.8-30.6c5.2-4.1 6.9 0 5.3 8.4c-1.4 4.8-4.8 10-14.3 13.6c-6.5 3.7-1.6 8.8 3.2 9c2.7 0 8.1-3.2 12.3-7.8c5.4-6.2 5.8-10.3 8.8-19.9c2.8-4.6 7.9-2.4 7.9 2.4c-2.5 9.6-4.5 11.3-9.5 15.2c-4.7 4.5 3.3 6 6 4.1c7.8-5.2 10.6-12 13.2-18.2c2-4.4 7.4-2.3 4.8 5c-6 17.4-16 24.2-33.3 27.8c-1.7.3-2.8 1.3-2.2 3.3l7 7c-10.7 3.2-19.4 5-30.2 8l-14.8-9.8c-1.3-3.2-2-8.2-9.8-4.7c-5.2-2.4-7.7-1.5-10.6 1c4.2 0 6 1.2 7.7 3.1c2.2 5.7 7.2 6.3 12.3 4.7c3.3 2.7 5 4.9 8.4 7.7l-16.7-.5c-6-6.3-10.6-6-14.8-1c-3.3.5-4.6.5-6.8 4.4c3.4-1.4 5.6-1.8 7.1-.3c6.3 3.7 10.4 2.9 13.5 0l17.5 1.1c-2.2 2-5.2 3-7.5 4.8c-9-2.6-13.8 1-15.4 8.3a17 17 0 0 0-1.2 9.3q1.1-4.6 4.9-7c8 2 11-1.3 11.5-6.1c4-3.2 9.8-3.9 13.7-7.1c4.6 1.4 6.8 2.3 11.4 3.8q2.4 7.5 11.3 5.6c7 .2 5.8 3.2 6.4 5.5c2-3.3 1.9-6.6-2.5-9.6c-1.6-4.3-5.2-6.3-9.8-3.8c-4.4-1.2-5.5-3-9.9-4.3c11-3.5 18.8-4.3 29.8-7.8l7.7 6.8q2.3 1.5 3.8 0c6.9-10 10-18.7 16.3-25.3c2.5-2.8 5.6-6.4 9-7.3c1.7-.5 3.8-.2 5.2 1.3c1.3 1.4 2.4 4.1 2 8.2c-.7 5.7-2.1 7.6-3.7 11s-3.6 5.6-5.7 8.3c-4 5.3-9.4 8.4-12.6 10.5c-6.4 4.1-9 2.3-14 2c-6.4.7-8 3.8-2.8 8.1c4.8 2.6 9.2 2.9 12.8 2.2c3-.6 6.6-4.5 9.2-6.6c2.8-3.3 7.6.6 4.3 4.5c-5.9 7-11.7 11.6-19 11.5c-7.7 1-6.2 5.3-1.2 7.4c9.2 3.7 17.4-3.3 21.6-8c3.2-3.5 5.5-3.6 5 1.9c-3.3 9.9-7.6 13.7-14.8 14.2c-5.8-.6-5.9 4-1.6 7c9.6 6.6 16.6-4.8 19.9-11.6c2.3-6.2 5.9-3.3 6.3 1.8c0 6.9-3 12.4-11.3 19.4c6.3 10.1 13.7 20.4 20 30.5l19.2-214L320 139c-2-1.8-8.8-9.8-10.5-11c-.7-.6-1-1-.1-1.4s3-.8 4.5-1c-4-4.1-7.6-5.4-15.3-7.6c1.9-.8 3.7-.4 9.3-.6a30 30 0 0 0-13.5-10.2c4.2-3 5-3.2 9.2-6.7a86 86 0 0 1-19.5-3.8a37 37 0 0 0-12-3.4zm.8 8.4c3.8 0 6.1 1.3 6.1 2.9s-2.3 2.9-6.1 2.9s-6.2-1.5-6.2-3c0-1.6 2.4-2.8 6.2-2.8"/><use width="100%" height="100%" href="#SVGSngwjdTL" transform="matrix(-1 0 0 1 640 0)"/></svg>', AZN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#3f9c35" d="M.1 0h640v480H.1z"/><path fill="#ed2939" d="M.1 0h640v320H.1z"/><path fill="#00b9e4" d="M.1 0h640v160H.1z"/><circle cx="304" cy="240" r="72" fill="#fff"/><circle cx="320" cy="240" r="60" fill="#ed2939"/><path fill="#fff" d="m384 200l7.7 21.5l20.6-9.8l-9.8 20.7L424 240l-21.5 7.7l9.8 20.6l-20.6-9.8L384 280l-7.7-21.5l-20.6 9.8l9.8-20.6L344 240l21.5-7.7l-9.8-20.6l20.6 9.8z"/></svg>', BHD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v480H0"/><path fill="#ce1126" d="M640 0H96l110.7 48L96 96l110.7 48L96 192l110.7 48L96 288l110.7 48L96 384l110.7 48L96 480h544"/></svg>', BIF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGwQJ26ddR"><path fill="gray" d="M67.6-154h666v666h-666z"/></clipPath></defs><g clip-path="url(#SVGwQJ26ddR)" transform="matrix(.961 0 0 .7207 -65 111)"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#319400" d="M0-154h333v666H0z"/><path fill="#ffd600" d="M333-154h666v333H333z"/><path fill="#de2110" d="M333 179h666v333H333z"/></g></g></svg>', BND: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#f7e017" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 33.3v213.4l640 100V233.3z"/><path fill="#000001" d="M0 146.7v100l640 200v-100z"/><g fill="#cf1126" transform="translate(-160)scale(.66667)"><path d="M695.7 569.7a117 117 0 0 1-49.4-17.2c-2.4-1.6-4.6-3-5-3s-.6 1.9-.6 4.1c0 6.4-2.6 9.6-9 11.3c-6.2 1.6-15.6-1.6-23.2-8a68 68 0 0 0-24.7-13.5a40 40 0 0 0-28 3.6a9 9 0 0 1-2.8 1.3c-1.1 0-1-6.9.2-9c1.5-3 5.1-5.8 9.4-7.3c2.2-.8 4-1.8 4-2.3s-.8-2-1.7-3.6q-4.3-7.9 3.4-13.9c5.2-4 14-4.6 21.7-1.7l4 1.4c1 0 .4-1.5-2.4-5.6c-3.2-4.7-3.9-7-3.5-12.7a15 15 0 0 1 13.5-13.5c5.8-.4 9.4 1.6 18 9.7a144 144 0 0 0 86 41.6c8.3 1 24.8.5 34.5-1a156 156 0 0 0 81.8-40.8c6.4-6 9.4-7.6 14.7-7.6c4.5 0 7.7 1.4 11 5c3 3.3 4 6.4 3.6 11.5c-.2 3.2-.7 4.7-2.6 7.9c-2.8 4.5-2.3 5 3.2 2.8c7.6-3 16.9-1.6 21.9 3.2c4.4 4.2 4.8 8.4 1.4 14c-1.3 2.1-2.3 4-2.3 4.4c0 .6 1 .8 5.5 1.6c6 1 9.5 5.4 9.5 12.2c0 2-.3 3.7-.6 3.7s-2.6-.9-5-1.9c-7-2.9-11-3.6-19.2-3.5c-6.2 0-8.3.3-12.6 1.7a58 58 0 0 0-19.5 11.5c-6.4 5.7-10.4 7.5-16.6 7.4q-8.7 0-11.8-5c-1.1-1.8-1.3-2.8-1-6.8c.2-2.6.1-4.7 0-4.7c-.3 0-2.5 1.4-5 3.1A81 81 0 0 1 778 560a182 182 0 0 1-82.3 9.7"/><path d="M706.3 525.2a136 136 0 0 1-97.9-55.7c-24.4-33.2-32-77.1-24.6-117.2c4-18.3 12-36.6 25.5-49.6a115 115 0 0 0-8.7 74.3c9 49.8 51 91.9 101.3 99.2c20 5.7 40.5-.4 59.5-6.5c42-14.8 74-54.6 77.8-99.1c3.3-24-.3-49.1-11.2-71c6.2 3.3 14 16.2 18.6 24.8c16 31 16.7 68.1 7.3 101.2c-12.8 42.1-45 79-87.5 92.4a166 166 0 0 1-60 7.2z"/><g id="SVGUtTKHewd"><path d="M512 469.9c-2.5-.4-5.3 2.1-4.3 4.7c1.8 2.6 5 4 7.8 5.2a54 54 0 0 0 23.2 3.6a50 50 0 0 0 17-3c3-1 6.8-2 8-5.4c1.3-2.1-1-4.3-3.1-3.9c-3 .7-6 2-9 2.9a58 58 0 0 1-20.3 2a54 54 0 0 1-14.4-4.2c-1.6-.7-3.1-1.7-4.9-1.9"/><path d="M514.8 459.5c-2.5-.4-4.7 2.6-3.7 5c2 2.8 5.3 4.3 8.4 5.6a42 42 0 0 0 17 2.9h1.5a38 38 0 0 0 14.4-2.8c2.7-1.1 6.1-2.2 7.3-5.2c.9-1.7.2-4.1-2-4.3c-1.8 0-3.5 1.2-5.3 1.7a44 44 0 0 1-20.6 3.2c-4.4-.5-8.5-2.1-12.5-4c-1.5-.7-2.8-1.8-4.5-2z"/><path d="M518.3 449.6c-2.2-.3-3.7 2.2-3.3 4.1c.3 1.8 1.8 3 3.1 4a30 30 0 0 0 18.6 5.3h1.6a28 28 0 0 0 12-2.8c2.5-1 5.4-2.3 6.3-5.2c.4-1.3.6-3.2-.9-4c-1.6-.8-3.1.5-4.5 1a34 34 0 0 1-15.5 3.9a27 27 0 0 1-13.1-4c-1.5-.7-2.7-2-4.3-2.3"/><path d="M481.5 302.7c-3.2 3.3-.7 9.3-1 13.5c1.8 13.2 3.9 26.5 8.8 39c6 12 18.8 18.5 26.5 29.2c2.8 5.1 1.8 11.3 2.4 17q.5 23 0 46c7 3.6 14.5 7 22.5 5.7c4.7-1.1 13.5-1.8 14.5-6.5l-1-79.5c-2.7-8.1-11-12.3-17.1-17.5a156 156 0 0 1-14.2-16.1c-2.6-4.5-12.9-6-9.2 1.6c2.2 6.7 7.7 11.6 9.1 18.6c.3 3.9 5 11 1 13.2a25 25 0 0 0-10.7-10c-4.4-3.3-11.7-4.7-13.3-10.5a43 43 0 0 0-11-22c1.5-7.4 0-16.7-6.4-21.5z"/><path d="M491.4 304.2c-3 .5-2.8 4.2-1.5 6.2a27 27 0 0 1 1.1 13.4a44 44 0 0 1 10.6 21.7c0 3 3.2 4 5.3 5.5c4.9 3.1 10.3 5.4 14.7 9.3c.9 1 1.6 2 1 0c-.7-2.6-1-5.4-3-7.3c-2.8-3-6.2-5.6-10.2-6.4c-.3-4.2-2.3-8-4.1-11.6c-2-3.5-4.1-7.2-7.5-9.4c0-6.1 0-12.5-2.6-18.2c-.8-1.4-2-3.1-3.8-3.2"/><path d="M499.7 306.6c-2 .6-1.6 3.2-1 4.7a54 54 0 0 1 1 13.2c3.9 3 6.2 7.4 8.4 11.6q2.2 4.2 3.1 8.9c3.1 1 5.8 3 8.2 5c-1-2.8-3-5-4.5-7.7s-3-5.6-3.7-8.7c-3-3.1-4.6-7.6-4-12c.2-4.7-1.3-9.6-4.5-13.2c-.8-.8-1.8-1.7-3-1.8"/><path d="M509.2 308c-1.2.2-1.8 1.2-2.4 2.1c-.3.9.8 1.8 1 2.8a22 22 0 0 1 1.4 10.4q0 3.9 2 7a4 4 0 0 1 3.5-2.8c.5 0 1.4.2 1-.7q-.4-7.3-2.8-14a10 10 0 0 0-2.8-4.5q-.4-.4-1-.3z"/></g><use width="100%" height="100%" href="#SVGUtTKHewd" transform="matrix(-1 0 0 1 1440 0)"/><path d="M715.7 476a36 36 0 0 1-29.9-24c.3-2.2 3 1.2 4.3 1.5a19 19 0 0 0 8 2.6c3.5 1.5 5.7 5 9.1 6.9c1.6 1.2 7.2 3.6 6.1-.3c-1.3-2-2.2-4.6-1-7c1.8-4.1 4.7-7.7 7.7-11.2c2.1-.7 3.6 3.6 5.1 5c2.1 3.3 4.7 7.3 3.4 11.3c-1.2 1.5-2 6 1.3 4.6c4-1.8 7.3-4.8 10.6-7.6c3-2 6.7-2.1 9.7-4c1.5-.3 4.4-3.1 5-1.6a45 45 0 0 1-7.4 12.3a32 32 0 0 1-18.8 10.9q-6.6 1.2-13.2.6"/><path d="M731.5 460.2q.4-4-1.7-8q-3.3-6.2-8-11.9c-2.8-1.6-4.3 3.7-6.1 5.2c-2.9 4.3-6.5 8.7-6.7 14c-1.6 2.5-4.6-2-5.9-3.5a19 19 0 0 1-4-12a51 51 0 0 1 3.6-20.6c2-5.6 5.1-11 4.8-17c.2-4.7-.7-9.7-4.4-12.8c-3.6-2.8 2.3-3.4 4.1-2c3.2.3 4.9 5.5 7.8 4.2c1.1-2.7 1.4-6 3.8-8.1c2.3-3.2 4.7 1.3 5.5 3.5c1.7 1.8 0 6.5 2.6 6.6c3.2-2.3 5.5-6 9.6-6.9c1.7-1 4.5 0 2.3 1.8c-3 2.9-5.6 6.4-6.2 10.7c-.9 5.3.4 10.7 2.7 15.4c4.5 9.4 8 20 5.7 30.5c-1 4.6-4.2 8.6-8 11.3c-.5.3-1.3.3-1.5-.4"/><path d="M726.7 389.6a21 21 0 0 0-5.6-7c-2.4 0-3.9 3-5.5 4.6c-1.1 2.1-2.5 5.6-5.3 2.9c-4.5-2.6-5.2-8.3-5.2-13c-.3-7.6 2.8-14.7 5.5-21.6c1.7-4.3 1.3-9.2.2-13.6c-1.3-5-5.4-8.6-8.5-12.6c.2-1.5 4.2-.7 5.7-.4c3.4.9 5.4 3.8 7.9 6c1.8-.6 1-4.2 1.9-5.9c0-2.4 3.2-5.5 4.5-2.1c2 2.2 0 6.5 2.5 7.8c2.4-.9 3.6-3.5 5.8-4.7a8 8 0 0 1 7.8-.5c.9 2.2-2.6 4-3.6 6a20 20 0 0 0-3.8 18c1.4 5 3.8 9.5 4.7 14.5a40 40 0 0 1-.5 17.2c-.9 3.4-3.8 5.6-6.8 7q-1-1.1-1.7-2.6"/><path d="M711.6 326.9c-3.4-2.5-4.5-4.8-4.5-9.5c0-2.3.5-3.6 2-5.8q3.6-4.7-1.3-3.3q-7.8 2.3-8-4.3c0-2.2.4-3.1 3.3-6.7q3.6-4.1 2.8-4.8q-.6-.7-9 7.8a124 124 0 0 1-11.4 10.6c-9.8 6.6-19.2 7.6-23.5 2.5c-2.2-2.6-2.1-4 .4-5.6a27 27 0 0 0 4.4-3.7a86 86 0 0 1 16.1-11.6q5.5-2.9 2.1-3c-3 0-12.5 6.2-19.8 12.8c-2.1 2-5.2 4.2-6.8 5a25 25 0 0 1-13.9 1c-2.2-.7-6.3-4.5-6.3-5.9c0-.3 1-1.1 2-1.8a30 30 0 0 0 4.6-3.2c5.8-5 16.8-10.3 25.5-12.2c2.8-.5 1.7-2-1.4-1.8a56 56 0 0 0-25 11.7c-8.3 6.9-20.8 6.2-24.8-1.3c-.7-1.3-1.2-2.5-1-2.7a93 93 0 0 0 20.4-7.8a52 52 0 0 1 18.1-6.5c2.8-.5 3-1.9.3-2.2c-3.6-.4-9 1.4-18.5 6c-12.3 6.1-15.8 7.2-22.2 6.8c-6-.4-9.3-1.9-14-6.4c-3.2-3-7.6-10.5-6.8-11.4a64 64 0 0 0 15.8 1.3c8.3 0 10.6-.2 15-1.5a84 84 0 0 0 24-12.1a58 58 0 0 1 36.8-13.6c12.4 0 20.2 2.8 27.2 9.9c2.4 2.4 4.4 3.9 4.7 3.6s.6-4.5.7-9.3c0 0 3.7-.4 4.5.7c0 7.7 0 8.4 1.2 8.4q1.2-.1 2-2c1-2.5 5-6 9.2-8.2c9-4.5 24.7-4.7 37.3-.3a62 62 0 0 1 16.7 9.5a90 90 0 0 0 24 12c6.8 2 19 2.5 25.1 1l5.4-1c2.3 0-1.6 7.6-6.2 12.1c-8.4 8.2-19.3 8.1-34.6-.1c-9.6-5.2-21-8-21-5.2q0 1 1.5 1q5 0 18.7 6.5a54 54 0 0 0 18.3 6.5q3.5 0 .2 4.7q-3.5 5-11.7 5c-5.3 0-8.3-1.1-13-5c-8-6.6-27.6-14-26.9-10q.2 1 3.2 1.5a56 56 0 0 1 23.1 11l5.9 4.3c1.1.6 1.1.8.2 2.5c-1.4 2.8-5.2 4.9-9.2 5.3q-7.6 1-14.5-5c-10-8.3-19.3-14.3-22.3-14.3q-3.7.1 3 3.7a80 80 0 0 1 15.8 11c2 1.9 4.3 3.7 5 4.1c1.9 1 1.8 2.4-.2 5s-5.4 3.8-9.7 3.3c-8.6-.9-15.4-5-26-16a71 71 0 0 0-8.2-7.8q-2 .2 2.2 5c3.4 3.7 4 5.8 2.7 9c-1.1 2.6-3 3.3-6.8 2.2q-6-1.5-2 3.1c3.8 4.9 3.3 10.7-1.5 14.8a12 12 0 0 1-3.4 2.3q-.8-.1-2.3-2.4q-4.3-6.9-8.7 0l-2 3z"/><path d="m726.7 233l-5.2 4l-4.6-3.4v27.8h9.8z"/><path d="M694.9 204.3a88 88 0 0 1-9 32.3l11.1-10.3l7.7 9.2l8.4-9.4l8.5 8l8.2-8.3l8.5 10l7.4-8.2l12.6 9c-4.6-10-10.7-18.6-10-32.8c-12.1 9-41 10.6-53.4.4z"/><path d="M717 197.6q-7-.2-13.4 1a20 20 0 0 0-7.8 3c.3 8.6 41 12.1 51.9.2a20 20 0 0 0-8.2-3.3c-4-.8-8.6-.8-12.9-1v7.1H717z"/><path d="M724.9 154h-6.3v49.4h6.4z"/><path d="m724.9 155.2l-2.4 23.7l24.3 11.9l-12.3-16.5l16.8-5.5zm-2.7-6.1c-3.7 0-6.4 1.4-6.4 3s2.7 3 6.4 3s6.4-1.4 6.4-3s-2.7-3-6.4-3"/></g></svg>',
      CAD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M150.1 0h339.7v480H150z"/><path fill="#d52b1e" d="M-19.7 0h169.8v480H-19.7zm509.5 0h169.8v480H489.9zM201 232l-13.3 4.4l61.4 54c4.7 13.7-1.6 17.8-5.6 25l66.6-8.4l-1.6 67l13.9-.3l-3.1-66.6l66.7 8c-4.1-8.7-7.8-13.3-4-27.2l61.3-51l-10.7-4c-8.8-6.8 3.8-32.6 5.6-48.9c0 0-35.7 12.3-38 5.8l-9.2-17.5l-32.6 35.8c-3.5.9-5-.5-5.9-3.5l15-74.8l-23.8 13.4q-3.2 1.3-5.2-2.2l-23-46l-23.6 47.8q-2.8 2.5-5 .7L264 130.8l13.7 74.1c-1.1 3-3.7 3.8-6.7 2.2l-31.2-35.3c-4 6.5-6.8 17.1-12.2 19.5s-23.5-4.5-35.6-7c4.2 14.8 17 39.6 9 47.7"/></svg>',
      COP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#ffe800" d="M0 0h640v480H0z"/><path fill="#00148e" d="M0 240h640v240H0z"/><path fill="#da0010" d="M0 360h640v120H0z"/></g></svg>',
      CRC: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#0000b4" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 75.4h640v322.3H0z"/><path fill="#d90000" d="M0 157.7h640v157.7H0z"/></g></svg>',
      CUP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGqHqQoeFk"><path fill-opacity=".7" d="M-32 0h682.7v512H-32z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGqHqQoeFk)" transform="translate(30)scale(.94)"><path fill="#002a8f" d="M-32 0h768v512H-32z"/><path fill="#fff" d="M-32 102.4h768v102.4H-32zm0 204.8h768v102.4H-32z"/><path fill="#cb1515" d="m-32 0l440.7 255.7L-32 511z"/><path fill="#fff" d="M161.8 325.5L114.3 290l-47.2 35.8l17.6-58.1l-47.2-36l58.3-.4l18.1-58l18.5 57.8l58.3.1l-46.9 36.3z"/></g></svg>',
      GEL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="red" d="M272 0h96v480h-96z"/><path fill="red" d="M0 192h640v96H0z"/><path fill="red" fill-rule="evenodd" d="M146.8 373.1c1-16.8 4-31.1 4-31.1s-9.8 1-14.8 1s-14.8-1-14.8-1s3 14.3 4 31.2c-16.9-1-31.2-4-31.2-4s1 7.4 1 14.8s-1 14.8-1 14.8s14.3-3 31.2-4c-1 16.9-4 31.2-4 31.2s7.4-1 14.8-1s14.8 1 14.8 1s-3-14.3-4-31.2c16.9 1 31.2 4 31.2 4s-1-9.8-1-14.8s1-14.8 1-14.8s-14.3 3-31.1 4zm368-288c1-16.8 4-31.1 4-31.1s-9.8 1-14.8 1s-14.8-1-14.8-1s3 14.3 4 31.1c-16.9-1-31.2-3.9-31.2-3.9s1 7.4 1 14.8s-1 14.8-1 14.8s14.3-3 31.2-4c-1 16.9-4 31.2-4 31.2s7.4-1 14.8-1s14.8 1 14.8 1s-3-14.3-4-31.1c16.9 1 31.2 4 31.2 4s-1-10-1-14.9s1-14.8 1-14.8s-14.3 3-31.2 4zm-368 0c1-16.8 4-31.1 4-31.1s-9.8 1-14.8 1s-14.8-1-14.8-1s3 14.3 4 31.2c-16.9-1-31.2-4-31.2-4s1 7.4 1 14.8s-1 14.8-1 14.8s14.3-3 31.2-4c-1 16.9-4 31.2-4 31.2s7.4-1 14.8-1s14.8 1 14.8 1s-3-14.3-4-31.2c16.9 1 31.2 4 31.2 4s-1-9.8-1-14.8s1-14.8 1-14.8s-14.3 3-31.1 4zm368 288c1-16.8 4-31.1 4-31.1s-9.8 1-14.8 1s-14.8-1-14.8-1s3 14.3 4 31.2c-16.9-1-31.2-4-31.2-4s1 7.4 1 14.8s-1 14.8-1 14.8s14.3-3 31.2-4c-1 16.9-4 31.2-4 31.2s7.4-1 14.8-1s14.8 1 14.8 1s-3-14.3-4-31.2c16.9 1 31.2 4 31.2 4s-1-9.8-1-14.8s1-14.8 1-14.8s-14.3 3-31.2 4z"/></svg>',
          CHF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h640v480H0z"/><g fill="#fff"><path d="M170 195h300v90H170z"/><path d="M275 90h90v300h-90z"/></g></g></svg>',
      DKK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#c8102e" d="M0 0h640.1v480H0z"/><path fill="#fff" d="M205.7 0h68.6v480h-68.6z"/><path fill="#fff" d="M0 205.7h640.1v68.6H0z"/></svg>',
          HKD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#EC1B2E" d="M0 0h640v480H0"/><path id="SVG6hxOLeeh" fill="#fff" d="M346.3 103.1C267 98 230.6 201.9 305.6 240.3c-26-22.4-20.6-55.3-10.1-72.4l1.9 1.1c-13.8 23.5-11.2 52.7 11.1 71c-12.7-12.3-9.5-39 12.1-48.9s23.6-39.3 16.4-49.1q-14.7-25.6 9.3-38.9M307.9 164l-4.7 7.4l-1.8-8.6l-8.6-2.3l7.8-4.3l-.6-8.9l6.5 6.1l8.3-3.3l-3.7 8.1l5.6 6.8z"/><use href="#SVG6hxOLeeh" transform="rotate(72 312.5 243.5)"/><use href="#SVG6hxOLeeh" transform="rotate(144 312.5 243.5)"/><use href="#SVG6hxOLeeh" transform="rotate(216 312.5 243.5)"/><use href="#SVG6hxOLeeh" transform="rotate(288 312.5 243.5)"/></svg>',
          HNL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#18c3df" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><g id="SVGnZdcPcGH" fill="#18c3df" transform="translate(320 240)scale(26.66665)"><g id="SVGn5urherG"><path id="SVG0aKtNxaY" d="m-.3 0l.5.1L0-1z"/><use width="100%" height="100%" href="#SVG0aKtNxaY" transform="scale(-1 1)"/></g><use width="100%" height="100%" href="#SVGn5urherG" transform="rotate(72)"/><use width="100%" height="100%" href="#SVGn5urherG" transform="rotate(-72)"/><use width="100%" height="100%" href="#SVGn5urherG" transform="rotate(144)"/><use width="100%" height="100%" href="#SVGn5urherG" transform="rotate(-144)"/></g><use width="100%" height="100%" href="#SVGnZdcPcGH" transform="translate(133.3 -42.7)"/><use width="100%" height="100%" href="#SVGnZdcPcGH" transform="translate(133.3 37.3)"/><use width="100%" height="100%" href="#SVGnZdcPcGH" transform="translate(-133.3 -42.7)"/><use width="100%" height="100%" href="#SVGnZdcPcGH" transform="translate(-133.3 37.3)"/></svg>',
      IDR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#e70011" d="M0 0h640v240H0Z"/><path fill="#fff" d="M0 240h640v240H0Z"/></svg>',
      JOD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGvdczqXZe"><path fill-opacity=".7" d="M-117.8 0h682.6v512h-682.6z"/></clipPath></defs><g clip-path="url(#SVGvdczqXZe)" transform="translate(110.5)scale(.9375)"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#000001" d="M-117.8 0h1024v170.7h-1024z"/><path fill="#fff" d="M-117.8 170.7h1024v170.6h-1024z"/><path fill="#090" d="M-117.8 341.3h1024V512h-1024z"/><path fill="red" d="m-117.8 512l512-256l-512-256z"/><path fill="#fff" d="m24.5 289l5.7-24.9H4.7l23-11l-15.9-19.9l23 11l5.6-24.8l5.7 24.9L69 233.2l-16 19.9l23 11H50.6l5.7 24.9l-15.9-20z"/></g></g></svg>',
      KES: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><path id="SVG9L8Mfcnn" fill="#000" stroke-miterlimit="10" d="m-28.6 47.5l1.8 1l46.7-81c2.7-.6 4.2-3.2 5.7-5.8c1-1.8 5-8.7 6.7-17.7a58 58 0 0 0-11.9 14.7c-1.5 2.6-3 5.2-2.3 7.9z"/></defs><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#000001" d="M0 0h640v144H0z"/><path fill="#060" d="M0 336h640v144H0z"/><g id="SVGUfyOEbEH" transform="matrix(3 0 0 3 320 240)"><use width="100%" height="100%" stroke="#000" href="#SVG9L8Mfcnn"/><use width="100%" height="100%" fill="#fff" href="#SVG9L8Mfcnn"/></g><use width="100%" height="100%" href="#SVGUfyOEbEH" transform="matrix(-1 0 0 1 640 0)"/><path fill="#b00" d="M640.5 168H377c-9-24-39-72-57-72s-48 48-57 72H-.2v144H263c9 24 39 72 57 72s48-48 57-72h263.5z"/><path id="SVGFNosBdQz" fill="#000" d="M377 312c9-24 15-48 15-72s-6-48-15-72c-9 24-15 48-15 72s6 48 15 72"/><use width="100%" height="100%" href="#SVGFNosBdQz" transform="matrix(-1 0 0 1 640 0)"/><g fill="#fff" transform="matrix(3 0 0 3 320 240)"><ellipse rx="4" ry="6"/><path id="SVGJEs4ZcGj" d="M1 5.8s4 8 4 21s-4 21-4 21z"/><use width="100%" height="100%" href="#SVGJEs4ZcGj" transform="scale(-1)"/><use width="100%" height="100%" href="#SVGJEs4ZcGj" transform="scale(-1 1)"/><use width="100%" height="100%" href="#SVGJEs4ZcGj" transform="scale(1 -1)"/></g></svg>',
          HUF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#fff" d="M640 480H0V0h640z"/><path fill="#388d00" d="M640 480H0V320h640z"/><path fill="#d43516" d="M640 160.1H0V.1h640z"/></g></svg>',
          ARS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#74acdf" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><g id="SVGORy5lq1Y" transform="translate(-64)scale(.96)"><path id="SVG00p3VbuB" fill="#f6b40e" stroke="#85340a" stroke-width="1.1" d="m396.8 251.3l28.5 62s.5 1.2 1.3.9c.8-.4.3-1.6.3-1.6l-23.7-64m-.7 24.2c-.4 9.4 5.4 14.6 4.7 23s3.8 13.2 5 16.5c1 3.3-1.2 5.2-.3 5.7c1 .5 3-2.1 2.4-6.8s-4.2-6-3.4-16.3s-4.2-12.7-3-22"/><use width="100%" height="100%" href="#SVG00p3VbuB" transform="rotate(22.5 400 250)"/><use width="100%" height="100%" href="#SVG00p3VbuB" transform="rotate(45 400 250)"/><use width="100%" height="100%" href="#SVG00p3VbuB" transform="rotate(67.5 400 250)"/><path id="SVGCPj9ubAZ" fill="#85340a" d="M404.3 274.4c.5 9 5.6 13 4.6 21.3c2.2-6.5-3.1-11.6-2.8-21.2m-7.7-23.8l19.5 42.6l-16.3-43.9"/><use width="100%" height="100%" href="#SVGCPj9ubAZ" transform="rotate(22.5 400 250)"/><use width="100%" height="100%" href="#SVGCPj9ubAZ" transform="rotate(45 400 250)"/><use width="100%" height="100%" href="#SVGCPj9ubAZ" transform="rotate(67.5 400 250)"/></g><use width="100%" height="100%" href="#SVGORy5lq1Y" transform="rotate(90 320 240)"/><use width="100%" height="100%" href="#SVGORy5lq1Y" transform="rotate(180 320 240)"/><use width="100%" height="100%" href="#SVGORy5lq1Y" transform="rotate(-90 320 240)"/><circle cx="320" cy="240" r="26.7" fill="#f6b40e" stroke="#85340a" stroke-width="1.4"/><path id="SVGmc65Hc4y" fill="#843511" stroke-width="1" d="M329 234.3c-1.7 0-3.5.8-4.5 2.4c2 1.9 6.6 2 9.7-.2a7 7 0 0 0-5.1-2.2zm0 .4c1.8 0 3.5.8 3.7 1.6c-2 2.3-5.3 2-7.4.4q1.6-2 3.8-2z"/><use width="100%" height="100%" href="#SVGCb5PxN0w" transform="matrix(-1 0 0 1 640.2 0)"/><use width="100%" height="100%" href="#SVGbzJRae4o" transform="matrix(-1 0 0 1 640.2 0)"/><use width="100%" height="100%" href="#SVGPtUKndDv" transform="translate(18.1)"/><use width="100%" height="100%" href="#SVGzcGMbeuD" transform="matrix(-1 0 0 1 640.2 0)"/><path fill="#85340a" d="M316 243.7a1.8 1.8 0 1 0 1.8 2.9a4 4 0 0 0 2.2.6h.2q1 0 2.3-.6q.5.7 1.5.7a1.8 1.8 0 0 0 .3-3.6q.8.3.8 1.2a1.2 1.2 0 0 1-2.4 0a3 3 0 0 1-2.6 1.7a3 3 0 0 1-2.5-1.7q-.1 1.1-1.3 1.2q-1-.1-1.2-1.2c-.2-1.1.3-1 .8-1.2zm2 5.4c-2.1 0-3 2-4.8 3.1c1-.4 1.8-1.2 3.3-2s2.6.2 3.5.2s2-1 3.5-.2l3.3 2c-1.9-1.2-2.7-3-4.8-3q-.7 0-2 .6z"/><path fill="#85340a" d="M317.2 251.6q-1.1 0-3.4.6c3.7-.8 4.5.5 6.2.5c1.6 0 2.5-1.3 6.1-.5c-4-1.2-4.9-.4-6.1-.4c-.8 0-1.4-.3-2.8-.2"/><path fill="#85340a" d="M314 252.2h-.8c4.3.5 2.3 3 6.8 3s2.5-2.5 6.8-3c-4.5-.4-3.1 2.3-6.8 2.3c-3.5 0-2.4-2.3-6-2.3"/><path fill="#85340a" d="M323.7 258.9a3.7 3.7 0 0 0-7.4 0a3.8 3.8 0 0 1 7.4 0"/><path id="SVGbzJRae4o" fill="#85340a" stroke-width="1" d="M303.4 234.3c4.7-4.1 10.7-4.8 14-1.7a8 8 0 0 1 1.5 3.4q.6 3.6-2.1 7.5l.8.4q2.4-4.7 1.6-9.4l-.6-2.3c-4.5-3.7-10.7-4-15.2 2z"/><path id="SVGCb5PxN0w" fill="#85340a" stroke-width="1" d="M310.8 233c2.7 0 3.3.6 4.5 1.7c1.2 1 1.9.8 2 1c.3.2 0 .8-.3.6q-.7-.2-2.5-1.6c-1.8-1.4-2.5-1-3.7-1c-3.7 0-5.7 3-6.1 2.8c-.5-.2 2-3.5 6.1-3.5"/><use width="100%" height="100%" href="#SVGmc65Hc4y" transform="translate(-18.4)"/><circle id="SVGPtUKndDv" cx="310.9" cy="236.3" r="1.8" fill="#85340a" stroke-width="1"/><path id="SVGzcGMbeuD" fill="#85340a" stroke-width="1" d="M305.9 237.5c3.5 2.7 7 2.5 9 1.3c2-1.3 2-1.7 1.6-1.7s-.8.4-2.4 1.3c-1.7.8-4.1.8-8.2-.9"/></svg>',
      IQD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#ce1126" d="M0 0h640v160H0z"/><path fill="#000001" d="M0 320h640v160H0z"/><g fill="#007a3d" transform="translate(-179.3 -92.8)scale(1.75182)"><path d="m325.5 173.2l-1.4-1q-.6-.7 1.2-.2q3.3 1 5.3-.8l1.3-1.1l1.5.7q1.5.8 2 .7c.7-.2 2.1-2 2-2.6c0-.7.6-.5 1 .3c.6 1.6-.3 3.5-2 3.9q-1 .3-2.6-.3c-1.4-.5-1.7-.5-2.4 0a5 5 0 0 1-5.9.4m5.8-5.3a8 8 0 0 1-1-4q.1-.9.8-.6c1 .3 1.2 1 1 3q0 2.7-.8 1.6m-67.6-1.9c-.1 1.3 2.4 4.6 3.5 5.2c-.8.3-1.7.2-2.4.5c-4 4-18.4 18-21 21.4c7.8.2 16.4-.1 23.7-.4c0-5.3 5-5.6 8.4-7.5c1.7 2.7 6 2.5 6.6 6.6v17.6H216a9.7 9.7 0 0 1-12.3 7.5c2-2 5.4-2.8 6.6-5.7c1-6.4-2-10.3-4-14a24 24 0 0 0 7-3.6c-2.3 7 6.2 6.3 12.4 6.1c.2-2.4.1-5.2-1.7-5.6c2.3-.9 2.7-1.2 6.6-4.4v9.6l46.1-.1c0-3 .8-7.9-1.6-7.9c-2.2 0 0 6.2-1.8 6.2h-35.7v-6c1.5-1.6 1.3-1.5 11.6-11.8c1-1 8.3-7.6 14.6-13.7zm89.1-.3c2.5 1.4 4.5 3.2 7.5 4c-.3 1.3-1.5 1.8-1.8 3.1v27c3.4.7 4.2-1.3 5.8-2.3c.4 4.3 3.2 8.5 3 12h-14.5zm-19.4 14.5s5.3-4.5 5.3-4.7V199h3.8l-.1-26.3c1.5-1.6 4.6-3.8 5.3-5.4v42h-33.4c-.5-8.7-.6-17.7 9.6-15.8V190c-.3-.6-.9.1-1-.7c1.6-1.6 2.1-2 6.5-5.8l.1 15.5h3.9zm-12.6 18.6c.7 1 3.2 1 3-.8c-.3-1.5-3.5-1-3 .8"/><circle cx="224" cy="214.4" r="2"/><path d="M287 165.8c2.5 1.3 4.5 3.2 7.6 4c-.4 1.2-1.5 1.7-1.8 3v27c3.4.7 4.1-1.2 5.7-2.3c.5 4.3 3.2 8.6 3.1 12H287z"/></g></svg>',
      ISK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG9mrxwcPk"><path fill-opacity=".7" d="M0 0h640v480H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="0" clip-path="url(#SVG9mrxwcPk)"><path fill="#003897" d="M0 0h666.7v480H0z"/><path fill="#fff" d="M0 186.7h186.7V0h106.6v186.7h373.4v106.6H293.3V480H186.7V293.3H0z"/><path fill="#d72828" d="M0 213.3h213.3V0h53.4v213.3h400v53.4h-400V480h-53.4V266.7H0z"/></g></svg>',
      JMD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#000001" d="m0 0l320 240L0 480zm640 0L320 240l320 240z"/><path fill="#090" d="m0 0l320 240L640 0zm0 480l320-240l320 240z"/><path fill="#fc0" d="M640 0h-59.6L0 435.3V480h59.6L640 44.7z"/><path fill="#fc0" d="M0 0v44.7L580.4 480H640v-44.7L59.6 0z"/></g></svg>',
      IRR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><path id="SVGQzCDLdwI" d="M17.8 359.9H21V371h-3.3z"/><path id="SVG1Nxnfmsu" d="M-62.8 359.9h3.3V371h-3.3z"/><path id="SVGyWEyCbTg" d="M97.7 359.9h3.4V371h-3.4z"/><path id="SVGXdNP2e5A" d="M662 359.9h3.5V371H662z"/><path id="SVG1xq52bua" d="M178.1 359.9h3.4V371h-3.4z"/><path id="SVGPcq4Hlbq" d="M258.9 359.9h3.4V371h-3.4z"/><path id="SVG0HDfpcUR" d="M340 359.9h3.5V371H340z"/><path id="SVGj48TNd7L" d="M420.8 359.9h3.4V371h-3.4z"/><path id="SVGycz5zeRH" d="M501.6 359.9h3.3V371h-3.3z"/><path id="SVGJASR0GlT" d="M582.8 359.9h3.3V371h-3.3z"/><path id="SVGE6mZldzk" d="M-144.4 359.9h3.4V371h-3.4z"/><path id="SVGW8rEveGb" d="M17.8 152.3H21v11.3h-3.3z"/><path id="SVGMJ6kZyOT" d="M-62.8 152.3h3.3v11.3h-3.3z"/><path id="SVGX4GdwDXc" d="M97.7 152.3h3.4v11.3h-3.4z"/><path id="SVGgaWjTPtA" d="M662 152.3h3.5v11.3H662z"/><path id="SVGxXbbfdLs" d="M178.1 152.3h3.4v11.3h-3.4z"/><path id="SVGGBboFeVF" d="M258.9 152.3h3.4v11.3h-3.4z"/><path id="SVG2mA3sk5o" d="M340 152.3h3.5v11.3H340z"/><path id="SVGzXlE9b8u" d="M420.8 152.3h3.4v11.3h-3.4z"/><path id="SVG55CWAd1y" d="M501.6 152.3h3.3v11.3h-3.3z"/><path id="SVGOquJocxO" d="M582.8 152.3h3.3v11.3h-3.3z"/><path id="SVGSek8PVQS" d="M-144.4 152.3h3.4v11.3h-3.4z"/><clipPath id="SVGrWZOadRL"><path fill-opacity=".7" d="M-85.3 0h682.7v512H-85.3z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGrWZOadRL)" transform="translate(80)scale(.9375)"><path fill="#fff" d="M-192 0h896v512h-896z"/><path fill="#da0000" d="M-192 343.8h896V512h-896z"/><g fill="#fff" stroke-width="1pt"><path d="M-21.6 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm41.9 0v3.3h-9.8v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M52.4 367.7v3.4H33.8v-3.4zm-34.6-7.9H21v11.3h-3.3z"/><path d="M49.6 351H53v20h-3.4zm-8.4 0h3.3v20h-3.3zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGQzCDLdwI"/><use href="#SVGQzCDLdwI"/><path d="M17.8 359.9H21V371h-3.3zm-39.3 0h3.3V371h-3.3zm28.8 0h3.4V371H7.3zm-14.3 0h3.4V371H-7z"/><path d="M9.6 367.7v3.4H-5.5v-3.4zm1-8.7v3.4H1V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M-102.2 351h49v3.3h-49zm7.3 16.8h3.4v3.3H-95zm41.9 0v3.3h-9.8v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M-28.2 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.3v11.3h-3.3z"/><path d="M-31 351h3.4v20H-31zm-8.4 0h3.3v20h-3.3zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVG1Nxnfmsu"/><use href="#SVG1Nxnfmsu"/><path d="M-62.8 359.9h3.3V371h-3.3zm-39.3 0h3.3V371h-3.3zm28.8 0h3.3V371h-3.3zm-14.3 0h3.4V371h-3.4z"/><path d="M-71 367.7v3.4h-15v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M58.3 351h49v3.3h-49zm7.3 16.8H69v3.3h-3.4zm41.9 0v3.3h-9.8v-3.4zm5.3-16.8h3.4v20h-3.4z"/><path d="M132.3 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M129.5 351h3.4v20h-3.4zm-8.4 0h3.4v20H121zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGyWEyCbTg"/><use href="#SVGyWEyCbTg"/><path d="M97.7 359.9h3.4V371h-3.4zm-39.3 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371h-3.4z"/><path d="M89.6 367.7v3.4H74.4v-3.4zm1-8.7v3.4H81V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M622.7 351h49v3.3h-49zm7.3 16.8h3.4v3.3H630zm41.9 0v3.3H662v-3.4zm5.3-16.8h3.3v20h-3.4z"/><path d="M696.7 367.7v3.4H678v-3.4zm-34.6-7.9h3.4v11.3H662z"/><path d="M694 351h3.3v20h-3.4zm-8.5 0h3.4v20h-3.4zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGXdNP2e5A"/><use href="#SVGXdNP2e5A"/><path d="M662 359.9h3.5V371H662zm-39.2 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371h-3.4z"/><path d="M654 367.7v3.4h-15.2v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M138.7 351h49.1v3.3h-49zm7.4 16.8h3.3v3.3h-3.3zm41.8 0v3.3h-9.8v-3.4zm5.3-16.8h3.4v20h-3.4z"/><path d="M212.8 367.7v3.4h-18.6v-3.4zm-34.7-7.9h3.4v11.3h-3.4z"/><path d="M210 351h3.4v20H210zm-8.5 0h3.4v20h-3.4zm-44.8 8v3.4h-17.9V359zm39.3 0v3.4h-17.9V359z"/><use href="#SVG1xq52bua"/><use href="#SVG1xq52bua"/><path d="M178.1 359.9h3.4V371h-3.4zm-39.3 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.2 0h3.3V371h-3.3z"/><path d="M170 367.7v3.4h-15.1v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M219.5 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm41.9 0v3.3h-9.8v-3.4zM274 351h3.3v20H274z"/><path d="M293.5 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M290.7 351h3.4v20h-3.4zm-8.4 0h3.4v20h-3.4zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGPcq4Hlbq"/><use href="#SVGPcq4Hlbq"/><path d="M258.9 359.9h3.4V371h-3.4zm-39.3 0h3.3V371h-3.3zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371H234z"/><path d="M250.8 367.7v3.4h-15.2v-3.4zm1-8.7v3.4H242V359z"/></g><path fill="#239f40" d="M-192 0h896v168.2h-896z"/><g fill="#fff" stroke-width="1pt"><path d="M300.7 351h49v3.3h-49zm7.3 16.8h3.4v3.3H308zm41.9 0v3.3H340v-3.4zm5.3-16.8h3.3v20h-3.3z"/><path d="M374.7 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3H340z"/><path d="M372 351h3.3v20H372zm-8.5 0h3.4v20h-3.4zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVG0HDfpcUR"/><use href="#SVG0HDfpcUR"/><path d="M340 359.9h3.5V371H340zm-39.2 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371h-3.4z"/><path d="M332 367.7v3.4h-15.2v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M381.4 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm42 0v3.3h-9.9v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M455.4 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M452.7 351h3.3v20h-3.3zm-8.5 0h3.4v20h-3.4zm-44.8 8v3.4h-17.9V359zm39.3 0v3.4h-17.9V359z"/><use href="#SVGj48TNd7L"/><use href="#SVGj48TNd7L"/><path d="M420.8 359.9h3.4V371h-3.4zm-39.3 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371h-3.3z"/><path d="M412.7 367.7v3.4h-15.1v-3.4zm1-8.7v3.4H404V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M462.2 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm41.9 0v3.3h-9.8v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M536.2 367.7v3.4h-18.6v-3.4zm-34.7-7.9h3.4v11.3h-3.4z"/><path d="M533.4 351h3.4v20h-3.4zm-8.4 0h3.3v20H525zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGycz5zeRH"/><use href="#SVGycz5zeRH"/><path d="M501.6 359.9h3.3V371h-3.3zm-39.4 0h3.4V371h-3.4zm28.9 0h3.3V371h-3.3zm-14.3 0h3.4V371h-3.4z"/><path d="M493.4 367.7v3.4h-15.1v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M543.4 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm41.9 0v3.3h-9.8v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M617.4 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.3v11.3h-3.3z"/><path d="M614.6 351h3.4v20h-3.4zm-8.4 0h3.3v20h-3.3zm-44.8 8v3.4h-18V359zm39.3 0v3.4h-18V359z"/><use href="#SVGJASR0GlT"/><use href="#SVGJASR0GlT"/><path d="M582.8 359.9h3.3V371h-3.3zm-39.3 0h3.3V371h-3.3zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371H558z"/><path d="M574.6 367.7v3.4h-15.1v-3.4zm1-8.7v3.4H566V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M-183.8 351h49v3.3h-49zm7.3 16.8h3.4v3.3h-3.4zm42 0v3.3h-9.9v-3.4zm5.2-16.8h3.4v20h-3.4z"/><path d="M-109.8 367.7v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M-112.5 351h3.3v20h-3.3zm-8.5 0h3.4v20h-3.4zm-44.8 8v3.4h-17.9V359zm39.3 0v3.4h-17.9V359z"/><use href="#SVGE6mZldzk"/><use href="#SVGE6mZldzk"/><path d="M-144.4 359.9h3.4V371h-3.4zm-39.3 0h3.4V371h-3.4zm28.8 0h3.4V371h-3.4zm-14.3 0h3.4V371h-3.4z"/><path d="M-152.5 367.7v3.4h-15.2v-3.4zm1-8.7v3.4h-9.6V359z"/></g><g fill="#fff" stroke-width="1pt"><path d="M-21.6 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm41.9-.2v3.4h-9.8v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M52.4 160.2v3.4H33.8v-3.4zm-34.6-7.9H21v11.3h-3.3z"/><path d="M49.6 143.4H53v20.2h-3.4zm-8.4 0h3.3v20.2h-3.3zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGW8rEveGb"/><use href="#SVGW8rEveGb"/><path d="M17.8 152.3H21v11.3h-3.3zm-39.3 0h3.3v11.3h-3.3zm28.8 0h3.4v11.3H7.3zm-14.3 0h3.4v11.3H-7z"/><path d="M9.6 160.2v3.4H-5.5v-3.4zm1-8.7v3.3H1v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M-102.2 143.4h49v3.4h-49zm7.3 17h3.4v3.2H-95zm41.9-.2v3.4h-9.8v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M-28.2 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.3v11.3h-3.3z"/><path d="M-31 143.4h3.4v20.2H-31zm-8.4 0h3.3v20.2h-3.3zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGMJ6kZyOT"/><use href="#SVGMJ6kZyOT"/><path d="M-62.8 152.3h3.3v11.3h-3.3zm-39.3 0h3.3v11.3h-3.3zm28.8 0h3.3v11.3h-3.3zm-14.3 0h3.4v11.3h-3.4z"/><path d="M-71 160.2v3.4h-15v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M58.3 143.4h49v3.4h-49zm7.3 17H69v3.2h-3.4zm41.9-.2v3.4h-9.8v-3.4zm5.3-16.8h3.4v20.2h-3.4z"/><path d="M132.3 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M129.5 143.4h3.4v20.2h-3.4zm-8.4 0h3.4v20.2H121zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGX4GdwDXc"/><use href="#SVGX4GdwDXc"/><path d="M97.7 152.3h3.4v11.3h-3.4zm-39.3 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3h-3.4z"/><path d="M89.6 160.2v3.4H74.4v-3.4zm1-8.7v3.3H81v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M622.7 143.4h49v3.4h-49zm7.3 17h3.4v3.2H630zm41.9-.2v3.4H662v-3.4zm5.3-16.8h3.3v20.2h-3.4z"/><path d="M696.7 160.2v3.4H678v-3.4zm-34.6-7.9h3.4v11.3H662z"/><path d="M694 143.4h3.3v20.2h-3.4zm-8.5 0h3.4v20.2h-3.4zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGgaWjTPtA"/><use href="#SVGgaWjTPtA"/><path d="M662 152.3h3.5v11.3H662zm-39.2 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3h-3.4z"/><path d="M654 160.2v3.4h-15.2v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M138.7 143.4h49.1v3.4h-49zm7.4 17h3.3v3.2h-3.3zm41.8-.2v3.4h-9.8v-3.4zm5.3-16.8h3.4v20.2h-3.4z"/><path d="M212.8 160.2v3.4h-18.6v-3.4zm-34.7-7.9h3.4v11.3h-3.4z"/><path d="M210 143.4h3.4v20.2H210zm-8.5 0h3.4v20.2h-3.4zm-44.8 8v3.4h-17.9v-3.3zm39.3 0v3.4h-17.9v-3.3z"/><use href="#SVGxXbbfdLs"/><use href="#SVGxXbbfdLs"/><path d="M178.1 152.3h3.4v11.3h-3.4zm-39.3 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.2 0h3.3v11.3h-3.3z"/><path d="M170 160.2v3.4h-15.1v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M219.5 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm41.9-.2v3.4h-9.8v-3.4zm5.3-16.8h3.3v20.2H274z"/><path d="M293.5 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M290.7 143.4h3.4v20.2h-3.4zm-8.4 0h3.4v20.2h-3.4zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGGBboFeVF"/><use href="#SVGGBboFeVF"/><path d="M258.9 152.3h3.4v11.3h-3.4zm-39.3 0h3.3v11.3h-3.3zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3H234z"/><path d="M250.8 160.2v3.4h-15.2v-3.4zm1-8.7v3.3H242v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M300.7 143.4h49v3.4h-49zm7.3 17h3.4v3.2H308zm41.9-.2v3.4H340v-3.4zm5.3-16.8h3.3v20.2h-3.3z"/><path d="M374.7 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3H340z"/><path d="M372 143.4h3.3v20.2H372zm-8.5 0h3.4v20.2h-3.4zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVG2mA3sk5o"/><use href="#SVG2mA3sk5o"/><path d="M340 152.3h3.5v11.3H340zm-39.2 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3h-3.4z"/><path d="M332 160.2v3.4h-15.2v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M381.4 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm42-.2v3.4h-9.9v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M455.4 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M452.7 143.4h3.3v20.2h-3.3zm-8.5 0h3.4v20.2h-3.4zm-44.8 8v3.4h-17.9v-3.3zm39.3 0v3.4h-17.9v-3.3z"/><use href="#SVGzXlE9b8u"/><use href="#SVGzXlE9b8u"/><path d="M420.8 152.3h3.4v11.3h-3.4zm-39.3 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3h-3.3z"/><path d="M412.7 160.2v3.4h-15.1v-3.4zm1-8.7v3.3H404v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M462.2 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm41.9-.2v3.4h-9.8v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M536.2 160.2v3.4h-18.6v-3.4zm-34.7-7.9h3.4v11.3h-3.4z"/><path d="M533.4 143.4h3.4v20.2h-3.4zm-8.4 0h3.3v20.2H525zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVG55CWAd1y"/><use href="#SVG55CWAd1y"/><path d="M501.6 152.3h3.3v11.3h-3.3zm-39.4 0h3.4v11.3h-3.4zm28.9 0h3.3v11.3h-3.3zm-14.3 0h3.4v11.3h-3.4z"/><path d="M493.4 160.2v3.4h-15.1v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M543.4 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm41.9-.2v3.4h-9.8v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M617.4 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.3v11.3h-3.3z"/><path d="M614.6 143.4h3.4v20.2h-3.4zm-8.4 0h3.3v20.2h-3.3zm-44.8 8v3.4h-18v-3.3zm39.3 0v3.4h-18v-3.3z"/><use href="#SVGOquJocxO"/><use href="#SVGOquJocxO"/><path d="M582.8 152.3h3.3v11.3h-3.3zm-39.3 0h3.3v11.3h-3.3zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3H558z"/><path d="M574.6 160.2v3.4h-15.1v-3.4zm1-8.7v3.3H566v-3.3z"/></g><g fill="#fff" stroke-width="1pt"><path d="M-183.8 143.4h49v3.4h-49zm7.3 17h3.4v3.2h-3.4zm42-.2v3.4h-9.9v-3.4zm5.2-16.8h3.4v20.2h-3.4z"/><path d="M-109.8 160.2v3.4h-18.6v-3.4zm-34.6-7.9h3.4v11.3h-3.4z"/><path d="M-112.5 143.4h3.3v20.2h-3.3zm-8.5 0h3.4v20.2h-3.4zm-44.8 8v3.4h-17.9v-3.3zm39.3 0v3.4h-17.9v-3.3z"/><use href="#SVGSek8PVQS"/><use href="#SVGSek8PVQS"/><path d="M-144.4 152.3h3.4v11.3h-3.4zm-39.3 0h3.4v11.3h-3.4zm28.8 0h3.4v11.3h-3.4zm-14.3 0h3.4v11.3h-3.4z"/><path d="M-152.5 160.2v3.4h-15.2v-3.4zm1-8.7v3.3h-9.6v-3.3z"/></g><path fill="#d90000" d="M-68.8 339.5h6V350h-6zm160.5 0h6V350h-6zm-283.7 0h6V350h-6zm81.5 0h6V350h-6zm80.9 0h6V350h-6zm40 0h6V350h-6zm40.9 0h6V350h-6zm80.4 0h6V350h-6zm203 0h6.1V350h-6zm-162.1 0h6V350h-6zm40 0h6V350h-6zm40.5 0h6V350h-6zm40.4 0h6V350h-6zm323.2 0h6V350h-6zm-242.7 0h6V350h-6zm40.8 0h6V350h-6zm41.3 0h6V350h-6zm38.8 0h6V350h-6zm41.3 0h6V350h-6zm40.4 0h6V350h-6zm119.7 0h6V350h-6zm-38.8 0h6V350h-6zm-808.9 0h6V350h-6z"/><path fill="#239e3f" d="M-68.8 162.6h6v10.5h-6zm160.5 0h6v10.5h-6zm-283.7 0h6v10.5h-6zm81.5 0h6v10.5h-6zm80.9 0h6v10.5h-6zm40 0h6v10.5h-6zm40.9 0h6v10.5h-6zm80.4 0h6v10.5h-6zm203 0h6.1v10.5h-6zm-162.1 0h6v10.5h-6zm40 0h6v10.5h-6zm40.5 0h6v10.5h-6zm40.4 0h6v10.5h-6zm323.2 0h6v10.5h-6zm-242.7 0h6v10.5h-6zm40.8 0h6v10.5h-6zm41.3 0h6v10.5h-6zm38.8 0h6v10.5h-6zm41.3 0h6v10.5h-6zm40.4 0h6v10.5h-6zm119.7 0h6v10.5h-6zm-38.8 0h6v10.5h-6zm-808.9 0h6v10.5h-6z"/><g fill="#da0000"><path d="M279.8 197.5c8.4 10.4 34.5 67.6-15.7 105.2c-23.7 17.8-9 18.6-8.3 21.6c38-20.1 50.3-47.5 50-72c-.2-24.4-13.2-46-26-54.8"/><path d="M284.8 194.8a73.3 73.3 0 0 1 15.7 112.4c27.2-6 62-86.4-15.7-112.4m-57.6 0a73.3 73.3 0 0 0-15.6 112.4c-27.3-6-62-86.4 15.6-112.4"/><path d="M232.2 197.5c-8.4 10.4-34.5 67.6 15.7 105.2c23.6 17.8 9 18.6 8.3 21.6c-38-20.1-50.3-47.5-50-72c.2-24.4 13.2-46 26-54.8"/><path d="M304.2 319.1c-14.9.2-33.6-2-47.5-9.3c2.3 4.5 4.2 7.3 6.5 11.7c13.2 1.3 31.5 2.8 41-2.4m-95 0c14.9.2 33.6-2 47.5-9.3c-2.3 4.5-4.2 7.3-6.5 11.7c-13.2 1.3-31.5 2.8-41-2.4m27.3-138.7c3 8 10.9 9.2 19.3 4.5c6.2 3.6 15.7 3.9 19-4.1c2.5 19.8-18.3 15-19 11.2c-7.8 7.5-22.2 3.2-19.3-11.6"/><path d="m256.4 331.6l7.8-9l1.1-120.1l-9.3-8.2l-9.3 7.8l1.9 121z"/></g></g></svg>',
      BIF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGuvcRdjoq"><path fill-opacity=".7" d="M-90.5 0H592v512H-90.5z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGuvcRdjoq)" transform="translate(84.9)scale(.9375)"><path fill="#18b637" d="m-178 0l428.8 256L-178 512zm857.6 0L250.8 256l428.8 256z"/><path fill="#cf0921" d="m-178 0l428.8 256L679.6 0zm0 512l428.8-256l428.8 256z"/><path fill="#fff" d="M679.6 0h-79.9L-178 464.3V512h79.9L679.6 47.7z"/><path fill="#fff" d="M398.9 256a148 148 0 1 1-296.1 0a148 148 0 0 1 296 0z"/><path fill="#fff" d="M-178 0v47.7L599.7 512h79.9v-47.7L-98.1 0z"/><path fill="#cf0921" stroke="#18b637" stroke-width="3.9" d="m280 200.2l-19.3.3l-10 16.4l-9.9-16.4l-19.2-.4l9.3-16.9l-9.2-16.8l19.2-.4l10-16.4l9.9 16.5l19.2.4l-9.3 16.8zm-64.6 111.6l-19.2.3l-10 16.4l-9.9-16.4l-19.2-.4l9.3-16.9l-9.2-16.8l19.2-.4l10-16.4l9.9 16.5l19.2.4l-9.3 16.8zm130.6 0l-19.2.3l-10 16.4l-10-16.4l-19.1-.4l9.3-16.9l-9.3-16.8l19.2-.4l10-16.4l10 16.5l19.2.4l-9.4 16.8z"/></g></svg>',
      XAF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#039" d="M0 0h640v480H0z"/><circle cx="320" cy="249.8" r="30.4" fill="none" stroke="#fc0" stroke-width="27.5"/><circle cx="320" cy="249.8" r="88.3" fill="none" stroke="#fc0" stroke-width="27.5"/><path fill="#039" d="m404.7 165.1l84.7 84.7l-84.7 84.7l-84.7-84.7z"/><path fill="#fc0" d="M175.7 236.1h59.2v27.5h-59.2zm259.1 0h88.3v27.5h-88.3zM363 187.4l38.8-38.8l19.4 19.5l-38.7 38.7zM306.3 48.6h27.5v107.1h-27.5z"/><circle cx="225.1" cy="159.6" r="13.7" fill="#fc0"/><circle cx="144.3" cy="249.8" r="13.7" fill="#fc0"/><circle cx="320" cy="381.4" r="13.7" fill="#fc0"/><circle cx="320" cy="425.5" r="13.7" fill="#fc0"/><circle cx="408.3" cy="249.8" r="13.7" fill="#fc0"/><path fill="#fc0" d="m208.3 341.5l19.5-19.4l19.4 19.4l-19.4 19.5zm204.7 21l19.5-19.5l19.5 19.5l-19.5 19.4z"/></svg>',
      BWP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#00cbff" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#000001" d="M0 186h640v108H0z"/></g></svg>',
      DJF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGlDEVxbEP"><path fill-opacity=".7" d="M-40 0h682.7v512H-40z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGlDEVxbEP)" transform="translate(37.5)scale(.94)"><path fill="#0c0" d="M-40 0h768v512H-40z"/><path fill="#69f" d="M-40 0h768v256H-40z"/><path fill="#fffefe" d="m-40 0l382.7 255.7L-40 511z"/><path fill="red" d="M119.8 292L89 270l-30.7 22.4L69.7 256l-30.6-22.5l37.9-.3l11.7-36.3l12 36.2h37.9l-30.5 22.7l11.7 36.4z"/></g></svg>',
      DZD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M320 0h320v480H320z"/><path fill="#006233" d="M0 0h320v480H0z"/><path fill="#d21034" d="M424 180a120 120 0 1 0 0 120a96 96 0 1 1 0-120m4 60l-108-35.2l67.2 92V183.2l-67.2 92z"/></svg>',
      ETB: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGBt2gMboh"><path fill-opacity=".7" d="M-61.3 0h682.7v512H-61.3z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVGBt2gMboh)" transform="translate(57.5)scale(.94)"><path fill="#ffc621" d="M-238 3.5H800v498H-238z"/><path fill="#ef2118" d="M-240 342.5H799.3V512H-240z"/><path fill="#298c08" d="M-238 0H800v180H-238z"/><circle cx="534.2" cy="353" r="199.7" fill="#006bc6" transform="matrix(.54 0 0 .54 -25.8 74)"/><path fill="#ffc621" d="m214.3 188.2l-6.5 4.5l23.5 33l6.3-4zm29.4 78l-9.7-6.8l4-12.7l-48.1.7l-14-10.7l65.7-.7l12.2-36.9l6.6 15zm76.5-70.7l-6.3-4.8l-24.3 32.4l5.6 4.7zM254.8 247l3.5-11.2h13.3L256.4 190l6-16.5l20.5 62.4l38.8.5l-12.2 10.7zm90.6 51.2l2.7-7.4l-38.3-13.3l-2.8 7zm-69.1-46.4l11.7-.1l4.1 12.6l38.8-28.5l17.6.6l-53.1 38.7l11.5 37.2l-14-8.4zm-19.8 102l7.9.2l.3-40.5l-7.4-.5zm22-80.3l3.8 11.1l-10.7 8l39.4 27.7l5 16.8l-53.6-38l-31.5 22.7l3.5-16l44-32.3zm-103.3 13l2.3 7.5l38.7-12.2l-2-7.2zm83.2-4l-9.4 7.1l-10.8-7.7l-14.2 46l-14.4 10l19.5-62.7l-31.4-23l16.3-1.6z"/></g></svg>',
      GMD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGjTmg8cPS"><path fill-opacity=".7" d="M0-48h640v480H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVGjTmg8cPS)" transform="translate(0 48)"><path fill="red" d="M0-128h640V85.3H0z"/><path fill="#fff" d="M0 85.3h640V121H0z"/><path fill="#009" d="M0 120.9h640V263H0z"/><path fill="#fff" d="M0 263.1h640v35.6H0z"/><path fill="#090" d="M0 298.7h640V512H0z"/></g></svg>',
      GHS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#006b3f" d="M0 0h640v480H0z"/><path fill="#fcd116" d="M0 0h640v320H0z"/><path fill="#ce1126" d="M0 0h640v160H0z"/><path fill="#000001" d="m320 160l52 160l-136.1-98.9H404L268 320z"/></svg>',
      GNF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h213.3v480H0z"/><path fill="#ff0" d="M213.3 0h213.4v480H213.3z"/><path fill="#090" d="M426.7 0H640v480H426.7z"/></g></svg>',
      GYD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#399408" d="M2.4 0H640v480H2.4z"/><path fill="#fff" d="M.2 0c-.9 0 619.6 241.5 619.6 241.5L0 479.8z"/><path fill="#ffde08" d="M.3 20.2c3.4 0 559 217.9 555.9 220L1.9 463.2L.3 20.3z"/><path fill="#000001" d="M1.9.8c1.8 0 290.9 240.9 290.9 240.9L1.8 477z"/><path fill="#de2110" d="M.3 33.9c1.6-15 260.9 208.4 260.9 208.4L.2 451.7V33.9z"/></g></svg>',
      CDF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#007fff" d="M0 0h640v480H0z"/><path fill="#f7d618" d="M28.8 96H96l20.8-67.2L137.6 96h67.2l-54.4 41.6l20.8 67.2l-54.4-41.6l-54.4 41.6l20.8-67.2zM600 0L0 360v120h40l600-360V0z"/><path fill="#ce1021" d="M640 0L0 384v96L640 96z"/></svg>',
      KWD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGo1QMTd8m"><path fill-opacity=".7" d="M0 0h682.7v512H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVGo1QMTd8m)" transform="scale(.9375)"><path fill="#fff" d="M0 170.6h1024v170.7H0z"/><path fill="#f31830" d="M0 341.3h1024V512H0z"/><path fill="#00d941" d="M0 0h1024v170.7H0z"/><path fill="#000001" d="M0 0v512l255.4-170.7l.6-170.8z"/></g></svg>',
      LAK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG9mrxwcPk"><path fill-opacity=".7" d="M0 0h640v480H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVG9mrxwcPk)"><path fill="#ce1126" d="M-40 0h720v480H-40z"/><path fill="#002868" d="M-40 119.3h720v241.4H-40z"/><path fill="#fff" d="M423.4 240a103.4 103.4 0 1 1-206.8 0a103.4 103.4 0 1 1 206.8 0"/></g></svg>',
      LRD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGo1QMTd8m"><path fill-opacity=".7" d="M0 0h682.7v512H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGo1QMTd8m)" transform="scale(.9375)"><path fill="#fff" d="M0 0h767.9v512H0z"/><path fill="#006" d="M0 0h232.7v232.8H0z"/><path fill="#c00" d="M0 464.9h767.9V512H0z"/><path fill="#c00" d="M0 465.4h767.9V512H0zm0-92.9h767.9v46.2H0zm0-93.2h766V326H0zM232.7 0h535.1v46.5H232.7zm0 186h535.1v46.8H232.7zm0-92.7h535.1v46.5H232.7z"/><path fill="#fff" d="m166.3 177.5l-50.7-31l-50.4 31.3l18.7-50.9l-50.3-31.4l62.3-.4l19.3-50.7L135 95h62.3l-50.1 31.7z"/></g></svg>',
      LYD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG34tvNeSy"><path d="M166.7-20h666.6v500H166.7z"/></clipPath></defs><g clip-path="url(#SVG34tvNeSy)" transform="matrix(.96 0 0 .96 -160 19.2)"><path fill="#239e46" d="M0-20h1000v500H0z"/><path fill="#000001" d="M0-20h1000v375H0z"/><path fill="#e70013" d="M0-20h1000v125H0z"/><path fill="#fff" d="M544.2 185.8a54.3 54.3 0 1 0 0 88.4a62.5 62.5 0 1 1 0-88.4M530.4 230l84.1-27.3l-52 71.5v-88.4l52 71.5z"/></g></svg>',
      MAD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#c1272d" d="M640 0H0v480h640z"/><path fill="none" stroke="#006233" stroke-width="11.7" d="M320 179.4L284.4 289l93.2-67.6H262.4l93.2 67.6z"/></svg>',
      MGA: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fc3d32" d="M213.3 0H640v240H213.3z"/><path fill="#007e3a" d="M213.3 240H640v240H213.3z"/><path fill="#fff" d="M0 0h213.3v480H0z"/></g></svg>',
      MKD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#d20000" d="M0 0h640v480H0z"/><path fill="#ffe600" d="M0 0h96l224 231.4L544 0h96L0 480h96l224-231.4L544 480h96zm640 192v96L0 192v96zM280 0l40 205.7L360 0zm0 480l40-205.7L360 480z"/><circle cx="320" cy="240" r="77.1" fill="#ffe600" stroke="#d20000" stroke-width="17.1"/></svg>',
      MMK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fecb00" d="M0 0h640v480H0z"/><path fill="#34b233" d="M0 160h640v320H0z"/><path fill="#ea2839" d="M0 320h640v160H0z"/><g transform="translate(320 256.9)scale(176.87999)"><path id="SVGOCbpRbuG" fill="#fff" d="m0-1l.3 1h-.6z"/><use width="100%" height="100%" href="#SVGOCbpRbuG" transform="rotate(-144)"/><use width="100%" height="100%" href="#SVGOCbpRbuG" transform="rotate(-72)"/><use width="100%" height="100%" href="#SVGOCbpRbuG" transform="rotate(72)"/><use width="100%" height="100%" href="#SVGOCbpRbuG" transform="rotate(144)"/></g></svg>',
      MRU: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#cd2a3e" d="M0 0h640v480H0z"/><path fill="#006233" d="M0 72h640v336H0z"/><path fill="#ffc400" d="M470 154.6a150 150 0 0 1-300 0a155 155 0 0 0-5 39.2a155 155 0 1 0 310 0a154 154 0 0 0-5-39.2" class="mr-st1"/><path fill="#ffc400" d="m320 93.8l-13.5 41.5H263l35.3 25.6l-13.5 41.4l35.3-25.6l35.3 25.6l-13.5-41.4l35.3-25.6h-43.6z"/></svg>',
      MUR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#00a04d" d="M0 360h640v120H0z"/><path fill="#151f6d" d="M0 120h640v120H0z"/><path fill="#ee2737" d="M0 0h640v120H0z"/><path fill="#ffcd00" d="M0 240h640v120H0z"/></g></svg>',
      MVR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#d21034" d="M0 0h640v480H0z"/><path fill="#007e3a" d="M120 120h400v240H120z"/><circle cx="350" cy="240" r="80" fill="#fff"/><circle cx="380" cy="240" r="80" fill="#007e3a"/></svg>',
      NAD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG9mrxwcPk"><path fill-opacity=".7" d="M0 0h640v480H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVG9mrxwcPk)"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#3662a2" d="m-26.4.2l.8 345.6L512.5 0z"/><path fill="#38a100" d="M666.4 479.6L665 120.3L122.3 479.8l544-.2z"/><path fill="#c70000" d="m-26 371.8l.4 108.2l117.5-.1L665.4 95.4l-.7-94.1l-116-1L-26 371.7z"/><path fill="#ffe700" d="m219.6 172l-21.8-13.2l-12.6 22.1l-12.2-22.2l-22 12.9l.6-25.4l-25.4.2l13.2-21.8l-22.1-12.5l22.2-12.3l-12.8-22l25.4.6l-.1-25.5l21.7 13.2L186.3 44l12.2 22.2l22-12.9l-.6 25.4l25.4-.2l-13.2 21.8l22.1 12.5l-22.2 12.3l12.8 22l-25.4-.6z"/><path fill="#3662a2" d="M232.4 112.4c0 25.6-20.9 46.3-46.6 46.3s-46.6-20.7-46.6-46.3s20.8-46.2 46.6-46.2s46.6 20.7 46.6 46.2"/><path fill="#ffe700" d="M222.3 112.4a36.5 36.5 0 1 1-73 0a36.5 36.5 0 0 1 73 0"/></g></svg>',
      NGN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#008753" d="M426.6 0H640v480H426.6zM0 0h213.3v480H0z"/></g></svg>',
      NOK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#ed2939" d="M0 0h640v480H0z"/><path fill="#fff" d="M180 0h120v480H180z"/><path fill="#fff" d="M0 180h640v120H0z"/><path fill="#002664" d="M210 0h60v480h-60z"/><path fill="#002664" d="M0 210h640v60H0z"/></svg>',
      NPR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGaszmZNzX"><path fill-opacity=".7" d="M0-16h512v512H0z"/></clipPath></defs><g clip-path="url(#SVGaszmZNzX)" transform="translate(0 15)scale(.9375)"><g fill-rule="evenodd"><path fill="#ce0000" stroke="#000063" stroke-width="13.8" d="M6.5 489.5h378.8L137.4 238.1l257.3.3L6.6-9.5v499z"/><path fill="#fff" d="m180.7 355.8l-27 9l21.2 19.8l-28.5-1.8l11.7 26.2l-25.5-12.3l.5 28.6l-18.8-20.9l-10.7 26.6l-9.2-26.3l-20.3 20.6l1.8-27.7L49 409l12.6-25l-29.3.6l21.5-18.3l-27.3-10.5l27-9L32.2 327l28.4 1.8L49 302.6l25.6 12.3l-.5-28.6l18.8 20.9l10.7-26.6l9.1 26.3l20.4-20.6l-1.9 27.7l27-11.4l-12.7 25l29.4-.6l-21.5 18.3zm-32.4-184.7l-11.3 8.4l5.6 4.6a94 94 0 0 0 30.7-36c1.8 21.3-17.7 69-68.7 69.5a70.6 70.6 0 0 1-71.5-70.3c10 18.2 16.2 27 32 36.5l4.7-4.4l-10.6-8.9l13.7-3.6l-7.4-12.4l14.4 1l-1.8-14.4l12.6 7.4l4-13.5l9 10.8l8.5-10.3l4.6 14l11.8-8.2l-1.5 14.3l14.2-1.7l-6.7 13.2z"/></g></g></svg>',
      NZD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><g id="SVG5pjB1cmc"><g id="SVGU3dMfdxc"><path d="M0-.3v.5l1-.5z"/><path d="M.2.3L0-.1l1-.2z"/></g><use href="#SVGU3dMfdxc" transform="scale(-1 1)"/><use href="#SVGU3dMfdxc" transform="rotate(72 0 0)"/><use href="#SVGU3dMfdxc" transform="rotate(-72 0 0)"/><use href="#SVGU3dMfdxc" transform="scale(-1 1)rotate(72)"/></g></defs><path fill="#00247d" fill-rule="evenodd" d="M0 0h640v480H0z"/><g transform="translate(-111 36.1)scale(.66825)"><use width="100%" height="100%" fill="#fff" href="#SVG5pjB1cmc" transform="translate(900 120)scale(45.4)"/><use width="100%" height="100%" fill="#cc142b" href="#SVG5pjB1cmc" transform="matrix(30 0 0 30 900 120)"/></g><g transform="rotate(82 525.2 114.6)scale(.66825)"><use width="100%" height="100%" fill="#fff" href="#SVG5pjB1cmc" transform="rotate(-82 519 -457.7)scale(40.4)"/><use width="100%" height="100%" fill="#cc142b" href="#SVG5pjB1cmc" transform="rotate(-82 519 -457.7)scale(25)"/></g><g transform="rotate(82 525.2 114.6)scale(.66825)"><use width="100%" height="100%" fill="#fff" href="#SVG5pjB1cmc" transform="rotate(-82 668.6 -327.7)scale(45.4)"/><use width="100%" height="100%" fill="#cc142b" href="#SVG5pjB1cmc" transform="rotate(-82 668.6 -327.7)scale(30)"/></g><g transform="translate(-111 36.1)scale(.66825)"><use width="100%" height="100%" fill="#fff" href="#SVG5pjB1cmc" transform="translate(900 480)scale(50.4)"/><use width="100%" height="100%" fill="#cc142b" href="#SVG5pjB1cmc" transform="matrix(35 0 0 35 900 480)"/></g><path fill="#012169" d="M0 0h320v240H0z"/><path fill="#fff" d="m37.5 0l122 90.5L281 0h39v31l-120 89.5l120 89V240h-40l-120-89.5L40.5 240H0v-30l119.5-89L0 32V0z"/><path fill="#c8102e" d="M212 140.5L320 220v20l-135.5-99.5zm-92 10l3 17.5l-96 72H0zM320 0v1.5l-124.5 94l1-22L295 0zM0 0l119.5 88h-30L0 21z"/><path fill="#fff" d="M120.5 0v240h80V0zM0 80v80h320V80z"/><path fill="#c8102e" d="M0 96.5v48h320v-48zM136.5 0v240h48V0z"/></svg>',
      PEN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#D91023" d="M0 0h640v480H0z"/><path fill="#fff" d="M213.3 0h213.4v480H213.3z"/></svg>',
      PGK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#000001" d="m1.6 0l-.5 480h640z"/><path fill="red" d="m640.6 480l.5-480H1.1z"/></g><path fill="#fc0" stroke="#fc0" stroke-width="1.1" d="m178 54l-3.8-.2c-1.2-2.8-4.5-3.8-6.6-2.6L156 51l7.1 3.1C165 59 171 60 171 60c-.6 8.8-8.9-1.1-15.9 3.9c-5 3-5 6.5-7.7 12.3c-.9 1.6-4.4 5.8-4.4 5.8l5.9-.5L147 84l7-1l-1.5 1.4c1 .2 8-1.7 8-1.7L160 85l8-2.9s1.6 1.3 3 1.9l1-4l4 1l1-4c6 8 8 16 19 18l-1-4l8.7 4l.9-1.7c4.8 3.4 8.7 3.3 11.4 3.7l-2-5l2 1l-3-8l3 1l-4-6l1.5-1l-.5-3c6 2 14 5 15 12c1 11-11 14-19 13c6 5 17 3 22-2c2-2 3-5 4-8c1 3 3 7 3 11c-1 9-13 12-21 13c9 5 25-1 26-14c0-11-7-16-10-21l-1-5.4l3 1.4s-1.8-3.3-2-4c0 0-3.1-8.5-4.2-10.4l2.2.4l-8.2-10.3l2.3-.2S215.6 44 213 43l3-1c-6-3-13-1-19 3l1-3l-1.8.2v-3.5L198 36l-3-1l2-5l-3 1l1-5s-2.2 1-3.6.9l1.6-3.4c-1-1.5 0-4.5 0-4.5c-7 1-8 2-12 8c-6 11-4 16-3 27z" transform="matrix(2.21989 0 0 2.21194 1.1 0)"/><path fill="red" fill-rule="evenodd" stroke="red" stroke-width="1.4" d="M215.8 70.4c.5.9 6.2 3.6 10.4 6c-1.1-4.6-9.4-5.6-10.4-6z" transform="matrix(2.21989 0 0 2.21194 1.1 0)"/><path fill="#fff" fill-rule="evenodd" d="m175 399l-14.2-9l-19 9.1l4.3-16.2l-14.5-15.1l16.7-1l10-18.4l6.1 15.5l20.7 3.8l-13 10.6zm36.2-79l-6.6-3l-6.3 3.6l1-7.2l-5.4-4.9l7.1-1.3l3-6.6l3.5 6.4l7.2.8l-5 5.2zm32-45.2l-14.5-7l-13.9 7.8l2.3-15.7l-11.8-10.8l15.7-2.8l6.6-14.4l7.6 14l15.8 1.8l-11 11.5zm-65.8-63l-17-8.5l-16.5 9.1l2.8-18.6l-13.8-13l18.7-3l8-17l8.7 16.7l18.8 2.3l-13.3 13.4zm-60.8 65.4l-17-10l-17 10.3l4.3-19.3l-15.1-13l19.7-1.8l7.7-18.3l7.9 18.2l19.8 1.6l-14.9 13z"/></svg>',
      PHP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#0038a8" d="M0 0h640v240H0z"/><path fill="#ce1126" d="M0 240h640v240H0z"/><path fill="#fff" d="M415.7 240L0 480V0"/><path fill="#fcd116" d="M26.7 42.4L41 55l16.6-9.2l-7.4 17.5l14 13l-19-1.6l-8.1 17.2l-4.3-18.5L14 71l16.3-10zm323.8 172.3l.4 19l18 6.3l-18 6.2l-.4 19l-11.5-15.1l-18.2 5.5l10.8-15.6l-10.8-15.6l18.2 5.5zM37.2 388.1l8 17.2l19-1.6l-13.9 13l7.4 17.5l-16.6-9.1l-14.4 12.4l3.6-18.7L14 409l18.9-2.4zm114.2-249l-6.2 6.2l3.1 47l-3 .3l-5.7-42.9l-5.1 5l7.6 38.4a48 48 0 0 0-17.2 7.1l-21.7-32.4H96l26.4 34.3l-2.4 2l-31.1-35.5h-8.8v8.8l35.4 31l-2 2.5l-34.3-26.3v7.1l32.5 21.7q-5.2 7.8-7.1 17.2L66.3 223l-5.1 5l42.9 5.7q-.3 1.6-.3 3.1l-47-3l-6.2 6.2l6.2 6.2l47-3.1l.3 3.1l-42.9 5.7l5 5l38.4-7.6a48 48 0 0 0 7.1 17.2l-32.5 21.7v7.2l34.3-26.3l2 2.4l-35.4 31v8.8H89l31-35.4l2.5 2L96 312.2h7.2l21.7-32.5q7.8 5.2 17.2 7.1l-7.6 38.4l5 5l5.7-42.9q1.5.3 3.1.3l-3 47l6.1 6.2l6.3-6.2l-3.1-47l3-.3l5.7 43l5.1-5.1l-7.6-38.4a48 48 0 0 0 17.2-7.1l21.7 32.5h7.2l-26.4-34.3l2.4-2l31.1 35.4h8.8v-8.8l-35.4-31l2-2.4l34.3 26.3v-7.2l-32.5-21.7q5.2-7.8 7.1-17.2l38.3 7.6l5.1-5l-42.9-5.7q.3-1.5.3-3.1l47 3l6.2-6.1l-6.2-6.2l-47 3l-.3-3l42.9-5.7l-5-5l-38.4 7.5a48 48 0 0 0-7.1-17.2l32.5-21.7v-7.1l-34.3 26.3l-2-2.4l35.4-31v-8.9H214l-31 35.5l-2.5-2l26.4-34.3h-7.2L178 200.2q-7.8-5.2-17.2-7.1l7.6-38.3l-5-5l-5.7 42.8l-3.1-.3l3-47z"/></svg>',
      PKR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGtK1cVinP"><path fill-opacity=".7" d="M-52.3 0h682.6v512H-52.3z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVGtK1cVinP)" transform="translate(49)scale(.9375)"><path fill="#0c590b" d="M-95 0h768v512H-95z"/><path fill="#fff" d="M-95 0H97.5v512H-95z"/><g fill="#fff"><path d="m403.7 225.4l-31.2-6.6l-16.4 27.3l-3.4-31.6l-31-7.2l29-13l-2.7-31.7l21.4 23.6l29.3-12.4l-15.9 27.6l21 24z"/><path d="M415.4 306a121 121 0 0 1-161.3 59.4a122 122 0 0 1-59.5-162.1A119 119 0 0 1 266 139a156 156 0 0 0-11.8 10.9A112.3 112.3 0 0 0 415.5 306z"/></g></g></svg>',
      QAR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#8d1b3d" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 0v480h158.4l97.8-26.7l-97.8-26.6l97.7-26.7l-97.7-26.7l97.7-26.6l-97.7-26.7l97.8-26.7l-97.8-26.6l97.7-26.7l-97.7-26.7l97.7-26.6l-97.7-26.7l97.8-26.7l-97.8-26.6L256.1 80l-97.7-26.7l97.8-26.6L158.3 0z"/></svg>',
      RON: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#00319c" d="M0 0h213.3v480H0z"/><path fill="#ffde00" d="M213.3 0h213.4v480H213.3z"/><path fill="#de2110" d="M426.7 0H640v480H426.7z"/></g></svg>',
      PLN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#fff" d="M640 480H0V0h640z"/><path fill="#dc143c" d="M640 480H0V240h640z"/></g></svg>',
      RUB: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v160H0z"/><path fill="#0039a6" d="M0 160h640v160H0z"/><path fill="#d52b1e" d="M0 320h640v160H0z"/></svg>',
      RWF: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#20603d" d="M0 0h640v480H0z"/><path fill="#fad201" d="M0 0h640v360H0z"/><path fill="#00a1de" d="M0 0h640v240H0z"/><g transform="translate(511 125.4)scale(.66667)"><g id="SVGSMboovNs"><path id="SVGwxHmebKq" fill="#e5be01" d="M116.1 0L35.7 4.7l76.4 25.4l-78.8-16.3L100.6 58l-72-36.2L82 82.1L21.9 28.6l36.2 72l-44.3-67.3L30 112L4.7 35.7L0 116.1L-1-1z"/><use width="100%" height="100%" href="#SVGwxHmebKq" transform="scale(1 -1)"/></g><use width="100%" height="100%" href="#SVGSMboovNs" transform="scale(-1 1)"/><circle r="34.3" fill="#e5be01" stroke="#00a1de" stroke-width="3.4"/></g></svg>',
      SCR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v480H0Z"/><path fill="#d92223" d="M0 480V0h640v160z"/><path fill="#fcd955" d="M0 480V0h426.7z"/><path fill="#003d88" d="M0 480V0h213.3z"/><path fill="#007a39" d="m0 480l640-160v160z"/></svg>',
      SEK: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#005293" d="M0 0h640v480H0z"/><path fill="#fecb00" d="M176 0v192H0v96h176v192h96V288h368v-96H272V0z"/></svg>',
      SGD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVG9mrxwcPk"><path fill-opacity=".7" d="M0 0h640v480H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVG9mrxwcPk)"><path fill="#fff" d="M-20 0h720v480H-20z"/><path fill="#df0000" d="M-20 0h720v240H-20z"/><path fill="#fff" d="M146 40.2a84.4 84.4 0 0 0 .8 165.2a86 86 0 0 1-106.6-59a86 86 0 0 1 59-106c16-4.6 30.8-4.7 46.9-.2z"/><path fill="#fff" d="m133 110l4.9 15l-13-9.2l-12.8 9.4l4.7-15.2l-12.8-9.3l15.9-.2l5-15l5 15h15.8zm17.5 52l5 15.1l-13-9.2l-12.9 9.3l4.8-15.1l-12.8-9.4l15.9-.1l4.9-15.1l5 15h16zm58.5-.4l4.9 15.2l-13-9.3l-12.8 9.3l4.7-15.1l-12.8-9.3l15.9-.2l5-15l5 15h15.8zm17.4-51.6l4.9 15.1l-13-9.2l-12.8 9.3l4.8-15.1l-12.9-9.4l16-.1l4.8-15.1l5 15h16zm-46.3-34.3l5 15.2l-13-9.3l-12.9 9.4l4.8-15.2l-12.8-9.4l15.8-.1l5-15.1l5 15h16z"/></g></svg>',
      SLL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#0000cd" d="M0 320.3h640V480H0z"/><path fill="#fff" d="M0 160.7h640v159.6H0z"/><path fill="#00cd00" d="M0 0h640v160.7H0z"/></g></svg>',
      SOS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGMXVQpcWp"><path fill-opacity=".7" d="M-85.3 0h682.6v512H-85.3z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGMXVQpcWp)" transform="translate(80)scale(.9375)"><path fill="#40a6ff" d="M-128 0h768v512h-768z"/><path fill="#fff" d="M336.5 381.2L254 327.7l-82.1 54l30.5-87.7l-82-54.2L222 239l31.4-87.5l32.1 87.3l101.4.1l-81.5 54.7z"/></g></svg>',
      SRD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#377e3f" d="M.1 0h640v480H.1z"/><path fill="#fff" d="M.1 96h640v288H.1z"/><path fill="#b40a2d" d="M.1 144h640v192H.1z"/><path fill="#ecc81d" d="m320 153.2l56.4 173.6l-147.7-107.3h182.6L263.6 326.8z"/></svg>',
      SSP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#078930" d="M0 336h640v144H0z"/><path fill="#fff" d="M0 144h640v192H0z"/><path fill="#000001" d="M0 0h640v144H0z"/><path fill="#da121a" d="M0 168h640v144H0z"/><path fill="#0f47af" d="m0 0l415.7 240L0 480z"/><path fill="#fcdd09" d="M200.7 194.8L61.7 240l139 45.1L114.9 167v146z"/></svg>',
      STN: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#12ad2b" d="M0 0h640v480H0z"/><path fill="#ffce00" d="M0 137.1h640V343H0z"/><path fill="#d21034" d="M0 0v480l240-240"/><g id="SVGq12h7bPc" transform="translate(351.6 240)scale(.34286)"><g id="SVG4uuPjewy"><path id="SVGXylNbcAN" fill="#000001" d="M0-200V0h100" transform="rotate(18 0 -200)"/><use width="100%" height="100%" href="#SVGXylNbcAN" transform="scale(-1 1)"/></g><use width="100%" height="100%" href="#SVG4uuPjewy" transform="rotate(72)"/><use width="100%" height="100%" href="#SVG4uuPjewy" transform="rotate(144)"/><use width="100%" height="100%" href="#SVG4uuPjewy" transform="rotate(-144)"/><use width="100%" height="100%" href="#SVG4uuPjewy" transform="rotate(-72)"/></g><use width="100%" height="100%" x="700" href="#SVGq12h7bPc" transform="translate(-523.2)"/></svg>',
      SYP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path d="M0 0h640v480H0Z"/><path fill="#fff" d="M0 0h640v320H0Z"/><path fill="#007a3d" d="M0 0h640v160H0Z"/><path fill="#ce1126" d="m101 300l39-120l39 120l-102-74.2h126M461 300l39-120l39 120l-102-74.2h126M281 300l39-120l39 120l-102.1-74.2h126.2"/></svg>',
      THB: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd"><path fill="#f4f5f8" d="M0 0h640v480H0z"/><path fill="#2d2a4a" d="M0 162.5h640v160H0z"/><path fill="#a51931" d="M0 0h640v82.5H0zm0 400h640v80H0z"/></g></svg>',
      TJS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#060" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 0h640v342.9H0z"/><path fill="#c00" d="M0 0h640v137.1H0z"/><path fill="#f8c300" d="M300.8 233.6a8.6 8.6 0 0 1 16 4V272h6.4v-34.3a8.6 8.6 0 0 1 16-4a20.2 20.2 0 1 0-38.4 0"/><path fill="#fff" d="M305.4 224.7a14 14 0 0 1 14.6 6.5a14 14 0 0 1 14.6-6.5a14.7 14.7 0 0 0-29.2 0"/><path id="SVGxhLDdrXd" fill="#f8c300" d="M316.8 258.3a26 26 0 0 1-43.8 16.6a27 27 0 0 1-41 12c2.5 25 40 19.9 42.8-4.4c11.7 20.7 37.6 14.7 45.2-10.6z"/><use width="100%" height="100%" fill="#f8c300" href="#SVGxhLDdrXd" transform="matrix(-1 0 0 1 640 0)"/><path id="SVGKAwz7ysE" fill="#f8c300" d="M291.8 302.6c-5.3 11.3-15.7 13.2-24.8 4.1c0 0 3.6-2.6 7.6-3.3c-.8-3.1.7-7.5 2.9-9.8a15 15 0 0 1 6.1 8.1c5.5-.7 8.2 1 8.2 1z"/><use width="100%" height="100%" fill="#f8c300" href="#SVGKAwz7ysE" transform="rotate(9.4 320 551.3)"/><use width="100%" height="100%" fill="#f8c300" href="#SVGKAwz7ysE" transform="rotate(18.7 320 551.3)"/><path fill="none" stroke="#f8c300" stroke-width="11" d="M253.5 327.8a233 233 0 0 1 133 0"/><g fill="#f8c300" transform="translate(320 164.6)scale(.68571)"><path id="SVGZYoEIeTF" d="m301930 415571l-790463-574305h977066l-790463 574305L0-513674z" transform="scale(.00005)"/></g><g id="SVGy1lETceU" fill="#f8c300" transform="translate(320 260.6)scale(.68571)"><use width="100%" height="100%" href="#SVGZYoEIeTF" transform="translate(-70 -121.2)"/><use width="100%" height="100%" href="#SVGZYoEIeTF" transform="translate(-121.2 -70)"/><use width="100%" height="100%" href="#SVGZYoEIeTF" transform="translate(-140)"/></g><use width="100%" height="100%" fill="#f8c300" href="#SVGy1lETceU" transform="matrix(-1 0 0 1 640 0)"/></svg>',
      TOP: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#c10000" d="M0 0h640v480H0z"/><path fill="#fff" d="M0 0h250v200.3H0z"/><g fill="#c10000"><path d="M102.8 31.2h39.9v139.6h-39.8z"/><path d="M192.6 81v40H53V81z"/></g></g></svg>',
      TND: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#e70013" d="M0 0h640v480H0z"/><path fill="#fff" d="M320 119.2a1 1 0 0 0-1 240.3a1 1 0 0 0 1-240.3M392 293a90 90 0 1 1 0-107a72 72 0 1 0 0 107m-4.7-21.7l-37.4-12.1l-23.1 31.8v-39.3l-37.4-12.2l37.4-12.2V188l23.1 31.8l37.4-12.1l-23.1 31.8z"/></svg>',
      TTD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#e00000" fill-rule="evenodd" d="M463.7 480L0 1v478.8zM176.3 0L640 479V.2z"/><path fill="#000001" fill-rule="evenodd" d="M27.7.2h118.6l468.2 479.3H492.2z"/></svg>',
      TWD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><clipPath id="SVG4ymqccZS"><path d="M0 0h640v480H0z"/></clipPath><g clip-path="url(#SVG4ymqccZS)"><path fill="red" d="M0 0h720v480H0z"/><path fill="#000095" d="M0 0h360v240H0z"/><g fill="#fff"><path d="m154 126.9l-2.5 9.6l9.4 2.6l-1.8-7.1zm46.9 5.1l-1.8 7.1l9.4-2.6l-2.5-9.6zm-41.8-24l-5.1 5.1l1.9 6.9z"/><path d="m155.9 120l-1.9 6.9l5.1 5.1z"/><path d="m154 113.1l-6.9 6.9l6.9 6.9l1.9-6.9zm14 27.8l5.1 5.1l6.9-1.9zm18.9 5.1l9.6 2.5l2.6-9.4l-7.1 1.8z"/><path d="m192 140.9l7.1-1.8l1.8-7.1zm-31.1-1.8l2.6 9.4l9.6-2.5l-5.1-5.1zm19.1 5l6.9 1.9l5.1-5.1z"/><path d="m173.1 146l6.9 6.9l6.9-6.9l-6.9-1.9zm-12.2-45.1l-9.4 2.6l2.5 9.6l5.1-5.1zm-1.8 31.1l1.8 7.1l7.1 1.8zm45-12l1.9-6.9l-5.1-5.1z"/><path d="m168 99.1l-7.1 1.8l-1.8 7.1zm32.9 8.9l-1.8-7.1l-7.1-1.8zm5.1 18.9l6.9-6.9l-6.9-6.9l-1.9 6.9z"/><path d="m200.9 108l-8.9-8.9l-12-3.2l-12 3.2l-8.9 8.9l-3.2 12l3.2 12l8.9 8.9l12 3.2l12-3.2l8.9-8.9l3.2-12z"/><path d="m200.9 132l5.1-5.1l-1.9-6.9zm5.1-18.9l2.5-9.6l-9.4-2.6l1.8 7.1zm-6.9-12.2l-2.6-9.4l-9.6 2.5l5.1 5.1zm-26-6.9l-9.6-2.5l-2.6 9.4l7.1-1.8zm6.9 1.9l-6.9-1.9l-5.1 5.1z"/><path d="m186.9 94l-6.9-6.9l-6.9 6.9l6.9 1.9z"/><path d="m192 99.1l-5.1-5.1l-6.9 1.9zM173.1 146l-9.6 2.5l4.5 16.6l12-12.2zm-5.1 19.1l12 44.9l12-44.9l-12-12.2zm-7.1-26l-9.4-2.6l-4.4 16.4l16.4-4.4z"/><path d="m147.1 152.9l-12 45.1l32.9-32.9l-4.5-16.6zm-12-20.9L102 165.1l45.1-12.2l4.4-16.4z"/><path d="m154 126.9l-6.9-6.9l-12 12l16.4 4.5zm0-13.8l-2.5-9.6l-16.4 4.5l12 12z"/><path d="M135.1 108L90 120l45.1 12l12-12zm90 24l-16.6 4.5l4.4 16.4l45.1 12.2z"/><path d="m199.1 139.1l-2.6 9.4l16.4 4.4l-4.4-16.4zm-12.2 6.9l-6.9 6.9l12 12.2l4.5-16.6zm19.1-19.1l2.5 9.6l16.6-4.5l-12.2-12z"/><path d="m192 165.1l33.1 32.9l-12.2-45.1l-16.4-4.4zm7.1-64.2l9.4 2.6l4.4-16.4l-16.4 4.4z"/><path d="M225.1 108L258 75.1l-45.1 12l-4.4 16.4zm-12.2-20.9L225.1 42L192 75.1l4.5 16.4zm12.2 44.9l44.9-12l-44.9-12l-12.2 12z"/><path d="m206 113.1l6.9 6.9l12.2-12l-16.6-4.5zm-38-38L135.1 42l12 45.1l16.4 4.4z"/><path d="m160.9 100.9l2.6-9.4l-16.4-4.4l4.4 16.4z"/><path d="m147.1 87.1l-45.1-12l33.1 32.9l16.4-4.5zm39.8 6.9l9.6-2.5l-4.5-16.4l-12 12z"/><path d="M192 75.1L180 30l-12 45.1l12 12z"/><path d="m173.1 94l6.9-6.9l-12-12l-4.5 16.4z"/></g><circle cx="180" cy="120" r="51.1" fill="#000095"/><circle cx="180" cy="120" r="45.1" fill="#fff"/></g></svg>',
      TZS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGCUqt9dOZ"><path fill-opacity=".7" d="M10 0h160v120H10z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#SVGCUqt9dOZ)" transform="matrix(4 0 0 4 -40 0)"><path fill="#09f" d="M0 0h180v120H0z"/><path fill="#090" d="M0 0h180L0 120z"/><path fill="#000001" d="M0 120h40l140-95V0h-40L0 95z"/><path fill="#ff0" d="M0 91.5L137.2 0h13.5L0 100.5zM29.3 120L180 19.5v9L42.8 120z"/></g></svg>',
      UAH: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="gold" d="M0 0h640v480H0z"/><path fill="#0057b8" d="M0 0h640v240H0z"/></g></svg>',
      UZS: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#1eb53a" d="M0 320h640v160H0z"/><path fill="#0099b5" d="M0 0h640v160H0z"/><path fill="#ce1126" d="M0 153.6h640v172.8H0z"/><path fill="#fff" d="M0 163.2h640v153.6H0z"/><circle cx="134.4" cy="76.8" r="57.6" fill="#fff"/><circle cx="153.6" cy="76.8" r="57.6" fill="#0099b5"/><g fill="#fff" transform="translate(261.1 122.9)scale(1.92)"><g id="SVGDvHz26BW"><g id="SVGJuEDhbmM"><g id="SVGAB0QWsoX"><g id="SVGCOzhFJ0i"><path id="SVGkJ2esbgq" d="M0-6L-1.9-.3L1 .7"/><use width="100%" height="100%" href="#SVGkJ2esbgq" transform="scale(-1 1)"/></g><use width="100%" height="100%" href="#SVGCOzhFJ0i" transform="rotate(72)"/></g><use width="100%" height="100%" href="#SVGCOzhFJ0i" transform="rotate(-72)"/><use width="100%" height="100%" href="#SVGAB0QWsoX" transform="rotate(144)"/></g><use width="100%" height="100%" y="-24" href="#SVGJuEDhbmM"/><use width="100%" height="100%" y="-48" href="#SVGJuEDhbmM"/></g><use width="100%" height="100%" x="24" href="#SVGDvHz26BW"/><use width="100%" height="100%" x="48" href="#SVGDvHz26BW"/><use width="100%" height="100%" x="-48" href="#SVGJuEDhbmM"/><use width="100%" height="100%" x="-24" href="#SVGJuEDhbmM"/><use width="100%" height="100%" x="-24" y="-24" href="#SVGJuEDhbmM"/></g></svg>',
      VES: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><g id="SVGijLcxdYY" transform="translate(0 -36)"><g id="SVGbpwq1cKC"><g id="SVG42osUdlU"><path id="SVG7J0aOdko" fill="#fff" d="M0-5L-1.5-.2l2.8.9z"/><use width="180" height="120" href="#SVG7J0aOdko" transform="scale(-1 1)"/></g><use width="180" height="120" href="#SVG42osUdlU" transform="rotate(72)"/></g><use width="180" height="120" href="#SVG42osUdlU" transform="rotate(-72)"/><use width="180" height="120" href="#SVGbpwq1cKC" transform="rotate(144)"/></g></defs><path fill="#cf142b" d="M0 0h640v480H0z"/><path fill="#00247d" d="M0 0h640v320H0z"/><path fill="#fc0" d="M0 0h640v160H0z"/><g id="SVGQR1ROcaw" transform="matrix(4 0 0 4 320 336)"><g id="SVGdJYbedPr"><use width="180" height="120" href="#SVGijLcxdYY" transform="rotate(10)"/><use width="180" height="120" href="#SVGijLcxdYY" transform="rotate(30)"/></g><use width="180" height="120" href="#SVGdJYbedPr" transform="rotate(40)"/></g><use width="180" height="120" href="#SVGQR1ROcaw" transform="rotate(-80 320 336)"/></svg>',
      WST: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#ce1126" d="M0 0h640v480H0z"/><path fill="#002b7f" d="M0 0h320v240H0z"/><path fill="#fff" d="m180 229.3l-20.7-14l-19.9 14.1l6.5-24.9l-19-15.2l24.5-1.5l8.1-23.6l8.8 24l24 .7l-19 16.3zm-3.6-165.6L159.8 53l-16 10.4l4.4-20l-14.6-12.7l19.4-1.6l7.2-18.6l7.4 18.7l19.1 1.7L172 44.3zm-73 59.5l-16-11l-16.7 11l5.2-19.4L60.8 91L80 90l7-19l6.8 18.9l19.6 1.1l-15 12.5zM250 110l-15.4-10l-15 10l4.4-18.3l-14-11.8l18.3-1.5l6.3-17.2l7 17.4l17.7 1l-13.7 12.3zm-43.1 43.4l-10.3-6.4l-10.3 6.6l2.7-12.3l-9.2-8.3l12-1l4.6-11.6l4.9 11.6l11.9 1l-9.1 8.3z"/></g></svg>',
      YER: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h640v472.8H0z"/><path fill="#f10600" d="M0 0h640v157.4H0z"/><path fill="#000001" d="M0 322.6h640V480H0z"/></g></svg>',
      ZAR: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGXmBVUWUt"><path fill-opacity=".7" d="M-71.9 0h682.7v512H-71.9z"/></clipPath></defs><g clip-path="url(#SVGXmBVUWUt)" transform="translate(67.4)scale(.93748)"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#000001" d="M-71.9 407.8V104.4L154 256.1z"/><path fill="#000c8a" d="m82.2 512.1l253.6-170.6H696V512H82.2z"/><path fill="#e1392d" d="M66 0h630v170.8H335.7S69.3-1.7 66 0"/><path fill="#ffb915" d="M-71.9 64v40.4L154 256L-72 407.8v40.3l284.5-192z"/><path fill="#007847" d="M-71.9 64V0h95l301.2 204h371.8v104.2H324.3L23 512h-94.9v-63.9l284.4-192L-71.8 64z"/><path fill="#fff" d="M23 0h59.2l253.6 170.7H696V204H324.3zm0 512.1h59.2l253.6-170.6H696v-33.2H324.3L23 512z"/></g></g></svg>',
      KPW: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGCoZqOclZ"><path fill-opacity=".7" d="M5 .1h682.6V512H5.1z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGCoZqOclZ)" transform="translate(-4.8 -.1)scale(.93768)"><path fill="#fff" stroke="#000" d="M776 511.5H-76V.5h852z"/><path fill="#3e5698" d="M776 419H-76v92.5h852z"/><path fill="#c60000" d="M776 397.6H-76V114.4h852z"/><path fill="#3e5698" d="M776 .6H-76V93h852z"/><path fill="#fff" d="M328.5 256c0 63.5-53 115-118.6 115S91.3 319.5 91.3 256s53-114.8 118.6-114.8s118.6 51.4 118.6 114.9z"/><path fill="#c40000" d="m175.8 270.6l-57-40.7l71-.2l22.7-66.4l21.1 66.1l71-.4l-57.9 41.2l21.3 66.1l-57-40.7l-58 41.3z"/></g></svg>',
      KRW: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGfF2gcbVl"><path fill-opacity=".7" d="M-95.8-.4h682.7v512H-95.8z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGfF2gcbVl)" transform="translate(89.8 .4)scale(.9375)"><path fill="#fff" d="M-95.8-.4H587v512H-95.8Z"/><g transform="rotate(-56.3 361.6 -101.3)scale(10.66667)"><g id="SVG9rYemeHp"><path id="SVGf3pJkddj" fill="#000001" d="M-6-26H6v2H-6Zm0 3H6v2H-6Zm0 3H6v2H-6Z"/><use width="100%" height="100%" y="44" href="#SVGf3pJkddj"/></g><path stroke="#fff" d="M0 17v10"/><path fill="#cd2e3a" d="M0-12a12 12 0 0 1 0 24Z"/><path fill="#0047a0" d="M0-12a12 12 0 0 0 0 24A6 6 0 0 0 0 0Z"/><circle cy="-6" r="6" fill="#cd2e3a"/></g><g transform="rotate(-123.7 191.2 62.2)scale(10.66667)"><use width="100%" height="100%" href="#SVG9rYemeHp"/><path stroke="#fff" d="M0-23.5v3M0 17v3.5m0 3v3"/></g></g></svg>',
      BSD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><defs><clipPath id="SVGPMBrYbZn"><path fill-opacity=".7" d="M-12 0h640v480H-12z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#SVGPMBrYbZn)" transform="translate(12)"><path fill="#fff" d="M968.5 480h-979V1.8h979z"/><path fill="#ffe900" d="M968.5 344.5h-979V143.3h979z"/><path fill="#08ced6" d="M968.5 480h-979V320.6h979zm0-318.7h-979V2h979z"/><path fill="#000001" d="M-11 0c2.3 0 391.8 236.8 391.8 236.8L-12 479.2z"/></g></svg>',
      AED: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"  style="opacity:1;"><path fill="#00732f" d="M0 0h512v170.7H0z"/><path fill="#fff" d="M0 170.7h512v170.6H0z"/><path fill="#000001" d="M0 341.3h512V512H0z"/><path fill="red" d="M0 0h180v512H0z"/></svg>',
      AMD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="24"  style="opacity:1;"><path fill="#d90012" d="M0 0h640v160H0z"/><path fill="#0033a0" d="M0 160h640v160H0z"/><path fill="#f2a800" d="M0 320h640v160H0z"/></svg>',
    };

    const CURRENCY_NAMES = {
      EUR: 'Euro (EUR)', USD: 'US Dollar (USD)', GBP: 'British Pound (GBP)', CLP: 'Chilean Peso (CLP)', SEK: 'Swedish Krona (SEK)', CHF: 'Swiss Franc (CHF)',
      HUF: 'Hungarian Forint (HUF)', DKK: 'Danish Krone (DKK)', NOK: 'Norwegian Krone (NOK)', PLN: 'Polish Złoty (PLN)', CAD: 'Canadian Dollar (CAD)',
      ARS: 'Argentine Peso (ARS)', PEN: 'Peruvian Sol (PEN)', BRL: 'Brazilian Real (BRL)', MXN: 'Mexican Peso (MXN)',
      CZK: 'Czech Koruna (CZK)', RON: 'Romanian Leu (RON)', CNY: 'Chinese Yuan (CNY)', JPY: 'Japanese Yen (JPY)', INR: 'Indian Rupee (INR)',
      SGD: 'Singapore Dollar (SGD)', KRW: 'South Korean Won (KRW)', EGP: 'Egyptian Pound (EGP)', ZAR: 'South African Rand (ZAR)', NGN: 'Nigerian Naira (NGN)',
      XOF: 'West African CFA Franc (XOF)', AUD: 'Australian Dollar (AUD)', NZD: 'New Zealand Dollar (NZD)', ILS: 'Israeli New Shekel (ILS)', TRY: 'Turkish Lira (TRY)',
      VND: 'Vietnamese Đồng (VND)', UYU: 'Uruguayan Peso (UYU)', MAD: 'Moroccan Dirham (MAD)', MVR: 'Maldivian Rufiyaa (MVR)', NAD: 'Namibian Dollar (NAD)',
      NPR: 'Nepalese Rupee (NPR)', PGK: 'Papua New Guinean Kina (PGK)', PHP: 'Philippine Peso (PHP)', PKR: 'Pakistani Rupee (PKR)', QAR: 'Qatari Riyal (QAR)',
      RUB: 'Russian Ruble (RUB)', MGA: 'Malagasy Ariary (MGA)', RWF: 'Rwandan Franc (RWF)', SCR: 'Seychellois Rupee (SCR)', SLL: 'Sierra Leonean Leone (SLL)',
      SOS: 'Somali Shilling (SOS)', SRD: 'Surinamese Dollar (SRD)', SSP: 'South Sudanese Pound (SSP)', STN: 'São Tomé and Príncipe Dobra (STN)', SYP: 'Syrian Pound (SYP)',
      THB: 'Thai Baht (THB)', TJS: 'Tajikistani Somoni (TJS)', TOP: 'Tongan Paʻanga (TOP)', TND: 'Tunisian Dinar (TND)', TTD: 'Trinidad and Tobago Dollar (TTD)',
      TWD: 'New Taiwan Dollar (TWD)', TZS: 'Tanzanian Shilling (TZS)', UAH: 'Ukrainian Hryvnia (UAH)', UZS: 'Uzbekistani Soʻm (UZS)', VES: 'Venezuelan Bolívar (VES)',
      WST: 'Samoan Tālā (WST)', YER: 'Yemeni Rial (YER)', KPW: 'North Korean Won (KPW)', LYD: 'Libyan Dinar (LYD)', BSD: 'Bahamian Dollar (BSD)',
      AED: 'United Arab Emirates Dirham (AED)', AMD: 'Armenian Dram (AMD)',
      AOA: 'Angolan Kwanza (AOA)', ALL: 'Albanian Lek (ALL)', AZN: 'Azerbaijani Manat (AZN)', BHD: 'Bahraini Dinar (BHD)', BIF: 'Burundian Franc (BIF)',
      BND: 'Brunei Dollar (BND)', COP: 'Colombian Peso (COP)', CRC: 'Costa Rican Colón (CRC)', CUP: 'Cuban Peso (CUP)', GEL: 'Georgian Lari (GEL)',
      HKD: 'Hong Kong Dollar (HKD)', HNL: 'Honduran Lempira (HNL)', IDR: 'Indonesian Rupiah (IDR)', JOD: 'Jordanian Dinar (JOD)', KES: 'Kenyan Shilling (KES)',
      IQD: 'Iraqi Dinar (IQD)', ISK: 'Icelandic Króna (ISK)', JMD: 'Jamaican Dollar (JMD)', IRR: 'Iranian Rial (IRR)', XAF: 'Central African CFA Franc (XAF)',
      BWP: 'Botswana Pula (BWP)', DJF: 'Djiboutian Franc (DJF)', DZD: 'Algerian Dinar (DZD)', ETB: 'Ethiopian Birr (ETB)', GMD: 'Gambian Dalasi (GMD)',
      GHS: 'Ghanaian Cedi (GHS)', GNF: 'Guinean Franc (GNF)', GYD: 'Guyanaese Dollar (GYD)', CDF: 'Congolese Franc (CDF)', KWD: 'Kuwaiti Dinar (KWD)',
      LAK: 'Lao Kip (LAK)', LRD: 'Liberian Dollar (LRD)', MKD: 'North Macedonian Denar (MKD)', MMK: 'Myanmar Kyat (MMK)', MRU: 'Mauritanian Ouguiya (MRU)',
      MUR: 'Mauritian Rupee (MUR)',
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
          single_cover: true,
          denomination_order: ORDER_LARGEST_FIRST,
          coins_rule: 'off',
          show_denominations_on_hand_only: false,
          show_bills_coins: true,
          show_cents: false,
          appearance: getInitialAppearance(),
          launch_updates_signups: [],
          biometric_lock: false,
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
      const sym = CURRENCY_SYMBOLS[currency] || currency;
      const sign = amount < 0 ? '-' : '';
      if (scale === 1) {
        const numStr = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.abs(amount));
        return `${sign}${sym}${numStr}`;
      }
      const showCents = app?.state?.settings?.show_cents ?? false;
      const hasCents = Math.abs(minor) % scale !== 0;
      const digits = (showCents || hasCents) ? 2 : 0;
      const numStr = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(Math.abs(amount));
      return `${sign}${sym}${numStr}`;
    }

    function formatDenomValue(valueMinor, currency) {
      return formatMoney(valueMinor, currency);
    }

    function strategyDisplayName(key) {
      const names = { greedy: 'Minimise', lex: 'Preserve', equalisation: 'Balance' };
      return names[key] || key || '-';
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
      return `${flag} ${CURRENCY_NAMES[wallet.currency] || wallet.currency} — ${wallet.name}`;
    }

    function getCurrencyOrder() {
      const priority = ['CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'USD'];
      const rest = SUPPORTED_CURRENCIES
        .filter((code) => !priority.includes(code))
        .sort((a, b) => a.localeCompare(b));
      return { priority, rest };
    }

    function renderCurrencyOptions(selectedCode = '') {
      const { priority, rest } = getCurrencyOrder();
      const renderOption = (code) => `<option value="${code}" ${selectedCode === code ? 'selected' : ''}>${CURRENCY_FLAGS[code] || '🏳️'} ${CURRENCY_NAMES[code] || code}</option>`;
      return `
        <optgroup label="Most used">
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
      const stripped = input.trim().replace(/[^0-9.,]/g, '').replace(/,/g, '');
      if (!stripped) return null;
      const n = Number(stripped);
      if (!Number.isFinite(n) || n <= 0) return null;
      const decimals = stripped.includes('.') ? stripped.split('.')[1].length : 0;
      if (scale === 1 && decimals > 0) return null;
      if (scale === 100 && decimals > 2) return null;
      return Math.round(n * scale);
    }

    function formatAmountDisplay(rawInput, currency) {
      const stripped = rawInput.replace(/[^0-9.]/g, '');
      if (!stripped) return '';
      const parts = stripped.split('.');
      const intPart = parts[0] || '';
      const decPart = parts.length > 1 ? parts[1] : null;
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const scale = getMinorScale(currency);
      const sym = getCurrencySymbol(currency);
      if (decPart !== null) {
        return `${sym}${formatted}.${decPart.slice(0, scale === 1 ? 0 : 2)}`;
      }
      return `${sym}${formatted}`;
    }

    function getCurrencySymbol(currency) {
      return CURRENCY_SYMBOLS[currency] || currency;
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
        lines.push(`- ${new Date(tx.created_at).toLocaleString()} | ${tx.wallet_name} | ${tx.type || 'outgoing'} ${formatMoney(amountMinor, tx.currency)} | paid ${formatMoney(paidMinor, tx.currency)} | strategy ${strategyDisplayName(tx.strategy)}`);
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
        if (typeof merged.settings.biometric_lock !== 'boolean') {
          merged.settings.biometric_lock = false;
        }
        if (typeof merged.settings.single_cover !== 'boolean') {
          merged.settings.single_cover = true;
        }
        if (typeof merged.settings.show_bills_coins !== 'boolean') {
          merged.settings.show_bills_coins = true;
        }
        if (typeof merged.settings.show_cents !== 'boolean') {
          merged.settings.show_cents = false;
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
        incomingEntryMode: null,
      },
      paymentSuccessMessage: '',
      paymentSuccessSummary: null,
      launchSignupMessage: '',
      modal: null,
      modalResolver: null,
      settingsOpen: false,
      isLocked: false,
      lockedAt: null,
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
      const allowOverpay = Boolean(app.state.settings.single_cover);
      const plan = app.state.settings.payment_strategies
        ? computeOutgoingPlan(wallet.denominations, amountMinor, strategy, denomOrder, allowOverpay, coinsRule)
        : { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
      const total = getWalletTotal(wallet);

      if (plan.status === 'exact') {
        return {
          wallet,
          amountMinor,
          status: 'EXACT_PAYABLE',
          breakdown: plan.breakdown,
          paidMinor: plan.paidMinor,
          overpay: plan.overpay,
        };
      }
      if (plan.status === 'sufficient_not_exact') {
        return {
          wallet,
          amountMinor,
          status: 'COVER_PAYABLE',
          breakdown: plan.breakdown,
          paidMinor: plan.paidMinor,
          overpay: plan.overpay,
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
      
      if (app.isLocked) {
        renderLockScreen();
      } else {
        renderCashOnHand();
        renderPay();
        renderTransactions();
        renderSettings();
        setupTabs();
        renderModal();
      }
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
                ${modal.showClose ? '<button type="button" class="modal-close-btn" data-modal-close aria-label="Close"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path fill-rule="evenodd" d="M7 1L1 7l5 5l-5 5l6 6l5-5l5 5l6-6l-5-5l5-5l-6-6l-5 5z" clip-rule="evenodd"/></svg></button>' : ''}
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
              ${modal.showClose ? '<button type="button" class="modal-close-btn" data-modal-close aria-label="Close"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path fill-rule="evenodd" d="M7 1L1 7l5 5l-5 5l6 6l5-5l5 5l6-6l-5-5l5-5l-6-6l-5 5z" clip-rule="evenodd"/></svg></button>' : ''}
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
        const blocked = gated && btn.dataset.tab !== app.activeTab;
        btn.disabled = Boolean(blocked);
      });
      document.querySelectorAll('.bottom-nav-link').forEach((link) => {
        link.classList.toggle('active', link.dataset.tab === app.activeTab);
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
                <div class="wallet-card-override">
                  <div
                    class="${cls} ${active ? 'active' : ''}"
                    data-wallet-selector="${selectorId}"
                    data-wallet-id="${wallet.id}"
                    data-wallet-draggable="true"
                    draggable="true"
                    role="button"
                    tabindex="0"
                    aria-pressed="${active ? 'true' : 'false'}"
                  >
                    <p class="wallet-card-head">${CURRENCY_FLAGS[wallet.currency] || '🏳️'}</p>
                    <p class="wallet-card-name">${wallet.name}</p>
                    <p class="wallet-card-total">${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
                  </div>
                </div>
                ${showActions && active ? `
                  <button type="button" class="wallet-card-action" data-wallet-action="1" aria-label="Wallet actions">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M30.47 6.1H32v4.57h-1.53Zm-1.52 4.57h1.52v1.52h-1.52Zm0-6.1h1.52V6.1h-1.52Zm-1.52 7.62h1.52v1.52h-1.52Zm0-9.14h1.52v1.52h-1.52ZM25.9 13.71h1.53v1.53H25.9Zm0-3.04h1.53v1.52H25.9Zm0-9.15h1.53v1.53H25.9Zm-1.52 13.72h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Zm-1.53 7.62h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm0-3.05h1.53v1.52h-1.53ZM21.33 0h4.57v1.52h-4.57Zm0 18.29h1.52v1.52h-1.52Zm0-6.1h1.52v1.52h-1.52Zm0-6.09h1.52v1.52h-1.52Zm-1.52 13.71h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-3.05h1.52V6.1h-1.52Zm0-3.05h1.52v1.53h-1.52Zm-1.53 19.81h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm0-6.1h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm-1.52 19.81h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-6.1h1.52V6.1h-1.52Zm-1.52 19.81h1.52v1.52h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-6.1h1.52v1.52h-1.52Zm0-6.09h1.52v1.52h-1.52Zm-1.53 19.8h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm0-6.1h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm-1.52 19.81h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Zm0-6.09h1.52v1.52h-1.52Zm0-6.1h1.52v1.53h-1.52Zm-1.53 13.72h1.53v1.52h-1.53Zm0-6.1h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm0 19.81h1.53v-1.53h-1.53v-4.57H7.62v-3.05H3.05v-1.52H1.52v1.52H0V32h10.66Zm-1.52 0H4.57v-1.53H3.05v-1.52H1.52v-4.57h4.57v3.04h3.05Zm0-12.19h1.52v1.52H9.14Zm0-6.1h1.52v1.52H9.14Zm-1.52 7.62h1.52v1.52H7.62Zm0-6.1h1.52v1.53H7.62Zm-1.53 1.53h1.53v1.52H6.09Zm-1.52 1.52h1.52v1.53H4.57Zm-1.52 1.53h1.52v1.52H3.05Z"/></svg>
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
      let errorMsg = '';
      let lastCurrency = 'EUR';
      while (true) {
        const result = await showModal({
          title: 'Create wallet',
          message: errorMsg ? `<p class="status danger">${errorMsg}</p>Enter a name and choose a currency.` : 'Enter a name and choose a currency.',
          fields: [
            { id: 'name', label: 'Name', type: 'text', defaultValue: '', maxLength: WALLET_NAME_MAX },
            { id: 'currency', label: 'Currency', type: 'select', defaultValue: lastCurrency, optionsHtml: renderCurrencyOptions(lastCurrency) },
          ],
          actions: [
            { id: 'create', label: 'Create wallet', style: 'primary' },
            { id: 'cancel', label: 'Cancel', style: 'secondary' },
          ],
        });
        if (!result || result.id !== 'create') return;
        const name = (result.values?.name || '').trim();
        const currency = result.values?.currency || 'EUR';
        lastCurrency = currency;
        if (!name) {
          errorMsg = 'Wallet name is required.';
          continue;
        }
        if (name.length > WALLET_NAME_MAX) {
          errorMsg = `Wallet name must be ${WALLET_NAME_MAX} characters or fewer.`;
          continue;
        }
        try {
          const id = createWallet(app.state, name, currency);
          app.activeWalletId = id;
          if (!app.paymentDraft.walletId) app.paymentDraft.walletId = id;
          saveState();
          render();
          return;
        } catch (err) {
          errorMsg = err.message || 'Unable to create wallet.';
        }
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
      const divideBillsCoins = app.state.settings.show_bills_coins;
      const showToggle = divideBillsCoins && bills.length > 0 && coins.length > 0;
      const activeTab = divideBillsCoins ? getActiveCashTab(wallet) : 'all';
      app.cashDenomTabByWallet[wallet.id] = activeTab;
      const hideEmptyDenoms = app.state.settings.show_denominations_on_hand_only;
      const activeTabDenoms = activeTab === 'all' ? wallet.denominations : (activeTab === 'bills' ? bills : coins);
      const activeTabTotal = activeTabDenoms.reduce((sum, row) => sum + row.value_minor * getDenomCount(wallet, row.value_minor), 0);
      const activeTabCount = activeTabDenoms.reduce((sum, row) => sum + getDenomCount(wallet, row.value_minor), 0);

      const rows = getSortedDenoms(wallet, 'largest_first')
        .filter((row) => {
          if (activeTab === 'all') return true;
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
            <p class="denom-value">${formatDenomValue(row.value_minor, wallet.currency)} ${count > 0 ? '<svg class="denom-presence-icon have" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M23.914 6.914L8.5 22.328L.086 13.914l2.828-2.828L8.5 16.672L21.086 4.086z" clip-rule="evenodd"/></svg>' : '<svg class="denom-presence-icon missing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M7 1L1 7l5 5l-5 5l6 6l5-5l5 5l6-6l-5-5l5-5l-6-6l-5 5z" clip-rule="evenodd"/></svg>'}</p>
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
                <p class="edit-reconciliation">Allocated: ${formatMoney(currentTotal, wallet.currency)} / Expected: ${formatMoney(expectedTotal, wallet.currency)}</p>
                <p class="edit-reconciliation-pill ${difference === 0 ? 'success' : 'danger'}">${difference === 0 ? 'Reconciled.' : (difference > 0 ? `You're over by ${formatMoney(Math.abs(difference), wallet.currency)}` : `You're short by ${formatMoney(Math.abs(difference), wallet.currency)}`)}</p>
                <div class="inline-actions edit-actions">
                  <button type="button" id="finish-edit-mode" class="btn-primary-soft" ${difference !== 0 ? 'disabled' : ''}>Finish edit</button>
                  <button type="button" id="cancel-edit-mode" class="btn-secondary-soft">Cancel edit</button>
                </div>
              </section>
            ` : ''}
          </section>

          ${!isEditMode && currentTotal === 0 ? '' : `
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
              <div class="denom-list">${rows}</div>
              <div class="denom-total-row">
                <p>Total</p>
                <p>${activeTabCount}</p>
                <p>${formatMoney(activeTabTotal, wallet.currency)}</p>
              </div>
            </section>
          `}
        </section>
      `;

      bindWalletCards('cash-wallet', async (walletId) => {
        if (app.editMode && app.editMode.walletId !== walletId) {
          await modalAlert('Finish or cancel Edit denominations before navigating.');
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
          snapshot: wallet.denominations.map((d) => ({ value_minor: d.value_minor, count: d.count })),
          draft: wallet.denominations.reduce((acc, d) => {
            acc[d.value_minor] = d.count;
            return acc;
          }, {}),
        };
        render();
      };

      const cashWalletActionsBtn = el.querySelector('[data-wallet-action="1"]');
      if (cashWalletActionsBtn) {
        cashWalletActionsBtn.addEventListener('click', async () => {
          const choice = await showModal({
            title: 'Wallet actions',
            message: `Manage ${wallet.name}.`,
            showClose: true,
            actions: [
              { id: 'name', label: 'Edit name', style: 'secondary' },
              { id: 'denoms', label: 'Edit denominations', style: 'secondary' },
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
              { id: 'edit', label: 'Enter edit mode', style: 'secondary' },
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
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
          const newBreakdown = wallet.denominations.filter((d) => d.count > 0).map((d) => ({ value_minor: d.value_minor, count: d.count }));
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
            prior_breakdown: priorBreakdown,
            breakdown: newBreakdown,
          });
          app.editMode = null;
          saveState();
          render();
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
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">No wallets yet. Create your first wallet to start tracking cash.</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet-pay" class="btn-secondary-soft">Create wallet</button>
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
      if (wallets.length === 0) {
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">No wallets yet. Create your first wallet to start tracking cash.</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet-payment" class="btn-secondary-soft">Create wallet</button>
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
      const allRowsForTab = getSortedDenoms(wallet, 'largest_first')
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
      const showManualEditor = manualDirect || (validAmount && (app.paymentDraft.manualEntry || !suggestionAvailable || coverSuggestionState));

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
          <div class="segmented-control" role="tablist" aria-label="Payment mode">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ Outgoing</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ Incoming</button>
          </div>
          ${zeroWalletHint ? `<p class="status warn">${zeroWalletHint}</p>` : ''}
        </section>
      ` : `
        <section class="card payment-context-pill">
          <div class="payment-wallet-summary">
            <p class="muted">Selected wallet</p>
            <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${CURRENCY_NAMES[wallet.currency] || wallet.currency} · ${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
          </div>
          <div class="segmented-control" role="tablist" aria-label="Payment mode">
            <button type="button" id="mode-outgoing" class="segment ${mode === 'outgoing' ? 'active' : ''}">↑ Outgoing</button>
            <button type="button" id="mode-incoming" class="segment ${mode === 'incoming' ? 'active' : ''}">↓ Incoming</button>
          </div>
          ${zeroWalletHint ? `<p class="status warn">${zeroWalletHint}</p>` : ''}
        </section>
      `;

      el.innerHTML = `
        <section class="panel">
          ${app.paymentSuccessSummary ? `
            <section class="card payment-context-pill">
              <div class="payment-wallet-summary">
                <p class="muted">Selected wallet</p>
                <p><strong>${CURRENCY_FLAGS[wallet.currency] || ''} ${wallet.name}</strong> · ${CURRENCY_NAMES[wallet.currency] || wallet.currency} · ${formatMoney(getWalletTotal(wallet), wallet.currency)}</p>
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
              ${manualDirect ? `
              <div class="payment-entry-grid">
                ${mode === 'outgoing' ? `
                <label class="payment-amount-field">Amount
                  <input id="payment-amount" class="payment-amount-input" type="text" inputmode="decimal" value="${app.paymentDraft.amountDisplay || ''}" autocomplete="off" />
                </label>
                ` : ''}
                <label>Note/Reference (optional)
                  <input id="payment-note" type="text" maxlength="30" value="${app.paymentDraft.note}" />
                </label>
                ${app.paymentDraft.note.length >= 25 ? `<p class="muted note-limit-hint">${app.paymentDraft.note.length}/30 characters${app.paymentDraft.note.length >= 30 ? ' — limit reached' : ''}</p>` : ''}
              </div>
              <div class="payment-divider" aria-hidden="true"></div>
              <section class="payment-breakdown-inline">
                ${allocationPreviewHtml}
                ${showToggle ? `
                  <div class="segmented-control" role="tablist" aria-label="Denomination type">
                    <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="payment-bills">Bills</button>
                    <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="payment-coins">Coins</button>
                  </div>
                ` : ''}
                <div class="denom-list">${allocationRows || '<p class="muted">No denominations available.</p>'}</div>
              </section>
              <div class="payment-actions">
                ${mode === 'incoming' ? (effectiveAllocated > 0 ? '<button type="submit" class="btn-primary-soft">Finalize</button>' : '') : ''}
                ${mode === 'outgoing' && validAmount && !applyDisabled ? '<button type="submit" class="btn-primary-soft">Finalize</button>' : ''}
                <button type="button" id="payment-cancel-entry" class="btn-secondary-soft">Cancel</button>
              </div>
              ` : `
              <div class="payment-entry-grid">
                <label class="payment-amount-field">Amount
                  <input id="payment-amount" class="payment-amount-input" type="text" inputmode="decimal" value="${app.paymentDraft.amountDisplay || ''}" autocomplete="off" />
                </label>
                <label>Note/Reference (optional)
                  <input id="payment-note" type="text" maxlength="30" value="${app.paymentDraft.note}" />
                </label>
                ${app.paymentDraft.note.length >= 25 ? `<p class="muted note-limit-hint">${app.paymentDraft.note.length}/30 characters${app.paymentDraft.note.length >= 30 ? ' — limit reached' : ''}</p>` : ''}
              </div>
              <div class="payment-divider" aria-hidden="true"></div>
              <section class="payment-breakdown-inline ${validAmount ? '' : 'disabled'}">
                ${validAmount ? `
                  ${insufficientOutgoing ? `
                    <div class="preview suggestion-danger">
                      <p class="status danger">Insufficient funds</p>
                      ${suggestionStatusHtml}
                    </div>
                  ` : `
                    ${!strategiesEnabled && mode === 'outgoing' ? `
                      <div class="preview suggestion-warn">
                        <p class="status warn">Suggestions are off</p>
                      </div>
                      ${allocationPreviewHtml}
                    ` : ''}
                    ${!strategiesEnabled && mode !== 'outgoing' ? allocationPreviewHtml : ''}

                    ${strategiesEnabled ? `
                    ${noExactSuggestionState ? `
                      <div class="preview suggestion-warn">
                        ${suggestionStatusHtml}
                      </div>
                      ${allocationPreviewHtml}
                      <div class="inline-actions">
                        <button type="button" id="payment-edit-manual" class="btn-secondary-soft">Edit manually</button>
                      </div>
                    ` : `
                    <div class="preview ${suggestionToneClass}">
                      ${suggestedBreakdown.length > 0 ? breakdownHtml(wallet, suggestedBreakdown) : ''}
                      ${suggestionStatusHtml}
                      ${allocationPreviewHtml}
                      ${suggestionAvailable ? `<div class="inline-actions"><button type="button" id="payment-use-suggested" class="${usingSuggestion ? 'btn-primary-soft' : 'btn-secondary-soft'}">${mode === 'outgoing' ? (ctx?.status === 'EXACT_PAYABLE' ? 'Use and finalize' : 'Use suggested') : 'Use and finalize'}</button><button type="button" id="payment-edit-manual" class="btn-secondary-soft">Edit manually</button></div>` : ''}
                    </div>
                    `}
                    ` : ''}
                    ${showManualEditor ? `
                      ${showToggle ? `
                        <div class="segmented-control" role="tablist" aria-label="Denomination type">
                          <button type="button" class="segment ${activeTab === 'bills' ? 'active' : ''}" id="payment-bills">Bills</button>
                          <button type="button" class="segment ${activeTab === 'coins' ? 'active' : ''}" id="payment-coins">Coins</button>
                        </div>
                      ` : ''}
                      <div class="denom-list">${allocationRows || '<p class="muted">No denominations available in this tab for the amount.</p>'}</div>
                    ` : ''}
                    ${strategiesEnabled && !exactSuggestionState && !noExactSuggestionState && !coverSuggestionState ? '' : ''}
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
              `}
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
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
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

      const goTransactions = document.getElementById('go-transactions');
      if (goTransactions) {
        goTransactions.addEventListener('click', () => {
          if (app.paymentSuccessSummary?.wallet_id && app.state.wallets[app.paymentSuccessSummary.wallet_id]) {
            app.activeWalletId = app.paymentSuccessSummary.wallet_id;
            app.txFilters.wallet = app.paymentSuccessSummary.wallet_id;
          }
          app.activeTab = 'transactions';
          render();
        });
      }
      const newTransactionBtn = document.getElementById('new-transaction');
      if (newTransactionBtn) {
        newTransactionBtn.addEventListener('click', () => {
          app.paymentDraft.amountInput = '';
          app.paymentDraft.amountDisplay = '';
          app.paymentDraft.note = '';
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
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          const prevDisplay = app.paymentDraft.amountDisplay || '';
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
          breakdown,
        };
        app.state.transactions.push(tx);
        setPaymentSuccess(tx);
        app.paymentDraft.note = '';
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
            title: 'Wallet actions',
            message: `Manage ${wallet.name}.`,
            showClose: true,
            actions: [
              { id: 'name', label: 'Edit name', style: 'secondary' },
              { id: 'denoms', label: 'Edit denominations', style: 'secondary' },
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
            rerenderPayment();
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
            rerenderPayment();
            return;
          }
          if (choice !== 'denoms') return;
          const ok = await showModal({
            title: 'Edit denominations?',
            message: 'Edit denominations instead of entering a transaction?',
            actions: [
              { id: 'edit', label: 'Enter edit mode', style: 'secondary' },
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
            ],
          });
          if (ok !== 'edit') return;
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

    function renderTransactions() {
      const el = document.getElementById('tab-transactions');
      const wallets = getWalletList();
      
      if (!wallets.length) {
        el.innerHTML = `
          <section class="panel">
            <p class="empty-notice">No wallets yet. Create your first wallet to start tracking cash.</p>
            <div class="inline-actions">
              <button type="button" id="open-create-wallet-transactions" class="btn-secondary-soft">Create wallet</button>
            </div>
          </section>
        `;
        const openCreateWalletBtn = document.getElementById('open-create-wallet-transactions');
        if (openCreateWalletBtn) {
          openCreateWalletBtn.addEventListener('click', openCreateWalletModal);
        }
        return;
      }

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
        const detailPrior = tx.type === 'denominations_edited' ? formatBreakdownLine(tx.prior_breakdown || [], tx.currency) : '';
        const detailNew = tx.type === 'denominations_edited' ? formatBreakdownLine(tx.breakdown || [], tx.currency) : '';
        const amountMinor = Number.isFinite(tx.requested_amount_minor) ? tx.requested_amount_minor : (tx.amount_minor || 0);
        const amountLabel = tx.type === 'incoming' ? '+' : tx.type === 'outgoing' ? '-' : '±';
        const amountClass = tx.type === 'incoming' ? 'incoming' : tx.type === 'outgoing' ? 'outgoing' : '';
        const isLatestForWallet = latestByWallet.get(tx.wallet_id)?.id === tx.id;
        const noteText = String(tx.note || '').trim();
        const shortNote = truncateNote(noteText, 30);
        const useNoteAsTitle = noteText && noteText.length <= 24;
        const isDenomEdit = tx.type === 'denominations_edited';
        const titleText = isDenomEdit
          ? 'Denominations edited'
          : (useNoteAsTitle
            ? noteText
            : (tx.type === 'incoming' ? 'Cash in' : tx.type === 'outgoing' ? 'Payment' : 'Adjustment'));
        const secondaryText = `${formatTimeEU(tx.created_at)}${(!isDenomEdit && !useNoteAsTitle && shortNote) ? ` · ${shortNote}` : ''}`;
        const changeSummary = tx.change_expected_minor
          ? `${formatMoney(tx.change_expected_minor, tx.currency)} / ${formatMoney(tx.change_received_minor || 0, tx.currency)}${detailChange !== '-' ? ` (${detailChange})` : ''}`
          : '-';
        const balanceLabel = formatMoney(balanceById.get(tx.id) || 0, tx.currency);
        const detailsBodyHtml = isDenomEdit
          ? `<div class="tx-detail"><span>Timestamp</span><span>${formatDateTimeEU(tx.created_at)}</span></div>
             <div class="tx-detail"><span>Type</span><span>Denominations edited</span></div>
             <div class="tx-detail"><span>Prior denominations</span><span>${detailPrior}</span></div>
             <div class="tx-detail"><span>New denominations</span><span>${detailNew}</span></div>
             ${isLatestForWallet ? `<button type="button" class="btn-danger-soft tx-revert-btn" data-revert-tx-id="${tx.id}">Revert transaction</button>` : ''}`
          : `<div class="tx-detail"><span>Timestamp</span><span>${formatDateTimeEU(tx.created_at)}</span></div>
             <div class="tx-detail"><span>Direction</span><span>${tx.type || '-'}</span></div>
             <div class="tx-detail"><span>Strategy</span><span>${strategyDisplayName(tx.strategy)}</span></div>
             <div class="tx-detail"><span>Breakdown</span><span>${detailPaid}</span></div>
             <div class="tx-detail"><span>Change</span><span>${changeSummary}</span></div>
             <div class="tx-detail"><span>Note</span><span>${noteText || '-'}</span></div>
             ${isLatestForWallet ? `<button type="button" class="btn-danger-soft tx-revert-btn" data-revert-tx-id="${tx.id}">Revert transaction</button>` : ''}`;
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
                ${detailsBodyHtml}
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
              <div class="banner-content">
                <p>Transactions older than 30 days are deleted automatically.</p>
                <p><strong>${scheduledNextDeletionCount} transactions will be deleted next.</strong></p>
                <p><strong>${nextCleanupDays} days remaining until the next deletion window.</strong></p>
                <p>Back up your history from Settings.</p>
              </div>
              <button type="button" class="banner-close-btn" id="tx-banner-close" aria-label="Don't show again for 5 days"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M7 1L1 7l5 5l-5 5l6 6l5-5l5 5l6-6l-5-5l5-5l-6-6l-5 5z" clip-rule="evenodd"/></svg></button>
            </div>
          ` : ''}
          <section class="card summary-card">
            <div class="summary-main">
              ${wallets.length > 0 ? renderWalletCards(wallets, filters.wallet, 'tx-wallet', false, { showCreateCard: true, showActions: true }) : '<p class="muted">No wallets yet.</p>'}
            </div>
          </section>
          ${filters.wallet && app.state.wallets[filters.wallet] ? `
            <section class="card tx-wallet-header">
              <div class="tx-wallet-header-main">
                <div>
                  <p class="muted">Selected wallet</p>
                  <p><strong>${app.state.wallets[filters.wallet].name}</strong> · ${CURRENCY_NAMES[app.state.wallets[filters.wallet].currency] || app.state.wallets[filters.wallet].currency}</p>
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

      const addWalletCardBtn = document.querySelector('[data-wallet-selector="tx-wallet"][data-wallet-add="1"]');
      if (addWalletCardBtn) {
        addWalletCardBtn.addEventListener('click', async () => {
          await openCreateWalletModal();
        });
      }

      const txWalletActionsBtn = el.querySelector('[data-wallet-action="1"]');
      if (txWalletActionsBtn) {
        txWalletActionsBtn.addEventListener('click', async () => {
          const activeWallet = app.state.wallets[filters.wallet];
          if (!activeWallet) return;
          
          const choice = await showModal({
            title: 'Wallet actions',
            message: `Manage ${activeWallet.name}.`,
            showClose: true,
            actions: [
              { id: 'name', label: 'Edit name', style: 'secondary' },
              { id: 'denoms', label: 'Edit denominations', style: 'secondary' },
              { id: 'delete', label: 'Delete wallet', style: 'danger' },
            ],
          });
          if (choice === 'name') {
            const name = await modalPrompt('New wallet name', activeWallet.name, 'Edit Wallet Name', '', WALLET_NAME_MAX);
            if (!name) return;
            if (name.length > WALLET_NAME_MAX) {
              await modalAlert(`Wallet name must be ${WALLET_NAME_MAX} characters or fewer.`);
              return;
            }
            activeWallet.name = name.trim();
            activeWallet.updated_at = nowIso();
            saveState();
            renderTransactions();
            return;
          }
          if (choice === 'delete') {
            const ok = await modalConfirm(`Delete wallet ${activeWallet.name}? This removes its cash and transactions.`, 'Delete Wallet');
            if (!ok) return;
            const id = activeWallet.id;
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
            renderTransactions();
            return;
          }
          if (choice !== 'denoms') return;
          const ok = await showModal({
            title: 'Edit denominations?',
            message: 'Edit denominations instead of entering a transaction?',
            actions: [
              { id: 'edit', label: 'Enter edit mode', style: 'secondary' },
              { id: 'cancel', label: 'Cancel', style: 'secondary' },
            ],
          });
          if (ok !== 'edit') return;
          app.editMode = {
            walletId: activeWallet.id,
            snapshot: activeWallet.denominations.map((d) => ({ value_minor: d.value_minor, count: d.count })),
            draft: activeWallet.denominations.reduce((acc, d) => {
              acc[d.value_minor] = d.count;
              return acc;
            }, {}),
          };
          app.activeWalletId = activeWallet.id;
          app.activeTab = 'cash';
          render();
        });
      }

    }

    function renderSettings() {
      const el = document.getElementById('settings-overlay-root');
      if (!el) return;
      if (!app.settingsOpen) {
        el.innerHTML = '';
        return;
      }
      const prevModal = el.querySelector('.settings-modal');
      const savedScroll = prevModal ? prevModal.scrollTop : 0;
      const coinsRule = app.state.settings.coins_rule || 'off';
      const coinsEnabled = coinsRule !== 'off';
      const coinsMode = coinsRule === 'avoid' ? 'avoid' : 'prefer';
      const strategiesEnabled = app.state.settings.payment_strategies;
      const changeSuggestionsEnabled = app.state.settings.change_suggestions;

      const singleCoverEnabled = app.state.settings.single_cover;
      const showBillsCoins = app.state.settings.show_bills_coins;
      const showCents = app.state.settings.show_cents;

      el.innerHTML = `
        <div class="modal-backdrop" id="settings-backdrop">
          <section class="modal-card settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
            <div class="settings-title-bar">
              <div></div>
              <h3 class="settings-title">Settings</h3>
              <button type="button" class="modal-close-btn" id="settings-close" aria-label="Close"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path fill-rule="evenodd" d="M7 1L1 7l5 5l-5 5l6 6l5-5l5 5l6-6l-5-5l5-5l-6-6l-5 5z" clip-rule="evenodd"/></svg></button>
            </div>
            <section class="settings-section">
              <h3>Suggestions</h3>
              <p class="muted">Suggestions show recommended denominations; you still confirm or edit manually.</p>
              <div class="segmented-control" role="group" aria-label="Suggestions">
                <button type="button" class="segment ${!strategiesEnabled ? 'active' : ''}" data-strategy-toggle="off">Off</button>
                <button type="button" class="segment ${strategiesEnabled ? 'active' : ''}" data-strategy-toggle="on">On</button>
              </div>
              ${strategiesEnabled ? `
                <div class="subpanel-divider"></div>
                <div class="stack-form">
                  <p class="muted"><strong>Strategies</strong></p>
                  <p class="muted">How suggestions are calculated.</p>
                  <div class="strategy-grid" role="group" aria-label="Default strategy">
                    <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'greedy' ? 'active' : ''}" data-strategy="greedy">
                      <h4>Minimise</h4>
                      <p>Uses larger denominations first to reduce item count.</p>
                    </button>
                    <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'lex' ? 'active' : ''}" data-strategy="lex">
                      <h4>Preserve</h4>
                      <p>Prefers higher denominations first when multiple exact options exist.</p>
                    </button>
                    <button type="button" class="strategy-card ${app.state.settings.default_strategy === 'equalisation' ? 'active' : ''}" data-strategy="equalisation">
                      <h4>Balance</h4>
                      <p>Prefers surplus denominations to keep wallet mix balanced.</p>
                    </button>
                  </div>
                  <div class="subpanel-divider"></div>
                  <p class="muted"><strong>Single cover</strong></p>
                  <p class="muted">When a strategy can't match the exact amount, suggest the lowest single or mix of denominations that can cover it. You'll get cash back.</p>
                  <div class="segmented-control" role="group" aria-label="Single cover">
                    <button type="button" class="segment ${!singleCoverEnabled ? 'active' : ''}" data-single-cover="off">Off</button>
                    <button type="button" class="segment ${singleCoverEnabled ? 'active' : ''}" data-single-cover="on">On</button>
                  </div>
                </div>
                <div class="subpanel-divider"></div>
                <div class="stack-form">
                  <p class="muted"><strong>Change suggestions</strong></p>
                  <p class="muted">Show a suggested change breakdown when overpaying, or go manual-only when Off.</p>
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

            <section class="settings-section">
              <h3>Show bills and coins</h3>
              <p class="muted">Divide denominations between bills and coins. When off, all denominations appear in a single list. Some denominations might not be categorised entirely correctly.</p>
              <div class="segmented-control" role="group" aria-label="Show bills and coins">
                <button type="button" class="segment ${!showBillsCoins ? 'active' : ''}" data-bills-coins-toggle="off">Off</button>
                <button type="button" class="segment ${showBillsCoins ? 'active' : ''}" data-bills-coins-toggle="on">On</button>
              </div>
            </section>

            <section class="settings-section">
              <h3>Show cents</h3>
              <p class="muted">When on, all currencies that use cents will always show .00. When off, .00 is hidden unless there are actual cents to display.</p>
              <div class="segmented-control" role="group" aria-label="Show cents">
                <button type="button" class="segment ${!showCents ? 'active' : ''}" data-show-cents-toggle="off">Off</button>
                <button type="button" class="segment ${showCents ? 'active' : ''}" data-show-cents-toggle="on">On</button>
              </div>
            </section>

            <section class="settings-section">
              <h3>Security</h3>
              <p class="muted">Lock the app with biometric authentication (fingerprint or face recognition).</p>
              <div class="segmented-control" role="group" aria-label="Biometric lock">
                <button type="button" class="segment ${!app.state.settings.biometric_lock ? 'active' : ''}" data-biometric-toggle="off">Off</button>
                <button type="button" class="segment ${app.state.settings.biometric_lock ? 'active' : ''}" data-biometric-toggle="on">On</button>
              </div>
            </section>

            <section class="settings-section">
              <h3>Appearance</h3>
              <p class="muted">Match the app theme to the website.</p>
              <div class="segmented-control appearance-control" role="group" aria-label="Theme">
                <button type="button" class="segment ${app.state.settings.appearance === 'light' ? 'active' : ''}" data-appearance="light">Light</button>
                <button type="button" class="segment ${app.state.settings.appearance === 'dark' ? 'active' : ''}" data-appearance="dark">Dark</button>
              </div>
            </section>

            <section class="settings-section">
              <h3>Export</h3>
              <div class="inline-actions">
                <button type="button" id="export-json" class="btn-secondary-soft">Export JSON</button>
                <button type="button" id="export-pdf" class="btn-secondary-soft">Export PDF</button>
              </div>
            </section>

            <section class="settings-section">
              <h3>Delete all data</h3>
              <p>This removes wallets, denominations, transactions, and settings.</p>
              <button class="btn-danger-soft" type="button" id="delete-all-data">Delete all data</button>
            </section>

            <section class="settings-section">
              <h3>Sign up</h3>
              <p>Optional. Email only. Stored locally now; server sync can be added later.</p>
              <form id="launch-updates-form" class="stack-form">
                <label>Email <input type="email" id="launch-email" required /></label>
                <label class="check-row"><input type="checkbox" id="launch-consent" /> Email me launch updates</label>
                <button type="submit" class="btn-secondary-soft">Sign up</button>
              </form>
              ${app.launchSignupMessage ? `<p>${app.launchSignupMessage}</p>` : ''}
            </section>
            <p class="muted app-version">Version ${APP_VERSION}</p>
          </section>
        </div>
      `;

      const newModal = el.querySelector('.settings-modal');
      if (newModal && savedScroll) newModal.scrollTop = savedScroll;

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

      el.querySelectorAll('button[data-biometric-toggle]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const next = btn.dataset.biometricToggle === 'on';
          if (app.state.settings.biometric_lock === next) return;
          
          if (next) {
            // Enable biometric lock - first verify biometrics are available
            if (!await checkBiometricAvailability()) {
              await modalAlert('Biometric authentication is not available on this device.');
              return;
            }
            
            // Test biometric authentication before enabling
            const success = await authenticateWithBiometrics('Test authentication to enable biometric lock');
            if (!success) {
              await modalAlert('Biometric authentication failed. Biometric lock not enabled.');
              return;
            }
          }
          
          app.state.settings.biometric_lock = next;
          saveState();
          renderSettings();
        });
      });

      el.querySelectorAll('button[data-single-cover]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.singleCover === 'on';
          if (app.state.settings.single_cover === next) return;
          app.state.settings.single_cover = next;
          saveState();
          renderSettings();
        });
      });

      el.querySelectorAll('button[data-bills-coins-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.billsCoinsToggle === 'on';
          if (app.state.settings.show_bills_coins === next) return;
          app.state.settings.show_bills_coins = next;
          saveState();
          renderSettings();
          render();
        });
      });

      el.querySelectorAll('button[data-show-cents-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.showCentsToggle === 'on';
          if (app.state.settings.show_cents === next) return;
          app.state.settings.show_cents = next;
          saveState();
          renderSettings();
          render();
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
          incomingEntryMode: null,
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
      btn.addEventListener('click', async () => {
        if (isAppGated() && btn.dataset.tab !== app.activeTab) {
          await modalAlert('Finish or cancel Edit denominations before navigating.');
          return;
        }
        previousTab = app.activeTab;
        app.activeTab = btn.dataset.tab;
        setupTabs();
        if (app.activeTab === 'cash') renderCashOnHand();
        if (app.activeTab === 'pay') renderPay();
        if (app.activeTab === 'transactions') renderTransactions();
        if (app.activeTab === 'settings') renderSettings();
      });
    });

    document.querySelectorAll('.bottom-nav-link').forEach((link) => {
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        if (isAppGated() && link.dataset.tab !== app.activeTab) {
          await modalAlert('Finish or cancel Edit denominations before navigating.');
          return;
        }
        app.activeTab = link.dataset.tab;
        setupTabs();
        if (app.activeTab === 'cash') renderCashOnHand();
        if (app.activeTab === 'pay') renderPay();
        if (app.activeTab === 'transactions') renderTransactions();
        if (app.activeTab === 'settings') renderSettings();
      });
    });

    const settingsBtn = document.getElementById('open-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', async () => {
        if (isAppGated()) {
          await modalAlert('Finish or cancel Edit denominations before navigating.');
          return;
        }
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

    // Biometric authentication functions
    async function checkBiometricAvailability() {
      if (!navigator.credentials) return false;
      
      try {
        const available = await navigator.credentials?.preventSilentAccess?.();
        return true;
      } catch (error) {
        // Check if WebAuthn is available
        return !!(window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
      }
    }

    async function authenticateWithBiometrics(reason = 'Authenticate to access the app') {
      if (!navigator.credentials) return false;
      
      try {
        // Create a simple biometric authentication request
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            allowCredentials: [],
            userVerification: 'required',
            timeout: 60000
          }
        });
        
        return credential !== null;
      } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
      }
    }

    async function lockApp() {
      app.isLocked = true;
      app.lockedAt = Date.now();
      renderLockScreen();
    }

    async function unlockApp() {
      if (!app.state.settings.biometric_lock) {
        app.isLocked = false;
        app.lockedAt = null;
        render();
        return;
      }
      
      const success = await authenticateWithBiometrics('Authenticate to unlock the app');
      if (success) {
        app.isLocked = false;
        app.lockedAt = null;
        render();
      } else {
        await modalAlert('Authentication failed. Please try again.');
      }
    }

    function renderLockScreen() {
      const el = document.getElementById('app-modal-root');
      if (!el) return;
      
      el.innerHTML = `
        <div class="modal-backdrop lock-backdrop">
          <section class="lock-screen" role="dialog" aria-modal="true" aria-label="App Locked">
            <div class="lock-content">
              <img src="/kontana-logo.svg" alt="Kontana" class="lock-logo" />
              <h2>App Locked</h2>
              <p class="muted">Use biometric authentication to unlock</p>
              <button type="button" class="btn-primary" id="unlock-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="margin-right: 8px;">
                  <path d="M12 17a2 2 0 0 0 2-2c0-1.11-.89-2-2-2a2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/>
                </svg>
                Unlock with Biometrics
              </button>
            </div>
          </section>
        </div>
      `;
      
      document.getElementById('unlock-btn').addEventListener('click', unlockApp);
    }

    // Check if app should be locked on startup
    async function checkAppLockStatus() {
      if (app.state.settings.biometric_lock && !app.isLocked) {
        // Auto-lock if app was closed and reopened
        const lastActivity = localStorage.getItem('kontana_last_activity');
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          const AUTO_LOCK_MINUTES = 5;
          if (timeSinceLastActivity > AUTO_LOCK_MINUTES * 60 * 1000) {
            await lockApp();
          }
        }
      }
    }

    // Update last activity timestamp
    function updateLastActivity() {
      localStorage.setItem('kontana_last_activity', Date.now().toString());
    }

    // Add activity tracking
    document.addEventListener('click', updateLastActivity);
    document.addEventListener('keydown', updateLastActivity);
    document.addEventListener('touchstart', updateLastActivity);

    // Initialize lock status
    checkAppLockStatus();

    // Initialize the app when DOM is ready
    console.log('Kontana app.js loaded, DOM state:', document.readyState);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, initializing app');
        render();
      });
    } else {
      console.log('DOM already loaded, initializing app immediately');
      render();
    }
