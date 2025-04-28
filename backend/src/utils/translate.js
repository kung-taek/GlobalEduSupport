import axios from 'axios';

export async function translateText(text, from, to) {
    try {
        const apiKey = process.env.MYMEMORY_API_KEY;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            text
        )}&langpair=${from}|${to}&key=${apiKey}`;
        const response = await axios.get(url);
        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            return response.data.responseData.translatedText;
        }
        return null;
    } catch (err) {
        console.error('MyMemory 번역 API 호출 실패:', err.message);
        return null;
    }
}
