import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TranslationProvider } from './contexts/TranslationContext';
import './styles/base/variables.css';
import './styles/base/reset.css';
import './styles/layouts/responsive.css';

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
