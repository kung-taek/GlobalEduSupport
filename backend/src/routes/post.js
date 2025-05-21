import express from 'express';
import * as postController from '../controllers/postController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// 게시글 작성
router.post('/', authenticateToken, upload.single('image'), postController.createPost);

// 게시글 수정
router.put('/:id', authenticateToken, postController.updatePost);

// 게시글 삭제
router.delete('/:id', authenticateToken, postController.deletePost);

// 게시글 조회수 증가
router.post('/:id/view', postController.increaseViewCount);

// 게시글 추천
router.post('/:id/like', authenticateToken, postController.likePost);

// 게시글 검색
router.get('/search', postController.searchPosts);

// 댓글 작성
router.post('/:id/comments', authenticateToken, postController.createComment);

// 댓글 수정
router.put('/comments/:id', authenticateToken, postController.updateComment);

// 댓글 삭제
router.delete('/comments/:id', authenticateToken, postController.deleteComment);

// 레벨업 체크
router.get('/check-level', authenticateToken, postController.checkLevelUp);

// 댓글 조회
router.get('/:id/comments', postController.getComments);

// 게시글 상세 조회
router.get('/:id', postController.getPost);

export default router;
