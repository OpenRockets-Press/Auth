import React, { useState } from 'react';
import axios from 'axios';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

import type { App, User } from '../models/types';

interface OAuthConsentProps {
  app?: App;
  user?: User;
  scopes?: string[];
  token?: string;
}

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const OAuthConsentScreen: React.FC<OAuthConsentProps> = ({ 
  app = { id: 1, name: "OpenRockets Community", owner: { name: "OpenRockets Inc." } } as App,
  user = { id: 1, name: "John Doe", email: "john.doe@example.com" } as User,
  scopes = ['profile', 'email', 'telemetry.read'],
  token = "mock-token-abc"
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Microsoft-style initial load stagger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = async (action: 'grant' | 'deny') => {
    setStatus('loading');
    
    try {
      await api.post(`/api/oauth/authorize`, { 
        client_id: app.id,
        action,
        token
      });
      
      if (action === 'deny') {
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch (error) {
      console.error('OAuth API Error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <>
      <div className={`ms-card ${status === 'error' ? 'theme-error' : ''} ${isInitialLoading ? 'is-loading-initial' : ''}`} style={{ position: 'relative' }}>
        {(status === 'loading' || isInitialLoading) && (
          <div className="ms-loader-overlay">
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="Open Rockets VC1 Logo" className="ms-logo-img" />
        </div>

        <div className="ms-card-content">
          <h1 className="ms-title">Let this app access your info?</h1>

          <div className="ms-user-badge">
            <div className="ms-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
            <div className="ms-user-info">
              <span className="ms-user-name">{user.name}</span>
              <span className="ms-user-email">{user.email}</span>
            </div>
          </div>

          <p className="ms-description">
            <strong>{app.name}</strong> (published by {app.owner?.name || 'Unknown'}) needs your permission to:
          </p>

          <ul className="ms-scope-list">
            {scopes.includes('profile') && (
              <li className="ms-scope-item">
                <div className="ms-verified-tick">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong>View your basic profile</strong>
                  <div style={{ color: 'var(--ms-text-secondary)' }}>Name, avatar, and public account information.</div>
                </div>
              </li>
            )}
            {scopes.includes('email') && (
              <li className="ms-scope-item">
                <div className="ms-verified-tick">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong>View your email address</strong>
                  <div style={{ color: 'var(--ms-text-secondary)' }}>Allows the app to see the email associated with your account.</div>
                </div>
              </li>
            )}
            {scopes.includes('telemetry.read') && (
              <li className="ms-scope-item">
                <div className="ms-verified-tick">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong>Read telemetry data</strong>
                  <div style={{ color: 'var(--ms-text-secondary)' }}>Access your historical vehicle metrics and flight logs.</div>
                </div>
              </li>
            )}
          </ul>

          <p className="ms-description" style={{ fontSize: '13px', color: 'var(--ms-text-secondary)' }}>
            You can revoke these permissions at any time from your OpenRockets account settings.
          </p>

          <div className="ms-button-group">
            <button 
              className="ms-button ms-button-secondary"
              onClick={() => handleAction('deny')}
              disabled={status !== 'idle'}
            >
              Cancel
            </button>
            <button 
              className="ms-button ms-button-primary"
              onClick={() => handleAction('grant')}
              disabled={status !== 'idle'}
            >
              Accept
            </button>
          </div>

          <div className="ms-footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <a href="https://press.openrockets.com/legal/terms" target="_blank" rel="noopener noreferrer">Terms of use</a> 
              &nbsp;|&nbsp; 
              <a href="https://press.openrockets.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy & cookies</a>
            </div>
            <div style={{ fontSize: '11px' }}>
              &copy; {new Date().getFullYear()} OpenRockets Inc.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
