import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import KakaoMap from './components/KakaoMap';
import SidebarMenu from './components/SidebarMenu';
import PlaceInfoPanel from './components/PlaceInfoPanel';
import KCulturePageContent from './pages/KCulturePage';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { LanguageSelector } from './components/LanguageSelector';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';

interface Place {
    place_name: string;
    address_name: string;
    phone: string;
    category_group_name: string;
    distance: string;
}

interface LatLng {
    lat: number;
    lng: number;
}

const AppContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    position: relative;
`;

const MapContainer = styled.div`
    flex: 1;
    position: relative;
    height: 100vh;
    width: 100%;
`;

const SearchBoxWrapper = styled.div<{ $sidebar: boolean }>`
    position: absolute;
    top: 24px;
    left: 200px;
    width: calc(100vw - 250px - 300px);
    display: flex;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
    transition: left 0.2s;

    @media (max-width: 768px) {
        left: 0 !important;
        width: 100vw;
        top: 52px;
        justify-content: center;
        padding: 0 8px;
    }
`;

const SearchInput = styled.input`
    width: 400px;
    max-width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    pointer-events: auto;
`;

const MenuIcon = styled.div<{ $sidebar?: boolean }>`
    position: fixed;
    top: 16px;
    left: ${({ $sidebar }) => ($sidebar ? '266px' : '16px')};
    font-size: 32px;
    cursor: pointer;
    z-index: 400;
    background: #fff;
    border-radius: 8px;
    padding: 4px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    transition: left 0.2s;
    display: flex;
    flex-direction: column;
    gap: 4px;

    @media (max-width: 768px) {
        display: none;
    }
`;

const MenuBar = styled.span`
    display: block;
    width: 24px;
    height: 3px;
    background: #222;
    border-radius: 2px;
    transition: transform 0.2s;
`;

const MobileSidebarDragHandle = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 40px;
        z-index: 350;
        background: transparent;
        cursor: pointer;

        &::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 8px;
            transform: translateX(-50%);
            width: 40px;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
        }
    }
`;

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

const App: React.FC = () => {
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string>('');
    const [search, setSearch] = useState('');
    const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
    const [keyword, setKeyword] = useState<string>('');
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { texts, currentLang, setLanguage, isLoading } = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarDragY, setSidebarDragY] = useState(0);
    const [sidebarDragging, setSidebarDragging] = useState(false);
    const sidebarStartY = useRef(0);
    const sidebarCurrentY = useRef(0);

    console.log('Current texts:', texts);
    console.log('Is loading:', isLoading);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSidebarTouchStart = (e: React.TouchEvent) => {
        if (!isMenuOpen) {
            setIsMenuOpen(true);
            return;
        }
        setSidebarDragging(true);
        sidebarStartY.current = e.touches[0].clientY;
        sidebarCurrentY.current = e.touches[0].clientY;
    };

    const handleSidebarTouchMove = (e: React.TouchEvent) => {
        if (!sidebarDragging || !isMenuOpen) return;
        sidebarCurrentY.current = e.touches[0].clientY;
        const diff = sidebarCurrentY.current - sidebarStartY.current;
        if (diff > 0) {
            setSidebarDragY(diff);
        }
    };

    const handleSidebarTouchEnd = () => {
        setSidebarDragging(false);
        if (sidebarDragY > 50) {
            setIsMenuOpen(false);
        }
        setSidebarDragY(0);
    };

    const handlePlaceSelect = (place: Place, latLng?: LatLng) => {
        setSelectedPlace(place);
        setRecentPlaces((prev) => {
            const newPlaces = [place, ...prev.filter((p) => p.place_name !== place.place_name)];
            return newPlaces.slice(0, 10);
        });
        if (latLng) setCenter(latLng);
    };

    const handleMenuIconClick = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleCategorySelect = (category: string) => {
        if (category === 'CT1') {
            navigate('/kculture');
            setIsMenuOpen(false);
            return;
        }
        if (category === 'MT1') {
            navigate('/');
            setIsMenuOpen(false);
            return;
        }
        setCurrentCategory(category);
        setIsMenuOpen(false);
    };

    const handleSearch = () => {
        setKeyword(search);
    };

    // 라우트에 따라 pageName 결정
    const getPageName = () => {
        if (location.pathname === '/kculture') return 'kculture';
        // 필요시 다른 라우트도 추가
        return 'main';
    };

    const pageName = getPageName();

    // texts[pageName]에서 해당 페이지의 번역을 꺼내서 사용
    const pageTexts = texts[pageName] || {};

    return (
        <AppContainer>
            <MenuIcon onClick={handleMenuIconClick} $sidebar={isMenuOpen}>
                <MenuBar />
                <MenuBar />
                <MenuBar />
            </MenuIcon>
            {isMobile && (
                <MobileSidebarDragHandle
                    onTouchStart={handleSidebarTouchStart}
                    onTouchMove={handleSidebarTouchMove}
                    onTouchEnd={handleSidebarTouchEnd}
                />
            )}
            <SidebarMenu
                onCategorySelect={handleCategorySelect}
                isMobile={isMobile}
                isOpen={isMenuOpen}
                dragY={sidebarDragY}
                setIsOpen={setIsMenuOpen}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <MapContainer>
                            <SearchBoxWrapper $sidebar={isMenuOpen}>
                                <SearchInput
                                    type="text"
                                    placeholder={
                                        isLoading ? '' : pageTexts['search_placeholder'] || '출발지점 - 도착지점'
                                    }
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </SearchBoxWrapper>
                            <KakaoMap />
                            <PlaceInfoPanel selectedPlace={selectedPlace} recentPlaces={recentPlaces} />
                        </MapContainer>
                    }
                />
                <Route path="/kculture" element={<KCulturePageContent />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </AppContainer>
    );
};

export default App;
