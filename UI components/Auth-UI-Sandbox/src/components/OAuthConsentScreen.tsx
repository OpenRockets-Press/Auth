import React, { useState, useEffect } from 'react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

// Import assets
import logoPath from '../assets/openrocketsvc1.png';
import libertyBg from '../assets/wp-content/statue_of_liberty_new_york_monument_manhattan_liberty_statue_skyline_usa-986669.png';
import museumBg from '../assets/wp-content/American_Museum_of_Natural_History_New_York_us_non-editorial_bpxph4.png';
import type {  User, App, Scope  } from '../models/types';

// Background images and their extracted ambient colors + locations
const BACKGROUNDS = [
  {
    src: libertyBg,
    ambientColor: '#6b9eb5', 
    alt: 'Statue of Liberty New York',
    location: 'New York City'
  },
  {
    src: museumBg,
    ambientColor: '#8c7b6d', 
    alt: 'American Museum of Natural History',
    location: 'New York City'
  }
];

const AmbientBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgInfo, setBgInfo] = useState(BACKGROUNDS[0]);

  useEffect(() => {
    // Randomly select a background on mount
    const selectedBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    setBgInfo(selectedBg);

    const img = new Image();
    img.src = selectedBg.src;
    img.onload = () => {
      // Shorter timeout to make it feel snappier
      setTimeout(() => setIsLoaded(true), 50);
    };
  }, []);

  return (
    <div className="ambient-bg-container">
      {/* The ambient color layer blending out */}
      <div 
        className={`ambient-color-layer ${isLoaded ? 'fade-out' : ''}`}
        style={{ backgroundColor: bgInfo.ambientColor }}
      />
      {/* The high-res image layer blending in */}
      <img 
        src={bgInfo.src} 
        alt={bgInfo.alt} 
        className={`ambient-image-layer ${isLoaded ? 'fade-in' : ''}`}
      />
      
      {/* Location Badge */}
      <div className={`ms-location-badge ${isLoaded ? 'fade-in' : ''}`}>
        <svg className="ms-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {bgInfo.location}
      </div>
    </div>
  );
};

// A simple SVG checkmark
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

interface OAuthConsentProps {
  user?: User;
  app?: App;
  requestedScopes?: Scope[];
}

export const OAuthConsentScreen: React.FC<OAuthConsentProps> = ({
  user = { id: 1, name: "John Doe", email: "john.doe@example.com", status: 'active', created_at: '2026-06-15', updated_at: '2026-06-15' } as User,
  app = { id: 1, client_id: 'c1', name: "Auth System Sandbox", description: null, status: 'verified' } as App,
  requestedScopes = [
    { id: 'profile', description: 'View your basic profile (Allows the app to see your name, email, and avatar.)' },
    { id: 'email', description: 'Access your email address (Allows the app to communicate with you.)' }
  ]
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Simulated accept action
  const handleAccept = () => {
    setIsLoading(true);
    setStatus('loading');
    
    // Simulating authorization logic (50% chance to fail for sandbox demonstration)
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;
      
      if (isSuccess) {
        setStatus('success');
        console.log("Authorization successful. Redirecting...");
      } else {
        setStatus('error');
        console.log("Authorization failed. Transitioning UI to error state...");
        
        // Wait 1.5 seconds for the user to see the morphing red animation before redirecting
        setTimeout(() => {
          console.log("Redirecting back to app with error=access_denied...");
        }, 1500);
      }
    }, 2000);
  };

  return (
    <>
      <AmbientBackground />
      
      <div className={`ms-card ${status === 'error' ? 'theme-error' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Absolute positioned loader overlay at the top of the card */}
        {isLoading && (
          <div className="ms-loader-overlay">
            <MicrosoftLoadingDots />
          </div>
        )}

        {/* Custom Logo (replacing Microsoft Logo) */}
        <div className="ms-logo-container">
          <img src={logoPath} alt="Open Rockets VC1 Logo" className="ms-logo-img" />
        </div>

        <h1 className="ms-title">Let this app access your info?</h1>

        <div className="ms-user-badge">
          <div className="ms-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
          <div className="ms-user-info">
            <span className="ms-user-name">{user.name}</span>
            <span className="ms-user-email">{user.email}</span>
          </div>
        </div>

        <p className="ms-description">
          <strong>{app.name}</strong> needs your permission to:
        </p>

        <ul className="ms-scope-list">
          {requestedScopes.map(scope => {
            const parts = scope.description.split('(');
            const title = parts[0].trim();
            const desc = parts[1] ? parts[1].replace(')', '').trim() : '';
            return (
              <li className="ms-scope-item" key={scope.id}>
                <div className="ms-verified-tick">
                  <CheckIcon />
                </div>
                <div>
                  <strong>{title}</strong>
                  {desc && <div style={{ color: 'var(--ms-text-secondary)' }}>{desc}</div>}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="ms-description" style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginBottom: '32px' }}>
          By clicking Next, you allow this application and OpenRockets to use your information in accordance with their respective terms of service and privacy policies. You can change these permissions at any time.
        </p>

        <div className="ms-button-group">
          <button 
            className="ms-button ms-button-secondary"
            onClick={() => console.log("Redirecting back...")}
            disabled={isLoading}
          >
            Go Back
          </button>
          <button 
            className="ms-button ms-button-primary"
            onClick={handleAccept}
            disabled={isLoading}
          >
            Next
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
