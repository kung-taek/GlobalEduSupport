import React, { useState } from 'react';
import styled from 'styled-components';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import KakaoMap from './components/KakaoMap';
import SidebarMenu from './components/SidebarMenu';
import PlaceInfoPanel from './components/PlaceInfoPanel';
import KCulturePageContent from './pages/KCulturePage';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { LanguageSelector } from './components/LanguageSelector';

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
`;

const MapContainer = styled.div`
    flex: 1;
    position: relative;
`;

const SearchBoxWrapper = styled.div`
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 400px;
    max-width: 90%;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
`;

const MenuIcon = styled.div<{ sidebar?: boolean }>`
    position: fixed;
    top: 16px;
    left: ${({ sidebar }) => (sidebar ? '266px' : '16px')};
    font-size: 32px;
    cursor: pointer;
    z-index: 200;
    background: #fff;
    border-radius: 8px;
    padding: 4px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    transition: left 0.2s;
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
    const { texts, isLoading } = useTranslation();

    console.log('Current texts:', texts);
    console.log('Is loading:', isLoading);

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

    return (
        <TranslationProvider key={getPageName()} pageName={getPageName()}>
            <AppContainer>
                <MenuIcon onClick={handleMenuIconClick} sidebar={isMenuOpen}>
                    <span
                        style={{
                            display: 'block',
                            width: 24,
                            height: 3,
                            background: '#222',
                            margin: '5px 0',
                            borderRadius: 2,
                        }}
                    ></span>
                    <span
                        style={{
                            display: 'block',
                            width: 24,
                            height: 3,
                            background: '#222',
                            margin: '5px 0',
                            borderRadius: 2,
                        }}
                    ></span>
                    <span
                        style={{
                            display: 'block',
                            width: 24,
                            height: 3,
                            background: '#222',
                            margin: '5px 0',
                            borderRadius: 2,
                        }}
                    ></span>
                </MenuIcon>
                {isMenuOpen && <SidebarMenu onCategorySelect={handleCategorySelect} />}

                <Routes>
                    <Route
                        path="/"
                        element={
                            <MapContainer>
                                <SearchBoxWrapper>
                                    <SearchInput
                                        type="text"
                                        placeholder={texts['search_placeholder'] || '출발지점 - 도착지점'}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </SearchBoxWrapper>
                                <KakaoMap />
                            </MapContainer>
                        }
                    />
                    <Route path="/kculture" element={<KCulturePageContent />} />
                </Routes>
                {location.pathname === '/' && (
                    <PlaceInfoPanel selectedPlace={selectedPlace} recentPlaces={recentPlaces} />
                )}
            </AppContainer>
        </TranslationProvider>
    );
};

export default App;
