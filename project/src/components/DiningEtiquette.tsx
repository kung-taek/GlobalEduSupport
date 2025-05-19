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

const RuleItem = styled.li`
    margin-bottom: 12px;
    line-height: 1.6;
    font-size: 1.1rem;
    color: #555;
`;

const DiningEtiquette: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const headerText = mainTexts['dining_etiquette'] || '식사 예절';
    return (
        <>
            <Header>{headerText}</Header>
            <SectionWrapper>
                <div
                    style={{
                        padding: '30px',
                        width: '100%',
                        maxWidth: '800px',
                        margin: '0 auto',
                        color: '#333',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                >
                    <h3>식사 예절을 말하기에 앞서</h3>
                    <p>
                        한국의 전통적인 식사 예절은 어른에 대한 공손함, 음식의 존귀함을 내세우는 경우가 많습니다. 아래
                        항목에 평소 익혀두면 좋을 대중적인 식사 예절을 12가지로 정리해뒀습니다.
                    </p>
                    <h3 style={{ marginTop: '30px' }}>식사 예절 규칙</h3>
                    <ol style={{ paddingLeft: '20px' }}>
                        <RuleItem>1. 음식 그릇 위에 머리를 너무 지나치게 숙이지 않는다.</RuleItem>
                        <RuleItem>2. 음식을 입에 넣을 때마다 그릇에 가까이 하지 않는다.</RuleItem>
                        <RuleItem>3. 상 위에 있는 음식을 집어먹을 떄 옷소매가 음식을 건들지 않도록 조심한다.</RuleItem>
                        <RuleItem>4. 여러 사람이 음식을 먹는 중 먼저 식기를 내려놓고 일어나지 않도록 한다.</RuleItem>
                        <RuleItem>
                            5. 음식을 다 먹었을 시 일어나지 말고 식기를 그릇에 얹어놓고 기다려서 다른 사람들이 다 먹은
                            후에 식기를 같이 내려놓고 일어난다.
                        </RuleItem>
                        <RuleItem>6. 손윗사람이 먼저 식기를 든 후 아랫사람이 따라 든다.</RuleItem>
                        <RuleItem>7. 숟가락과 젓가락을 한손에 쥐지 않는다.</RuleItem>
                        <RuleItem>8. 국은 그릇째 들고 마시지 않는다.</RuleItem>
                        <RuleItem>9. 수저를 입 속 깊이 넣지 않는다.</RuleItem>
                        <RuleItem>10. 음식이 묻은 수저를 여럿이 먹는 음식에 넣지 않는다.</RuleItem>
                        <RuleItem>
                            11. 밥이나 국이 아무리 뜨거워도 입으로 불지 말고, 젓가락으로 소반을 두드리지 않는다.
                        </RuleItem>
                        <RuleItem>12. 음식을 먹을 때 소리를 크게 내지 않도록 조심한다.</RuleItem>
                    </ol>
                </div>
            </SectionWrapper>
        </>
    );
};

export default DiningEtiquette;
