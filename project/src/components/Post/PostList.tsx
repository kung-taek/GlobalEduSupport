import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from '../../contexts/TranslationContext';

interface Post {
    id: number;
    title: string;
    username: string;
    views: number;
    likes: number;
    comments_count: number;
    created_at: string;
    level: number;
}

const Container = styled.div`
    width: 50vw;
    min-width: 400px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 0 80px 0;
    @media (max-width: 768px) {
        width: 100vw;
        min-width: unset;
        max-width: 100vw;
        padding: 0 0 80px 0;
    }
`;

const TopTabs = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: #fff;
    /* border-bottom: 1px solid #eee; */
`;

const Tab = styled.button<{ active: boolean }>`
    padding: 10px 24px;
    border: none;
    border-radius: 8px 8px 0 0;
    background: ${({ active }) => (active ? '#23272f' : '#f5f6fa')};
    color: ${({ active }) => (active ? '#fff' : '#23272f')};
    font-size: 1.08rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0;
    padding: 0;
    background: #23272f;
    /* border-bottom: 1px solid #eee; */
`;

const ActionTextButton = styled.button`
    background: #23272f;
    border: none;
    padding: 8px 0;
    font-size: 1.08rem;
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    border-radius: 0;
    width: 50%;
    transition: background 0.2s, color 0.2s;
    &:hover {
        background: #444;
        color: #fff;
    }
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const ListItem = styled.li`
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #fff;
    margin-bottom: 16px;
    padding: 16px 20px;
    cursor: pointer;
    transition: box-shadow 0.15s, border 0.15s;
    &:hover {
        background: #f8f9fa;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1.5px solid #0078ff;
    }
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.08rem;
    font-weight: 500;
    color: #23272f;
`;

const InfoRow = styled.div`
    display: flex;
    gap: 12px;
    font-size: 0.92rem;
    color: #888;
    margin-top: 6px;
`;

const CommentCount = styled.span`
    color: #e74c3c;
    font-weight: bold;
    margin-left: 4px;
`;

const EmptyBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    color: #bbb;
    padding: 40px 0;
    font-size: 1.1rem;
    text-align: center;
`;

const PostList: React.FC = () => {
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // URL 파라미터에서 board_type을 가져옴
    const params = new URLSearchParams(location.search);
    const boardType = params.get('board_type') || 'free';

    useEffect(() => {
        fetchPosts();
    }, [boardType]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Post[]>(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/search?board_type=${boardType}`
            );
            setPosts(response.data);
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
        }
        setLoading(false);
    };

    // 게시판 타입 변경 시 URL 업데이트
    const handleTabChange = (type: 'free' | 'info') => {
        navigate(`/community?board_type=${type}`);
    };

    function formatPostDate(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (isToday) {
            const hour = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            return `${hour}:${min}`;
        } else {
            return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
        }
    }

    return (
        <Container>
            <TopTabs>
                <Tab active={boardType === 'free'} onClick={() => handleTabChange('free')}>
                    {mainTexts['freepost'] || '자유게시판'}
                </Tab>
                <Tab active={boardType === 'info'} onClick={() => handleTabChange('info')}>
                    {mainTexts['infopost'] || '정보게시판'}
                </Tab>
            </TopTabs>
            <ActionBar>
                <ActionTextButton
                    title={mainTexts['findpostlist'] || '검색'}
                    onClick={() => alert('검색 기능은 추후 지원 예정입니다.')}
                >
                    {mainTexts['findpostlist'] || '검색'}
                </ActionTextButton>
                <ActionTextButton
                    title={mainTexts['writing'] || '글쓰기'}
                    onClick={() => navigate('/community/write', { state: { boardType } })}
                >
                    {mainTexts['writing'] || '글쓰기'}
                </ActionTextButton>
            </ActionBar>
            <List>
                {loading ? (
                    <EmptyBox>
                        <span>불러오는 중...</span>
                    </EmptyBox>
                ) : posts.length === 0 ? (
                    <EmptyBox>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
                        <div style={{ color: '#bbb', fontSize: '1.1rem', fontWeight: 500 }}>
                            {mainTexts['notfindwrite'] || '게시글이 없습니다.'}
                        </div>
                    </EmptyBox>
                ) : (
                    posts.map((post) => (
                        <ListItem key={post.id} onClick={() => navigate(`/community/post/${post.id}`)}>
                            <TitleRow>
                                {post.title}
                                {post.comments_count > 0 && <CommentCount>[{post.comments_count}]</CommentCount>}
                            </TitleRow>
                            <InfoRow>
                                <span>{post.username}</span>
                                <span>|</span>
                                <span>Lv.{post.level}</span>
                                <span>|</span>
                                <span>
                                    {mainTexts['lookcount'] || '조회'} {post.views}
                                </span>
                                <span>|</span>
                                <span>
                                    {mainTexts['postrespect'] || '추천'} {post.likes}
                                </span>
                                <span>|</span>
                                <span>
                                    {mainTexts['postcomment'] || '댓글'} {post.comments_count ?? 0}
                                </span>
                                <span>|</span>
                                <span>{formatPostDate(post.created_at)}</span>
                            </InfoRow>
                        </ListItem>
                    ))
                )}
            </List>
        </Container>
    );
};

export default PostList;
