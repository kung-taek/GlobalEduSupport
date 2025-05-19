import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import React from 'react';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthCallback - Full URL:', window.location.href);
        console.log('AuthCallback - Search Params:', Object.fromEntries(searchParams.entries()));

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        console.log('AuthCallback - Token:', token);
        console.log('AuthCallback - Error:', error);

        if (error) {
            console.error('AuthCallback - Authentication error:', error);
            navigate(`/login?error=${error}`);
            return;
        }

        if (token) {
            console.log('AuthCallback - Storing token and redirecting to home');
            localStorage.setItem('token', token);
            const browserLang = navigator.language || 'ko';
            fetch('/api/user/update-locale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ locale: browserLang.split('-')[0] }),
            }).finally(() => {
                window.location.href = '/';
            });
        } else {
            console.error('AuthCallback - No token received');
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
            }}
        >
            로그인 처리 중...
        </div>
    );
};

export default AuthCallback;
