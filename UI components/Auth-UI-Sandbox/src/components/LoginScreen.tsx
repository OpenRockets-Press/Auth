import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AmbientBackground } from './AmbientBackground';
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/api/auth/login', { email, password });
      setStatus('success');
      // In a real flow, you'd store the token here, e.g., localStorage.setItem('token', response.data.access_token)
      // Then redirect the user to the destination. For now, just simulating.
      setTimeout(() => {
        window.location.href = 'https://myaccount.openrockets.com';
      }, 1000);
    } catch (error: any) {
      console.error('Login Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className="ms-card" style={{ position: 'relative' }}>
        <div className="ms-header">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo" />
          <h2 className="ms-title">Sign in</h2>
          <p className="ms-subtitle">to continue to OpenRockets</p>
        </div>

        {status === 'error' && (
          <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '13px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="ms-content">
          <div className="ms-info-box" style={{ background: 'transparent', padding: '0', border: 'none', marginBottom: '16px' }}>
            <input
              type="email"
              className="ms-input"
              placeholder="Email, phone, or Skype"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid #8A8886',
                outline: 'none',
                fontSize: '15px',
                marginBottom: '16px',
                background: 'transparent'
              }}
            />
            <input
              type="password"
              className="ms-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid #8A8886',
                outline: 'none',
                fontSize: '15px',
                marginBottom: '16px',
                background: 'transparent'
              }}
            />
          </div>

          <div style={{ fontSize: '13px', marginBottom: '32px' }}>
            No account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="ms-link">
              Create one!
            </a>
          </div>

          <div className="ms-actions" style={{ justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="ms-button ms-button-primary"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
