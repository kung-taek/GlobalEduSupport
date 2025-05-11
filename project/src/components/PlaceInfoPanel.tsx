import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import '../styles/components/PlaceInfoPanel.css';

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

const PlaceInfoPanel: React.FC<PlaceInfoPanelProps> = ({ selectedPlace, recentPlaces }) => {
    const { texts } = useTranslation();
    const pageTexts = texts['main'] || {};
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isOpen, setIsOpen] = useState(true);
    const [dragHeight, setDragHeight] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
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
        setDragHeight(diff);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragHeight < -50) {
            setIsOpen(true);
        } else if (dragHeight > 50) {
            setIsOpen(false);
        }
        setDragHeight(0);
    };

    return (
        <div
            className={`panel-container ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}
            style={{
                transform: isDragging ? `translateY(${dragHeight}px)` : undefined,
            }}
        >
            {isMobile && (
                <div
                    className="drag-handle"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            )}
            {selectedPlace && (
                <>
                    <h2 className="section-title">{pageTexts['selected_place'] || '선택한 장소'}</h2>
                    <div className="place-card">
                        <h3>{selectedPlace.place_name}</h3>
                        <p>
                            {pageTexts['address'] || '주소'}: {selectedPlace.address_name}
                        </p>
                        {selectedPlace.phone && (
                            <p>
                                {pageTexts['phone'] || '전화'}: {selectedPlace.phone}
                            </p>
                        )}
                        <p>
                            {pageTexts['category'] || '카테고리'}: {selectedPlace.category_group_name}
                        </p>
                        <p>
                            {pageTexts['distance'] || '거리'}: {selectedPlace.distance}m
                        </p>
                    </div>
                </>
            )}

            <h2 className="section-title">{pageTexts['recent_places'] || '최근 본 장소'}</h2>
            {recentPlaces.map((place, index) => (
                <div key={index} className="place-card">
                    <h3>{place.place_name}</h3>
                    <p>
                        {pageTexts['address'] || '주소'}: {place.address_name}
                    </p>
                    {place.phone && (
                        <p>
                            {pageTexts['phone'] || '전화'}: {place.phone}
                        </p>
                    )}
                    <p>
                        {pageTexts['category'] || '카테고리'}: {place.category_group_name}
                    </p>
                    <p>
                        {pageTexts['distance'] || '거리'}: {place.distance}m
                    </p>
                </div>
            ))}
        </div>
    );
};

export default PlaceInfoPanel;
