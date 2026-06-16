import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { AmbientBackground } from './AmbientBackground';
import { FaceAgeDetector } from './auth/FaceAgeDetector';
import { MembershipCard } from './auth/MembershipCard';
import logoPath from '../assets/openrocketsvc1.png';

import { sendOtp, verifyOtp, registerMinorWizard } from '../api';

type Step = 'PARENT_STATEMENT' | 'PARENT_VERIFICATION' | 'PARENT_DETAILS' | 'CONSENT' | 'MINOR_VERIFICATION' | 'MINOR_PROFILE_SETUP' | 'SUCCESS_CARD';

const PLACEHOLDER_AVATARS = [
  'https://raw.githubusercontent.com/roma-lukashik/animal-avatar-generator/e9b435bb28c8ae2dda224678bdda8faad6035373/preview.svg',
  'https://img.magnific.com/premium-photo/animal-cat-icon-3d-rendering-isolated-background_150525-3349.jpg',
  'https://www.svgrepo.com/show/420337/animal-avatar-bear.svg'
];

export const RegisterWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('PARENT_STATEMENT');
  const [parentSignatureData, setParentSignatureData] = useState('');
  const [profileFileName, setProfileFileName] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [pin, setPin] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtp, setParentOtp] = useState('');
  const [parentEmailVerified, setParentEmailVerified] = useState(false);

  const [minorOtpSent, setMinorOtpSent] = useState(false);
  const [minorOtp, setMinorOtp] = useState('');
  const [minorEmailVerified, setMinorEmailVerified] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [parentOtpError, setParentOtpError] = useState('');
  const [minorOtpError, setMinorOtpError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  const sigPad = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 800);
    // Pre-select a random placeholder
    setProfileImage(PLACEHOLDER_AVATARS[Math.floor(Math.random() * PLACEHOLDER_AVATARS.length)]);
    return () => clearTimeout(timer);
  }, []);


  const handleParentAgeDetected = (averageAge: number) => {
    if (averageAge < 18) {
      setErrorMessage("Verification failed. The person detected appears to be a minor.");
      setStatus('error');
    } else {
      setErrorMessage('');
      setStatus('idle');
      setStep('PARENT_DETAILS');
    }
  };

  const handleMinorVerification = (averageAge: number) => {
    if (averageAge >= 35) {
      setErrorMessage("Verification failed. The person detected appears to be an adult. This flow is for minors.");
      setStatus('error');
    } else {
      setErrorMessage('');
      setStatus('idle');
      setStep('MINOR_PROFILE_SETUP');
    }
  };

  const handleParentConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigPad.current || sigPad.current.isEmpty()) {
       setErrorMessage("Parent signature is required.");
       return;
    }
    try {
      setParentSignatureData(sigPad.current.toDataURL('image/png'));
    } catch (err) {
      console.error("Signature save error:", err);
      // allow to proceed even if canvas export fails
    }
    setErrorMessage('');
    setStep('MINOR_VERIFICATION');
  };

  const handleSendParentOtp = async () => {
    if (!parentEmail) return;
    setStatus('loading');
    try {
      await sendOtp(parentEmail, 'parent');
      setParentOtpSent(true);
    } catch (err: any) {
      setErrorMessage("Failed to send OTP.");
      setStatus('error');
    }
    setStatus('idle');
  };

  const handleVerifyParentOtp = async () => {
    setParentOtpError('');
    if (!parentOtp || parentOtp.length < 6) {
       setParentOtpError("Please enter a valid 6-digit OTP.");
       return;
    }
    setStatus('loading');
    try {
      await verifyOtp(parentEmail, parentOtp, 'parent');
      setParentEmailVerified(true);
      setParentOtpError('');
    } catch (err: any) {
      setParentOtpError(err.response?.data?.message || "Invalid OTP.");
    }
    setStatus('idle');
  };

  const handleSendMinorOtp = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      await sendOtp(email, 'minor');
      setMinorOtpSent(true);
    } catch (err: any) {
      setErrorMessage("Failed to send OTP.");
      setStatus('error');
    }
    setStatus('idle');
  };

  const handleVerifyMinorOtp = async () => {
    setMinorOtpError('');
    if (!minorOtp || minorOtp.length < 6) {
       setMinorOtpError("Please enter a valid 6-digit OTP.");
       return;
    }
    setStatus('loading');
    try {
      await verifyOtp(email, minorOtp, 'minor');
      setMinorEmailVerified(true);
      setMinorOtpError('');
    } catch (err: any) {
      setMinorOtpError(err.response?.data?.message || "Invalid OTP.");
    }
    setStatus('idle');
  };

  const submitRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!minorEmailVerified) {
      setErrorMessage("Please verify your email code first.");
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('parent_email', parentEmail);
      formData.append('parent_name', parentName);
      formData.append('dob', dob);
      formData.append('pin', pin);
      formData.append('signature', parentSignatureData);

      // Extract raw File if available (using a hack from the image src or ideally keeping raw File in state)
      // Since profileImage is a dataUrl, we should ideally fetch it and convert to blob
      if (profileImage && profileImage.startsWith('data:image')) {
          const res = await fetch(profileImage);
          const blob = await res.blob();
          formData.append('profile_image', blob, profileFileName || 'avatar.png');
      }

      const response = await registerMinorWizard(formData);
      
      if (response.token) {
        const encryptedToken = window.btoa(response.token);
        localStorage.setItem('_or_auth_tk', encryptedToken);
      }

      setStatus('idle');
      setStep('SUCCESS_CARD');
    } catch (err: any) {
      console.error("Registration error", err);
      setErrorMessage(err.response?.data?.message || "Registration failed.");
      setStatus('error');
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
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image too large. Please select an image under 5MB.");
        return;
      }
      setProfileFileName(file.name);
      setIsUploading(true);
      setUploadError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setProfileImage(reader.result as string);
          setIsUploading(false);
          setUploadError('');
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className={`ms-card ${(initialLoad || aiLoading) ? 'is-loading-initial' : ''} ${step === 'MINOR_PROFILE_SETUP' ? 'expanded' : ''}`} style={{ position: 'relative', maxWidth: step === 'MINOR_PROFILE_SETUP' ? '800px' : '440px', transition: 'max-width 0.5s ease' }}>
        
        {(status === 'loading' || initialLoad || aiLoading) && (
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

        <div className="ms-logo-container" style={{ marginBottom: aiLoading ? '0' : '16px', transition: 'margin 0.5s ease' }}>
          <img src={logoPath} alt="OpenRockets Logo" className="ms-logo-img" />
        </div>

        {aiLoading && (
          <div style={{ marginTop: '16px', animation: 'fadeIn 0.5s ease' }}>
            <p className="ms-description" style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--ms-text-secondary)' }}>
              This feature uses AI...
            </p>
          </div>
        )}
        
        <div className="ms-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {step !== 'SUCCESS_CARD' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: aiLoading ? 'column' : 'row', 
              justifyContent: aiLoading ? 'flex-start' : 'space-between', 
              alignItems: aiLoading ? 'flex-start' : 'flex-end', 
              marginBottom: '24px',
              gap: aiLoading ? '8px' : '0',
              transition: 'all 0.3s ease'
            }}>
              <h1 className="ms-title" style={{ margin: 0 }}>Create account</h1>
              <span style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', paddingBottom: '4px' }}>
                Step <strong style={{ fontSize: '24px', color: '#000', fontWeight: 'bold' }}>{
                  step === 'PARENT_STATEMENT' ? 1 : step === 'PARENT_VERIFICATION' ? 2 : step === 'PARENT_DETAILS' ? 3 : step === 'CONSENT' ? 4 : step === 'MINOR_VERIFICATION' ? 5 : step === 'MINOR_PROFILE_SETUP' ? 6 : 1
                }</strong> of 6
              </span>
            </div>
          )}

          <div className="ms-card-scrollable">
            


            {step === 'PARENT_STATEMENT' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Data Privacy Statement</h3>
                <div style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  padding: '16px', 
                  background: 'rgba(0,0,0,0.02)', 
                  border: '1px solid var(--ms-border)', 
                  borderRadius: '4px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--ms-text)'
                }}>
                  <p><strong>Your Privacy is Our Priority</strong></p>
                  <p style={{ marginBottom: '12px' }}>
                    OpenRockets is a 100% teen-run corporation based in the United States, operated by high schoolers and teenagers. Our mission is to make a positive impact on our community, and our primary goal is to provide the highest security standards for our users—which means teenagers, minors, and their supervising parents.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>How We Process Data:</strong> You will notice that we use video technology and artificial intelligence to predict your age internally, directly inside your device. Meaning that your data will never be shared with a separate data center. Since we utilize local JavaScript technologies and AI frameworks, everything is fully transparent.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Legal Compliance:</strong> We must justify our use of video technologies based on the <a href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-primary)' }}>Child Online Privacy Protection Act (COPPA)</a> in the United States, and the <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-primary)' }}>GDPR</a> in Europe (and other countries where applicable). This rigorous process is to certify to parents and governments that we are verifying teenagers and minors properly. We collect and store teenagers and minors data securely in an encrypted manner that meets or exceeds industry standard practices.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>Why The High Standards?</strong> We use AI age prediction and two-step email verification because this single OpenRockets account grants teenagers and minors access to more than 30+ OpenRockets services via Single Sign-On. Furthermore, as of January 2026, 50 to 60 external organizations are integrating our account system via our API. Teenagers and minors will use this same account to access those external services. This is why we maintain such a high-standard, secure account system—so only teenagers and minors can access and benefit from it safely.
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    To see exactly how we secure your data and how transparent we are, please review our legal policies:
                    <br />
                    • <a href="https://openrockets.com/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-primary)' }}>openrockets.com/legal/privacy</a>
                    <br />
                    • <a href="https://openrockets.com/legal/id-verification" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-primary)' }}>openrockets.com/legal/id-verification</a>
                  </p>
                  <p style={{ marginTop: '16px', fontSize: '13px', fontStyle: 'italic', color: 'var(--ms-text-secondary)', textAlign: 'right', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px' }}>
                    written by; United States Rep: Ryan Chan
                  </p>
                </div>
                <div className="ms-button-group" style={{ justifyContent: 'flex-end' }}>
                  <button className="ms-button ms-button-primary" onClick={() => setStep('PARENT_VERIFICATION')}>Next</button>
                </div>
              </div>
            )}

            {step === 'PARENT_VERIFICATION' && (
              <>
                {status !== 'error' ? (
                  <FaceAgeDetector 
                    onComplete={handleParentAgeDetected} 
                    title="Parent or Guardian Verification"
                    onLoadingChange={setAiLoading}
                    subtitle={
                      <>
                        To comply with safety regulations, we need to determine you are an adult who is either a legal parent or guardian. Your face data is never sent to any other place, and they are processed internally inside your device.
                        <br/><br/>
                        <a href="https://openrockets.com/legal/ID-verification" target="_blank" rel="noreferrer" style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}>
                          Learn more about data handling process and safety measures
                        </a>
                      </>
                    }
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Verification Failed</h3>
                    <p style={{ color: '#E81123', marginBottom: '24px' }}>{errorMessage}</p>
                    <button className="ms-button ms-button-primary" onClick={() => setStatus('idle')}>Try Again</button>
                  </div>
                )}
              </>
            )}

            {step === 'PARENT_DETAILS' && (
              <form onSubmit={(e) => { e.preventDefault(); setStep('CONSENT'); }}>
                <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Parent Details</p>
                <p className="ms-description" style={{ fontSize: '14px', marginBottom: '16px' }}>Please provide your details as the consenting parent/guardian.</p>
                {renderInput('text', "Parent's Full Name", parentName, setParentName)}
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="email"
                        placeholder="Parent's Email Address"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        required={true}
                        disabled={status === 'loading' || parentEmailVerified}
                        style={{
                          width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--ms-border)',
                          outline: 'none', fontSize: '15px', background: 'transparent', color: 'var(--ms-text)'
                        }}
                      />
                    </div>
                    {!parentEmailVerified && (
                      <button type="button" className="ms-button ms-button-secondary" 
                        onClick={handleSendParentOtp}
                        disabled={!parentEmail || parentOtpSent || status === 'loading'}
                        style={{ height: '37px', whiteSpace: 'nowrap' }}
                      >
                        {parentOtpSent ? 'Code Sent' : 'Send Code'}
                      </button>
                    )}
                  </div>
                  
                  {parentOtpSent && !parentEmailVerified && (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <input 
                          type="text" 
                          placeholder="Enter 6-digit OTP" 
                          value={parentOtp} 
                          onChange={e => setParentOtp(e.target.value)} 
                          maxLength={6}
                          style={{ flex: 1, padding: '8px', border: '1px solid var(--ms-border)', outline: 'none' }}
                        />
                        <button type="button" className="ms-button ms-button-primary" onClick={handleVerifyParentOtp} style={{ height: '37px' }}>
                          Verify
                        </button>
                      </div>
                      {parentOtpError && <div style={{ color: '#E81123', marginTop: '8px', fontSize: '13px' }}>{parentOtpError}</div>}
                    </>
                  )}
                  {parentEmailVerified && (
                    <div style={{ color: '#107c10', fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>✓ Parent Email Verified</div>
                  )}
                </div>

                {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}

                <div className="ms-button-group" style={{ justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="ms-button ms-button-secondary" onClick={() => setStep('PARENT_VERIFICATION')}>Back</button>
                  <button type="submit" className="ms-button ms-button-primary" disabled={!parentEmailVerified}>Next</button>
                </div>
              </form>
            )}

            {step === 'CONSENT' && (
              <form onSubmit={handleParentConsentSubmit}>
                <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Terms & Consent</p>

                <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--ms-border)' }}>
                  <strong>OpenRockets Terms of Service & Consent</strong><br/><br/>
                  <>I, {parentName || '[Parent Name]'}, hereby grant permission for my child to create an OpenRockets account. I understand the privacy policy and consent to the collection of necessary data.</>
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
                  <button type="button" className="ms-button ms-button-secondary" onClick={() => setStep('PARENT_DETAILS')} disabled={status === 'loading'}>Back</button>
                  <button type="submit" className="ms-button ms-button-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Processing...' : 'Grant Consent'}
                  </button>
                </div>
              </form>
            )}

            {step === 'MINOR_VERIFICATION' && (
              <>
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <h3 className="ms-title" style={{ fontSize: '20px' }}>Hand device back to child</h3>
                  <p className="ms-description">Thank you for consenting. Please hand the device back to the minor to create their profile.</p>
                </div>
                {status !== 'error' ? (
                  <FaceAgeDetector 
                    onComplete={handleMinorVerification} 
                    title="Child Verification"
                    subtitle="Please position your face to verify."
                    onLoadingChange={setAiLoading}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Verification Failed</h3>
                    <p style={{ color: '#E81123', marginBottom: '24px' }}>{errorMessage}</p>
                    <button className="ms-button ms-button-primary" onClick={() => setStatus('idle')}>Try Again</button>
                  </div>
                )}
              </>
            )}

            {step === 'MINOR_PROFILE_SETUP' && (
              <div className="ms-split-container">
                <div className="ms-split-form">
                  <form onSubmit={submitRegistration}>
                    <p className="ms-description" style={{ marginBottom: '16px', fontWeight: 600 }}>Create Your Profile</p>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--ms-text)' }}>Profile Picture</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          type="button" 
                          className="ms-button ms-button-primary" 
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                          onClick={() => document.getElementById('profile-upload-input')?.click()}
                        >
                          Choose File
                        </button>
                        <span style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {profileFileName || 'No file chosen'}
                        </span>
                        <input 
                          id="profile-upload-input"
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          style={{ display: 'none' }} 
                        />
                      </div>
                      {uploadError && <div style={{ color: '#E81123', marginTop: '8px', fontSize: '13px' }}>{uploadError}</div>}
                    </div>

                    {renderInput('text', 'Your Full Name', name, setName)}
                    
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="email"
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={true}
                            disabled={status === 'loading' || minorEmailVerified}
                            style={{
                              width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--ms-border)',
                              outline: 'none', fontSize: '15px', background: 'transparent', color: 'var(--ms-text)'
                            }}
                          />
                        </div>
                        {!minorEmailVerified && (
                          <button type="button" className="ms-button ms-button-secondary" 
                            onClick={handleSendMinorOtp}
                            disabled={!email || minorOtpSent || status === 'loading'}
                            style={{ height: '37px', whiteSpace: 'nowrap' }}
                          >
                            {minorOtpSent ? 'Code Sent' : 'Send Code'}
                          </button>
                        )}
                      </div>
                      
                      {minorOtpSent && !minorEmailVerified && (
                        <>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <input 
                              type="text" 
                              placeholder="Enter 6-digit OTP" 
                              value={minorOtp} 
                              onChange={e => setMinorOtp(e.target.value)} 
                              maxLength={6}
                              style={{ flex: 1, padding: '8px', border: '1px solid var(--ms-border)', outline: 'none' }}
                            />
                            <button type="button" className="ms-button ms-button-primary" onClick={handleVerifyMinorOtp} style={{ height: '37px' }}>
                              Verify
                            </button>
                          </div>
                          {minorOtpError && <div style={{ color: '#E81123', marginTop: '8px', fontSize: '13px' }}>{minorOtpError}</div>}
                        </>
                      )}
                      {minorEmailVerified && (
                        <div style={{ color: '#107c10', fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>✓ Email Verified</div>
                      )}
                    </div>

                    {renderInput('password', 'Create Password', password, setPassword)}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>{renderInput('date', 'Date of Birth', dob, setDob)}</div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="password"
                          placeholder="4-Digit PIN"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          required={true}
                          disabled={status === 'loading'}
                          maxLength={4}
                          style={{
                            width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--ms-border)',
                            outline: 'none', fontSize: '15px', marginBottom: '16px', background: 'transparent', color: 'var(--ms-text)'
                          }}
                        />
                      </div>
                    </div>
                    {renderInput('tel', 'Phone Number (Optional)', phone, setPhone, false)}
                    
                    {status === 'error' && <div style={{ color: '#E81123', marginBottom: '16px', fontSize: '14px' }}>{errorMessage}</div>}

                    <div className="ms-button-group" style={{ marginTop: '24px' }}>
                      <button 
                        type="submit" 
                        className="ms-button ms-button-primary" 
                        style={{ width: '100%', opacity: !minorEmailVerified ? 0.6 : 1, cursor: !minorEmailVerified ? 'not-allowed' : 'pointer' }}
                        onClick={(e) => {
                          if (!minorEmailVerified) {
                            e.preventDefault();
                            setErrorMessage("Please verify your email code first.");
                            setStatus('error');
                          }
                        }}
                      >
                        {status === 'loading' ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="ms-split-preview" style={{ justifyContent: 'center' }}>
                  <img src={profileImage} alt="Profile Preview" className={`profile-preview-avatar ${isUploading ? 'ms-upload-anim' : ''}`} style={{ width: '120px', height: '120px', marginBottom: '16px' }} />
                  <div className="profile-preview-name" style={{ fontSize: '18px' }}>{name || 'Your Name'}</div>
                  <div className="profile-preview-email" style={{ fontSize: '14px' }}>{email || 'your.email@example.com'}</div>
                  {phone && <div style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', marginTop: '8px' }}>{phone}</div>}
                </div>
              </div>
            )}

            {step === 'SUCCESS_CARD' && (
              <MembershipCard name={name} password={password} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
