import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { finishCourseStorageReset } from './lib/courseStorage';
import './styles.css';

const initialUrl = new URL(window.location.href);
if (initialUrl.searchParams.has('reset-course-progress')) {
  finishCourseStorageReset();
  initialUrl.searchParams.delete('reset-course-progress');
  window.history.replaceState(null, '', `${initialUrl.pathname}${initialUrl.search}${initialUrl.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
