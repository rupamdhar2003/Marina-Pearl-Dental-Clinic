import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const LOCALES = { en, ar };
const I18nCtx = createContext(null);

function getStored() {
    try { return localStorage.getItem('mp.locale'); } catch { return null; }
}

export function I18nProvider({ children }) {
    const [locale, setLocaleState] = useState(() => getStored() || 'en');

    const setLocale = useCallback((next) => {
        setLocaleState(next);
        try { localStorage.setItem('mp.locale', next); } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    }, [locale]);

    const t = useCallback((key, fallback) => {
        const bag = LOCALES[locale] || LOCALES.en;
        const val = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), bag);
        if (typeof val === 'string') return val;
        // Fallback chain: english → literal fallback → key
        const enVal = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), LOCALES.en);
        return (typeof enVal === 'string' ? enVal : undefined) ?? fallback ?? key;
    }, [locale]);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
    return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nCtx);
    if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
    return ctx;
}
