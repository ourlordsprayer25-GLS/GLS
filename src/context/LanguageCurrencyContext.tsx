import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Language, CurrencyConfig, CountryInfo } from '../types/localization';
import { SUPPORTED_CURRENCIES, SUPPORTED_COUNTRIES, detectCountryAndCurrency, detectDeviceLanguage, getDeviceSystemLanguage } from '../data/currencies';
import { TRANSLATIONS, TranslationKey } from '../data/translations';

interface LanguageCurrencyContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  resetToDeviceLanguage: () => void;
  currency: CurrencyConfig;
  setCurrency: (currencyCode: string) => void;
  country: CountryInfo;
  setCountry: (countryCode: string) => void;
  allCurrencies: CurrencyConfig[];
  allCountries: CountryInfo[];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
  isAutoDetected: boolean;
  isLanguageAutoDetected: boolean;
  deviceLanguage: Language;
  isSelectorModalOpen: boolean;
  setIsSelectorModalOpen: (open: boolean) => void;
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | null>(null);

export const LanguageCurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [isLanguageAutoDetected, setIsLanguageAutoDetected] = useState(() => {
    try {
      return localStorage.getItem('gladyns_language_manual') !== 'true';
    } catch {
      return true;
    }
  });
  const [deviceLanguage, setDeviceLanguage] = useState<Language>(() => getDeviceSystemLanguage());
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  // Initialize Language
  const [language, setLanguageState] = useState<Language>(() => {
    return detectDeviceLanguage();
  });

  // Initialize Country & Currency
  const [currencyCode, setCurrencyCodeState] = useState<string>(() => {
    const detected = detectCountryAndCurrency();
    return detected.currencyCode;
  });

  const [countryCode, setCountryCodeState] = useState<string>(() => {
    const detected = detectCountryAndCurrency();
    return detected.countryCode;
  });

  // Listen for device language changes in OS/browser
  useEffect(() => {
    const updateFromDevice = () => {
      const currentDeviceLang = getDeviceSystemLanguage();
      setDeviceLanguage(currentDeviceLang);
      try {
        const isManual = localStorage.getItem('gladyns_language_manual');
        if (isManual !== 'true') {
          setLanguageState(currentDeviceLang);
          setIsLanguageAutoDetected(true);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('languagechange', updateFromDevice);
    return () => window.removeEventListener('languagechange', updateFromDevice);
  }, []);

  // Check if user previously manually set these
  useEffect(() => {
    try {
      const isManual = localStorage.getItem('gladyns_language_manual');
      const savedLang = localStorage.getItem('gladyns_language');
      const savedCurr = localStorage.getItem('gladyns_currency');
      const savedCountry = localStorage.getItem('gladyns_country');
      if (isManual === 'true') {
        setIsLanguageAutoDetected(false);
      }
      if (savedLang || savedCurr || savedCountry) {
        setIsAutoDetected(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setIsAutoDetected(false);
    setIsLanguageAutoDetected(false);
    try {
      localStorage.setItem('gladyns_language', lang);
      localStorage.setItem('gladyns_language_manual', 'true');
    } catch {
      // ignore
    }
  };

  const resetToDeviceLanguage = () => {
    try {
      localStorage.removeItem('gladyns_language_manual');
      localStorage.removeItem('gladyns_language');
    } catch {
      // ignore
    }
    const detected = getDeviceSystemLanguage();
    setLanguageState(detected);
    setDeviceLanguage(detected);
    setIsLanguageAutoDetected(true);
  };

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCodeState(code);
      setIsAutoDetected(false);
      try {
        localStorage.setItem('gladyns_currency', code);
      } catch {
        // ignore
      }
    }
  };

  const setCountry = (code: string) => {
    const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === code);
    if (countryObj) {
      setCountryCodeState(code);
      setCurrencyCodeState(countryObj.defaultCurrency);
      setIsAutoDetected(false);
      try {
        localStorage.setItem('gladyns_country', code);
        localStorage.setItem('gladyns_currency', countryObj.defaultCurrency);
      } catch {
        // ignore
      }
    }
  };

  const activeCurrency = useMemo(() => {
    return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES['XOF'];
  }, [currencyCode]);

  const activeCountry = useMemo(() => {
    return SUPPORTED_COUNTRIES.find((c) => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  }, [countryCode]);

  const allCurrencies = useMemo(() => Object.values(SUPPORTED_CURRENCIES), []);
  const allCountries = useMemo(() => SUPPORTED_COUNTRIES, []);

  // Translation Function
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    let text = (langDict[key] as string) || (TRANSLATIONS['en'][key] as string) || (key as string);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  // Price Conversion & Formatting
  const convertPrice = (priceInUSD: number): number => {
    if (typeof priceInUSD !== 'number' || isNaN(priceInUSD)) return 0;
    return priceInUSD * activeCurrency.rate;
  };

  const formatPrice = (priceInUSD: number): string => {
    if (typeof priceInUSD !== 'number' || isNaN(priceInUSD)) return `${activeCurrency.symbol}0`;
    const converted = convertPrice(priceInUSD);

    try {
      const formattedNum = new Intl.NumberFormat(
        language === 'fr' ? 'fr-FR' : activeCurrency.localeString || 'en-US',
        {
          minimumFractionDigits: activeCurrency.decimals,
          maximumFractionDigits: activeCurrency.decimals,
        }
      ).format(converted);

      if (activeCurrency.formatPosition === 'suffix') {
        return `${formattedNum} ${activeCurrency.symbol}`;
      } else {
        return `${activeCurrency.symbol}${formattedNum}`;
      }
    } catch {
      return `${activeCurrency.symbol}${converted.toFixed(activeCurrency.decimals)}`;
    }
  };

  return (
    <LanguageCurrencyContext.Provider
      value={{
        language,
        setLanguage,
        resetToDeviceLanguage,
        currency: activeCurrency,
        setCurrency,
        country: activeCountry,
        setCountry,
        allCurrencies,
        allCountries,
        t,
        formatPrice,
        convertPrice,
        isAutoDetected,
        isLanguageAutoDetected,
        deviceLanguage,
        isSelectorModalOpen,
        setIsSelectorModalOpen,
      }}
    >
      {children}
    </LanguageCurrencyContext.Provider>
  );
};

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) {
    throw new Error('useLanguageCurrency must be used within a LanguageCurrencyProvider');
  }
  return context;
};
