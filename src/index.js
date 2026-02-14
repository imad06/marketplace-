import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n/config'; // Import de la configuration i18n

// Appliquer la direction RTL si la langue est l'arabe
const savedLanguage = localStorage.getItem('language');
if (savedLanguage === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);