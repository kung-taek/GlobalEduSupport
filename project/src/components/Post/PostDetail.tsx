import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../contexts/TranslationContext';

const Container = styled.div`
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
`;

const PostContainer = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PostHeader = styled.div`
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
`;

const PostTitle = styled.h1`
    margin: 0 0 15px 0;
    font-size: 1.8rem;
    color: #23272f;
`;

const PostInfo = styled.div`
    display: flex;
    gap: 20px;
    color: #666;
    font-size: 0.9rem;
`;

const PostContent = styled.div`
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #23272f;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #181c20;
    }
`;

const CommentSection = styled.div`
    margin-top: 40px;
`;

const CommentForm = styled.form`
    margin-bottom: 30px;
`;

const CommentInput = styled.textarea`
    width: 100%;
    height: 100px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
    resize: vertical;
`;

const CommentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Comment = styled.div`
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
`;

const CommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const CommentContent = styled.div`
    color: #333;
`;

interface Post {
    id: number;
    title: string;
    content: string;
    board_type: 'free' | 'info';
    views: number;
    likes: number;
    created_at: string;
    username: string;
    level: number;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    username: string;
    parent_id: number | null;
}

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [parentCommentId, setParentCommentId] = useState<number | null>(null);

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await axios.get<Post>(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}`);
            setPost(response.data);
        } catch (error) {
            console.error('게시글 조회 실패:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get<Comment[]>(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/comments`
            );
            setComments(response.data);
        } catch (error) {
            console.error('댓글 조회 실패:', error);
        }
    };

    const handleLike = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/like`);
            fetchPost();
        } catch (error) {
            console.error('추천 실패:', error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/comments`, {
                content: newComment,
                parent_id: parentCommentId,
            });
            setNewComment('');
            setParentCommentId(null);
            fetchComments();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    const handleReply = (commentId: number) => {
        setParentCommentId(commentId);
    };

    const handleEdit = () => {
        navigate(`/community/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}`);
                navigate('/community');
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
            }
        }
    };

    if (!post) return <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>로딩중...</div>;

    return (
        <Container>
            <PostContainer>
                <PostHeader>
                    <PostTitle>{post.title}</PostTitle>
                    <PostInfo>
                        <span>
                            {post.username} <span style={{ color: '#0078ff', fontWeight: 700 }}>Lv.{post.level}</span>
                        </span>
                        <span>
                            {mainTexts['lookcount'] || '조회수'} {post.views}
                        </span>
                        <span>
                            {mainTexts['postrespect'] || '추천'} {post.likes}
                        </span>
                        <span>{new Date(post.created_at).toLocaleString('ko-KR', { hour12: false })}</span>
                    </PostInfo>
                </PostHeader>
                <PostContent>{post.content}</PostContent>
                <ButtonGroup>
                    <Button onClick={handleLike}>추천</Button>
                    {user && user.username === post.username && (
                        <>
                            <Button onClick={handleEdit}>수정</Button>
                            <Button onClick={handleDelete}>삭제</Button>
                        </>
                    )}
                </ButtonGroup>
            </PostContainer>

            <CommentSection>
                <h2>댓글</h2>
                <CommentForm onSubmit={handleCommentSubmit}>
                    <CommentInput
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성하세요..."
                    />
                    <Button type="submit">댓글 작성</Button>
                </CommentForm>

                <CommentList>
                    {comments.map((comment) => (
                        <Comment key={comment.id}>
                            <CommentHeader>
                                <div>
                                    <strong>{comment.username}</strong>
                                    <span style={{ marginLeft: '10px', color: '#666' }}>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <Button onClick={() => handleReply(comment.id)}>답글</Button>
                            </CommentHeader>
                            <CommentContent>{comment.content}</CommentContent>
                        </Comment>
                    ))}
                </CommentList>
            </CommentSection>
        </Container>
    );
};

export default PostDetail;
