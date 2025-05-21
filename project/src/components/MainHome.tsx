import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(90deg, #181c20 0%, #23272f 100%);
    color: #fff;
    text-align: center;
    z-index: 5000;
    letter-spacing: 1.5px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
`;

const MainWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    min-height: 100vh;
    padding-top: 64px;
    background: #f5f6fa;
    @media (min-width: 601px) {
        background: url('/globalmain.jpg') center/cover no-repeat;
    }
    gap: 32px;
`;

const CardSection = styled.section`
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(44, 62, 80, 0.1);
    padding: 36px 32px 32px 32px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 320px;
    max-width: 420px;
    width: 90vw;
    gap: 24px;
    @media (max-width: 600px) {
        padding: 24px 8px 20px 8px;
        min-width: unset;
        max-width: 98vw;
    }
`;

const AuthCardSection = styled(CardSection)`
    border: 1px solid #000;
    background: rgba(0, 0, 0, 0.99);
    box-shadow: 0 4px 24px rgba(44, 62, 80, 0.08);
`;

const AuthSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const UserName = styled.div`
    font-weight: bold;
    color: #4fc3f7;
    font-size: 2rem;
    margin-bottom: 4px;
`;

const AuthButton = styled.button`
    width: 180px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: linear-gradient(90deg, #e3f2fd 0%, #fff 100%);
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 4px;
    font-size: 1rem;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
    &:hover {
        background: #e3f2fd;
        box-shadow: 0 4px 16px rgba(33, 150, 243, 0.13);
    }
`;

const MenuGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(3, auto);
    gap: 28px;
    justify-content: center;
    align-items: center;
    width: 400px;
    margin-top: 8px;
    @media (max-width: 600px) {
        width: 98vw;
        gap: 18px;
    }
`;

const MenuButton = styled.button`
    min-width: 180px;
    min-height: 110px;
    width: auto;
    background: linear-gradient(135deg, #23272f 0%, #181c20 100%);
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    border: none;
    border-radius: 18px;
    box-shadow: 0 2px 16px rgba(44, 62, 80, 0.1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 28px 8px 22px 8px;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    &:hover {
        background: linear-gradient(135deg, #181c20 0%, #23272f 100%);
        transform: translateY(-2px) scale(1.04);
        box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
    }
`;

const MENU_STRUCTURE = [
    { key: 'find_way', labelKey: 'find_way', defaultLabel: '길찾기', path: '/find-way' },
    { key: 'transportation', labelKey: 'transportation', defaultLabel: '교통수단', path: '/transportation' },
    { key: 'korean_food', labelKey: 'korean_food', defaultLabel: '한국 음식', path: '/korean-food' },
    { key: 'dining_etiquette', labelKey: 'dining_etiquette', defaultLabel: '식사 예절', path: '/dining-etiquette' },
    { key: 'dialect', labelKey: 'dialect', defaultLabel: '사투리', path: '/dialect' },
    { key: 'emergency_number', labelKey: 'emergency_number', defaultLabel: '긴급 전화번호', path: '/emergency-number' },
    { key: 'community', labelKey: 'community', defaultLabel: '커뮤니티', path: '/community' },
];

const MainHome: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const { user, login, logout, loading } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <Header>Global Edu Support</Header>
            <MainWrapper>
                <AuthCardSection>
                    <AuthSection>
                        {user && user.username && <UserName>{user.username}</UserName>}
                        {!user && <AuthButton onClick={login}>{mainTexts['googleLogin'] || '로그인'}</AuthButton>}
                    </AuthSection>
                </AuthCardSection>
                <CardSection>
                    <MenuGrid>
                        {MENU_STRUCTURE.map((item) => {
                            const rawLabel = mainTexts[item.labelKey];
                            const label =
                                typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim() : item.defaultLabel;
                            return (
                                <MenuButton key={item.key} onClick={() => navigate(item.path)}>
                                    {label}
                                </MenuButton>
                            );
                        })}
                    </MenuGrid>
                </CardSection>
            </MainWrapper>
        </>
    );
};

export default MainHome;
