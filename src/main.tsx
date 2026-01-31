import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Entry point for the Side‑Car MVP application.
// ReactDOM.createRoot is used for concurrent rendering support.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}