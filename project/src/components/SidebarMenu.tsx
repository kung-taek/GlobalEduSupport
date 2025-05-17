import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../hooks/useAuth';

interface MenuItem {
    id: string;
    name: string;
}

interface SidebarMenuProps {
    onCategorySelect: (category: string) => void;
    isMobile: boolean;
    isOpen: boolean;
    dragY: number;
    setIsOpen: (open: boolean) => void;
}

const SidebarContainer = styled.div<{ $isMobile: boolean; $isOpen: boolean; $dragY: number }>`
    width: 250px;
    height: ${({ $isMobile }) => ($isMobile ? 'auto' : '100vh')};
    max-height: 100vh;
    background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 500;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: ${({ $isOpen, $dragY }) => ($isOpen ? `translateX(0) translateY(${$dragY}px)` : 'translateX(-100%)')};

    @media (max-width: 768px) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        background: #2d3436;
    }
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 40px 0 0 0;
    width: 100%;
    text-align: center;
`;

const MenuItemStyled = styled.li`
    padding: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.2s;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

const AuthSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const { user, login, logout, loading } = useAuth();
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
                    로그인
                </button>
            ) : (
                <>
                    {!isMobile && user?.username && (
                        <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#333' }}>{user.username}님</div>
                    )}
                    <button
                        onClick={logout}
                        style={{
                            width: isMobile ? '90%' : '100%',
                            padding: '12px',
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            background: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        로그아웃
                    </button>
                </>
            )}
        </div>
    );
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onCategorySelect, isMobile, isOpen, dragY, setIsOpen }) => {
    const { texts } = useTranslation();
    const pageTexts = texts['main'] || {};
    const kCultureTexts = texts['kculture'] || {};

    const menuItems: MenuItem[] = [
        { id: 'MT1', name: pageTexts['find_way'] || '길 찾기' },
        { id: 'TR1', name: kCultureTexts['transportation'] || '교통수단' },
        { id: 'ET1', name: kCultureTexts['dining_etiquette'] || '식사 예절' },
        { id: 'FD1', name: kCultureTexts['korean_food'] || '한국의 음식' },
        { id: 'TRC1', name: kCultureTexts['traditional_culture'] || '전통 문화' },
    ];

    const kCultureTitle = pageTexts['k_culture'] || 'K-문화';

    return (
        <SidebarContainer $isMobile={isMobile} $isOpen={isOpen} $dragY={dragY}>
            <MenuList>
                {menuItems.map((item, idx) => {
                    if (idx === 1) {
                        return (
                            <React.Fragment key="k-culture-header">
                                <div style={{ borderTop: '2px solid #e0e0e0', margin: '16px 0' }} />
                                <MenuItemStyled
                                    as="li"
                                    style={{ cursor: 'default', color: '#bbb', fontWeight: 'bold', background: 'none' }}
                                >
                                    {kCultureTitle}
                                </MenuItemStyled>
                                <MenuItemStyled key={item.id} onClick={() => onCategorySelect(item.id)}>
                                    {item.name}
                                </MenuItemStyled>
                            </React.Fragment>
                        );
                    }
                    return (
                        <MenuItemStyled key={item.id} onClick={() => onCategorySelect(item.id)}>
                            {item.name}
                        </MenuItemStyled>
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
