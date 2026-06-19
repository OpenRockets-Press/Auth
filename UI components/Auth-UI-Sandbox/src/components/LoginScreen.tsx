import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AmbientBackground } from './AmbientBackground';
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [targetAppName, setTargetAppName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 800);

    const urlParams = new URLSearchParams(window.location.search);
    const redirectUri = urlParams.get('redirect_uri') || localStorage.getItem('_or_redirect_uri');
    if (redirectUri) {
      try {
        const url = new URL(redirectUri);
        const host = url.hostname.toLowerCase();
        if (host.startsWith('mag.')) setTargetAppName('Mag');
        else if (host.startsWith('ads.')) setTargetAppName('Ads');
        else if (host.startsWith('myaccount.')) setTargetAppName('MyAccount');
      } catch (e) {
        // invalid url, ignore
      }
    }

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      const token = response.data.access_token || response.data.token;

      // Indefinite encrypted token storage
      if (token) {
        const encryptedToken = window.btoa(token);
        localStorage.setItem('_or_auth_tk', encryptedToken);
      }

      setStatus('success');
      setTimeout(() => {
        const storedRedirect = localStorage.getItem('_or_redirect_uri');
        if (storedRedirect) {
          try {
            const redirectUrl = new URL(storedRedirect);
            redirectUrl.searchParams.set('token', token);
            localStorage.removeItem('_or_redirect_uri');
            window.location.href = redirectUrl.toString();
          } catch (e) {
            window.location.href = 'https://myaccount.openrockets.com/auth/sso?token=' + token;
          }
        } else {
          window.location.href = 'https://myaccount.openrockets.com/auth/sso?token=' + token;
        }
      }, 1000);
    } catch (error: any) {
      console.error('Login Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className={`ms-card ${initialLoad ? 'is-loading-initial' : ''}`} style={{ position: 'relative' }}>
        
        {(status === 'loading' || initialLoad) && (
          <div className="ms-loader-overlay">
            <div className="ms-loader-container">
              <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
            </div>
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>
        
        <div className="ms-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <h1 className="ms-title" style={{ marginBottom: '8px' }}>Sign in</h1>
          <p className="ms-description" style={{ marginBottom: '24px' }}>
            to continue to OpenRockets
            {targetAppName && <span style={{ color: 'var(--theme-primary)' }}> {targetAppName}</span>}
          </p>

          {status === 'error' && (
            <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>
              {errorMessage}
            </div>
          )}

        <form onSubmit={handleLogin} className="ms-card-scrollable">
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email, phone, or Skype"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid var(--ms-border)',
                outline: 'none',
                fontSize: '15px',
                marginBottom: '16px',
                background: 'transparent',
                color: 'var(--ms-text)'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid var(--ms-border)',
                outline: 'none',
                fontSize: '15px',
                marginBottom: '16px',
                background: 'transparent',
                color: 'var(--ms-text)'
              }}
            />
          </div>

          <div style={{ fontSize: '13px', marginBottom: '32px' }}>
            No account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}>
              Create one!
            </a>
          </div>

          <div className="ms-button-group">
            <button 
              type="submit" 
              className="ms-button ms-button-primary"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};
