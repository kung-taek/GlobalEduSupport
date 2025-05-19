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

// 새로운 테이블 구조를 위한 styled 컴포넌트 추가
const TransportationTable = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
`;

const TransportationRow = styled.div`
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const LeftCell = styled.div`
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #f8f8f8;
    @media (max-width: 768px) {
        flex: none;
        width: 100%;
        padding: 10px;
    }
`;

const RightCell = styled.div`
    flex: 1;
    padding: 20px;
    color: #333;
    @media (max-width: 768px) {
        width: 100%;
        padding: 10px;
    }
`;

const TransportationName = styled.h4`
    margin-top: 0;
    margin-bottom: 10px;
    text-align: center;
`;

const TransportationPhotoPlaceholder = styled.div`
    width: 200px;
    height: 150px;
    background: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    font-size: 0.9rem;
    border-radius: 4px;
`;

const TransportationContent = styled.div`
    line-height: 1.6;
`;

// 새로운 아코디언 구조를 위한 styled 컴포넌트 추가
const AccordionContainer = styled.div`
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
`;

const AccordionHeader = styled.div`
    font-weight: bold;
    cursor: pointer;
    color: #007bff;
    &:hover {
        text-decoration: underline;
    }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
    max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    padding-top: ${({ $isOpen }) => ($isOpen ? '15px' : '0')};
`;

const RouteImage = styled.img`
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
`;

// 버스 노선 표 구조를 위한 styled 컴포넌트 추가
const BusRouteTable = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    max-height: 300px;
    overflow-y: auto;
`;

const BusRouteRow = styled.div`
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const BusRouteNumberCell = styled.div`
    flex: 0 0 120px;
    padding: 10px;
    font-weight: bold;
    background: #f8f8f8;
    border-right: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 768px) {
        flex: none;
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #eee;
        justify-content: flex-start;
    }
`;

const BusRouteDetailsCell = styled.div`
    flex: 1;
    padding: 10px;
    display: flex;
    align-items: center;
`;

// 메인 콘텐츠 영역을 감싸고 너비를 제한하는 styled 컴포넌트 추가
const ContentArea = styled.div`
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;

    @media (max-width: 768px) {
        padding: 0 10px;
    }
`;

