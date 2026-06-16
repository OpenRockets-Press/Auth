import React, { useState, useRef, useEffect } from 'react';
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

type Step = 'AGE_SELECTION' | 'USER_DETAILS' | 'GETTING_PARENT' | 'PARENT_VERIFICATION' | 'CONSENT' | 'MINOR_VERIFICATION' | 'MINOR_PROFILE_SETUP' | 'SUCCESS';
type UserType = 'adult' | 'minor' | null;

const PLACEHOLDER_AVATARS = [
  'https://raw.githubusercontent.com/roma-lukashik/animal-avatar-generator/e9b435bb28c8ae2dda224678bdda8faad6035373/preview.svg',
  'https://img.magnific.com/premium-photo/animal-cat-icon-3d-rendering-isolated-background_150525-3349.jpg',
  'https://www.svgrepo.com/show/420337/animal-avatar-bear.svg'
];

export const RegisterWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('AGE_SELECTION');
  const [userType, setUserType] = useState<UserType>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  
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
    // Pre-select a random placeholder
    setProfileImage(PLACEHOLDER_AVATARS[Math.floor(Math.random() * PLACEHOLDER_AVATARS.length)]);
    return () => clearTimeout(timer);
  }, []);

  const handleAgeDetected = (_averageAge: number, isAdult: boolean) => {
    setUserType(isAdult ? 'adult' : 'minor');
    if (isAdult) {
      setStep('USER_DETAILS');
    } else {
      setStep('GETTING_PARENT');
    }
  };

  const handleParentAgeDetected = (_averageAge: number, isAdult: boolean) => {
    if (!isAdult) {
      setErrorMessage("Parent verification failed. The person detected appears to be a minor.");
      setStep('GETTING_PARENT');
    } else {
      setErrorMessage('');
      setStep('CONSENT');
    }
  };

  const handleMinorVerification = (_averageAge: number, isAdult: boolean) => {
    if (isAdult) {
      setErrorMessage("Verification failed. The person detected appears to be an adult. This flow is for minors.");
    } else {
      setErrorMessage('');
      setStep('MINOR_PROFILE_SETUP');
    }
  };

  const handleAdultDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('CONSENT');
  };

  const handleParentConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigPad.current || sigPad.current.isEmpty()) {
       setErrorMessage("Parent signature is required.");
       return;
    }
    setErrorMessage('');
    setStep('MINOR_VERIFICATION');
  };

  const submitRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (userType === 'adult' && (!sigPad.current || sigPad.current.isEmpty())) {
      setErrorMessage("Please provide a signature to continue.");
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    const signatureBase64 = sigPad.current ? sigPad.current.getTrimmedCanvas().toDataURL('image/png') : '';

    try {
      const response = await api.post('/api/auth/register-with-consent', {
        name,
        email,
        password,
        password_confirmation: password,
        phone,
        profile_image: profileImage,
        is_minor: userType === 'minor',
        parent_name: userType === 'minor' ? parentName : null,
        parent_email: userType === 'minor' ? parentEmail : null,
        signature: signatureBase64
      });
      
      // Indefinite encrypted token storage
      if (response.data.token) {
        // Obfuscation/Encryption placeholder (btoa for now)
        const encryptedToken = window.btoa(response.data.token);
        localStorage.setItem('_or_auth_tk', encryptedToken);
      }

      setStatus('idle');
      setStep('SUCCESS');
      
      // Auto-redirect if token was received
      if (response.data.token) {
        setTimeout(() => {
          window.location.href = 'https://myaccount.openrockets.com';
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('Registration Error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'An error occurred during registration.');
    }
  };

  const renderInput = (type: string, placeholder: string, value: string, onChange: (val: string) => void, required = true) => (
    <input
      type={type}
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className={`ms-card ${initialLoad ? 'is-loading-initial' : ''} ${step === 'MINOR_PROFILE_SETUP' ? 'expanded' : ''}`} style={{ position: 'relative', maxWidth: step === 'MINOR_PROFILE_SETUP' ? '800px' : (step === 'AGE_SELECTION' || step === 'PARENT_VERIFICATION' || step === 'MINOR_VERIFICATION' ? '500px' : '440px') }}>
        
        {(status === 'loading' || initialLoad) && (
          <div className="ms-loader-overlay">
            <div className="ms-loader-container">
              <div className={`anim-dot dot1 ${status === 'error' ? 'error-dot' : ''}`}></div>
              <div className={`anim-dot dot2 ${status === 'error' ? 'error-dot' : ''}`}></div>
              <div className={`anim-dot dot3 ${status === 'error' ? 'error-dot' : ''}`}></div>
              <div className={`anim-dot dot4 ${status === 'error' ? 'error-dot' : ''}`}></div>
              <div className={`anim-dot dot5 ${status === 'error' ? 'error-dot' : ''}`}></div>
            </div>
          </div>
        )}

        <div className="ms-logo-container">
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>
        
        <div className="ms-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {step !== 'SUCCESS' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <h1 className="ms-title" style={{ margin: 0 }}>Create account</h1>
              <span style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', paddingBottom: '4px' }}>
                Step {
                  userType === 'minor' 
                    ? (step === 'GETTING_PARENT' ? 2 : step === 'PARENT_VERIFICATION' ? 3 : step === 'CONSENT' ? 4 : step === 'MINOR_VERIFICATION' ? 5 : step === 'MINOR_PROFILE_SETUP' ? 6 : 1)
                    : (step === 'USER_DETAILS' ? 2 : step === 'CONSENT' ? 3 : 1)
                } of {userType === 'minor' ? 6 : 3}
              </span>
            </div>
          )}

          <div className="ms-card-scrollable">
            
            {step === 'AGE_SELECTION' && (
              <FaceAgeDetector 
                onComplete={handleAgeDetected} 
                title="Identity Verification"
              />
            )}

            {step === 'USER_DETAILS' && (
              <form onSubmit={handleAdultDetailsSubmit}>
                <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Enter your details</p>
                {renderInput('text', 'Full Name', name, setName)}
                {renderInput('email', 'Email Address', email, setEmail)}
                {renderInput('password', 'Create Password', password, setPassword)}
                
                {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}

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
                {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="ms-button ms-button-primary" onClick={() => setStep('PARENT_VERIFICATION')} style={{ width: '100%', padding: '12px' }}>
                    I am the Parent / Ready
                  </button>
                  <button className="ms-button ms-button-secondary" onClick={() => setStep('AGE_SELECTION')} style={{ width: '100%', padding: '12px' }}>
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 'PARENT_VERIFICATION' && (
              <FaceAgeDetector 
                onComplete={handleParentAgeDetected} 
                title="Parent or Guardian Verification"
                subtitle={
                  <>
                    To comply with safety regulations, we need to determine you are an adult who is either a legal parent or guardian. Your face data is never sent to any other place, and they are processed internally inside your device.
                    <br/><br/>
                    <a href="https://openrockets.com/legal/ID-verification" target="_blank" rel="noreferrer" style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}>
                      Learn more how you can trust us
                    </a>
                  </>
                }
              />
            )}

            {step === 'CONSENT' && (
              <form onSubmit={userType === 'minor' ? handleParentConsentSubmit : submitRegistration}>
                <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Terms & Consent</p>
                
                {userType === 'minor' && (
                  <>
                    <p className="ms-description" style={{ fontSize: '14px', marginBottom: '16px' }}>Please provide your details as the consenting parent/guardian.</p>
                    {renderInput('text', "Parent's Full Name", parentName, setParentName)}
                    {renderInput('email', "Parent's Email Address", parentEmail, setParentEmail)}
                  </>
                )}

                <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--ms-border)' }}>
                  <strong>OpenRockets Terms of Service & Consent</strong><br/><br/>
                  {userType === 'minor' ? (
                    <>I, {parentName || '[Parent Name]'}, hereby grant permission for my child to create an OpenRockets account. I understand the privacy policy and consent to the collection of necessary data.</>
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

                {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}

                <div className="ms-button-group" style={{ justifyContent: 'space-between' }}>
                  <button type="button" className="ms-button ms-button-secondary" onClick={() => setStep(userType === 'minor' ? 'GETTING_PARENT' : 'USER_DETAILS')} disabled={status === 'loading'}>Back</button>
                  <button type="submit" className="ms-button ms-button-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Processing...' : (userType === 'minor' ? 'Grant Consent' : 'Accept & Create Account')}
                  </button>
                </div>
              </form>
            )}

            {step === 'MINOR_VERIFICATION' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h3 className="ms-title" style={{ fontSize: '20px' }}>Hand device back to child</h3>
                  <p className="ms-description">Thank you for consenting. Please hand the device back to the minor to create their profile.</p>
                </div>
                <FaceAgeDetector 
                  onComplete={handleMinorVerification} 
                  title="Child Verification"
                  subtitle="Please position your face to verify."
                />
                {status === 'error' && <div style={{ color: '#E81123', marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{errorMessage}</div>}
              </>
            )}

            {step === 'MINOR_PROFILE_SETUP' && (
              <div className="ms-split-container">
                <div className="ms-split-form">
                  <form onSubmit={submitRegistration}>
                    <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Create Your Profile</p>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--ms-text)' }}>Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '14px', color: 'var(--ms-text)' }} />
                    </div>

                    {renderInput('text', 'Your Full Name', name, setName)}
                    {renderInput('email', 'Your Email Address', email, setEmail)}
                    {renderInput('password', 'Create Password', password, setPassword)}
                    {renderInput('tel', 'Phone Number (Optional)', phone, setPhone, false)}
                    
                    {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}

                    <div className="ms-button-group" style={{ marginTop: '24px' }}>
                      <button type="submit" className="ms-button ms-button-primary" disabled={status === 'loading'} style={{ width: '100%' }}>
                        {status === 'loading' ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="ms-split-preview">
                  <p className="ms-description" style={{ marginBottom: '24px', fontWeight: 600 }}>Live Preview</p>
                  <img src={profileImage} alt="Profile Preview" className="profile-preview-avatar" />
                  <div className="profile-preview-name">{name || 'Your Name'}</div>
                  <div className="profile-preview-email">{email || 'your.email@example.com'}</div>
                  {phone && <div style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginTop: '8px' }}>{phone}</div>}
                  <div style={{ marginTop: 'auto', paddingTop: '24px', fontSize: '12px', color: 'var(--theme-primary)', fontWeight: 'bold' }}>
                    OpenRockets Ecosystem
                  </div>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '48px', color: '#107c10', marginBottom: '16px' }}>✓</div>
                <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '8px' }}>Account Created</h3>
                <p className="ms-description" style={{ marginBottom: '24px' }}>
                  We've successfully created your account.
                  <br/><br/>
                  Redirecting to your dashboard...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
