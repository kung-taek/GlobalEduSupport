export const login = (req, res) => {
    // 로그인 로직 구현
    res.send('로그인 성공');
};

export const register = (req, res) => {
    // 회원가입 로직 구현
    const message = '회원가입 성공?';
    console.log('응답 메시지:', message);
    res.send(message);
};
