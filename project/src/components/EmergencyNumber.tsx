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

const TableWrapper = styled.div`
    width: 100vw;
    padding-top: 80px;
    display: flex;
    justify-content: center;
    border: 1px solid #000;
`;

const Table = styled.table`
    border-collapse: collapse;
    width: 90vw;
    max-width: 700px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(44, 62, 80, 0.1);
    border: 2px solid #000;
`;

const Th = styled.th`
    background: #23272f;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 16px 8px;
    border-bottom: 2px solid #181c20;
    border: 1px solid #000;
`;

const Td = styled.td`
    padding: 14px 8px;
    font-size: 1.05rem;
    border-bottom: 1px solid #eee;
    text-align: center;
    border: 1px solid #000;
`;

const TelLink = styled.a`
    color: #23272f;
    text-decoration: underline;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        color: #007bff;
    }
`;

// 번호 리스트
const callNumbers = ['112', '119', '1301', '182', '111', '1345', '1644-0644', '1332', '120', '1588-7722'];

const EmergencyNumber: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const headerText = mainTexts['emergency_number'] || '긴급 전화번호';
    // 번호별 키워드: main[번호] 값
    const rows = callNumbers
        .map((num) => ({
            callnumber: num,
            callkeyword: mainTexts[num] || '',
        }))
        .filter((row) => row.callnumber && row.callkeyword); // 값이 없는 빈 칸 제거
    return (
        <>
            <Header>{headerText}</Header>
            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>전화번호</Th>
                            <Th>키워드</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <Td>
                                    <TelLink href={`tel:${row.callnumber}`}>{row.callnumber}</TelLink>
                                </Td>
                                <Td>{row.callkeyword}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        </>
    );
};

export default EmergencyNumber;
