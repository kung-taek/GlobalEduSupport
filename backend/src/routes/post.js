import express from 'express';
import * as postController from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 게시글 작성
router.post('/', auth, postController.createPost);

// 게시글 수정
router.put('/:id', auth, postController.updatePost);

// 게시글 삭제
router.delete('/:id', auth, postController.deletePost);

// 게시글 조회수 증가
router.post('/:id/view', postController.increaseViewCount);

// 게시글 추천
router.post('/:id/like', auth, postController.likePost);

// 게시글 검색
router.get('/search', postController.searchPosts);

// 댓글 작성
router.post('/:postId/comments', auth, postController.createComment);

// 댓글 수정
router.put('/comments/:id', auth, postController.updateComment);

// 댓글 삭제
router.delete('/comments/:id', auth, postController.deleteComment);

// 레벨업 체크
router.get('/check-level', auth, postController.checkLevelUp);

export default router;
