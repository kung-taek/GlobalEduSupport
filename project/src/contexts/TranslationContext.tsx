// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllUITexts, requestTranslateAll } from '../services/api';

const LANGUAGE_STORAGE_KEY = 'globalhelper_lang';

interface TranslationContextType {
    texts: Record<string, Record<string, string>>; // page별로 저장
    currentLang: string;
    setLanguage: (lang: string) => void;
    isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getInitialLang = () => localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ko';
    const [currentLang, setCurrentLang] = useState(getInitialLang());
    const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
    const [isLoading, setIsLoading] = useState(true);

    const setLanguage = async (lang: string) => {
        setCurrentLang(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        setIsLoading(true);
        // 번역이 DB에 없으면 번역 요청
        await requestTranslateAll(lang);
        // 전체 번역 다시 불러오기
        const allTexts = await fetchAllUITexts(lang);
        setTexts(allTexts);
        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await requestTranslateAll(currentLang);
            const allTexts = await fetchAllUITexts(currentLang);
            setTexts(allTexts);
            setIsLoading(false);
        })();
    }, [currentLang]);

    return (
        <TranslationContext.Provider value={{ texts, currentLang, setLanguage, isLoading }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) throw new Error('useTranslation must be used within TranslationProvider');
    return context;
};
