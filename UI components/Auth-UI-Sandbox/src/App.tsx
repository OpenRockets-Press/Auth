import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthConsentScreen } from './components/OAuthConsentScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterWizard } from './components/RegisterWizard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterWizard />} />
        <Route path="/oauth/authorize" element={<OAuthConsentScreen />} />
        <Route path="/oauth" element={<Navigate to="/oauth/authorize" replace />} />
        <Route path="/consent" element={<Navigate to="/oauth/authorize" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
