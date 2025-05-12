import React, { useRef, useState } from 'react';
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
    background-color: #ffffff;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 300;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: ${({ $isMobile, $isOpen }) => (!$isMobile ? ($isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none')};

    @media (max-width: 768px) {
        width: 100vw;
        height: auto;
        max-height: 80vh;
        transform: ${({ $isOpen, $dragY }) =>
            $isOpen ? `translateY(${$dragY}px)` : `translateY(calc(-100% + 40px + ${$dragY}px))`};
        border-radius: 0 0 16px 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        position: fixed;
        left: 0;
        top: 0;
        bottom: auto;
    }
`;

const DragHandle = styled.div`
    width: 100%;
    height: 40px;
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 301;
    background: transparent;

    &::after {
        content: '';
        width: 40px;
        height: 4px;
        background: #ddd;
        border-radius: 2px;
    }

    &:active {
        cursor: grabbing;
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
    transition: background-color 0.2s;
    justify-content: center;

    &:hover {
        background-color: #f0f0f0;
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
                    {!isMobile && (
                        <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#333' }}>{user.username}</div>
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
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;
        if (isOpen && diff < -30) {
            setIsOpen(false);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const menuItems: MenuItem[] = [
        { id: 'MT1', name: pageTexts['find_way'] || '길 찾기' },
        { id: 'CT1', name: pageTexts['k_culture'] || '한국 문화' },
    ];

    return (
        <SidebarContainer $isMobile={isMobile} $isOpen={isOpen} $dragY={dragY}>
            {isMobile && (
                <DragHandle onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} />
            )}
            <MenuList>
                {menuItems.map((item) => (
                    <MenuItemStyled key={item.id} onClick={() => onCategorySelect(item.id)}>
                        {item.name}
                    </MenuItemStyled>
                ))}
            </MenuList>
            {isMobile ? <AuthSection isMobile={isMobile} /> : null}
            <LanguageSelector />
            {!isMobile ? <AuthSection isMobile={isMobile} /> : null}
        </SidebarContainer>
    );
};

export default SidebarMenu;