const Transportation: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const headerText = mainTexts['transportation'] || '교통수단';

    // 아코디언 상태 관리 (어떤 항목이 열려 있는지 인덱스로 저장)
    const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

    // 아코디언 토글 함수
    const toggleAccordion = (index: number) => {
        setOpenAccordionIndex(openAccordionIndex === index ? null : index);
    };

    // 여기에 교통수단 데이터를 배열로 정의 (버스 routeInfo 구조 변경)
    const transportationData = [
        {
            name: '버스',
            photo: '버스 사진', // 실제 이미지 태그 또는 컴포넌트로 변경
            content: '여기에 버스에 대한 설명 내용을 입력하세요.',
            routeInfo: {
                type: 'bus_routes', // 내용 타입: 버스 노선 표
                content: [
                    // 버스 노선 배열
                    {
                        number: '급행 803',
                        details:
                            '경산역-경산시장-경산 시외버스정류장-영남대역-압량읍 행정복시젠터-하양 꿈바우 시장-하양역 건너-하양 시외버스 터미널-와촌면 행정복지센터',
                    },
                    {
                        number: '803',
                        details:
                            '대구대학교(경산캠퍼스)-내리리-대구대삼거리-부기2리-금락초교-하양역-하양읍행정복지센터-무학교-하양금호어울림A-도리리-하양성당-하양여중고-와촌면행정복지센터-와촌초교-동강삼거리-소월입구-방거리-박사리-대동초교-신한교차로-천성암-솔매기-원효암-약사암입구-갓바위(선본사)',
                    },
                    {
                        number: '803-1',
                        details:
                            '펜타힐즈더샵2차-힐스테이트A-펜타힐즈더샵1차-이마트경산점-서부2동행정복지센터-경산시장-경산시외버스정류장-임당역-영남대-신대부적지구-경산병영유적지-현흥초교-현흥2리-선화리청구-진량우체국-영남신학대학교-진량성당-코오롱공장-대구대삼거리-내리리-대구대',
                    },
                    {
                        number: '809',
                        details:
                            '삼도뷰엔빌-백천주공-경산중앙병원-옥곡초교-옥산네거리-서부2동행정복지센터-중산삼거리-정평역-영대고-임당역-영남대-압량읍행정복지센터-부적2리-현흥초교-환상교회-대조2리-대부잠수교-경일대-부호역-대구가톨릭대학교-하양역-하양시장-동서오거리-부림한방병원-용천2리',
                    },
                    {
                        number: '814',
                        details:
                            '대구대-대구대삼거리-금락초교-하양역-부호역-청천역-숙천동-안심역-동부경찰서-안심지구대-반야월시장-정동고등학교-용계삼거리-우방강촌마을-망우당공원-대구마이스터고교-아양교역-동구청-KT동대구지사-동대구역-상공회의소-법원-그랜드호텔-어린이세상-황금네거리-TBC-대구경찰청-동아백화점수성점-범물2동행정복지센터-진밭골',
                    },
                    {
                        number: '818',
                        details:
                            '대구대-대구대삼거리-금락초교-하양역-경일호산대학교-청천초교-청천리-동부경찰서-반야월시장-정동고등학교-용계삼거리-방촌역-방촌시장-해안역-홈플러스동촌점-입석중학교-아양교-동구청-KT동대구지사-동대구역-동대구역복합환승센터-대구지방법원등기국-국립대구박물관-동구시장-수성도서관-영남일보-상공회의소',
                    },
                    {
                        number: '818-1',
                        details:
                            '경일대-호산대-부호역-대구가톨릭대학교-하양시외버스터미널-하양역-하양초등학교-하양대구은행-부기리LH아파트-부기2리-대구대삼거리-상림리-내리리-대구대-내리리-상림리-대구대삼거리-부기리-코오롱공장-북1리-삼주봉황타운-영남신학대학-진량우방A-진량보국웰리치A-금정사-황제리-진량황제A',
                    },
                    {
                        number: '894',
                        details:
                            '경일대-부호역-하양시외버스터미널-하양대구은행-부기리LH아파트-사동성당-대구대삼거리-대구대-내리리-코오롱공장-진량성당-진량우체국-연지입구-현흥초교-부적2리-압량읍행정복지센터-영남대-임당역-경산시외버스정류장-옥산농협-대구시지노인전문병원-대구스타디움-수성알파시티역-방공포병학교-만촌우방1차-두리봉터널-수성소방서-동아백화점수성점-범물1동행정복지센터',
                    },
                    {
                        number: '급행 803',
                        details:
                            '경산역-경산시장-경산 시외버스정류장-영남대역-압량읍 행정복시젠터-하양 꿈바우 시장-하양역 건너-하양 시외버스 터미널-와촌면 행정복지센터',
                    },
                ],
            },
        },
        {
            name: '지하철',
            photo: 'ㅁㅁㅁㅁㅁ', // 실제 이미지 태그 또는 컴포넌트로 변경
            content: '여기에 지하철에 대한 설명 내용을 입력하세요.',
            routeInfo: {
                type: 'image', // 내용 타입: 이미지
                content: 'daegu.png', // 지하철 노선도 이미지 파일 경로 또는 URL
            },
        },
        {
            name: '택시',
            photo: '택시 사진', // 실제 이미지 태그 또는 컴포넌트로 변경
            content: '여기에 택시에 대한 설명 내용을 입력하세요.',
            routeInfo: null, // 택시에는 아코디언 없음
        },
        // 필요한 만큼 항목 추가
    ];

    return (
        <>
            <Header>{headerText}</Header>
            <SectionWrapper>
                <Section>
                    {/* ContentArea로 콘텐츠 감싸기 */}
                    <ContentArea>
                        <TransportationTable>
                            {transportationData.map((item, index) => (
                                <TransportationRow key={index}>
                                    <LeftCell>
                                        <TransportationName>{item.name}</TransportationName>
                                        <TransportationPhotoPlaceholder>{item.photo}</TransportationPhotoPlaceholder>
                                    </LeftCell>
                                    <RightCell>
                                        <TransportationContent>{item.content}</TransportationContent>

                                        {/* routeInfo가 있는 항목에만 아코디언 추가 */}
                                        {item.routeInfo && (
                                            <AccordionContainer>
                                                <AccordionHeader onClick={() => toggleAccordion(index)}>
                                                    노선 정보 {openAccordionIndex === index ? '숨기기' : '보기'}
                                                </AccordionHeader>
                                                <AccordionContent $isOpen={openAccordionIndex === index}>
                                                    {/* 내용 타입에 따라 렌더링 */}
                                                    {item.routeInfo.type === 'bus_routes' &&
                                                        Array.isArray(item.routeInfo.content) && (
                                                            <BusRouteTable>
                                                                {item.routeInfo.content.map((route, routeIndex) => (
                                                                    <BusRouteRow key={routeIndex}>
                                                                        <BusRouteNumberCell>
                                                                            {route.number}
                                                                        </BusRouteNumberCell>
                                                                        <BusRouteDetailsCell>
                                                                            {route.details}
                                                                        </BusRouteDetailsCell>
                                                                    </BusRouteRow>
                                                                ))}
                                                            </BusRouteTable>
                                                        )}
                                                    {item.routeInfo.type === 'image' &&
                                                        typeof item.routeInfo.content === 'string' && (
                                                            <RouteImage
                                                                src={item.routeInfo.content}
                                                                alt={`${item.name} 노선도`}
                                                            />
                                                        )}
                                                </AccordionContent>
                                            </AccordionContainer>
                                        )}
                                    </RightCell>
                                </TransportationRow>
                            ))}
                        </TransportationTable>
                    </ContentArea>
                </Section>
            </SectionWrapper>
        </>
    );
};

export default Transportation;
