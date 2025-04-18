import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { pool } from '../models/database.js';
import bcrypt from 'bcryptjs';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://globalhelper.p-e.kr:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails[0].value;
                const username = profile.displayName;

                // 기존 사용자 조회
                const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);

                if (rows.length === 0) {
                    // 사용자 없으면 추가
                    await pool.query(
                        "INSERT INTO users (username, email, provider, google_id) VALUES (?, ?, 'google', ?)",
                        [username, email, googleId]
                    );
                }

                return done(null, { email, googleId, username });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
