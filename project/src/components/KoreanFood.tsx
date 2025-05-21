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
    max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
    overflow-y: auto;
    transition: max-height 0.3s ease-in-out;
    padding-top: ${({ $isOpen }) => ($isOpen ? '10px' : '0')};

    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #007bff;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #0056b3;
    }
`;

const FoodItemList = styled.ul`
    list-style: disc;
    padding-left: 20px;
    margin-top: 0;
    margin-bottom: 0;
    max-height: 400px;
`;

const FoodItem = styled.li`
    margin-bottom: 10px;
    line-height: 1.6;
    color: #333;
    font-size: 1rem;
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
                '밥: 주식은 주로 쌀로 지은 흰밥이고 보리, 조, 수수, 콩, 팥 등을 섞어 지은 잡곡밥이 있다. 밥은, 곡물과물을 함께 넣고 끓여서 수분을 흡수시켜 익힌 후에 충분히 뜸을 들여서 완전히 호화 시킨 것이다. 별식으로 채소류, 어패류, 육류 등을 넣어 짓기도 하며, 비빔밥은 밥 위에 나물과 고기를 얹어서 비벼 먹는 밥이다.',
                '죽: 모두 곡물로 만드는 유동식 음식으로, 죽은 곡물을 알곡으로 또는 갈아서 물을 넣고 끓여 완전히 호화 시킨 것이고, 미음은 죽과는 달리 곡물을 알곡 째 푹 고아서 체에 거른 것이다. 응이는 곡물의 전분을 물에 풀어서 끓인 것으로 훌훌 마실 수 있을 정도로 묽다.죽에다 곡물 이외에 채소류, 육류, 어패류 등을 넣고 끓이기도 한다. 곡물에 열매를 넣은 죽으로 잣죽, 깨죽, 호두죽, 녹두죽, 콩죽 등이 있고, 채소를 넣은 죽으로는 늙은호박죽, 애호박죽, 표고죽, 아욱죽 등이 있고, 어패류죽으로는 전복죽, 어죽, 조개죽, 피문어죽 등이 있으며, 육류죽으로는 장국죽, 쇠고기죽, 닭고기죽 등이 있다.',
                '국수: 국수에는 곡물이나 전분의 재료에 따라 밀국수, 메밀국수, 녹말국수, 강량국수, 칡국수 등이 있다. 또, 따뜻한 국물에 먹는 온면과 찬 육수나 동치미 국물에 먹는 냉면, 장국에 말지 않는 비빔국수로 나눌 수 있다. 온면의 하나인 국수장국은 예전에는 꿩고기를 쓰기도 하였으나 대개는 쇠고기 양지머리나 사골 등을 삶아 쓰고, 칼국수에는 닭 삶은 국물을 쓴다. 냉면은 메밀가루에 밀가루나 전분을 섞어 반죽하여 국수틀에 넣어 눌러 빼고, 칼국수는 밀가루나 메밀가루를 반죽하여 얇게 밀어 칼로 썬다. 여름철에는 콩국에 밀국수를 말아먹는 콩국수도 즐겨 먹는다.',
                '만두, 떡국: 만두는 껍질의 재료와 넣는 소에 따라 아주 다양하다. 대개는 밀가루를 반죽하여 밀어서 껍질을 만드는데, 메밀가루로 빚는 메밀만두도 있다. 궁중의 만두에는 소를 넣어 주름을 잡지 않고 반달형으로 빚은 병시와 해삼 모양으로 빚은 규아상이 있다. 예부터 우리나라에서는 어느 가정에서나 정월 초하루에는 떡국을 마련하여 조상께 차례를 지내고, 새해 아침의 첫 식사로 삼아 왔다. 떡국은 멥쌀로 흰 가래떡을 만들어 어슷한 타원형으로 얇게 썰어 육수에 넣어 끓인다. 북쪽 지방에서는 만두를 즐기고, 남쪽에서는 떡국을 즐겨 먹는다.',
            ],
        },
        {
            name: '찬품류',
            items: [
                '국,탕:밥이 주식인 우리나라의 밥상에서 국은 매끼마다 오르는 기본적인 반찬이다. 크게 맑은장국, 토장국, 곰국, 냉국으로 나뉜다. ',
                '찌개: 건지와 국물의 비율이 비슷한 찌개는 국보다 간이 센 편인 국물 음식이다. 맛을 내는 재료에 따라 된장찌개, 고추장찌개, 맑은 찌개로 나뉜다. ',
                '전골, 볶음: 전골은 육류와 채소를 밑간을 하여 그릇에 담아 준비해 놓고 상 옆에서 화로에 전골 틀을 올려놓고 즉석에서 볶고 끓이며 먹는 음식이다. 미리 볶아서 접시에 담아 상에 올리면 볶음이 된다. ',
                '찜: 찜은 육류, 어패류, 채소류를 국물과 함께 끓여서 익히는 방법과 증기로 쪄서 익히는 방법이 있다. 끓이는 찜은 쇠갈비, 쇠꼬리, 사태, 돼지갈비 등을 주재료로 하여 약한 불에서 서서히 오래 익혀서 연하게 만들며, 증기에 찌는 찜은 주로 생선, 새우, 조개 등으로 만든다.',
                '생채: 생채(生菜)는 계절마다 새로 나오는 싱싱한 채소를 익히지 않고 초장, 초고추장, 겨자장으로 무친 가장 일반적인 찬품이다. 설탕과 식초를 조미료로 써서 달고 새콤하며 산뜻한 맛을 낸다.',
                '조림, 초: 조림은 육류, 어패류, 채소류로 간을 약간 세게 하여 주로 반상에 오르는 찬품이다. 대개 맛이 담백한 흰살 생선은 간장으로 조리고, 붉은살 생선이나 비린내가 많이 나는 생선류는 고춧가루나 고추장을 넣어 조린다.',
                '전유어: 전(煎)은 기름을 두르고 지지는 조리법으로 전유어(煎油魚), 전유아, 전냐, 전야, 전 등으로 불리고 궁중에서는 전유화라고 하였다. 전의 재료는 육류, 어패류, 채소류 등 다양하다. ',
                '회: 회(膾)는 육류, 어패류를 날로 또는 익혀서 초간장, 초고추장, 겨자즙, 소금기름 등에 찍어 먹는 음식이다.',
                '편육: 편육은, 쇠고기나 돼지고기를 덩어리째 삶아 베보에 싸서 도마로 누른 다음 얇게 썬 것으로 양념장이나 새우젓국을 찍어 먹는다.',
                '튀각, 부각: 튀각은 다시마, 가죽나무순, 호두 따위를 기름에 바싹 튀긴 것이다. 부각은 재료를 그대로 말리거나 찹쌀풀이나 밥풀을 묻혀서 말렸다가 튀긴 반찬으로 감자, 고추, 깻잎, 김, 가죽나무잎 등으로 만든다.',
                '포: 육포는 주로 쇠고기를 간장으로 간하여 말리고, 어포는 생선을 그대로 통째로 말리거나 살을 떠서 소금 간을 하여 말린다.',
                '장아찌: 장아찌는 채소가 많은 철에 간장, 고추장, 된장 등에 넣어 저장해 두었다가 그 재료가 귀한 철에 먹는 찬품으로 장과(醬瓜)라고도 한다.',
                '김치: 채소류를 절여서 저장 발효시킨 음식으로 찬품 중에 가장 기본이다. 발효하는 동안에 유산균이 생겨서 독특한 신맛을 내고, 고추의 매운맛이 함께 어우러져 식욕을 돋우고 소화 작용도 돕는다. 채소류 외에 젓갈류를 함께 넣으면 맛이 더욱 좋아지고 동물성 단백질의 급원이 되기도 한다.',
                '젓갈: 어패류를 소금에 절여서 염장하여 만드는 저장 식품으로 어패류의 단백질 성분이 분해하면서 특유의 향과 맛을 낸다.',
            ],
        },
        {
            name: '양념류',
            items: [
                '기름: 식물성 기름으로 참기름(眞油)과 들기름(法油)을 주로 썼다. 궁중에서는 참깨로 만든 참기름을 음식에 두루 썼고 유과나 유밀과 만들 때도 많이 썼다.',
                '겨자: 갓의 씨앗을 빻아서 쓰는데 가루 자체에는 매운맛이 나지 않으며 더운물로 개어서 따뜻한 곳에 두어 매운맛이 나게 한 다음에 쓴다. 매운맛이 나면 식초, 설탕, 소금으로 간을 맞추어 겨자채나 회에 쓴다.',
                '깨소금: 참깨를 잘 일어서 씻어 건져 번철에 볶아 식기 전에 소금을 약간 넣고 절구에 반쯤 빻아서 양념으로 쓴다. 볶은 깨를 빻지 않고 통깨로 쓰기도 한다. 비벼서 속껍질까지 벗긴 깨를 실깨라고 하는데 희고 곱다.',
                '엿, 조청: 단맛을 내는 데 썼으나 지금은 물엿을 많이 쓴다.',
            ],
        },
        {
            name: '고명류',
            items: [
                '알고명: 흰자와 노른자를 나누어 거품이 일지 않게 풀어서 지단을 얇게 부친다. 채로 썰거나 완자형(다이아몬드 꼴) 또는 골패형(직사각형)으로 썰어서 웃기로 쓴다.',
                '미나리: 미나리를 씻어 잎을 떼고 다듬어 줄기만 4cm 길이로 잘라서 소금을 뿌려 살짝 절였다가 번철에 파랗게 볶아서 녹색 고명으로 쓴다. 실파를 대신 쓰거나 오이나 호박의 푸른 부분만 채로 썰어 볶아서 쓰기도 한다.',
                '고추: 고추는 덜 성숙한 풋고추도 쓰고, 익은 붉은색 고추도 쓴다. 대부분은 말려서 고춧가루로 빻아 찬물과 김치와 고추장에 쓴다. 실고추는 주로 고명으로 쓴다.',
                '호두, 은행: 호두는 속살이 부서지지 않게 까서 더운물에 불려서 속껍질을 깨끗이 벗기고, 은행은 단단한 껍질을 까고 번철을 달구어 기름을 약간 두르고 볶아 마른 행주나 종이로 비벼서 속껍질을 벗긴다.',
                '잣: 잣은 백자, 실백자, 해송자 등으로도 불린다. 껍질을 벗기고 고갈을 떼어 마른 도마에 종이를 깔고 칼로 다진다. 잣가루는 기름이 스며 나와 잘 뭉치므로 종이에 펴서 기름이 배어 나오도록 하여 보송보송한 가루로 하여 쓴다.',
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
