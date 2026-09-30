export type Language = 'en' | 'fr';

export interface CurrencyConfig {
  code: string; // 'USD', 'EUR', 'GBP', 'CAD', 'NGN', 'XOF', 'AUD', 'JPY', 'CHF'
  symbol: string; // '$', '€', '£', 'CA$', '₦', 'CFA', 'A$', '¥', 'CHF'
  name: string; // 'US Dollar', 'Euro', 'British Pound', etc.
  rate: number; // Conversion rate relative to 1 USD
  flag: string; // Emoji flag or country code e.g. '🇺🇸', '🇪🇺', '🇬🇧', '🇨🇦', '🇳🇬', '🇨🇮', '🇦🇺', '🇯🇵', '🇨🇭'
  decimals: number; // 2 for most, 0 for JPY, XOF, NGN
  formatPosition: 'prefix' | 'suffix'; // e.g. '$100' or '100 €'
  localeString: string; // 'en-US', 'fr-FR', 'en-GB', etc.
}

export interface CountryInfo {
  code: string; // 'US', 'FR', 'CA', 'GB', 'NG', 'CI', 'SN', 'DE', 'AU', 'JP', 'CH', 'BE', 'CH'
  name: string;
  nameFr: string;
  flag: string;
  defaultCurrency: string;
  defaultLanguage: Language;
}
