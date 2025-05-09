// src/types/translation.ts

// 번역 관련 타입 정의
// 번역할 페이지의 이름과 요소의 키를 포함하는 인터페이스
export interface UIText {
    page_name: string;
    element_key: string;
    original_text_ko: string;
    // 동적으로 추가될 수 있는 번역 텍스트들
    [key: string]: string;  // translated_text_ko, translated_text_ja, translated_text_en 등이 여기에 포함
}


export type Language = string; 

