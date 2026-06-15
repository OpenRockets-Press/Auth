import React, { useState } from 'react';
import axios from 'axios';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

import type {  User  } from '../models/types';

interface PrivacyCenterProps {
  user?: User;
}

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const PrivacyCenterScreen: React.FC<PrivacyCenterProps> = ({ 
  user = { id: 1, name: "John Doe", email: "john.doe@example.com", status: 'active', country: "US", age: 30, created_at: '2026-06-15', updated_at: '2026-06-15' } as User
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Microsoft-style initial load stagger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = async (action: 'download' | 'delete') => {
    setStatus('loading');
    setActionMessage(null);
    
    try {
      const response = await api.post('/api/privacy/data', { action });
      setStatus('success');
      setActionMessage(response.data.message || `Data ${action} request processed successfully.`);
      
      setTimeout(() => {
        setStatus('idle');
        setActionMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Privacy API Error:', error);
      setStatus('error');
      setActionMessage('An error occurred while processing your request.');
      
      setTimeout(() => {
        setStatus('idle');
        setActionMessage(null);
      }, 3000);
    }
  };

  return (
    <>
      <AmbientBackground />
      
      <div className={`ms-card ${status === 'error' ? 'theme-error' : ''} ${isInitialLoading ? 'is-loading-initial' : ''}`} style={{ maxWidth: '560px', position: 'relative' }}>
        {(status === 'loading' || isInitialLoading) && (
          <div className="ms-loader-overlay">
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="Open Rockets VC1 Logo" className="ms-logo-img" />
        </div>

        <div className="ms-card-content">
          <h1 className="ms-title">Privacy & Data Management</h1>

          <div className="ms-user-badge">
            <div className="ms-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
            <div className="ms-user-info">
              <span className="ms-user-name">{user.name}</span>
              <span className="ms-user-email">{user.email}</span>
            </div>
          </div>

          <p className="ms-description">
            We are committed to protecting your privacy. Below you can manage your data in compliance with GDPR and CCPA.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            
            {/* Download Data Section */}
            <div style={{ padding: '20px', border: '1px solid #e1dfdd', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Download Your Data</h3>
              <p style={{ fontSize: '14px', color: 'var(--ms-text-secondary)', marginBottom: '16px' }}>
                Get a copy of your OpenRockets data including your account details, telemetry, and activity logs. 
                This process may take a few minutes to complete.
              </p>
              <button 
                className="ms-button ms-button-primary"
                onClick={() => handleAction('download')}
                disabled={status !== 'idle'}
              >
                Request Data Archive
              </button>
            </div>

            {/* Delete Account Section */}
            <div style={{ padding: '20px', border: '1px solid #e1dfdd', borderLeft: '4px solid var(--ms-red)', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--ms-red)' }}>Delete Account</h3>
              <p style={{ fontSize: '14px', color: 'var(--ms-text-secondary)', marginBottom: '16px' }}>
                Permanently delete your OpenRockets account and all associated data. This action is irreversible and you will lose access to all connected apps.
              </p>
              <button 
                className="ms-button ms-button-secondary"
                style={{ backgroundColor: '#fdf3f4', color: 'var(--ms-red)', border: '1px solid var(--ms-red)' }}
                onClick={() => {
                  if (window.confirm("Are you absolutely sure you want to delete your account? This cannot be undone.")) {
                    handleAction('delete');
                  }
                }}
                disabled={status !== 'idle'}
              >
                Delete My Account
              </button>
            </div>

          </div>

          {actionMessage && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '24px', 
              backgroundColor: status === 'error' ? '#fdf3f4' : '#dff6dd', 
              color: status === 'error' ? 'var(--ms-red)' : '#107c10',
              borderLeft: `4px solid ${status === 'error' ? 'var(--ms-red)' : '#107c10'}`,
              fontSize: '14px'
            }}>
              {actionMessage}
            </div>
          )}

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
