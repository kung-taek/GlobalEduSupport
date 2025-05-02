import axios from 'axios';

export async function translateText(text, from, to) {
    try {
        const apiKey = process.env.MYMEMORY_API_KEY;
        const email = process.env.MyMEMORY_NAVER_EMAIL;

        if (!apiKey || !email) {
            console.warn('⚠️ MyMemory API 키 또는 이메일이 설정되어 있지 않습니다.');
            return null;
        }

        if (!text || text.trim() === '') return '';

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            text
        )}&langpair=${from}|${to}&key=${apiKey}&de=${email}`;

        const response = await axios.get(url);

        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            return response.data.responseData.translatedText;
        }

        console.warn('⚠️ 번역 응답이 예상과 다릅니다:', response.data);
        return null;
    } catch (err) {
        console.error('MyMemory 번역 API 호출 실패:', err.response?.data || err.message);
        return null;
    }
}
