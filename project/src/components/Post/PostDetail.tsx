import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../contexts/TranslationContext';

const Container = styled.div`
    width: 50vw;
    min-width: 400px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    @media (max-width: 768px) {
        width: 100vw;
        min-width: unset;
        max-width: 100vw;
        padding: 20px 0;
    }
`;

const PostContainer = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PostHeader = styled.div`
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 0;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const TitleCell = styled.div`
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: #23272f;
    min-height: 2.2rem;
`;

const InfoCell = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 0.97rem;
    color: #666;
    gap: 18px;
`;

const EditCell = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const PostContent = styled.div`
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 32px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 0;
    margin-left: 0;
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
    margin-top: 0;
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

const BackButton = styled.button`
    padding: 0 16px;
    height: 2.2rem;
    border: none;
    border-radius: 6px;
    background: #eee;
    color: #23272f;
    font-weight: bold;
    cursor: pointer;
    font-size: 1.5rem;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    &:hover {
        background: #23272f;
        color: #fff;
    }
`;

// 댓글 액션(수정 | 삭제) 텍스트 스타일
const CommentActions = styled.div`
    margin-top: 8px;
    font-size: 0.92rem;
    color: #888;
    display: flex;
    gap: 8px;
    align-items: center;
    a,
    span {
        cursor: pointer;
        color: #888;
        text-decoration: none;
        &:hover {
            color: #23272f;
        }
    }
`;

// 게시글 액션(수정 | 삭제) 텍스트 스타일
const PostActions = styled.div`
    margin-top: 8px;
    font-size: 0.92rem;
    color: #888;
    display: flex;
    gap: 8px;
    align-items: center;
    a,
    span {
        cursor: pointer;
        color: #888;
        text-decoration: none;
        &:hover {
            color: #23272f;
        }
    }
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
    image_url?: string;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    username: string;
    parent_id: number | null;
}

// 댓글 트리 구조 변환 함수 추가
function buildCommentTree(comments: Comment[]) {
    const map = new Map<number, Comment & { children?: Comment[] }>();
    const roots: (Comment & { children?: Comment[] })[] = [];
    comments.forEach((c) => map.set(c.id, { ...c }));
    comments.forEach((c) => {
        if (c.parent_id) {
            const parent = map.get(c.parent_id);
            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(map.get(c.id)!);
            }
        } else {
            roots.push(map.get(c.id)!);
        }
    });
    return roots;
}

// 게시글 시간 포맷 함수 변경
const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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
        // 조회수 증가
        if (id) {
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/view`).catch(() => {});
        }
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
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/like`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchPost();
        } catch (error) {
            console.error('추천 실패:', error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (parentCommentId) return; // 답글 입력 중에는 메인 댓글 작성 방지
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/comments`,
                {
                    content: newComment,
                    parent_id: null,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
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

    const handleReplySubmit = async (parentId: number) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}/comments`,
                {
                    content: newComment,
                    parent_id: parentId,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setNewComment('');
            setParentCommentId(null);
            fetchComments();
        } catch (error) {
            console.error('답글 작성 실패:', error);
        }
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

    const handleEditComment = (id: number) => {
        // TODO: 댓글 수정 로직 구현
        alert('댓글 수정 기능은 추후 구현 예정입니다.');
    };

    const handleDeleteComment = (id: number) => {
        // TODO: 댓글 삭제 로직 구현
        if (window.confirm('정말 댓글을 삭제하시겠습니까?')) {
            // 삭제 API 호출 등
            alert('댓글 삭제 기능은 추후 구현 예정입니다.');
        }
    };

    // 댓글 입력창 클릭 시 로그인 체크
    const handleCommentInputFocus = () => {
        if (!user) navigate('/login');
    };

    // 답글 버튼 클릭 시 로그인 체크
    const handleReplyClick = (commentId: number) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setParentCommentId(commentId);
    };

    if (!post) return <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>로딩중...</div>;

    return (
        <Container>
            <PostContainer>
                <PostHeader>
                    <HeaderRow>
                        <TitleCell>{post.title}</TitleCell>
                    </HeaderRow>
                    <HeaderRow style={{ marginTop: 8 }}>
                        <InfoCell>
                            <span>{post.username}</span>
                            <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
                            <span style={{ color: '#0078ff', fontWeight: 700 }}>Lv.{post.level}</span>
                            <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
                            <span>
                                {mainTexts['lookcount']} {post.views}
                            </span>
                            <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
                            <span>
                                {mainTexts['postrespect']} {post.likes}
                            </span>
                            <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>
                            <span>{formatDate(post.created_at)}</span>
                        </InfoCell>
                    </HeaderRow>
                </PostHeader>
                {post.image_url && (
                    <div style={{ marginBottom: 18 }}>
                        <img
                            src={post.image_url}
                            alt="post"
                            style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid #eee' }}
                        />
                    </div>
                )}
                <PostContent>{post.content}</PostContent>
            </PostContainer>

            <CommentSection>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 16 }}>
                    <ButtonGroup>
                        <Button onClick={handleLike}>
                            {mainTexts['postrespect']} {post.likes}
                        </Button>
                    </ButtonGroup>
                    <PostActions>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>
                            {mainTexts['topostlist']}
                        </span>
                        {user && user.username === post.username && (
                            <>
                                <span>|</span>
                                <span onClick={handleEdit}>{mainTexts['postupdate']}</span>
                                <span>|</span>
                                <span onClick={handleDelete}>{mainTexts['postdelete']}</span>
                            </>
                        )}
                    </PostActions>
                </div>
                <h2>{mainTexts['postcomment']}</h2>
                <CommentList>
                    {buildCommentTree(comments).map((comment) => (
                        <CommentTreeItem
                            key={comment.id}
                            comment={comment}
                            parentCommentId={parentCommentId}
                            setParentCommentId={setParentCommentId}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            handleReplySubmit={handleReplySubmit}
                            handleReply={handleReply}
                            depth={0}
                            mainTexts={mainTexts}
                            user={user}
                            handleEditComment={handleEditComment}
                            handleDeleteComment={handleDeleteComment}
                            handleReplyClick={handleReplyClick}
                            handleCommentInputFocus={handleCommentInputFocus}
                        />
                    ))}
                </CommentList>
                <CommentForm onSubmit={handleCommentSubmit} style={{ marginTop: 32 }}>
                    <CommentInput
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={handleCommentInputFocus}
                        placeholder={mainTexts['plasecomment'] || '댓글을 작성하세요...'}
                    />
                    <Button type="submit">{mainTexts['postcommentok']}</Button>
                </CommentForm>
            </CommentSection>
        </Container>
    );
};

