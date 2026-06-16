import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { AmbientBackground } from './AmbientBackground';
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

type Step = 'AGE_SELECTION' | 'USER_DETAILS' | 'GETTING_PARENT' | 'CONSENT' | 'SUCCESS';
type UserType = 'adult' | 'minor' | null;

export const RegisterWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('AGE_SELECTION');
  const [userType, setUserType] = useState<UserType>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const sigPad = useRef<SignatureCanvas>(null);
  const navigate = useNavigate();

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setStep('USER_DETAILS');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'minor') {
      setStep('GETTING_PARENT');
      setTimeout(() => {
        setStep('CONSENT');
      }, 2000); // Simulate getting parent
    } else {
      setStep('CONSENT');
    }
  };

  const submitRegistration = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      setErrorMessage("Please provide a signature to continue.");
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

    try {
      await api.post('/api/auth/register-with-consent', {
        name,
        email,
        password,
        password_confirmation: password,
        is_minor: userType === 'minor',
        parent_name: userType === 'minor' ? parentName : null,
        parent_email: userType === 'minor' ? parentEmail : null,
        signature: signatureBase64
      });
      
      setStatus('idle');
      setStep('SUCCESS');
    } catch (error: any) {
      console.error('Registration Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'An error occurred during registration.');
    }
  };

  const renderInput = (type: string, placeholder: string, value: string, onChange: (val: string) => void, required = true) => (
    <input
      type={type}
      className="ms-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={status === 'loading'}
      style={{
        width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid #8A8886',
        outline: 'none', fontSize: '15px', marginBottom: '16px', background: 'transparent'
      }}
    />
  );

  return (
    <>
      <AmbientBackground />
      <div className="ms-card" style={{ position: 'relative' }}>
        <div className="ms-header">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo" />
          <h2 className="ms-title">Create account</h2>
          {step === 'AGE_SELECTION' && <p className="ms-subtitle">Select your age group to continue</p>}
          {step === 'USER_DETAILS' && <p className="ms-subtitle">Enter your details</p>}
          {step === 'GETTING_PARENT' && <p className="ms-subtitle">Please hand the device to your parent/guardian...</p>}
          {step === 'CONSENT' && <p className="ms-subtitle">Parental Consent & Signature</p>}
          {step === 'SUCCESS' && <p className="ms-subtitle">Account created successfully</p>}
        </div>

        {status === 'error' && (
          <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '13px' }}>{errorMessage}</div>
        )}

        <div className="ms-content">
          {step === 'AGE_SELECTION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <button className="ms-button" onClick={() => handleSelectType('adult')} style={{ padding: '12px' }}>
                I am an Adult (18+)
              </button>
              <button className="ms-button" onClick={() => handleSelectType('minor')} style={{ padding: '12px' }}>
                I am a Minor (Under 18)
              </button>
              <div style={{ fontSize: '13px', marginTop: '16px' }}>
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="ms-link">Sign in</a>
              </div>
            </div>
          )}

          {step === 'USER_DETAILS' && (
            <form onSubmit={handleDetailsSubmit}>
              {renderInput('text', 'Full Name', name, setName)}
              {renderInput('email', 'Email Address', email, setEmail)}
              {renderInput('password', 'Create Password', password, setPassword)}
              
              {userType === 'minor' && (
                <>
                  <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Parent/Guardian Details</div>
                  {renderInput('text', "Parent's Full Name", parentName, setParentName)}
                  {renderInput('email', "Parent's Email Address", parentEmail, setParentEmail)}
                </>
              )}

              <div className="ms-actions" style={{ justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" className="ms-button" onClick={() => setStep('AGE_SELECTION')}>Back</button>
                <button type="submit" className="ms-button ms-button-primary">Next</button>
              </div>
            </form>
          )}

          {step === 'GETTING_PARENT' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div className="ms-loader-overlay" style={{ position: 'relative', background: 'transparent' }}>
                <div className="ms-loading-dots">
                  <div className="ms-dot"></div><div className="ms-dot"></div><div className="ms-dot"></div>
                </div>
              </div>
              <p style={{ marginTop: '16px', fontSize: '15px' }}>Waiting for parent...</p>
            </div>
          )}

          {step === 'CONSENT' && (
            <div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: '#f3f2f1' }}>
                <strong>OpenRockets Terms of Service & Consent</strong><br/>
                {userType === 'minor' ? (
                  <>I, {parentName}, hereby grant permission for my child, {name}, to create an OpenRockets account and access the ecosystem. I understand the privacy policy and consent to the collection of necessary data.</>
                ) : (
                  <>I, {name}, hereby agree to the OpenRockets Terms of Service and Privacy Policy. I certify that I am 18 years of age or older.</>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Please sign below:</label>
                <div style={{ border: '1px solid #8A8886', background: '#fff' }}>
                  <SignatureCanvas 
                    ref={sigPad} 
                    canvasProps={{ width: 400, height: 150, className: 'sigCanvas' }} 
                    penColor="black"
                  />
                </div>
                <button type="button" onClick={() => sigPad.current?.clear()} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0067b8', cursor: 'pointer', padding: '4px 0' }}>
                  Clear Signature
                </button>
              </div>

              <div className="ms-actions" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="ms-button" onClick={() => setStep('USER_DETAILS')} disabled={status === 'loading'}>Back</button>
                <button type="button" className="ms-button ms-button-primary" onClick={submitRegistration} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Creating...' : 'Accept & Create Account'}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', color: '#107c10', marginBottom: '16px' }}>✓</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Account Created</h3>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                We've sent a verification email to <strong>{email}</strong>. 
                {userType === 'minor' && <span> We also sent a copy to your parent at <strong>{parentEmail}</strong>.</span>}
                <br/><br/>
                <strong>You must verify your email before you can log in.</strong>
              </p>
              <button className="ms-button ms-button-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
