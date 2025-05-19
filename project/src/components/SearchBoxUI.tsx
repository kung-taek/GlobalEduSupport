import styled from 'styled-components';

const SearchBoxWrapper = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    z-index: 1000;
`;

const Panel = styled.div`
    width: 100%;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(44, 62, 80, 0.13);
    padding: 24px;
    margin: 40px 0 0 0;
    @media (max-width: 600px) {
        width: 100%;
        margin: 40px auto 0 auto;
    }
`;
