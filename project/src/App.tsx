import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import KakaoMap from './components/KakaoMap';
import SidebarMenu from './components/SidebarMenu';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { LanguageSelector } from './components/LanguageSelector';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';
import { searchLocation, searchRoute, askGptRoute, API_URL } from './services/api'; // 경로에 맞게 import

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

const MenuBar = styled.span<{ $isOpen?: boolean; $isMobile?: boolean }>`
    display: block;
    width: 28px;
    height: 2px;
    background: ${({ $isOpen, $isMobile }) => ($isOpen && $isMobile ? '#ffffff' : '#2D3436')};
    border-radius: 3.5px;
    transition: all 0.2s;
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

const SearchTabs = styled.div`
    display: flex;
    width: 100%;
    border-bottom: 1px solid #ddd;
    background: #fff;
`;

const Tab = styled.button<{ active: boolean }>`
    flex: 1;
    padding: 12px 0;
    background: ${({ active }) => (active ? '#f0f0f0' : '#fff')};
    border: none;
    border-bottom: ${({ active }) => (active ? '2px solid #007bff' : 'none')};
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
`;

const SearchPanel = styled.div`
    background: #fff;
    padding: 24px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 8px;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid #007bff;
    background: #fff;
    color: #007bff;
    font-weight: bold;
    cursor: pointer;
    margin-left: 8px;
`;

const GptAnswer = styled.div`
    width: 100%;
    background: #f8f8f8;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    color: #333;
    min-height: 40px;
`;

const FloatingPanel = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 380px;
    max-width: 95vw;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
    z-index: 20;
    padding: 0;
    @media (max-width: 600px) {
        width: 98vw;
        top: 12px;
    }
`;

function extractPlacesFromText(text: string): [string, string] | null {
    // 1. "A에서 B로" 패턴
    let match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)[으로|로|까지|에]?/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    // 2. "A에서 B까지" 패턴
    match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)까지/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    // 3. "A에서 B로 가려면" 패턴
    match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)로\s*가려면/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    // 4. "A에서 B로 어떻게" 패턴
    match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)로\s*어떻게/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    // 5. "A에서 B로"만 있는 경우
    match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)로/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    // 6. "A에서 B"만 있는 경우
    match = text.match(/([가-힣A-Za-z0-9]+)에서\s*([가-힣A-Za-z0-9]+)/);
    if (match && match[1] && match[2]) {
        return [match[1], match[2]];
    }
    return null;
}

