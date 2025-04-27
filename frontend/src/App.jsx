import { useState, useEffect } from 'react';
import axios from 'axios';
import KakaoMap from './components/KakaoMap';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function App() {
    const [input, setInput] = useState('');
    const [reply, setReply] = useState('');
    const [address, setAddress] = useState('');
    const [submittedAddress, setSubmittedAddress] = useState('');
    const [path, setPath] = useState([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [mapError, setMapError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lang, setLang] = useState('ko');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        fetch(`/api/ui-texts?lang=${lang}&page=test`)
            .then((res) => res.json())
            .then(setTranslations);
    }, [lang]);

    // GPT 응답을 분석하여 위치 검색이 필요한지 확인하는 함수
    const isLocationRequest = (text) => {
        // "가고 싶어", "위치", "어디", "가는 길" 등의 키워드를 포함하는지 확인
        const locationKeywords = ['가고 싶', '위치', '어디', '가는 길', '찾아'];
        return locationKeywords.some((keyword) => text.includes(keyword));
    };

    const sendToGPT = async () => {
        if (!input.trim()) {
            setReply('메시지를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            setReply('GPT 응답을 기다리는 중...');
            const res = await axios.post('http://13.124.18.66:5000/api/gpt', {
                message: input,
            });

            if (res.data && res.data.reply) {
                setReply(res.data.reply);
                setMapError('');
            } else {
                setReply('GPT로부터 유효한 응답을 받지 못했습니다.');
            }
        } catch (err) {
            console.error('GPT 응답 에러:', err);
            handleGPTError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGPTError = (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
            setReply('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.response) {
            if (err.response.status === 429) {
                setReply('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setReply(`서버 오류가 발생했습니다. (${err.response.status})`);
            }
        } else if (err.request) {
            setReply('서버로부터 응답이 없습니다. 인터넷 연결을 확인해주세요.');
        } else {
            setReply('GPT 응답 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const sendToGPTLocation = async () => {
        if (!input.trim()) {
            setMapError('검색할 내용을 입력해주세요.');
            return;
        }

        try {
            setMapError(''); // 에러 메시지 초기화
            const res = await axios.post('http://13.124.18.66:5000/api/gpt-kakao/gpt-location', {
                message: input,
            });

            if (res.data.type === 'route') {
                console.log('경로 데이터 수신:', res.data); // 디버깅용 로그
                setPath(res.data.path);
                // 출발지와 도착지 정보도 저장
                setFrom(res.data.from.place_name);
                setTo(res.data.to.place_name);
            } else if (res.data.type === 'location') {
                console.log('위치 데이터 수신:', res.data); // 디버깅용 로그
                setSubmittedAddress({
                    lat: res.data.lat,
                    lng: res.data.lng,
                    name: res.data.place_name,
                });
            }
        } catch (err) {
            console.error('GPT 위치 검색 오류:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setMapError(err.response.data.error);
            } else {
                setMapError('위치를 찾을 수 없습니다. 장소나 경로를 포함하여 질문해주세요.');
            }
        }
    };

    const fetchRoute = async () => {
        try {
            const response = await axios.post('http://13.124.18.66:5000/api/kakao/route', {
                from,
                to,
            });
            setPath(response.data.path);
        } catch (error) {
            console.error('경로를 가져오는 중 오류 발생:', error);
        }
    };

    const searchAddress = async () => {
        try {
            const response = await axios.post('http://13.124.18.66:5000/api/kakao/search', {
                keyword: address,
            });
            if (response.data.location) {
                setSubmittedAddress({
                    lat: response.data.location.y,
                    lng: response.data.location.x,
                    name: response.data.location.place_name,
                });
            }
        } catch (error) {
            console.error('주소 검색 중 오류 발생:', error);
        }
    };

    return (
        <Router>
            <div>
                <header
                    style={{
                        backgroundColor: '#2c3e50',
                        padding: '1rem',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                        <h1 style={{ margin: 0 }}>글로벌 교육 지원</h1>
                    </Link>
                    <nav>
                        <Link
                            to="/login"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                backgroundColor: '#3498db',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                transition: 'background-color 0.3s',
                            }}
                            onMouseOver={(e) => (e.target.style.backgroundColor = '#2980b9')}
                            onMouseOut={(e) => (e.target.style.backgroundColor = '#3498db')}
                        >
                            로그인
                        </Link>
                    </nav>
                </header>

                <select value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    {/* 필요시 다른 언어도 추가 */}
                </select>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                        path="/"
                        element={
                            <div style={{ padding: '20px' }}>
                                <h2>{translations.gptsend || '지피티야 도와줘'}</h2>
                                <div style={{ marginBottom: '20px' }}>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="GPT에게 보낼 메시지를 입력하세요"
                                        rows={4}
                                        cols={50}
                                        disabled={isLoading}
                                    />
                                    <br />
                                    <div
                                        style={{
                                            marginTop: '10px',
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <button onClick={sendToGPT} disabled={isLoading}>
                                            {translations.gptcallback || 'GPt 요청(로컬)'}
                                        </button>
                                        <button
                                            onClick={sendToGPTLocation}
                                            title="장소나 경로 관련 질문시 지도에 표시"
                                            disabled={isLoading}
                                        >
                                            {translations.findmap || '지도에서 찾기(로컬)'}
                                        </button>
                                    </div>
                                </div>

                                <h3>GPT 응답:</h3>
                                <pre
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '5px',
                                        whiteSpace: 'pre-wrap',
                                        color: isLoading ? '#666' : '#000',
                                    }}
                                >
                                    {reply}
                                </pre>

                                {mapError && (
                                    <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>
                                        {mapError}
                                    </div>
                                )}

                                <hr />

                                <h2>주소 입력 후 지도 이동</h2>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="예: 경일대학교"
                                    style={{ width: '300px', marginRight: '10px' }}
                                />
                                <button onClick={searchAddress}>지도 이동</button>
                                <KakaoMap address={submittedAddress} />

                                <h2>경로 표시</h2>
                                <input
                                    type="text"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    placeholder="출발지"
                                    style={{ width: '300px', marginRight: '10px' }}
                                />
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="도착지"
                                    style={{ width: '300px', marginRight: '10px' }}
                                />
                                <button onClick={fetchRoute}>경로 가져오기</button>
                                <KakaoMap path={path} />

                                <KakaoMap path={path} address={submittedAddress} />
                            </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
