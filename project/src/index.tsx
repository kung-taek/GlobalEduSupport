import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TranslationProvider } from './contexts/TranslationContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <TranslationProvider>
                <App />
            </TranslationProvider>
        </BrowserRouter>
    </React.StrictMode>
);
