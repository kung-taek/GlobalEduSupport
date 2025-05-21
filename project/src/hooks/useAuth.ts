import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://globalhelper.p-e.kr:5000';

export function useAuth() {
    const [user, setUser] = useState<{ username?: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        // 토큰이 있으면 사용자 정보 요청
        console.log('Stored Token:', token);

        axios
            .get(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res: any) => {
                console.log('User data received:', res.data);
                setUser(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                setUser(null);
                setLoading(false);
            });
    }, []);

    const login = () => {
        console.log('Redirecting to Google login:', `${BACKEND_URL}/api/auth/google`);
        window.location.href = `${BACKEND_URL}/api/auth/google`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
    };

    return { user, loading, login, logout };
}
