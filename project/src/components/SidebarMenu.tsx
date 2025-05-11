import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';
import { LanguageSelector } from '../components/LanguageSelector';

interface MenuItem {
    id: string;
    name: string;
}

interface SidebarMenuProps {
    onCategorySelect: (category: string) => void;
}

const SidebarContainer = styled.div`
    width: 250px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
`;

const MenuList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const MenuItemStyled = styled.li`
    padding: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onCategorySelect }) => {
    const { texts } = useTranslation();
    const pageTexts = texts['main'] || {};

    const menuItems: MenuItem[] = [
        { id: 'MT1', name: pageTexts['find_way'] || '길 찾기' },
        { id: 'CT1', name: pageTexts['k_culture'] || '한국 문화' },
    ];

    return (
        <SidebarContainer>
            <MenuList>
                {menuItems.map((item) => (
                    <MenuItemStyled key={item.id} onClick={() => onCategorySelect(item.id)}>
                        {item.name}
                    </MenuItemStyled>
                ))}
            </MenuList>
            <LanguageSelector />
        </SidebarContainer>
    );
};

export default SidebarMenu;