const SearchBoxUI: React.FC<{
    mapAddress: any;
    setMapAddress: (addr: any) => void;
    mapPath: number[];
    setMapPath: (path: number[]) => void;
    gptAnswer: string;
    setGptAnswer: (ans: string) => void;
    gptRoutePath: number[];
    setGptRoutePath: (path: number[]) => void;
    showGptRoute: boolean;
    setShowGptRoute: (show: boolean) => void;
    boxPosition: { x: number; y: number };
    setBoxPosition: (pos: { x: number; y: number }) => void;
    isMobile: boolean;
    fetchRouteRecommendation: (from: string, to: string) => void;
    routeRecommendation: string;
    showRecommendationPanel: boolean;
    setShowRecommendationPanel: (show: boolean) => void;
}> = ({
    mapAddress,
    setMapAddress,
    mapPath,
    setMapPath,
    gptAnswer,
    setGptAnswer,
    gptRoutePath,
    setGptRoutePath,
    showGptRoute,
    setShowGptRoute,
    boxPosition,
    setBoxPosition,
    isMobile,
    fetchRouteRecommendation,
    routeRecommendation,
    showRecommendationPanel,
    setShowRecommendationPanel,
}) => {
    const { texts, isLoading } = useTranslation();
    const [tab, setTab] = useState(0);
    const [location, setLocation] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [question, setQuestion] = useState('');
    const [extractedPlaces, setExtractedPlaces] = useState<[string, string] | null>(null);
    const [minimized, setMinimized] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                setBoxPosition({
                    x: dragOffset.x + (e.clientX - dragStart.x),
                    y: dragOffset.y + (e.clientY - dragStart.y),
                });
            }
        };
        const onMouseUp = () => {
            setDragging(false);
            document.body.style.userSelect = '';
        };
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, dragStart, dragOffset, setBoxPosition]);

    const handleLocationSearch = async () => {
        try {
            const result = await searchLocation(location);
            if (result.location) {
                setMapAddress({
                    lat: result.location.y,
                    lng: result.location.x,
                    name: result.location.place_name,
                });
                setMapPath([]);
            } else {
                alert('장소를 찾을 수 없습니다.');
            }
        } catch (e) {
            alert('위치 검색 실패');
        }
    };

    const handleRouteSearch = async () => {
        if (!start.trim() || !end.trim()) {
            alert('출발지와 도착지를 모두 입력하세요.');
            return;
        }
        try {
            const result = await searchRoute(start, end);
            if (result.path && result.path.length > 0) {
                setMapPath(result.path);
                setMapAddress(null);
                fetchRouteRecommendation(start, end);
            } else {
                alert('경로를 찾을 수 없습니다.');
            }
        } catch (e: any) {
            if (e?.response?.data?.error) {
                alert(e.response.data.error);
            } else {
                alert('경로 검색 실패');
            }
        }
    };

    const isLocationRequest = (text: string) => {
        const keywords = ['가고 싶', '위치', '어디', '가는 길', '찾아', '경로', '출발', '도착'];
        return keywords.some((keyword) => text.includes(keyword));
    };

    const handleGptSend = async () => {
        try {
            let result: any;
            if (isLocationRequest(question)) {
                result = await askGptRoute(question);
                if (result && typeof result.answer === 'string') {
                    setGptAnswer(result.answer);
                    // 답변에서 장소명 2개 추출
                    const places = extractPlacesFromText(result.answer);
                    setExtractedPlaces(places);
                } else if (result && result.error) {
                    setGptAnswer(result.error);
                    setExtractedPlaces(null);
                } else {
                    setGptAnswer('답변이 없습니다.');
                    setExtractedPlaces(null);
                }
                if (result.type === 'route' && result.path) {
                    setGptRoutePath(result.path);
                    setShowGptRoute(false);
                } else if (result.type === 'location' && result.lat && result.lng) {
                    setMapAddress({
                        lat: result.lat,
                        lng: result.lng,
                        name: result.place_name,
                    });
                    setMapPath([]);
                    setGptRoutePath([]);
                    setShowGptRoute(false);
                } else {
                    setGptRoutePath([]);
                    setShowGptRoute(false);
                }
            } else {
                // 일반 대화
                const res = await fetch(`${API_URL}/api/gpt`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ message: question }),
                });
                const data = await res.json();
                setGptAnswer(data.reply || '답변이 없습니다.');
                setGptRoutePath([]);
                setShowGptRoute(false);
                setExtractedPlaces(null);
            }
        } catch (e: any) {
            if (e?.response?.data?.error) {
                setGptAnswer(e.response.data.error);
            } else {
                setGptAnswer('질문 처리 실패');
            }
            setGptRoutePath([]);
            setShowGptRoute(false);
            setExtractedPlaces(null);
        }
    };

    const handleShowRoute = async () => {
        if (gptRoutePath && gptRoutePath.length > 0) {
            setShowGptRoute(true);
            if (extractedPlaces) {
                const [from, to] = extractedPlaces;
                fetchRouteRecommendation(from, to);
            }
            return;
        }
        if (extractedPlaces) {
            const [from, to] = extractedPlaces;
            try {
                const result = await searchRoute(from, to);
                if (result.path && result.path.length > 0) {
                    setGptRoutePath(result.path);
                    setShowGptRoute(true);
                    fetchRouteRecommendation(from, to);
                } else {
                    alert('경로를 찾을 수 없습니다.');
                }
            } catch (e) {
                alert('경로 검색 실패');
            }
        } else {
            alert('장소를 추출할 수 없습니다.');
        }
    };

    // 마우스 드래그
    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragOffset({ x: boxPosition.x, y: boxPosition.y });
        document.body.style.userSelect = 'none';
    };

    // 터치 드래그
    const onTouchStart = (e: React.TouchEvent) => {
        setDragging(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setDragOffset({ x: boxPosition.x, y: boxPosition.y });
    };
    useEffect(() => {
        const onTouchMove = (e: TouchEvent) => {
            if (dragging && e.touches.length === 1) {
                setBoxPosition({
                    x: dragOffset.x + (e.touches[0].clientX - dragStart.x),
                    y: dragOffset.y + (e.touches[0].clientY - dragStart.y),
                });
            }
        };
        const onTouchEnd = () => {
            setDragging(false);
        };
        if (dragging) {
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [dragging, dragStart, dragOffset, setBoxPosition]);

    if (isLoading || !texts['main']) {
        return <div>로딩 중...</div>;
    }
    const mainTexts = texts['main'];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ cursor: 'grab', userSelect: 'none' }} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                <SearchTabs>
                    <Tab active={tab === 0} onClick={() => setTab(0)}>
                        {mainTexts['tab_location_search'] || '위치 검색'}
                    </Tab>
                    <Tab active={tab === 1} onClick={() => setTab(1)}>
                        {mainTexts['tab_route_search'] || '경로 검색'}
                    </Tab>
                    <Tab active={tab === 2} onClick={() => setTab(2)}>
                        {mainTexts['tab_route_question'] || '경로 질문'}
                    </Tab>
                    <span style={{ marginLeft: 'auto' }}>
                        {minimized ? (
                            <button
                                style={{ fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' }}
                                onClick={() => setMinimized(false)}
                                title="최대화"
                            >
                                □
                            </button>
                        ) : (
                            <button
                                style={{ fontSize: 20, border: 'none', background: 'none', cursor: 'pointer' }}
                                onClick={() => setMinimized(true)}
                                title="최소화"
                            >
                                ─
                            </button>
                        )}
                    </span>
                </SearchTabs>
            </div>
            {!minimized && (
                <SearchPanel>
                    {tab === 0 && (
                        <>
                            <Input
                                placeholder={mainTexts['input_location'] || '위치 입력'}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            <Button onClick={handleLocationSearch}>{mainTexts['search_btn'] || '검색'}</Button>
                        </>
                    )}
                    {tab === 1 && (
                        <>
                            <Input
                                placeholder={mainTexts['input_start'] || '출발지점 입력'}
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                            />
                            <Input
                                placeholder={mainTexts['input_end'] || '도착지점 입력'}
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                            <Button onClick={handleRouteSearch}>{mainTexts['search_btn'] || '검색'}</Button>
                        </>
                    )}
                    {tab === 2 && (
                        <>
                            <Input
                                placeholder={mainTexts['input_question'] || '질문 입력'}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <Button onClick={handleGptSend}>{mainTexts['send_btn'] || '보내기'}</Button>
                            <GptAnswer>{gptAnswer || mainTexts['gpt_answer'] || 'GPT 답변'}</GptAnswer>
                            <Button onClick={handleShowRoute}>{mainTexts['show_route_btn'] || '경로표시'}</Button>
                        </>
                    )}
                </SearchPanel>
            )}
        </div>
    );
};

const App: React.FC = () => {
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
    const [mapAddress, setMapAddress] = useState<any>(null);
    const [mapPath, setMapPath] = useState<number[]>([]);
    const [gptAnswer, setGptAnswer] = useState('');
    const [showRouteBtn, setShowRouteBtn] = useState(false);
    const [gptRoutePath, setGptRoutePath] = useState<number[]>([]);
    const [showGptRoute, setShowGptRoute] = useState(false);
    const PANEL_WIDTH = 380; // FloatingPanel의 width와 동일하게
    const [boxPosition, setBoxPosition] = useState<{ x: number; y: number }>(() => ({
        x: window.innerWidth <= 768 ? 0 : Math.max((window.innerWidth - PANEL_WIDTH) / 2, 0),
        y: 0,
    }));
    const [routeRecommendation, setRouteRecommendation] = useState('');
    const [showRecommendationPanel, setShowRecommendationPanel] = useState(false); // 모바일용

    console.log('Current texts:', texts);
    console.log('Is loading:', isLoading);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setBoxPosition({
            x: isMobile ? 0 : Math.max((window.innerWidth - PANEL_WIDTH) / 2, 0),
            y: 0,
        });
    }, [isMobile]);

    useEffect(() => {
        fetch('/api/getShowRouteBtn')
            .then((response) => response.json())
            .then((data) => setShowRouteBtn(data.show_route_btn));
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

    const handleMenuIconClick = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleCategorySelect = (category: string) => {
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

    // 경로 검색/질문 후 GPT에 이동 방법 안내 요청 함수
    const fetchRouteRecommendation = async (from: string, to: string) => {
        try {
            const res = await fetch(`${API_URL}/api/gpt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content:
                                "너는 친절하고 지적인 한국인 비서야. 사용자가 물어보는 대중교통 경로나 이동 방법에 대해 현실적으로 안내하고, 실제 존재하는 버스 노선, 지하철 노선만 사용해. 정확한 지명을 사용하고, 잘못된 노선이나 지하철역을 지어내지 마. 몰라서 확신이 없다면 '정확한 정보를 위해 지역 교통 웹사이트를 참고하세요'라고 안내해. 답변은 자연스럽고, 간결하지만 유익하게 말해줘.",
                        },
                        {
                            role: 'user',
                            content: `'${from}'에서 '${to}'까지 대중교통(버스, 지하철 등)으로 이동하는 방법을 구체적으로 예시로 설명해줘. 버스 n정거장, 환승, 몇 분 도보, 도시철도에서 n정거장 이동 등도 포함해서 알려줘.`,
                        },
                    ],
                }),
            });

            // 진단용 로그 추가
            console.log('GPT API 응답 상태:', res.status);
            const data = await res.json();
            console.log('GPT API 응답 데이터:', data);

            if (data.reply) {
                setRouteRecommendation(data.reply);
            } else {
                throw new Error('No reply in response');
            }
        } catch (error) {
            console.error('GPT 요청 실패:', error);
            setRouteRecommendation('교통 안내 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <AppContainer>
            {/* PC: 기존 위치 */}
            {!isMobile && (
                <MenuIcon onClick={handleMenuIconClick} $sidebar={isMenuOpen}>
                    <MenuBar />
                    <MenuBar />
                    <MenuBar />
                </MenuIcon>
            )}
            {/* 모바일: 좌측 하단 고정 */}
            {isMobile && (
                <MenuIcon
                    onClick={handleMenuIconClick}
                    $sidebar={isMenuOpen}
                    style={{
                        position: 'fixed',
                        left: 16,
                        bottom: 24,
                        zIndex: 1000,
                        borderRadius: 24,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        background: '#fff',
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                    }}
                >
                    <MenuBar />
                    <MenuBar />
                    <MenuBar />
                </MenuIcon>
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
                            <FloatingPanel
                                style={{
                                    position: 'absolute',
                                    left: isMobile ? 0 : boxPosition.x,
                                    top: boxPosition.y,
                                    width: isMobile ? '98vw' : 380,
                                    maxWidth: isMobile ? '100vw' : 380,
                                    zIndex: 20,
                                    cursor: 'grab',
                                    transform: 'none',
                                }}
                            >
                                <SearchBoxUI
                                    mapAddress={mapAddress}
                                    setMapAddress={setMapAddress}
                                    mapPath={mapPath}
                                    setMapPath={setMapPath}
                                    gptAnswer={gptAnswer}
                                    setGptAnswer={setGptAnswer}
                                    gptRoutePath={gptRoutePath}
                                    setGptRoutePath={setGptRoutePath}
                                    showGptRoute={showGptRoute}
                                    setShowGptRoute={setShowGptRoute}
                                    boxPosition={boxPosition}
                                    setBoxPosition={setBoxPosition}
                                    isMobile={isMobile}
                                    fetchRouteRecommendation={fetchRouteRecommendation}
                                    routeRecommendation={routeRecommendation}
                                    showRecommendationPanel={showRecommendationPanel}
                                    setShowRecommendationPanel={setShowRecommendationPanel}
                                />
                            </FloatingPanel>
                            <KakaoMap address={mapAddress} path={showGptRoute ? gptRoutePath : mapPath} />
                        </MapContainer>
                    }
                />

                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            {/* PC: 우측 안내 패널 */}
            {!isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        width: 340,
                        height: '100vh',
                        background: '#fff',
                        borderLeft: '1px solid #eee',
                        zIndex: 2000,
                        boxShadow: '0 0 12px rgba(0,0,0,0.07)',
                        padding: 24,
                        overflowY: 'auto',
                    }}
                >
                    <div style={{ whiteSpace: 'pre-line' }}>{routeRecommendation}</div>
                </div>
            )}
            {/* 모바일: 하단 ▲/▼ 버튼 및 안내 패널 */}
            {isMobile && (
                <>
                    {!showRecommendationPanel && (
                        <button
                            style={{
                                position: 'fixed',
                                left: '50%',
                                bottom: 16,
                                transform: 'translateX(-50%)',
                                zIndex: 2000,
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 24,
                                fontSize: 24,
                                width: 48,
                                height: 48,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            }}
                            onClick={() => setShowRecommendationPanel(true)}
                        >
                            ▲
                        </button>
                    )}
                    {showRecommendationPanel && (
                        <div
                            style={{
                                position: 'fixed',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: '#fff',
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
                                padding: 20,
                                maxHeight: '60vh',
                                overflowY: 'auto',
                                zIndex: 3000,
                            }}
                        >
                            <button
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: 8,
                                    transform: 'translateX(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 24,
                                    color: '#888',
                                }}
                                onClick={() => setShowRecommendationPanel(false)}
                            >
                                ▼
                            </button>
                            <div style={{ whiteSpace: 'pre-line', marginTop: 32 }}>{routeRecommendation}</div>
                        </div>
                    )}
                </>
            )}
        </AppContainer>
    );
};

export default App;
