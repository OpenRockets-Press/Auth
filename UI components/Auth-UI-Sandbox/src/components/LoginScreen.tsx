import React, { useState } from 'react';
import axios from 'axios';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';
import { Link, useSearchParams } from 'react-router-dom';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const LoginScreen: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();

  // Microsoft-style initial load stagger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await api.post(`/api/auth/login`, { 
        email,
        password
      });
      
      setStatus('success');
      
      // Store token safely (in production this could be secure HTTP-only cookie, but standard practice here is localStorage)
      localStorage.setItem('openrockets_token', response.data.token);
      
      // Redirect back if origin is set
      const redirectUri = searchParams.get('redirect_uri') || localStorage.getItem('redirect_uri');
      
      setTimeout(() => {
        if (redirectUri) {
          localStorage.removeItem('redirect_uri');
          window.location.href = redirectUri;
        } else {
          // Fallback to OpenRockets main or DataHub
          window.location.href = 'https://accounts.openrockets.com';
        }
      }, 1500);

    } catch (error: any) {
      console.error('Login API Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Invalid email or password.');
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
        
        {status === 'success' && (
          <div className="ms-loader-overlay" style={{ background: '#ffffff', bottom: 0, height: '100%', display: 'flex', zIndex: 20 }}>
            <div className="ms-success-animation">
              <svg viewBox="0 0 52 52" className="checkmark">
                <circle className="checkmark-circle" fill="none" cx="26" cy="26" r="25" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <h2 className="ms-title" style={{ marginTop: '24px' }}>Welcome back!</h2>
              <p className="ms-subtitle">Redirecting...</p>
            </div>
          </div>
        )}

        <div className="ms-card-content">
          <div className="ms-header">
            <img src={logoPath} alt="OpenRockets" className="ms-logo" />
            <h1 className="ms-title">Sign in</h1>
            <p className="ms-subtitle">to continue to OpenRockets</p>
          </div>

          <form onSubmit={handleLogin} className="ms-form" style={{ marginTop: '24px' }}>
            <div className="ms-input-group">
              <input 
                type="email" 
                className="ms-input" 
                placeholder="Email, phone, or Skype" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>
            
            <div className="ms-input-group" style={{ marginTop: '12px' }}>
              <input 
                type="password" 
                className="ms-input" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>

            {errorMessage && (
              <div className="ms-error-text" style={{ marginTop: '12px', color: '#e81123', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <div className="ms-help-links" style={{ marginTop: '16px', fontSize: '13px' }}>
              <p>No account? <Link to={`/register${searchParams.toString() ? '?' + searchParams.toString() : ''}`} className="ms-link">Create one!</Link></p>
            </div>

            <div className="ms-actions" style={{ marginTop: '32px' }}>
              <button 
                type="submit" 
                className="ms-button primary"
                disabled={status === 'loading'}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
