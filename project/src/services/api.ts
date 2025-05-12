import type { UIText, Language } from '../types/translation';

// API URL 설정
const API_URL = 'http://globalhelper.p-e.kr:5000';

// UI 텍스트 목록 가져오기
export const fetchUITexts = async (page: string, lang: Language): Promise<UIText[]> => {
    console.log('Fetching translations for:', page, lang);
    try {
        const response = await fetch(`${API_URL}/api/ui-texts?page=${page}&lang=${lang}`, {
            credentials: 'include',
        });
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received translations:', data);

        if (!Array.isArray(data)) {
            console.error('Expected array but received:', data);
            throw new Error('Invalid response format');
        }

        return data;
    } catch (error) {
        console.error('Translation fetch error:', error);
        throw error;
    }
};

// 번역 요청 함수
export const translateText = async (text: string, targetLang: Language) => {
    const response = await fetch(`${API_URL}/api/ui-texts/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
};

export const fetchAllUITexts = async (lang: string) => {
    const response = await fetch(`${API_URL}/api/ui-texts/all?lang=${lang}`, {
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch all UI texts');
    return await response.json();
};

export const requestTranslateAll = async (lang: string) => {
    try {
        const response = await fetch(`${API_URL}/api/ui-texts/translate-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ lang }),
            credentials: 'include',
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Translation request failed:', error);
        // 에러 발생 시 빈 객체 반환하여 앱이 계속 동작하도록 함
        return {};
    }
};
