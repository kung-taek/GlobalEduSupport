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
    flex-direction: row;
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

const Section = styled.div<{ bg: string }>`
    width: 50vw;
    height: 100%;
    background: ${({ bg }) => bg};
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 0;
    @media (max-width: 768px) {
        width: 100vw;
        height: 50%;
    }
`;

const Dialect: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const headerText = mainTexts['dialect'] || '사투리';
    return (
        <>
            <Header>{headerText}</Header>
            <SectionWrapper>
                <Section bg="#e53935">
                    <h3>섹션 1</h3>
                    <p>여기는 빨간 배경의 섹션입니다.</p>
                </Section>
                <Section bg="#1e88e5">
                    <h3>섹션 2</h3>
                    <p>여기는 파란 배경의 섹션입니다.</p>
                </Section>
            </SectionWrapper>
        </>
    );
};

export default Dialect;
