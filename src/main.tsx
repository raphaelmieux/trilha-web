import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });

  // A returning visitor can land on an index.html served by the *previous*
  // worker's cache, which references hashed bundles that no longer exist — the
  // page then renders blank. The replacement worker takes control via
  // skipWaiting/clients.claim; reloading once at that moment re-fetches the
  // current index.html and recovers the session without user intervention.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}
