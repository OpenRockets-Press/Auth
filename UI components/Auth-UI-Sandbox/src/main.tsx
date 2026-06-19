import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Capture redirect_uri immediately before any routing takes over
const urlParams = new URLSearchParams(window.location.search);
const redirectUri = urlParams.get('redirect_uri');
if (redirectUri) {
  localStorage.setItem('_or_redirect_uri', redirectUri);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
