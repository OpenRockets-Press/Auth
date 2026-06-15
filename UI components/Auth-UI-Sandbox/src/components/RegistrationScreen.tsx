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

export const RegistrationScreen: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();

  // Microsoft-style initial load stagger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await api.post(`/api/auth/register`, { 
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      setStatus('success');
      
      // Store token safely
      localStorage.setItem('openrockets_token', response.data.token);
      
      // Redirect back if origin is set
      const redirectUri = searchParams.get('redirect_uri') || localStorage.getItem('redirect_uri');
      
      setTimeout(() => {
        if (redirectUri) {
          localStorage.removeItem('redirect_uri');
          window.location.href = redirectUri;
        } else {
          // Fallback to OpenRockets main or DataHub
          window.location.href = 'https://myaccount.openrockets.com';
        }
      }, 1500);

    } catch (error: any) {
      console.error('Registration API Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to create account.');
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
              <h2 className="ms-title" style={{ marginTop: '24px' }}>Account Created!</h2>
              <p className="ms-subtitle">Redirecting...</p>
            </div>
          </div>
        )}

        <div className="ms-card-content">
          <div className="ms-header">
            <img src={logoPath} alt="OpenRockets" className="ms-logo" />
            <h1 className="ms-title">Create account</h1>
            <p className="ms-subtitle">Join the OpenRockets community</p>
          </div>

          <form onSubmit={handleRegister} className="ms-form" style={{ marginTop: '24px' }}>
            <div className="ms-input-group">
              <input 
                type="text" 
                className="ms-input" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>
            
            <div className="ms-input-group" style={{ marginTop: '12px' }}>
              <input 
                type="email" 
                className="ms-input" 
                placeholder="Email address" 
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
                placeholder="Create password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>

            <div className="ms-input-group" style={{ marginTop: '12px' }}>
              <input 
                type="password" 
                className="ms-input" 
                placeholder="Confirm password" 
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
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
              <p>Already have an account? <Link to={`/login${searchParams.toString() ? '?' + searchParams.toString() : ''}`} className="ms-link">Sign in here!</Link></p>
            </div>

            <div className="ms-actions" style={{ marginTop: '32px' }}>
              <button 
                type="submit" 
                className="ms-button primary"
                disabled={status === 'loading'}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
