import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { pool } from '../models/database.js';
import jwt from 'jsonwebtoken';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://13.124.18.66:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const username = profile.displayName;

                // 기존 사용자 조회 (google_id 또는 email로)
                const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [
                    googleId,
                    email,
                ]);

                let user;
                if (rows.length === 0) {
                    // 새 사용자 추가
                    const [result] = await pool.query(
                        "INSERT INTO users (username, email, provider, google_id) VALUES (?, ?, 'google', ?)",
                        [username, email, googleId]
                    );
                    user = {
                        id: result.insertId,
                        email,
                        username,
                        googleId,
                        provider: 'google',
                    };
                } else {
                    user = rows[0];
                    // 기존 로컬 사용자가 구글 로그인을 시도하는 경우
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
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
