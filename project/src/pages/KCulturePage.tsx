import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';

const Container = styled.div`
    padding: 24px 16px;
    max-width: 700px;
    width: 90vw;
    margin: 64px auto 0 auto;
    margin-top: 72px;
`;

const TitleBar = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    height: 48px;
    /* border-bottom: 1px solid #eee; */
    margin-bottom: 24px;
`;

const PageTitle = styled.div`
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background: #f8f8f8;
    z-index: 100;
    pointer-events: none;
`;

const AccordionSection = styled.div`
    margin-bottom: 24px;
`;

const AccordionHeader = styled.div<{ open: boolean }>`
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`;

const AccordionContent = styled.div`
    font-size: 15px;
    color: #444;
    margin-left: 8px;
    margin-bottom: 8px;
`;

const Arrow = styled.span<{ open: boolean }>`
    display: inline-block;
    margin-left: 8px;
    transition: transform 0.2s;
    transform: rotate(${(props) => (props.open ? '90deg' : '0deg')});
`;

// KCulturePageContent 컴포넌트
const KCulturePageContent: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { texts, isLoading } = useTranslation();
    const pageTexts = texts['kculture'] || {};

    const accordionData = [
        {
            title: pageTexts['transportation'] || '교통수단?',
            content: pageTexts['transportation_content'] || '여기에 텍스트를 채울 수 있습니다.',
        },
        {
            title: pageTexts['dining_etiquette'] || '식사 예절?',
            content: pageTexts['dining_etiquette_content'] || '식사 예절에 대한 내용입니다.',
        },
        {
            title: pageTexts['korean_food'] || '한국의 음식?',
            content: pageTexts['korean_food_content'] || '한국의 음식에 대한 내용입니다.',
        },
        {
            title: pageTexts['traditional_culture'] || '전통 문화?',
            content: pageTexts['traditional_culture_content'] || '전통 문화에 대한 내용입니다.',
        },
    ];

    return (
        <Container>
            <TitleBar>
                <PageTitle>{pageTexts['k_culture_title'] || 'K- 문화?'}</PageTitle>
            </TitleBar>
            {accordionData.map((item, idx) => (
                <AccordionSection key={item.title}>
                    <AccordionHeader
                        open={openIndex === idx}
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    >
                        {item.title}
                        <Arrow open={openIndex === idx}>{'>'}</Arrow>
                    </AccordionHeader>
                    {openIndex === idx && item.content && <AccordionContent>{item.content}</AccordionContent>}
                </AccordionSection>
            ))}
        </Container>
    );
};

export default KCulturePageContent;
