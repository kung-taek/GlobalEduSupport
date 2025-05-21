import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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
    max-width: 600px;
    margin: 0 auto;
    padding: 0 0 80px 0;
`;

const TopTabs = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 18px 0 10px 0;
    background: #fff;
    border-bottom: 1px solid #eee;
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
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 8px 0;
    background: #fff;
    border-bottom: 1px solid #eee;
`;

const ActionTextButton = styled.button`
    background: none;
    border: none;
    padding: 6px 14px;
    font-size: 1.08rem;
    color: #23272f;
    cursor: pointer;
    font-weight: bold;
    border-radius: 6px;
    &:hover {
        background: #f0f4fa;
        color: #0078ff;
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
    border-bottom: 1px solid #eee;
    padding: 16px 0;
    cursor: pointer;
    &:hover {
        background: #f8f9fa;
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
    const [activeTab, setActiveTab] = useState<'free' | 'info'>('free');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Post[]>(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/search?board_type=${activeTab}`
            );
            setPosts(response.data);
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
        }
        setLoading(false);
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
                <Tab active={activeTab === 'free'} onClick={() => setActiveTab('free')}>
                    {mainTexts['freepost'] || '자유게시판'}
                </Tab>
                <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
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
                    onClick={() => navigate('/community/write', { state: { boardType: activeTab } })}
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
                                <span>
                                    {post.username}{' '}
                                    <span style={{ color: '#0078ff', fontWeight: 700 }}>Lv.{post.level}</span>
                                </span>
                                <span>조회 {post.views}</span>
                                <span>추천 {post.likes}</span>
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
