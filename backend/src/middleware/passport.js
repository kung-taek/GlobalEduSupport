import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { pool } from '../models/database.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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
                console.log('Google Strategy - Profile:', profile._json);
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const username = profile.displayName;
                let locale = profile._json?.locale?.split('-')[0] || null;

                // locale이 없으면 accessToken으로 userinfo API 직접 호출
                if (!locale && accessToken) {
                    try {
                        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                        console.log('Google userinfo API 전체 응답:', res.data);
                        locale = res.data.locale ? res.data.locale.split('-')[0] : null;
                        console.log('Google userinfo API locale:', res.data.locale);
                    } catch (err) {
                        console.error('Google userinfo API locale fetch error:', err.message, err.response?.data);
                    }
                }

                console.log('Google Strategy - User Info:', { googleId, email, username, locale });

                // 기존 사용자 확인
                const [users] = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [
                    googleId,
                    email,
                ]);

                console.log('Google Strategy - Existing Users:', users);

                let user;
                if (users.length === 0) {
                    // 새 사용자 생성
                    const [result] = await pool.query(
                        'INSERT INTO users (username, email, google_id, provider, locale) VALUES (?, ?, ?, ?, ?)',
                        [username, email, googleId, 'google', locale]
                    );
                    user = {
                        id: result.insertId,
                        username,
                        email,
                        googleId,
                        provider: 'google',
                        locale: locale,
                    };
                    console.log('Google Strategy - New User Created:', user);
                } else {
                    user = users[0];
                    // 기존 사용자의 Google 정보/locale 업데이트
                    if (!user.google_id || !user.locale) {
                        await pool.query('UPDATE users SET google_id = ?, provider = ?, locale = ? WHERE id = ?', [
                            googleId,
                            'google',
                            locale,
                            user.id,
                        ]);
                        user.google_id = googleId;
                        user.provider = 'google';
                        user.locale = locale;
                        console.log('Google Strategy - Updated Existing User:', user);
                    }
                }

                // JWT 토큰 생성
                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        provider: user.provider,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                console.log('Google Strategy - Token Generated:', token);

                return done(null, { ...user, token });
            } catch (error) {
                console.error('Google Strategy - Error:', error);
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
