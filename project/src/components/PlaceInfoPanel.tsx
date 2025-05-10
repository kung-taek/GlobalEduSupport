import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../contexts/TranslationContext';

interface Place {
    place_name: string;
    address_name: string;
    phone: string;
    category_group_name: string;
    distance: string;
}

interface PlaceInfoPanelProps {
    selectedPlace: Place | null;
    recentPlaces: Place[];
}

const PanelContainer = styled.div`
    width: 300px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    overflow-y: auto;
`;

const PlaceCard = styled.div`
    padding: 15px;
    border-radius: 8px;
    background-color: #f8f9fa;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #343a40;
    }

    p {
        margin: 5px 0;
        font-size: 14px;
        color: #6c757d;
    }
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    color: #343a40;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e9ecef;
`;

const PlaceInfoPanel: React.FC<PlaceInfoPanelProps> = ({ selectedPlace, recentPlaces }) => {
    const { texts } = useTranslation();
    const pageTexts = texts['main'] || {};

    return (
        <PanelContainer>
            {selectedPlace && (
                <>
                    <SectionTitle>{pageTexts['selected_place'] || '선택한 장소?'}</SectionTitle>
                    <PlaceCard>
                        <h3>{selectedPlace.place_name}</h3>
                        <p>
                            {pageTexts['address'] || '주소?'}: {selectedPlace.address_name}
                        </p>
                        {selectedPlace.phone && (
                            <p>
                                {pageTexts['phone'] || '전화?'}: {selectedPlace.phone}
                            </p>
                        )}
                        <p>
                            {pageTexts['category'] || '카테고리?'}: {selectedPlace.category_group_name}
                        </p>
                        <p>
                            {pageTexts['distance'] || '거리?'}: {selectedPlace.distance}m
                        </p>
                    </PlaceCard>
                </>
            )}

            <SectionTitle>{pageTexts['recent_places'] || '최근 본 장소?'}</SectionTitle>
            {recentPlaces.map((place, index) => (
                <PlaceCard key={index}>
                    <h3>{place.place_name}</h3>
                    <p>
                        {pageTexts['address'] || '주소?'}: {place.address_name}
                    </p>
                    {place.phone && (
                        <p>
                            {pageTexts['phone'] || '전화?'}: {place.phone}
                        </p>
                    )}
                    <p>
                        {pageTexts['category'] || '카테고리?'}: {place.category_group_name}
                    </p>
                    <p>
                        {pageTexts['distance'] || '거리?'}: {place.distance}m
                    </p>
                </PlaceCard>
            ))}
        </PanelContainer>
    );
};

export default PlaceInfoPanel;
