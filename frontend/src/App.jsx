import { useState, useEffect } from 'react';
import axios from 'axios';
import KakaoMap from './components/KakaoMap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
        fetch(`/api/ui-texts?lang=${lang}&page=test`, {
            credentials: 'include', // ✅ 추가
        })
            .then((res) => res.json())
            .then(setTranslations)
            .catch((err) => console.error('번역 데이터 로드 실패:', err));
    }, [lang]);

    const isLocationRequest = (text) => {
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
            }, {
                withCredentials: true, // ✅ 추가
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
            setMapError('');
            const res = await axios.post('http://13.124.18.66:5000/api/gpt-kakao/gpt-location', {
                message: input,
            }, {
                withCredentials: true, // ✅ 추가
            });

            if (res.data.type === 'route') {
                console.log('경로 데이터 수신:', res.data);
                setPath(res.data.path);
                setFrom(res.data.from.place_name);
                setTo(res.data.to.place_name);
            } else if (res.data.type === 'location') {
                console.log('위치 데이터 수신:', res.data);
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
            }, {
                withCredentials: true, // ✅ 추가
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
            }, {
                withCredentials: true, // ✅ 추가
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
        <R