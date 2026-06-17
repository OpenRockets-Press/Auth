import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthConsentScreen } from './components/OAuthConsentScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterWizard } from './components/RegisterWizard';
import logoPath from './assets/openrocketsvc1.png';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if we were redirected back with an error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'invalid_token') {
        localStorage.removeItem('_or_auth_tk');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('_or_auth_tk');
    if (token) {
      // Simulate validation delay and redirect
      setTimeout(() => {
        window.location.href = 'https://myaccount.openrockets.com/auth/sso?token=' + token;
      }, 1000);
    } else {
      setIsChecking(false);
    }
  }, []);

  if (isChecking) {
    return (
      <div className="ms-card is-loading-initial" style={{ position: 'relative' }}>
        <div className="ms-loader-overlay">
          <div className="ms-loader-container">
            <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
          </div>
        </div>
        <div className="ms-logo-container">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterWizard />} />
          <Route path="/oauth/authorize" element={<OAuthConsentScreen />} />
          <Route path="/oauth" element={<Navigate to="/oauth/authorize" replace />} />
          <Route path="/consent" element={<Navigate to="/oauth/authorize" replace />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;
