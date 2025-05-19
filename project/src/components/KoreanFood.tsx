import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';

const Header = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    background: #23272f;
    color: #fff;
    text-align: center;
    z-index: 5000;
`;

const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: calc(100vh - 64px);
    gap: 0;
    padding-top: 64px;
    @media (max-width: 768px) {
        flex-direction: column;
        width: 100vw;
        height: calc(100vh - 64px);
        padding-top: 64px;
    }
`;

const Section = styled.div`
    width: 100vw;
    height: auto;
    background: #fff;
    color: #23272f;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 0;
    padding: 20px;
    @media (max-width: 768px) {
        width: 100vw;
        height: auto;
        padding: 10px;
    }
`;

// 아코디언 구조를 위한 styled 컴포넌트 추가 (Transportation.tsx에서 가져옴)
const AccordionContainer = styled.div`
    margin-top: 10px; /* 카테고리 제목 아래 여백 */
    border-top: 1px solid #eee; /* 구분선 */
    padding-top: 10px; /* 구분선 위 여백 */
`;

const AccordionHeader = styled.div`
    font-weight: bold;
    cursor: pointer; /* 클릭 가능한 요소임을 표시 */
    color: #007bff; /* 링크처럼 보이도록 색상 변경 */
    &:hover {
        text-decoration: underline; /* 호버 시 밑줄 */
    }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
    max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')}; /* 상태에 따라 높이 조절 */
    overflow: hidden; /* 내용 숨김 처리 */
    transition: max-height 0.3s ease-in-out; /* 부드러운 전환 효과 */
    padding-top: ${({ $isOpen }) => ($isOpen ? '10px' : '0')}; /* 열렸을 때 위 여백 */
`;

const FoodItemList = styled.ul`
    list-style: disc; /* 목록 스타일 */
    padding-left: 20px; /* 들여쓰기 */
    margin-top: 0;
    margin-bottom: 0;
`;

const FoodItem = styled.li`
    margin-bottom: 5px; /* 각 항목 아래 여백 */
    line-height: 1.5; /* 줄 높이 조절 */
`;

const KoreanFood: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const headerText = mainTexts['korean_food'] || '한국의 음식';

    // 아코디언 상태 관리 (어떤 카테고리가 열려 있는지 인덱스로 저장)
    const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(null);

    // 아코디언 토글 함수
    const toggleCategory = (index: number) => {
        setOpenCategoryIndex(openCategoryIndex === index ? null : index);
    };

    const foodCategories = [
        {
            name: '주식류',
            items: [
                '밥: 쌀을 씻어 물을 붓고 끓여 익힌 주식.',
                '죽: 곡식에 물을 많이 붓고 끓여서 부드럽게 만든 음식.',
                '국수: 밀가루나 메밀가루 등을 반죽하여 면을 만들어 삶아 만든 음식.',
                '떡국: 얇게 썬 떡을 넣어 끓인 국.',
                '만둣국: 만두를 넣어 끓인 국.',
            ],
        },
        {
            name: '찬품류',
            items: [
                '김치: 채소를 소금에 절여 양념에 버무려 발효시킨 한국의 대표적인 전통 음식.',
                '나물: 채소, 산나물, 들나물을 데치거나 볶거나 무쳐서 만든 반찬.',
                '구이: 불에 직접 굽거나 팬에 지져서 만든 음식.',
                '전: 재료에 밀가루나 찹쌀가루 등의 옷을 입혀 기름에 지진 음식.',
                '볶음: 재료를 기름에 빠르게 볶아 만든 음식.',
                '조림: 양념장을 넣어 국물이 거의 졸아들게 끓인 음식.',
                '찜: 재료를 찜통에 쪄서 익힌 음식.',
                '국: 국물을 주체로 하여 건더기를 넣어 끓인 음식.',
                '찌개: 국보다 국물이 적고 건더기가 많은 음식.',
                '전골: 여러 가지 재료를 함께 끓여 먹는 국물 음식.',
            ],
        },
        {
            name: '양념류',
            items: [
                '간장: 콩을 발효시켜 만든 장.',
                '된장: 콩을 발효시켜 만든 장으로 국이나 찌개에 사용.',
                '고추장: 고춧가루, 찹쌀 등을 섞어 발효시켜 만든 매운 장.',
                '쌈장: 된장과 고추장을 섞어 만든 쌈용 장.',
                '마늘: 향신료로 다양하게 사용.',
                '파: 향신료로 다양하게 사용.',
                '생강: 향신료로 주로 비린내 제거에 사용.',
                '고춧가루: 말린 고추를 빻아 만든 가루로 매운맛을 냄.',
            ],
        },
        {
            name: '고명류',
            items: [
                '지단: 달걀을 얇게 부쳐 채 썬 것.',
                '김가루: 김을 구워 잘게 부순 것.',
                '깨소금: 볶은 깨를 빻아 소금과 섞은 것.',
                '실고추: 고추를 가늘게 찢어 말린 것.',
                '잣: 잣나무 열매의 씨앗.',
            ],
        },
    ];

    return (
        <>
            <Header>{headerText}</Header>
            <SectionWrapper>
                <Section>
                    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                        <h2>한식의 구성 요소</h2>
                        {foodCategories.map((category, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                                {/* 아코디언 헤더 */}
                                <AccordionHeader onClick={() => toggleCategory(index)}>
                                    {category.name} {openCategoryIndex === index ? '숨기기' : '보기'}
                                </AccordionHeader>
                                {/* 아코디언 내용 */}
                                <AccordionContent $isOpen={openCategoryIndex === index}>
                                    <FoodItemList>
                                        {category.items.map((item, itemIndex) => (
                                            <FoodItem key={itemIndex}>{item}</FoodItem>
                                        ))}
                                    </FoodItemList>
                                </AccordionContent>
                            </div>
                        ))}
                    </div>
                </Section>
            </SectionWrapper>
        </>
    );
};

export default KoreanFood;
