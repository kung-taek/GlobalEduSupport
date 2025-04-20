import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { pool } from '../models/database.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Google OAuth 전략 설정
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const username = profile.displayName;

                // 기존 사용자 확인
                const [users] = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [
                    googleId,
                    email,
                ]);

                let user;
                if (users.length === 0) {
                    // 새 사용자 생성
                    const [result] = await pool.query(
                        'INSERT INTO users (username, email, google_id, provider) VALUES (?, ?, ?, ?)',
                        [username, email, googleId, 'google']
                    );
                    user = {
                        id: result.insertId,
                        username,
                        email,
                        googleId,
                        provider: 'google',
                    };
                } else {
                    user = users[0];
                    // 기존 사용자의 Google 정보 업데이트
                    if (!user.google_id) {
                        await pool.query('UPDATE users SET google_id = ?, provider = ? WHERE id = ?', [
                            googleId,
                            'google',
                            user.id,
                        ]);
                    }
                }

                // JWT 토큰 생성
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
                    expiresIn: '24h',
                });

                return done(null, { ...user, token });
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// 세션 직렬화
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// 세션 역직렬화
passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
