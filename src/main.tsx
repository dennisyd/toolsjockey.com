import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import * as PDFLib from 'pdf-lib';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
(window as any).pdfjsLib = pdfjsLib;
(window as any).PDFLib = PDFLib;

// Initialize the app with React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
