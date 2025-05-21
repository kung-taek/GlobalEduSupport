import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from '../../contexts/TranslationContext';

interface Post {
    id: number;
    title: string;
    content: string;
    board_type: 'free' | 'info';
    views: number;
    likes: number;
    created_at: string;
    username: string;
    image_url?: string;
}

const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 30px 0 0 0;
`;

const Form = styled.form`
    background: #fff;
    padding: 24px 18px 18px 18px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const FormGroup = styled.div`
    margin-bottom: 18px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 7px;
    font-weight: bold;
    color: #23272f;
    font-size: 1.05rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 11px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 220px;
    padding: 11px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    resize: vertical;
`;

const ImagePreview = styled.div`
    margin-top: 10px;
    img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 8px;
        border: 1px solid #eee;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 18px;
`;

const Button = styled.button`
    padding: 11px 22px;
    border: none;
    border-radius: 6px;
    background: #23272f;
    color: #fff;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background 0.2s;
    &:hover {
        background: #181c20;
    }
`;

const CancelButton = styled(Button)`
    background: #666;
    &:hover {
        background: #555;
    }
`;

const PostForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { texts } = useTranslation();
    const mainTexts = texts['main'] || {};
    // boardType을 location.state로 전달받음 (없으면 free)
    const boardType = (location.state && location.state.boardType) || 'free';
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await axios.get<Post>(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}`);
            const post = response.data;
            setTitle(post.title);
            setContent(post.content);
            if (post.image_url) setImagePreview(post.image_url);
        } catch (error) {
            console.error('게시글 조회 실패:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('board_type', boardType);
            if (image) formData.append('image', image);

            if (isEdit) {
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/posts`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            navigate('/community');
        } catch (error) {
            console.error('게시글 저장 실패:', error);
        }
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>{mainTexts['posttitle'] || '제목'}</Label>
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder={mainTexts['posttitleplease'] || '제목을 입력해 주세요.'}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>{mainTexts['postbody'] || '내용'}</Label>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        placeholder={mainTexts['postbodyplease'] || '내용을 입력해 주세요.'}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>{mainTexts['postimage'] || '이미지 첨부'}</Label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        <Button
                            type="button"
                            style={{ padding: '7px 16px', fontSize: '0.98rem', minWidth: 90 }}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            {mainTexts['selectimage'] || '이미지 선택'}
                        </Button>
                        <span style={{ color: '#888', fontSize: '0.97rem' }}>
                            {image ? image.name : mainTexts['postnotselectedimage'] || '선택된 파일 없음.'}
                        </span>
                    </div>
                    {imagePreview && (
                        <ImagePreview>
                            <img src={imagePreview} alt={mainTexts['selectimage'] || '이미지 선택'} />
                        </ImagePreview>
                    )}
                </FormGroup>
                <ButtonGroup>
                    <Button type="submit">
                        {isEdit ? mainTexts['postpost'] || '작성하기' : mainTexts['postpost'] || '작성하기'}
                    </Button>
                    <CancelButton type="button" onClick={() => navigate('/community')}>
                        {mainTexts['postcancel'] || '취소'}
                    </CancelButton>
                </ButtonGroup>
            </Form>
        </Container>
    );
};

export default PostForm;
