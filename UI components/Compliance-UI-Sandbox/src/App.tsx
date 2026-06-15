import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ParentalConsentScreen } from './components/ParentalConsentScreen';
import { PrivacyCenterScreen } from './components/PrivacyCenterScreen';
import logoPath from './assets/openrocketsvc1.png';

function App() {
  return (
    <BrowserRouter>
      {/* Premium Navigation Header */}
      <header className="premium-nav">
        <div className="nav-brand">
          <img src={logoPath} alt="OpenRockets Logo" />
          <span>Privacy Center</span>
        </div>
        <nav className="nav-links">
          <NavLink 
            to="/parental-consent" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Parental Consent
          </NavLink>
          <NavLink 
            to="/privacy-center" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Data Rights
          </NavLink>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ParentalConsentScreen />} />
          <Route path="/parental-consent" element={<ParentalConsentScreen />} />
          <Route path="/privacy-center" element={<PrivacyCenterScreen />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
