const jwt = 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Received Token:', token); // ✅ 토큰 출력

    if (!token) return res.status(403).json({ error: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Verification Error:', err);
            return res.status(403).json({ error: 'Access Denied' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
