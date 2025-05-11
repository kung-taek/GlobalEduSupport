import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // 로그인 성공 후 메인 페이지로 이동
            navigate('/');
        } else {
            // 에러 처리
            alert('로그인에 실패했습니다.');
            navigate('/');
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
