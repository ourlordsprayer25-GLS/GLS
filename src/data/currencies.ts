import { CurrencyConfig, CountryInfo, Language } from '../types/localization';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1.0,
    flag: '🇺🇸',
    decimals: 2,
    formatPosition: 'prefix',
    localeString: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.92,
    flag: '🇪🇺',
    decimals: 2,
    formatPosition: 'suffix',
    localeString: 'fr-FR',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.79,
    flag: '🇬🇧',
    decimals: 2,
    formatPosition: 'prefix',
    localeString: 'en-GB',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rate: 1.36,
    flag: '🇨🇦',
    decimals: 2,
    formatPosition: 'prefix',
    localeString: 'en-CA',
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    rate: 1550,
    flag: '🇳🇬',
    decimals: 0,
    formatPosition: 'prefix',
    localeString: 'en-NG',
  },
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA (UEMOA)',
    rate: 605,
    flag: '🇨🇮',
    decimals: 0,
    formatPosition: 'suffix',
    localeString: 'fr-CI',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rate: 1.52,
    flag: '🇦🇺',
    decimals: 2,
    formatPosition: 'prefix',
    localeString: 'en-AU',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rate: 155,
    flag: '🇯🇵',
    decimals: 0,
    formatPosition: 'prefix',
    localeString: 'ja-JP',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    rate: 0.90,
    flag: '🇨🇭',
    decimals: 2,
    formatPosition: 'suffix',
    localeString: 'fr-CH',
  },
};

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: 'US', name: 'United States', nameFr: 'États-Unis', flag: '🇺🇸', defaultCurrency: 'USD', defaultLanguage: 'en' },
  { code: 'FR', name: 'France', nameFr: 'France', flag: '🇫🇷', defaultCurrency: 'EUR', defaultLanguage: 'fr' },
  { code: 'CA', name: 'Canada', nameFr: 'Canada', flag: '🇨🇦', defaultCurrency: 'CAD', defaultLanguage: 'en' },
  { code: 'GB', name: 'United Kingdom', nameFr: 'Royaume-Uni', flag: '🇬🇧', defaultCurrency: 'GBP', defaultLanguage: 'en' },
  { code: 'NG', name: 'Nigeria', nameFr: 'Nigéria', flag: '🇳🇬', defaultCurrency: 'NGN', defaultLanguage: 'en' },
  { code: 'CI', name: 'Côte d\'Ivoire', nameFr: 'Côte d\'Ivoire', flag: '🇨🇮', defaultCurrency: 'XOF', defaultLanguage: 'fr' },
  { code: 'SN', name: 'Senegal', nameFr: 'Sénégal', flag: '🇸🇳', defaultCurrency: 'XOF', defaultLanguage: 'fr' },
  { code: 'CM', name: 'Cameroon', nameFr: 'Cameroun', flag: '🇨🇲', defaultCurrency: 'XOF', defaultLanguage: 'fr' },
  { code: 'BE', name: 'Belgium', nameFr: 'Belgique', flag: '🇧🇪', defaultCurrency: 'EUR', defaultLanguage: 'fr' },
  { code: 'CH', name: 'Switzerland', nameFr: 'Suisse', flag: '🇨🇭', defaultCurrency: 'CHF', defaultLanguage: 'fr' },
  { code: 'DE', name: 'Germany', nameFr: 'Allemagne', flag: '🇩🇪', defaultCurrency: 'EUR', defaultLanguage: 'en' },
  { code: 'AU', name: 'Australia', nameFr: 'Australie', flag: '🇦🇺', defaultCurrency: 'AUD', defaultLanguage: 'en' },
  { code: 'JP', name: 'Japan', nameFr: 'Japon', flag: '🇯🇵', defaultCurrency: 'JPY', defaultLanguage: 'en' },
];

/**
 * Auto-detects device language ('fr' or 'en')
 */
export function detectDeviceLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = localStorage.getItem('gladyns_language');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // ignore
  }

  try {
    const browserLanguages = navigator.languages || [navigator.language || 'en'];
    for (const lang of browserLanguages) {
      if (lang && lang.toLowerCase().startsWith('fr')) {
        return 'fr';
      }
    }
  } catch {
    // fallback
  }

  return 'en';
}

/**
 * Auto-detects country & currency based on timezone, locale, and browser settings
 */
export function detectCountryAndCurrency(): { countryCode: string; currencyCode: string; detectedLanguage: Language } {
  const detectedLanguage = detectDeviceLanguage();
  let countryCode = 'US';
  let currencyCode = 'USD';

  if (typeof window !== 'undefined') {
    // Check saved in local storage first
    try {
      const savedCountry = localStorage.getItem('gladyns_country');
      const savedCurrency = localStorage.getItem('gladyns_currency');
      if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
        return {
          countryCode: savedCountry || 'US',
          currencyCode: savedCurrency,
          detectedLanguage,
        };
      }
    } catch {
      // ignore
    }

    // Detect from timezone
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tz = timeZone.toLowerCase();

      if (tz.includes('paris') || tz.includes('monaco')) {
        countryCode = 'FR';
        currencyCode = 'EUR';
      } else if (tz.includes('lagos') || tz.includes('kano') || tz.includes('nigeria')) {
        countryCode = 'NG';
        currencyCode = 'NGN';
      } else if (tz.includes('london') || tz.includes('belfast')) {
        countryCode = 'GB';
        currencyCode = 'GBP';
      } else if (tz.includes('toronto') || tz.includes('montreal') || tz.includes('vancouver') || tz.includes('edmonton')) {
        countryCode = 'CA';
        currencyCode = 'CAD';
      } else if (tz.includes('abidjan') || tz.includes('dakar') || tz.includes('bamako') || tz.includes('ouagadougou') || tz.includes('lome') || tz.includes('cotonou')) {
        countryCode = 'CI';
        currencyCode = 'XOF';
      } else if (tz.includes('douala') || tz.includes('yaounde') || tz.includes('libreville') || tz.includes('brazzaville')) {
        countryCode = 'CM';
        currencyCode = 'XOF';
      } else if (tz.includes('berlin') || tz.includes('rome') || tz.includes('madrid') || tz.includes('amsterdam') || tz.includes('brussels') || tz.includes('vienna')) {
        countryCode = tz.includes('brussels') ? 'BE' : 'DE';
        currencyCode = 'EUR';
      } else if (tz.includes('zurich') || tz.includes('geneva')) {
        countryCode = 'CH';
        currencyCode = 'CHF';
      } else if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') || tz.includes('perth')) {
        countryCode = 'AU';
        currencyCode = 'AUD';
      } else if (tz.includes('tokyo')) {
        countryCode = 'JP';
        currencyCode = 'JPY';
      } else {
        // Fallback to locale tags
        const navLang = (navigator.language || '').toLowerCase();
        if (navLang.includes('-fr') || navLang === 'fr') {
          countryCode = 'FR';
          currencyCode = 'EUR';
        } else if (navLang.includes('-ca')) {
          countryCode = 'CA';
          currencyCode = 'CAD';
        } else if (navLang.includes('-gb')) {
          countryCode = 'GB';
          currencyCode = 'GBP';
        } else if (navLang.includes('-ng')) {
          countryCode = 'NG';
          currencyCode = 'NGN';
        } else if (navLang.includes('-au')) {
          countryCode = 'AU';
          currencyCode = 'AUD';
        }
      }
    } catch {
      // fallback
    }
  }

  return {
    countryCode,
    currencyCode,
    detectedLanguage,
  };
}
