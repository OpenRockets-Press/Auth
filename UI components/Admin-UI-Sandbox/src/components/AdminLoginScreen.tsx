import React, { useState } from 'react';
import axios from 'axios';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const AdminLoginScreen: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Microsoft-style initial load stagger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await api.get(`/api/admin/auth/google/redirect`);
      window.location.href = response.data.redirect_url;
    } catch (error: any) {
      console.error('Google Redirect Error:', error);
      setStatus('error');
      setErrorMessage('Failed to connect to Google Auth provider.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className={`ms-card ${status === 'error' ? 'theme-error' : ''} ${isInitialLoading ? 'is-loading-initial' : ''}`} style={{ position: 'relative' }}>
        {(status === 'loading' || isInitialLoading) && (
          <div className="ms-loader-overlay">
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-card-content">
          <div className="ms-header">
            <img src={logoPath} alt="OpenRockets" className="ms-logo" />
            <h1 className="ms-title">Admin Console</h1>
            <p className="ms-subtitle">Restricted to @openrockets.com</p>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button 
              onClick={handleGoogleLogin}
              className="ms-button primary"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: '#000000' }}
              disabled={status === 'loading'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google Workspace
            </button>
          </div>

          {errorMessage && (
            <div className="ms-error-text" style={{ marginTop: '16px', color: '#e81123', fontSize: '14px', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
