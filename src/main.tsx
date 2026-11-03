import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'lenis/dist/lenis.css';
import './index.css';
import App from './App.tsx';
import { startSmoothScroll } from './lib/smooth';
import { startCursor } from './lib/cursor';

startSmoothScroll();
startCursor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
