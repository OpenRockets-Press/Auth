import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ParentalConsentScreen } from './components/ParentalConsentScreen';
import { PrivacyCenterScreen } from './components/PrivacyCenterScreen';

function App() {
  return (
    <BrowserRouter>
      {/* Dev Navigation to switch between Sandbox screens */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
        <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Compliance Sandbox</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/parental-consent" style={{ fontSize: '13px', color: '#0067b8', textDecoration: 'none' }}>→ Parental Consent (COPPA/GDPR)</Link>
          <Link to="/privacy-center" style={{ fontSize: '13px', color: '#0067b8', textDecoration: 'none' }}>→ Privacy Center (GDPR Data)</Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<ParentalConsentScreen />} />
        <Route path="/parental-consent" element={<ParentalConsentScreen />} />
        <Route path="/privacy-center" element={<PrivacyCenterScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
