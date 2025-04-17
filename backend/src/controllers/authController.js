import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../models/database.js';

exports.register = async (req, res) => {
    const { username, email, password, provider = 'local', google_id = null } = req.body;
    try {
        // 이메일 중복 검사
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
        }

        // 비밀번호 해시 처리
        const hashedPassword = await bcrypt.hash(password, 10);

        // 유저 정보 DB에 삽입
        await pool.query('INSERT INTO users (username, email, password, provider, google_id) VALUES (?, ?, ?, ?, ?)', [
            username,
            email,
            hashedPassword,
            provider,
            google_id,
        ]);

        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        res.status(500).json({ error: '회원가입 중 오류 발생' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 유저 조회
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        // JWT 발급
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: '로그인 성공', token });
    } catch (error) {
        res.status(500).json({ error: '로그인 중 오류 발생' });
    }
};
