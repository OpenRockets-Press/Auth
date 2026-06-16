import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { AmbientBackground } from './AmbientBackground';
import { FaceAgeDetector } from './auth/FaceAgeDetector';
import logoPath from '../assets/openrocketsvc1.png';

const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

type Step = 'AGE_SELECTION' | 'USER_DETAILS' | 'GETTING_PARENT' | 'PARENT_VERIFICATION' | 'CONSENT' | 'SUCCESS';
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
  const [initialLoad, setInitialLoad] = useState(true);
  
  const sigPad = useRef<SignatureCanvas>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAgeDetected = (_averageAge: number, isAdult: boolean) => {
    setUserType(isAdult ? 'adult' : 'minor');
    setStep('USER_DETAILS');
  };

  const handleParentAgeDetected = (_averageAge: number, isAdult: boolean) => {
    if (!isAdult) {
      setErrorMessage("Parent verification failed. The person detected appears to be a minor.");
      // Go back to getting parent
      setStep('GETTING_PARENT');
    } else {
      setErrorMessage('');
      setStep('CONSENT');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'minor') {
      setStep('GETTING_PARENT');
    } else {
      setStep('CONSENT');
    }
  };

  const submitRegistration = async () => {
    if (userType === 'adult' && (!sigPad.current || sigPad.current.isEmpty())) {
      setErrorMessage("Please provide a signature to continue.");
      return;
    }
    
    if (userType === 'minor' && (!sigPad.current || sigPad.current.isEmpty())) {
       setErrorMessage("Parent signature is required.");
       return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    const signatureBase64 = sigPad.current ? sigPad.current.getTrimmedCanvas().toDataURL('image/png') : '';

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
        width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--ms-border)',
        outline: 'none', fontSize: '15px', marginBottom: '16px', background: 'transparent', color: 'var(--ms-text)'
      }}
    />
  );

  return (
    <>
      <AmbientBackground />
      <div className={`ms-card ${initialLoad ? 'is-loading-initial' : ''}`} style={{ position: 'relative', maxWidth: step === 'AGE_SELECTION' || step === 'PARENT_VERIFICATION' ? '500px' : '440px' }}>
        
        {(status === 'loading' || initialLoad) && (
          <div className="ms-loader-overlay">
            <div className="ms-loader-container">
              <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
            </div>
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>
        
        <div className="ms-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <h1 className="ms-title" style={{ marginBottom: '24px' }}>Create account</h1>

          {status === 'error' && (
            <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>
          )}

          <div className="ms-card-scrollable">
            {step === 'AGE_SELECTION' && (
              <FaceAgeDetector 
                onComplete={handleAgeDetected} 
                title="Identity Verification"
                subtitle="To comply with safety regulations, we need to determine if you are an adult or a minor. Your image is processed entirely on your device and is not saved."
              />
            )}

            {step === 'USER_DETAILS' && (
            <form onSubmit={handleDetailsSubmit}>
              <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Enter your details</p>
              {renderInput('text', 'Full Name', name, setName)}
              {renderInput('email', 'Email Address', email, setEmail)}
              {renderInput('password', 'Create Password', password, setPassword)}
              
              {userType === 'minor' && (
                <>
                  <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '15px', fontWeight: 600 }}>Parent/Guardian Details</div>
                  <p className="ms-description" style={{ fontSize: '13px', marginBottom: '16px' }}>
                    Because you are a minor, we need your parent's consent.
                  </p>
                  {renderInput('text', "Parent's Full Name", parentName, setParentName)}
                  {renderInput('email', "Parent's Email Address", parentEmail, setParentEmail)}
                </>
              )}

              <div className="ms-button-group" style={{ justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" className="ms-button ms-button-secondary" onClick={() => setStep('AGE_SELECTION')}>Back</button>
                <button type="submit" className="ms-button ms-button-primary">Next</button>
              </div>
            </form>
          )}

          {step === 'GETTING_PARENT' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Parental Consent Required</h3>
              <p className="ms-description" style={{ marginBottom: '24px' }}>
                Please hand the device to your parent or guardian to verify their identity and provide consent.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="ms-button ms-button-primary" onClick={() => setStep('PARENT_VERIFICATION')} style={{ width: '100%', padding: '12px' }}>
                  I am the Parent / Ready
                </button>
                <button className="ms-button ms-button-secondary" onClick={() => setStep('USER_DETAILS')} style={{ width: '100%', padding: '12px' }}>
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'PARENT_VERIFICATION' && (
            <FaceAgeDetector 
              onComplete={handleParentAgeDetected} 
              title="Parent Verification"
              subtitle="Please take three photos to verify that you are an adult. This is processed securely on your device."
            />
          )}

          {step === 'CONSENT' && (
            <div>
              <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Terms & Consent</p>
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--ms-border)' }}>
                <strong>OpenRockets Terms of Service & Consent</strong><br/><br/>
                {userType === 'minor' ? (
                  <>I, {parentName}, hereby grant permission for my child, {name}, to create an OpenRockets account and access the ecosystem. I understand the privacy policy and consent to the collection of necessary data.</>
                ) : (
                  <>I, {name}, hereby agree to the OpenRockets Terms of Service and Privacy Policy. I certify that I am 18 years of age or older.</>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--ms-text)' }}>Please sign below:</label>
                <div style={{ border: '1px solid var(--ms-border)', background: '#fff' }}>
                  <SignatureCanvas 
                    ref={sigPad} 
                    canvasProps={{ width: 400, height: 150, className: 'sigCanvas' }} 
                    penColor="black"
                  />
                </div>
                <button type="button" onClick={() => sigPad.current?.clear()} style={{ fontSize: '13px', background: 'none', border: 'none', color: 'var(--theme-primary)', cursor: 'pointer', padding: '6px 0', marginTop: '4px' }}>
                  Clear Signature
                </button>
              </div>

              <div className="ms-button-group" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="ms-button ms-button-secondary" onClick={() => setStep(userType === 'minor' ? 'GETTING_PARENT' : 'USER_DETAILS')} disabled={status === 'loading'}>Back</button>
                <button type="button" className="ms-button ms-button-primary" onClick={submitRegistration} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Creating...' : 'Accept & Create Account'}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', color: '#107c10', marginBottom: '16px' }}>✓</div>
              <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '8px' }}>Account Created</h3>
              <p className="ms-description" style={{ marginBottom: '24px' }}>
                We've sent a verification email to <strong>{email}</strong>. 
                {userType === 'minor' && <span> We also sent a copy to your parent at <strong>{parentEmail}</strong>.</span>}
                <br/><br/>
                <strong>You must verify your email before you can log in.</strong>
              </p>
              <button className="ms-button ms-button-primary" onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px' }}>
                Return to Sign In
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};
