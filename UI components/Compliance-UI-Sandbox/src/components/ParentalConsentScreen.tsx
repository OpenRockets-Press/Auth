import React, { useState } from 'react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import { AmbientBackground } from './AmbientBackground';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';

import type {  User  } from '../models/types';

interface ParentalConsentProps {
  child: User;
  consentId: string;
  token: string;
}

export const ParentalConsentScreen: React.FC<ParentalConsentProps> = ({ 
  child = { id: 2, name: "Alice Doe", email: "alice.doe@example.com", status: 'pending_parental_consent', country: "US", age: 11, created_at: '2026-06-15', updated_at: '2026-06-15' } as User,
  consentId = "cons_12345",
  token = "tok_xyz"
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Simulated backend POST to /api/consent/verify/{token} with { action: 'grant' | 'deny' }
  const handleAction = (action: 'grant' | 'deny') => {
    setStatus('loading');
    
    setTimeout(() => {
      if (action === 'deny') {
        setStatus('error');
        console.log(`POST /api/consent/verify/${token} { action: 'deny' }`);
        
        // Wait to show the red morphing effect, then redirect to a denied screen or relying app
        setTimeout(() => {
          console.log("Redirecting after deny...");
        }, 1500);
      } else {
        setStatus('success');
        console.log(`POST /api/consent/verify/${token} { action: 'grant' }`);
        // Simulate redirect to success completion
      }
    }, 2000);
  };

  return (
    <>
      <AmbientBackground />
      
      <div className={`ms-card ${status === 'error' ? 'theme-error' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
        {status === 'loading' && (
          <div className="ms-loader-overlay">
            <MicrosoftLoadingDots />
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="Open Rockets VC1 Logo" className="ms-logo-img" />
        </div>

        <h1 className="ms-title">Parental Consent Required</h1>

        <div className="ms-user-badge">
          <div className="ms-avatar">{child.name.substring(0, 2).toUpperCase()}</div>
          <div className="ms-user-info">
            <span className="ms-user-name">{child.name}</span>
            <span className="ms-user-email">{child.email}</span>
          </div>
        </div>

        <p className="ms-description">
          Under the <strong>Children's Online Privacy Protection Act (COPPA)</strong> and applicable local laws, a parent or guardian must verify consent before their child can create an account and share their data.
        </p>

        <ul className="ms-scope-list">
          <li className="ms-scope-item">
            <div className="ms-verified-tick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <strong>Account Creation</strong>
              <div style={{ color: 'var(--ms-text-secondary)' }}>Allows the child to finalize their account creation.</div>
            </div>
          </li>
          <li className="ms-scope-item">
            <div className="ms-verified-tick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <strong>Data Collection</strong>
              <div style={{ color: 'var(--ms-text-secondary)' }}>Allows OpenRockets to collect basic profile and usage data as outlined in our privacy policy.</div>
            </div>
          </li>
        </ul>

        <p className="ms-description" style={{ fontSize: '13px', color: 'var(--ms-text-secondary)' }}>
          By clicking Grant Consent, you confirm you are the parent or legal guardian of this child.
        </p>

        <div className="ms-button-group">
          <button 
            className="ms-button ms-button-secondary"
            onClick={() => handleAction('deny')}
            disabled={status !== 'idle'}
          >
            Deny
          </button>
          <button 
            className="ms-button ms-button-primary"
            onClick={() => handleAction('grant')}
            disabled={status !== 'idle'}
          >
            Grant Consent
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
    </>
  );
};
