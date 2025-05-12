// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllUITexts, requestTranslateAll } from '../services/api';

const LANGUAGE_STORAGE_KEY = 'globalhelper_lang';

interface TranslationContextType {
    texts: Record<string, Record<string, string>>; // page별로 저장
    currentLang: string;
    setLanguage: (lang: string) => void;
    isLoading: boolean;
    error: string | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getInitialLang = () => localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ko';
    const [currentLang, setCurrentLang] = useState(getInitialLang());
    const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setLanguage = async (lang: string) => {
        try {
            setCurrentLang(lang);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            setIsLoading(true);
            setError(null);

            // 번역이 DB에 없으면 번역 요청
            await requestTranslateAll(lang);
            // 전체 번역 다시 불러오기
            const allTexts = await fetchAllUITexts(lang);
            setTexts(allTexts);
        } catch (err) {
            console.error('Language change failed:', err);
            setError('언어 변경 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeTranslations = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await requestTranslateAll(currentLang);
                const allTexts = await fetchAllUITexts(currentLang);
                if (isMounted) {
                    setTexts(allTexts);
                }
            } catch (err) {
                console.error('Translation initialization failed:', err);
                if (isMounted) {
                    setError('번역을 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeTranslations();

        return () => {
            isMounted = false;
        };
    }, [currentLang]);

    return (
        <TranslationContext.Provider value={{ texts, currentLang, setLanguage, isLoading, error }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) throw new Error('useTranslation must be used within TranslationProvider');
    return context;
};
