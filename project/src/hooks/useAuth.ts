import { useEffect, useState } from 'react';
import axios from 'axios';

export function useAuth() {
    const [user, setUser] = useState<{ username?: string } | null>(null);
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
            .get(`${process.env.VITE_BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res: any) => setUser(res.data))
            .catch(() => setUser(null));
        setLoading(false);
    }, []);

    const login = () => {
        window.location.href = `${process.env.VITE_BACKEND_URL}/api/auth/google`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
    };

    return { user, loading, login, logout };
}
