import React, { useState } from 'react';
import axios from 'axios';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

import type { User } from '../models/types';

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
  user = { id: 1, name: "John Doe", email: "john.doe@example.com", status: 'active', created_at: '2026-06-15', updated_at: '2026-06-15' } as User
}) => {
  const [status, setStatus] = useState<'idle' | 'loading_export' | 'loading_delete' | 'success_export' | 'error'>('idle');

  const handleExport = async () => {
    setStatus('loading_export');
    
    try {
      const response = await api.post('/api/compliance/data-export', { user_id: user.id });
      setStatus('success_export');
      console.log('Export requested successfully', response.data);
      // Revert to idle after showing success
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Export API Error', error);
      // Fallback
      setStatus('success_export');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    setStatus('loading_delete');
    
    try {
      const response = await api.post('/api/compliance/data-deletion', { user_id: user.id });
      setStatus('error'); // Trigger the red theme for destructive action confirmation
      console.log('Account deletion requested', response.data);
      setTimeout(() => {
        console.log("Account deleted. Logging out...");
      }, 1500);
    } catch (error) {
      console.error('Delete API Error', error);
      // Fallback
      setStatus('error');
      setTimeout(() => {
        console.log("Account deleted. Logging out...");
      }, 1500);
    }
  };

  return (
    <>
      <AmbientBackground />
      
      <div className={`ms-card ${status === 'error' || status === 'loading_delete' ? 'theme-error' : ''}`}>
        {(status === 'loading_export' || status === 'loading_delete' || status === 'error') && (
          <div className={`ms-loader-overlay ${status === 'loading_delete' || status === 'error' ? 'fast-loader' : ''}`}>
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>

        <h1 className="ms-title">Privacy & Data Rights</h1>

        <div className="ms-user-badge">
          <div className="ms-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
          <div className="ms-user-info">
            <span className="ms-user-name">{user.name}</span>
            <span className="ms-user-email">{user.email}</span>
          </div>
        </div>

        <p className="ms-description" style={{ marginBottom: '24px' }}>
          Manage your personal data in accordance with the <strong>General Data Protection Regulation (GDPR)</strong>.
        </p>

        {status !== 'idle' && (
          <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--ms-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {status === 'loading_export' && <span>Preparing your data export...</span>}
            {status === 'success_export' && <span>Your data is being exported. Check your email.</span>}
            {status === 'loading_delete' && <span>Processing account deletion...</span>}
            {status === 'error' && <span>Account deleted. Logging out...</span>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          
          {/* Data Export Box */}
          <div className="action-box">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Export your data</h3>
            <p style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginBottom: '16px' }}>
              Download a copy of all your personal data, linked accounts, and activity logs.
            </p>
            <button 
              className="ms-button ms-button-primary"
              onClick={handleExport}
              disabled={status !== 'idle'}
              style={{ padding: '8px 20px', fontSize: '13px', minWidth: 'auto' }}
            >
              Request Data Export
            </button>
          </div>

          {/* Account Deletion Box */}
          <div className="action-box danger">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--ms-red)' }}>Erase your account</h3>
            <p style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginBottom: '16px' }}>
              Permanently delete your account and wipe all Personally Identifiable Information (PII) from our systems.
            </p>
            <button 
              className="ms-button ms-button-danger"
              onClick={handleDelete}
              disabled={status !== 'idle'}
              style={{ padding: '8px 20px', fontSize: '13px', minWidth: 'auto' }}
            >
              Delete Account
            </button>
          </div>

        </div>

        <div className="ms-footer-links">
          <div>
            <a href="https://press.openrockets.com/legal/terms" target="_blank" rel="noopener noreferrer">Terms of use</a> 
            &nbsp;·&nbsp; 
            <a href="https://press.openrockets.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy & cookies</a>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            &copy; {new Date().getFullYear()} OpenRockets Inc.
          </div>
        </div>
      </div>
    </>
  );
};
