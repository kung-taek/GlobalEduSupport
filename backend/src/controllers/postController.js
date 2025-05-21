import { pool } from '../models/database.js';

// 게시글 작성
export const createPost = async (req, res) => {
    try {
        const { title, content, board_type, image_url } = req.body;
        const user_id = req.user.id; // 인증된 사용자의 ID

        const query = `
            INSERT INTO posts (user_id, board_type, title, content, image_url)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [user_id, board_type, title, content, image_url]);

        // 작성자 경험치 증가 (게시글 작성 +10)
        await pool.query('UPDATE users SET exp = exp + 10 WHERE id = ?', [user_id]);

        res.status(201).json({ message: '게시글이 작성되었습니다.', postId: result.insertId });
    } catch (error) {
        console.error('게시글 작성 에러:', error);
        res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
    }
};

// 게시글 수정
export const updatePost = async (req, res) => {
    try {
        const { title, content, image_url } = req.body;
        const postId = req.params.id;
        const user_id = req.user.id;

        // 게시글 작성자 확인
        const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
        if (post[0].user_id !== user_id) {
            return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });
        }

        const query = `
            UPDATE posts 
            SET title = ?, content = ?, image_url = ?
            WHERE id = ? AND user_id = ?
        `;

        await pool.query(query, [title, content, image_url, postId, user_id]);
        res.json({ message: '게시글이 수정되었습니다.' });
    } catch (error) {
        console.error('게시글 수정 에러:', error);
        res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.' });
    }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const user_id = req.user.id;

        // 게시글 작성자 확인
        const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
        if (post[0].user_id !== user_id) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }

        await pool.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [postId, user_id]);
        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 에러:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
};

// 게시글 조회수 증가
export const increaseViewCount = async (req, res) => {
    try {
        const postId = req.params.id;
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [postId]);
        res.json({ message: '조회수가 증가되었습니다.' });
    } catch (error) {
        console.error('조회수 증가 에러:', error);
        res.status(500).json({ message: '조회수 증가 중 오류가 발생했습니다.' });
    }
};

// 게시글 추천
export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const user_id = req.user.id;

        // 이미 추천했는지 확인
        const [existingLike] = await pool.query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [
            postId,
            user_id,
        ]);

        if (existingLike.length > 0) {
            return res.status(400).json({ message: '이미 추천한 게시글입니다.' });
        }

        // 추천 추가
        await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, user_id]);

        // 게시글 추천수 증가
        await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);

        // 작성자 경험치 증가 (추천 받음 +5)
        const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
        await pool.query('UPDATE users SET exp = exp + 5 WHERE id = ?', [post[0].user_id]);

        res.json({ message: '게시글을 추천했습니다.' });
    } catch (error) {
        console.error('게시글 추천 에러:', error);
        res.status(500).json({ message: '게시글 추천 중 오류가 발생했습니다.' });
    }
};

// 게시글 검색
export const searchPosts = async (req, res) => {
    try {
        const { keyword, board_type } = req.query;
        let query = `
            SELECT p.*, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        if (keyword) {
            query += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (board_type) {
            query += ` AND p.board_type = ?`;
            params.push(board_type);
        }

        query += ` ORDER BY p.created_at DESC`;

        const [posts] = await pool.query(query, params);
        res.json(posts);
    } catch (error) {
        console.error('게시글 검색 에러:', error);
        res.status(500).json({ message: '게시글 검색 중 오류가 발생했습니다.' });
    }
};

// 댓글 작성
export const createComment = async (req, res) => {
    try {
        const { post_id, content, parent_id } = req.body;
        const user_id = req.user.id;

        const query = `
            INSERT INTO comments (post_id, user_id, parent_id, content)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [post_id, user_id, parent_id, content]);

        // 작성자 경험치 증가 (댓글 작성 +5)
        await pool.query('UPDATE users SET exp = exp + 5 WHERE id = ?', [user_id]);

        res.status(201).json({ message: '댓글이 작성되었습니다.', commentId: result.insertId });
    } catch (error) {
        console.error('댓글 작성 에러:', error);
        res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
    }
};

// 댓글 수정
export const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.id;
        const user_id = req.user.id;

        // 댓글 작성자 확인
        const [comment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [commentId]);
        if (comment[0].user_id !== user_id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        await pool.query('UPDATE comments SET content = ? WHERE id = ? AND user_id = ?', [content, commentId, user_id]);
        res.json({ message: '댓글이 수정되었습니다.' });
    } catch (error) {
        console.error('댓글 수정 에러:', error);
        res.status(500).json({ message: '댓글 수정 중 오류가 발생했습니다.' });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user_id = req.user.id;

        // 댓글 작성자 확인
        const [comment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [commentId]);
        if (comment[0].user_id !== user_id) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        await pool.query('DELETE FROM comments WHERE id = ? AND user_id = ?', [commentId, user_id]);
        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error('댓글 삭제 에러:', error);
        res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
    }
};

// 레벨업 체크
export const checkLevelUp = async (req, res) => {
    try {
        const user_id = req.user.id;

        // 사용자의 현재 경험치와 레벨 조회
        const [user] = await pool.query('SELECT exp, level FROM users WHERE id = ?', [user_id]);

        // 다음 레벨의 필요 경험치 조회
        const [nextLevel] = await pool.query('SELECT required_exp FROM user_levels WHERE level = ?', [
            user[0].level + 1,
        ]);

        if (nextLevel.length > 0 && user[0].exp >= nextLevel[0].required_exp) {
            // 레벨업
            await pool.query('UPDATE users SET level = level + 1 WHERE id = ?', [user_id]);
            res.json({
                message: '레벨업했습니다!',
                newLevel: user[0].level + 1,
            });
        } else {
            res.json({
                message: '아직 레벨업할 수 없습니다.',
                currentExp: user[0].exp,
                nextLevelExp: nextLevel[0]?.required_exp || '최대 레벨',
            });
        }
    } catch (error) {
        console.error('레벨업 체크 에러:', error);
        res.status(500).json({ message: '레벨업 체크 중 오류가 발생했습니다.' });
    }
};

// 게시글 상세 조회
export const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const [rows] = await pool.query(
            `SELECT p.*, u.username, u.level
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [postId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('게시글 상세 조회 에러:', error);
        res.status(500).json({ message: '게시글 상세 조회 중 오류가 발생했습니다.' });
    }
};
