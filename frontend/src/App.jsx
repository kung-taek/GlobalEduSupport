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

    const sendToGPT = async () => {
        try {
            const res = await axios.post('http://13.124.18.66:5000/api/gpt', {
                message: input,
            });
            setReply(res.data.reply);
        } catch (err) {
            console.error(err);
            setReply('에러가 발생했습니다.');
        }
    };

    const sendToGPTLocation = async () => {
        try {
            const res = await axios.post('http://13.124.18.66:5000/api/gpt-location', {
                message: input,
            });
            if (res.data.type === 'route') {
                setPath(res.data);
            } else if (res.data.type === 'location') {
                setSubmittedAddress(res.data);
            }
        } catch (err) {
            console.error(err);
            setReply('에러가 발생했습니다.');
        }
    };

    const fetchRoute = async () => {
        try {
            const response = await axios.post('http://13.124.18.66:5000/api/route', {
                from,
                to,
            });
            setPath(response.data.path);
        } catch (error) {
            console.error('경로를 가져오는 중 오류 발생:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>GPT 메시지 보내기</h2>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="GPT에게 보낼 메시지를 입력하세요"
                rows={4}
                cols={50}
            />
            <br />
            <button onClick={sendToGPT}>전송</button>
            <h3>GPT 응답:</h3>
            <pre>{reply}</pre>

            <hr />

            <h2>주소 입력 후 지도 이동</h2>
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 경일대학교"
                style={{ width: '300px', marginRight: '10px' }}
            />
            <button onClick={() => setSubmittedAddress(address)}>지도 이동</button>
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

            <button onClick={sendToGPTLocation}>지도 연동 전송</button>
            <KakaoMap path={path} address={submittedAddress} />
        </div>
    );
}

export default App;
