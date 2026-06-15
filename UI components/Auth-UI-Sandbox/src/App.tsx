import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthConsentScreen } from './components/OAuthConsentScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegistrationScreen } from './components/RegistrationScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/consent" element={<OAuthConsentScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
