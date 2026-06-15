import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ParentalConsentScreen } from './components/ParentalConsentScreen';
import { PrivacyCenterScreen } from './components/PrivacyCenterScreen';

function App() {
  return (
    <BrowserRouter>
      {/* Dev Navigation removed for production */}

      <Routes>
        <Route path="/" element={<ParentalConsentScreen />} />
        <Route path="/parental-consent" element={<ParentalConsentScreen />} />
        <Route path="/privacy-center" element={<PrivacyCenterScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
