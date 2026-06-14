import React, { useState } from 'react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

interface UserProfile {
  name: string;
  email: string;
}

interface PrivacyCenterProps {
  user: UserProfile;
}

export const PrivacyCenterScreen: React.FC<PrivacyCenterProps> = ({ 
  user = { name: "John Doe", email: "john.doe@example.com" }
}) => {
  const [status, setStatus] = useState<'idle' | 'loading_export' | 'loading_delete' | 'success_export' | 'error'>('idle');

  // Simulated backend POST to /api/compliance/data/export
  const handleExport = () => {
    setStatus('loading_export');
    
    setTimeout(() => {
      setStatus('success_export');
      console.log(`POST /api/compliance/data/export`);
      // Revert to idle after showing success
      setTimeout(() => setStatus('idle'), 3000);
    }, 2400);
  };

  // Simulated backend POST to /api/compliance/data/delete
  const handleDelete = () => {
    setStatus('loading_delete');
    
    setTimeout(() => {
      setStatus('error'); // Trigger the red theme for destructive action confirmation
      console.log(`POST /api/compliance/data/delete`);
      
      setTimeout(() => {
        console.log("Account deleted. Logging out...");
      }, 1500);
    }, 2000);
  };

  return (
    <>
      <AmbientBackground />
      
      <div className={`ms-card ${status === 'error' || status === 'loading_delete' ? 'theme-error' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
        {(status === 'loading_export' || status === 'loading_delete' || status === 'error') && (
          <div className={`ms-loader-overlay ${status === 'loading_delete' || status === 'error' ? 'fast-loader' : ''}`}>
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="Open Rockets VC1 Logo" className="ms-logo-img" />
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
          Manage your personal data in accordance with the <strong>General Data Protection Regulation</strong>.
        </p>

        {status !== 'idle' && (
          <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--ms-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {status === 'loading_export' && <span>Preparing your data export...</span>}
            {status === 'success_export' && <span>Your data is being exported.</span>}
            {status === 'loading_delete' && <span>Deleting your account...</span>}
            {status === 'error' && <span>Account deleted. Logging out...</span>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          
          {/* Data Export Box */}
          <div style={{ border: '1px solid var(--ms-border)', padding: '16px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Export your data</h3>
            <p style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginBottom: '12px' }}>
              Download a copy of all your personal data, linked accounts, and activity logs.
            </p>
            <button 
              className="ms-button ms-button-primary"
              onClick={handleExport}
              disabled={status !== 'idle'}
              style={{ padding: '6px 16px', fontSize: '13px', minWidth: 'auto' }}
            >
              Request Data Export
            </button>
          </div>

          {/* Account Deletion Box */}
          <div style={{ border: '1px solid var(--ms-border)', padding: '16px', borderRadius: '4px', borderColor: 'var(--ms-red)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--ms-red)' }}>Erase your account</h3>
            <p style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginBottom: '12px' }}>
              Permanently delete your account and wipe all Personally Identifiable Information (PII) from our systems.
            </p>
            <button 
              className="ms-button ms-button-secondary"
              onClick={handleDelete}
              disabled={status !== 'idle'}
              style={{ padding: '6px 16px', fontSize: '13px', minWidth: 'auto', backgroundColor: '#fcebea', color: 'var(--ms-red)' }}
            >
              Delete Account
            </button>
          </div>

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
    </>
  );
};
