import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/'); // 메인 페이지로 리다이렉트
        } else {
            navigate('/login'); // 토큰이 없으면 로그인 페이지로
        }
    }, [searchParams, navigate]);

    return <div>로그인 처리 중...</div>;
}

export default AuthCallback;
