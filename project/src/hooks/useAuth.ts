import { create } from 'zustand';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    username: string;
    provider: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const useAuth = create<AuthState>((set: any) => ({
    user: null,
    loading: true,
    error: null,
    login: (token: string) => {
        localStorage.setItem('token', token);
        set({ loading: true });
        useAuth.getState().checkAuth();
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, loading: false, error: null });
    },
    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ user: null, loading: false, error: null });
            return;
        }

        try {
            const response = await axios.get(`${process.env.VITE_BACKEND_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            set({ user: response.data, loading: false, error: null });
        } catch (error) {
            console.error('인증 확인 중 오류:', error);
            localStorage.removeItem('token');
            set({ user: null, loading: false, error: '인증에 실패했습니다.' });
        }
    },
}));

// 초기 인증 상태 확인
const token = localStorage.getItem('token');
if (token) {
    useAuth.getState().checkAuth();
}

export default useAuth;
