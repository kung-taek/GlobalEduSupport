import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
