// src/components/LanguageSelector.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';

const LanguageSelectorContainer = styled.div`
    margin-top: 20px;
    padding: 0 15px;
    position: relative;
`;

const SelectButton = styled.button`
    width: 100%;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    margin-bottom: 4px;

    &:hover {
        background: #f8f9fa;
    }
`;

const DropdownList = styled.div<{ $isOpen: boolean }>`
    position: absolute;
    left: 15px;
    right: 15px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: ${(props) => (props.$isOpen ? 'block' : 'none')};
    z-index: 1000;
    max-width: 200px;
    margin: 0 auto;
    bottom: 60px;
`;

const LangOption = styled.button<{ $active: boolean }>`
    width: 100%;
    padding: 12px 15px;
    border: none;
    background: ${(props) => (props.$active ? '#007bff' : 'white')};
    color: ${(props) => (props.$active ? 'white' : 'black')};
    cursor: pointer;
    text-align: left;
    font-weight: ${(props) => (props.$active ? 'bold' : 'normal')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        background: ${(props) => (props.$active ? '#0056b3' : '#f8f9fa')};
    }
`;

/*
ko: 한국어 (Korean)

en: English (영어)

ja: 日本語 (Japanese, 일본어)

vi: Tiếng Việt (Vietnamese, 베트남어)

mn: Монгол (Mongolian, 몽골어)

zh: 中文 (Chinese, 중국어)

ru: Русский (Russian, 러시아어)

fr: Français (French, 프랑스어)

es: Español (Spanish, 스페인어)

ar: العربية (Arabic, 아랍어)
*/

const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'mn', name: 'Монгол' },
    { code: 'zh', name: '中文' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
];

export const LanguageSelector: React.FC = () => {
    const { currentLang, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find((lang) => lang.code === currentLang);

    return (
        <LanguageSelectorContainer>
            <SelectButton onClick={() => setIsOpen(!isOpen)}>
                {currentLanguage?.name || 'Language'}
                <span>▼</span>
            </SelectButton>
            <DropdownList $isOpen={isOpen}>
                {languages.map((lang) => (
                    <LangOption
                        key={lang.code}
                        $active={currentLang === lang.code}
                        onClick={() => {
                            setLanguage(lang.code);
                            setIsOpen(false);
                        }}
                    >
                        {lang.name}
                    </LangOption>
                ))}
            </DropdownList>
        </LanguageSelectorContainer>
    );
};
