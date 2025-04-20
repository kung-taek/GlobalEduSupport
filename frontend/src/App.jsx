import { useState } from 'react';
import axios from 'axios';
import KakaoMap from './components/KakaoMap';

function App() {
    const [input, setInput] = useState('');
    const [reply, setReply] = useState('');
    const [address, setAddress] = useState('');
    const [submittedAddress, setSubmittedAddress] = useState('');
    const [path, setPath] = useState([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [mapError, setMapError] = useState('');

    // GPT 응답을 분석하여 위치 검색이 필요한지 확인하는 함수
    const isLocationRequest = (text) => {
        // "가고 싶어", "위치", "어디", "가는 길" 등의 키워드를 포함하는지 확인
        const locationKeywords = ['가고 싶', '위치', '어디', '가는 길', '찾아'];
        return locationKeywords.some((keyword) => text.includes(keyword));
    };

    const sendToGPT = async () => {
        try {
            const res = await axios.post('http://13.124.18.66:5000/api/gpt', {
                message: input,
            });
            setReply(res.data.reply);
            setMapError('');
        } catch (err) {
            console.error(err);
            setReply('GPT 응답 중 에러가 발생했습니다.');
        }
    };

    const sendToGPTLocation = async () => {
        if (!input.trim()) {
            setMapError('검색할 내용을 입력해주세요.');
            return;
        }

        try {
            const res = await axios.post('http://13.124.18.66:5000/api/gpt-kakao/gpt-location', {
                message: input,
            });
            if (res.data.type === 'route') {
                setPath(res.data);
                setMapError('');
            } else if (res.data.type === 'location') {
                setSubmittedAddress(res.data);
                setMapError('');
            }
        } catch (err) {
            console.error('GPT 위치 검색 오류:', err);
            setMapError('위치를 찾을 수 없습니다. 장소나 경로를 포함하여 질문해주세요.');
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
        <div style={{ padding: '20px' }}>
            <h2>GPT 메시지 보내기</h2>
            <div style={{ marginBottom: '20px' }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="GPT에게 보낼 메시지를 입력하세요"
                    rows={4}
                    cols={50}
                />
                <br />
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={sendToGPT}>GPT 답변 받기</button>
                    <button onClick={sendToGPTLocation} title="장소나 경로 관련 질문시 지도에 표시">
                        지도에서 찾기
                    </button>
                </div>
            </div>

            <h3>GPT 응답:</h3>
            <pre>{reply}</pre>

            {mapError && <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>{mapError}</div>}

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
    );
}

export default App;
