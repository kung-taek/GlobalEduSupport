import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const MENU_STRUCTURE = [
    {
        key: 'location_category',
        labelKey: 'location_category',
        defaultLabel: '위치',
        children: [
            { key: 'find_way', labelKey: 'find_way', defaultLabel: '길찾기' },
            { key: 'transportation', labelKey: 'transportation', defaultLabel: '교통수단' },
        ],
    },
    {
        key: 'food_category',
        labelKey: 'food_category',
        defaultLabel: '음식',
        children: [
            { key: 'korean_food', labelKey: 'korean_food', defaultLabel: '한국 음식' },
            { key: 'dining_etiquette', labelKey: 'dining_etiquette', defaultLabel: '식사 예절' },
        ],
    },
    {
        key: 'language_category',
        labelKey: 'language_category',
        defaultLabel: '언어',
        children: [{ key: 'dialect', labelKey: 'dialect', defaultLabel: '사투리' }],
    },
    {
        key: 'etc_category',
        labelKey: 'etc_category',
        defaultLabel: '기타',
        children: [{ key: 'emergency_number', labelKey: 'emergency_number', defaultLabel: '긴급 전화번호' }],
    },
];

interface SidebarMenuProps {
    onCategorySelect: (category: string) => void;
    isMobile: boolean;
    isOpen: boolean;
    dragY: number;
    setIsOpen: (open: boolean) => void;
}

const SidebarContainer = styled.div<{ $isMobile: boolean; $isOpen: boolean; $dragY: number }>`
    width: 250px;
    height: 100vh;
    max-height: 100vh;
    background: linear-gradient(135deg, #181c20 0%, #23272f 100%);
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 50001;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: ${({ $isOpen, $dragY }) => ($isOpen ? `translateX(0) translateY(${$dragY}px)` : 'translateX(-100%)')};
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #444 #23272f;

    /* 스크롤바를 사이드바 바깥쪽에 아주 얇게 표시 */
    &::-webkit-scrollbar {
        width: 5px;
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 8px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }

    @media (max-width: 768px) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        background: #181c20;
    }
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    text-align: center;
`;

const MenuItemStyled = styled.li<{ $category?: boolean }>`
    padding: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.2s;
    justify-content: center;
    color: ${({ $category }) => ($category ? '#fff' : 'white')};
    font-weight: ${({ $category }) => ($category ? 900 : 700)};
    font-size: ${({ $category }) => ($category ? '22px' : '20px')};

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

const AuthSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const { user, login, logout, loading } = useAuth();
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    if (loading) return null;
    return (
        <div
            style={{
                width: '100%',
                marginTop: 'auto',
                paddingTop: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {!user ? (
                <button
                    onClick={login}
                    style={{
                        width: isMobile ? '90%' : '100%',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        background: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: 8,
                    }}
                >
                    {mainTexts['googleLogin'] || '로그인'}
                </button>
            ) : isMobile ? (
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    {user?.username && (
                        <div
                            style={{
                                width: '50%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#4fc3f7',
                                letterSpacing: 0.5,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {user.username}
                        </div>
                    )}
                    <button
                        onClick={logout}
                        style={{
                            width: '50%',
                            padding: '12px',
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            background: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        {mainTexts['googleLogout'] || '로그아웃'}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: 8 }}>
                    {user?.username && (
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#4fc3f7',
                                letterSpacing: 0.5,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 40,
                            }}
                        >
                            {user.username}
                        </div>
                    )}
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            background: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        {mainTexts['googleLogout'] || '로그아웃'}
                    </button>
                </div>
            )}
        </div>
    );
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onCategorySelect, isMobile, isOpen, dragY, setIsOpen }) => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        location_category: true,
        food_category: false,
        language_category: false,
        etc_category: false,
    });
    const navigate = useNavigate();

    const handleToggle = (key: string) => {
        setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SidebarContainer $isMobile={isMobile} $isOpen={isOpen} $dragY={dragY}>
            <button
                onClick={() => navigate('/')}
                style={{
                    width: '100%',
                    padding: '16px 0',
                    marginBottom: 24,
                    background: 'linear-gradient(90deg,rgb(0, 0, 0) 0%,rgb(76, 76, 76) 100%)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 17,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                    letterSpacing: 1.5,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                }}
            >
                Global Edu Support
            </button>
            <MenuList>
                {MENU_STRUCTURE.map((cat) => {
                    const rawCatLabel = mainTexts[cat.labelKey];
                    const catLabel =
                        typeof rawCatLabel === 'string'
                            ? rawCatLabel.trim()
                                ? rawCatLabel.trim()
                                : cat.defaultLabel
                            : cat.defaultLabel;
                    return (
                        <React.Fragment key={cat.key}>
                            <MenuItemStyled as="li" $category onClick={() => handleToggle(cat.key)}>
                                {catLabel}
                                <span style={{ float: 'right', fontSize: 14 }}>
                                    {openCategories[cat.key] ? '▲' : '▼'}
                                </span>
                            </MenuItemStyled>
                            {openCategories[cat.key] &&
                                cat.children.map((item) => {
                                    const rawItemLabel = mainTexts[item.labelKey];
                                    const itemLabel =
                                        typeof rawItemLabel === 'string'
                                            ? rawItemLabel.trim()
                                                ? rawItemLabel.trim()
                                                : item.defaultLabel
                                            : item.defaultLabel;
                                    return (
                                        <MenuItemStyled
                                            key={item.key}
                                            onClick={() => onCategorySelect(item.key)}
                                            style={{ paddingLeft: 24, fontWeight: 'normal', fontSize: 16 }}
                                        >
                                            {itemLabel}
                                        </MenuItemStyled>
                                    );
                                })}
                        </React.Fragment>
                    );
                })}
            </MenuList>
            {isMobile ? <AuthSection isMobile={isMobile} /> : null}
            <LanguageSelector />
            {!isMobile ? <AuthSection isMobile={isMobile} /> : null}
        </SidebarContainer>
    );
};

export default SidebarMenu;
