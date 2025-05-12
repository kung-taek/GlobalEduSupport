import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';

interface Place {
    place_name: string;
    address_name: string;
    phone?: string;
    category_group_name: string;
    distance: string;
}

interface PlaceInfoPanelProps {
    selectedPlace: Place | null;
    recentPlaces: Place[];
}

const PanelContainer = styled.div<{ $isMobile: boolean; $isOpen: boolean; $dragHeight: number }>`
    width: 300px;
    height: ${({ $isMobile, $isOpen }) => ($isMobile ? ($isOpen ? '50vh' : '80px') : '100vh')};
    max-height: ${({ $isMobile, $isOpen }) => ($isMobile ? ($isOpen ? '50vh' : '80px') : '100vh')};
    background: ${({ $isOpen }) => ($isOpen ? '#ffffff' : 'rgba(255,255,255,0.95)')};
    box-shadow: ${({ $isOpen }) => ($isOpen ? '-2px 0 8px rgba(0, 0, 0, 0.1)' : '0 -4px 16px rgba(0,0,0,0.15)')};
    padding: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 301;
    transition: transform 0.3s ease, height 0.3s ease, max-height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease,
        padding 0.3s ease;
    overflow: visible;

    @media (max-width: 768px) {
        width: 100%;
        transform: ${({ $isOpen, $dragHeight }) =>
            $isOpen ? `translateY(${$dragHeight}px)` : `translateY(calc(100% - 80px))`};
        border-radius: 16px 16px 0 0;
        box-shadow: ${({ $isOpen }) => ($isOpen ? '0 -4px 16px rgba(0, 0, 0, 0.15)' : 'none')};
        padding-top: 0;
        position: fixed;
        right: 0;
        left: 0;
        top: auto;
        bottom: 0;
    }
`;

const DragHandle = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: flex;
        width: 100%;
        height: 40px;
        align-items: center;
        justify-content: center;
        cursor: grab;
        position: static;
        background: #ffffff;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        z-index: 301;

        &::after {
            content: '';
            width: 40px;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        &:active {
            cursor: grabbing;
        }
    }
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 16px 0;
    color: #333;
`;

const PlaceCard = styled.div`
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PlaceName = styled.h3`
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #333;
`;

const PlaceInfo = styled.p`
    margin: 4px 0;
    font-size: 14px;
    color: #666;
`;

// 최근 본 장소 텍스트 중앙 정렬용 styled-component
const HandleTitleText = styled.div`
    width: 100%;
    text-align: center;
    font-weight: bold;
    color: #333;
    font-size: 16px;
    margin-bottom: 8px;
`;

const PlaceInfoPanel: React.FC<PlaceInfoPanelProps> = ({ selectedPlace, recentPlaces }) => {
    const { texts } = useTranslation();
    const pageTexts = texts['main'] || {};
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
    const [dragHeight, setDragHeight] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);

    useEffect(() => {
        const handleResize = () => {
            const isMobileView = window.innerWidth <= 768;
            setIsMobile(isMobileView);
            setIsOpen(!isMobileView);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;
        if (isOpen && diff > 0) {
            setDragHeight(diff);
        } else if (!isOpen && diff < 0) {
            setDragHeight(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragHeight > 50) {
            setIsOpen(false);
        } else if (dragHeight < -50) {
            setIsOpen(true);
        }
        setDragHeight(0);
    };

    return (
        <PanelContainer $isMobile={isMobile} $isOpen={isOpen} $dragHeight={dragHeight}>
            {isMobile && (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px 16px 0 0',
                        boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 302,
                    }}
                >
                    <DragHandle
                        onTouchStart={isOpen ? handleTouchStart : () => setIsOpen(true)}
                        onTouchMove={isOpen ? handleTouchMove : undefined}
                        onTouchEnd={isOpen ? handleTouchEnd : undefined}
                        style={{ position: 'static', marginBottom: 0 }}
                    />
                    <HandleTitleText>{pageTexts['recent_places'] || '최근 본 장소'}</HandleTitleText>
                </div>
            )}
            {isOpen && (
                <>
                    {selectedPlace && (
                        <>
                            <SectionTitle>{pageTexts['selected_place'] || '선택한 장소'}</SectionTitle>
                            <PlaceCard>
                                <PlaceName>{selectedPlace.place_name}</PlaceName>
                                <PlaceInfo>
                                    {pageTexts['address'] || '주소'}: {selectedPlace.address_name}
                                </PlaceInfo>
                                {selectedPlace.phone && (
                                    <PlaceInfo>
                                        {pageTexts['phone'] || '전화'}: {selectedPlace.phone}
                                    </PlaceInfo>
                                )}
                                <PlaceInfo>
                                    {pageTexts['category'] || '카테고리'}: {selectedPlace.category_group_name}
                                </PlaceInfo>
                                <PlaceInfo>
                                    {pageTexts['distance'] || '거리'}: {selectedPlace.distance}m
                                </PlaceInfo>
                            </PlaceCard>
                        </>
                    )}
                    <SectionTitle style={{ textAlign: 'center', width: '100%' }}>
                        {pageTexts['recent_places'] || '최근 본 장소'}
                    </SectionTitle>
                    {recentPlaces.map((place, index) => (
                        <PlaceCard key={index}>
                            <PlaceName>{place.place_name}</PlaceName>
                            <PlaceInfo>
                                {pageTexts['address'] || '주소'}: {place.address_name}
                            </PlaceInfo>
                            {place.phone && (
                                <PlaceInfo>
                                    {pageTexts['phone'] || '전화'}: {place.phone}
                                </PlaceInfo>
                            )}
                            <PlaceInfo>
                                {pageTexts['category'] || '카테고리'}: {place.category_group_name}
                            </PlaceInfo>
                            <PlaceInfo>
                                {pageTexts['distance'] || '거리'}: {place.distance}m
                            </PlaceInfo>
                        </PlaceCard>
                    ))}
                </>
            )}
        </PanelContainer>
    );
};

export default PlaceInfoPanel;
