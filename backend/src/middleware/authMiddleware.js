import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    // Bearer 접두어가 있으면 제거
    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
