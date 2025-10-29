import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// 🧭 Fix Chrome mobile white bar issue
if ('visualViewport' in window) {
  const updateHeight = () => {
    document.documentElement.style.setProperty('--vh', `${window.visualViewport.height * 0.01}px`);
  };
  window.visualViewport.addEventListener('resize', updateHeight);
  updateHeight();
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);  
