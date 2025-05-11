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
        axios
            .get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = () => {
        window.location.href = '/api/auth/google';
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
    };

    return { user, loading, login, logout };
}
