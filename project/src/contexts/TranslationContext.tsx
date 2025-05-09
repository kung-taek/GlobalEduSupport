// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UIText, Language } from '../types/translation';
import { fetchUITexts } from '../services/api';

interface TranslationContextType {
  texts: Record<string, string>;
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode, pageName: string }> = ({ children, pageName }) => {
    const [texts, setTexts] = useState<Record<string, string>>({});
    const [currentLang, setCurrentLang] = useState<Language>('ko');
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const loadTexts = async () => {
        console.log('Loading texts for page:', pageName); // 디버깅용 로그 
        setIsLoading(true);
        try {
          const data = await fetchUITexts(pageName, currentLang);
          const textMap = Array.isArray(data)
            ? data.reduce((acc: Record<string, string>, text: UIText) => {
                acc[text.element_key] = text[`translated_text_${currentLang}`] || text.original_text_ko;
                return acc;
              }, {})
            : {};
          console.log('Processed text map:', textMap); // 디버깅용 로그
          setTexts(textMap);
        } catch (error) {
          console.error('Failed to load translations:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadTexts();
    }, [pageName, currentLang]);
  
    return (
      <TranslationContext.Provider value={{ texts, currentLang, setLanguage: setCurrentLang, isLoading }}>
        {children}
      </TranslationContext.Provider>
    );
  };

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};