// 댓글 트리 렌더링 컴포넌트 추가
interface CommentTreeItemProps {
    comment: Comment & { children?: Comment[] };
    parentCommentId: number | null;
    setParentCommentId: (id: number | null) => void;
    newComment: string;
    setNewComment: (v: string) => void;
    handleReplySubmit: (parentId: number) => void;
    handleReply: (id: number) => void;
    depth: number;
    mainTexts: any;
    user: any;
    handleEditComment: (id: number) => void;
    handleDeleteComment: (id: number) => void;
    handleReplyClick: (id: number) => void;
    handleCommentInputFocus: () => void;
}
const CommentTreeItem: React.FC<CommentTreeItemProps> = ({
    comment,
    parentCommentId,
    setParentCommentId,
    newComment,
    setNewComment,
    handleReplySubmit,
    handleReply,
    depth,
    mainTexts,
    user,
    handleEditComment,
    handleDeleteComment,
    handleReplyClick,
    handleCommentInputFocus,
}) => (
    <div style={{ marginLeft: depth === 0 ? 0 : 32, marginTop: 8 }}>
        <Comment>
            <CommentHeader>
                <div>
                    <strong>{comment.username}</strong>
                    <span style={{ marginLeft: '10px', color: '#666' }}>{formatDate(comment.created_at)}</span>
                    {user && user.username === comment.username && (
                        <span
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ marginLeft: 12, color: '#888', fontSize: '0.95rem', cursor: 'pointer' }}
                        >
                            {mainTexts['postdelete']}
                        </span>
                    )}
                </div>
                <Button onClick={() => handleReplyClick(comment.id)}>{mainTexts['postcommentcomment']}</Button>
            </CommentHeader>
            <CommentContent>{comment.content}</CommentContent>
        </Comment>
        {parentCommentId === comment.id && (
            <CommentForm
                style={{ marginTop: 10, background: '#f4f6fa', borderRadius: 8, padding: 10, marginLeft: 32 }}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleReplySubmit(comment.id);
                }}
            >
                <CommentInput
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={handleCommentInputFocus}
                    placeholder={mainTexts['pleasecommentcomment'] || '답글을 작성하세요...'}
                />
                <Button type="submit">{mainTexts['postcommentcommentok']}</Button>
                <Button
                    type="button"
                    style={{ background: '#bbb', marginLeft: 8 }}
                    onClick={() => setParentCommentId(null)}
                >
                    {mainTexts['postcancel']}
                </Button>
            </CommentForm>
        )}
        {comment.children &&
            comment.children.map((child) => (
                <CommentTreeItem
                    key={child.id}
                    comment={child}
                    parentCommentId={parentCommentId}
                    setParentCommentId={setParentCommentId}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    handleReplySubmit={handleReplySubmit}
                    handleReply={handleReply}
                    depth={depth + 1}
                    mainTexts={mainTexts}
                    user={user}
                    handleEditComment={handleEditComment}
                    handleDeleteComment={handleDeleteComment}
                    handleReplyClick={handleReplyClick}
                    handleCommentInputFocus={handleCommentInputFocus}
                />
            ))}
    </div>
);

export default PostDetail;
