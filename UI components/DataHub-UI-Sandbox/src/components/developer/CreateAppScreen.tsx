import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Plus, Trash2 } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';
import axios from 'axios';

// Create a custom axios instance pointing to the live backend
const api = axios.create({
  baseURL: 'https://openrocketsauth.alwaysdata.net',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export const CreateAppScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ client_id: string; client_secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    homepage_url: '',
    privacy_policy_url: '',
    redirect_uris: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUriChange = (index: number, value: string) => {
    const newUris = [...formData.redirect_uris];
    newUris[index] = value;
    setFormData({ ...formData, redirect_uris: newUris });
    if (errors[`redirect_uris.${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`redirect_uris.${index}`];
      setErrors(newErrors);
    }
  };

  const addUri = () => {
    if (formData.redirect_uris.length < 10) {
      setFormData({ ...formData, redirect_uris: [...formData.redirect_uris, ''] });
    }
  };

  const removeUri = (index: number) => {
    if (formData.redirect_uris.length > 1) {
      const newUris = formData.redirect_uris.filter((_, i) => i !== index);
      setFormData({ ...formData, redirect_uris: newUris });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Application name is required';
    
    // Quick validation for URLs
    const urlPattern = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const localhostPattern = /^(http:\/\/)(localhost|127\.0\.0\.1)(:\d+)?([\/\w \.-]*)*\/?$/;
    
    formData.redirect_uris.forEach((uri, i) => {
      if (!uri) {
        newErrors[`redirect_uris.${i}`] = 'Redirect URI cannot be empty';
      } else if (!urlPattern.test(uri) && !localhostPattern.test(uri)) {
        newErrors[`redirect_uris.${i}`] = 'Must be a valid HTTPS URL or localhost HTTP URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // Send comma separated URIs or array depending on Laravel Passport requirement.
      // Passport typically accepts comma-separated string for redirect
      const redirectUriString = formData.redirect_uris.filter(u => u.trim() !== '').join(',');
      
      const response = await api.post('/oauth/clients', {
        name: formData.name,
        redirect: redirectUriString,
        description: formData.description,
        homepage_url: formData.homepage_url,
      });

      setSuccessData({
        client_id: response.data.id || response.data.client_id || 'Unknown',
        client_secret: response.data.secret || response.data.client_secret || 'Unknown',
      });
    } catch (err: any) {
      console.error('Error creating OAuth client:', err);
      alert('Failed to create application. Ensure your backend has Passport configured and you are authenticated.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecret = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.client_secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 0' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px auto' }}>
          <Check size={32} color="#000000" />
        </div>
        <h1 style={{ textAlign: 'center', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '500' }}>Application Created</h1>
        <p style={{ textAlign: 'center', margin: '0 0 32px 0', fontSize: '15px', opacity: 0.8 }}>
          Your application "{formData.name}" has been registered successfully.
        </p>

        <div style={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', opacity: 0.6 }}>Client ID</label>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', padding: '12px', backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px' }}>
              {successData.client_id}
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Client Secret</span>
              <span style={{ fontSize: '12px', color: '#ff4444', fontWeight: '500' }}>Shown only once!</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '16px', padding: '12px', backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px', overflowX: 'auto' }}>
                {successData.client_secret}
              </div>
              <button 
                onClick={copySecret}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  backgroundColor: copied ? '#ffffff' : '#222222',
                  color: copied ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.6 }}>
              Copy this secret and store it securely. You will not be able to see it again.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/developer/apps')}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <button 
        onClick={() => navigate('/developer/apps')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          fontSize: '15px',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '24px',
          opacity: 0.8
        }}
      >
        <ArrowLeft size={18} />
        Back to Apps
      </button>

      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500' }}>Create New App</h1>
      <p style={{ margin: '0 0 32px 0', fontSize: '15px', opacity: 0.8 }}>
        Register a new application to obtain OAuth credentials.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Info */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>Basic Information</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Application Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (errors.name) setErrors({...errors, name: ''});
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#000000',
                  border: `1px solid ${errors.name ? '#ff4444' : '#444'}`,
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                placeholder="My Awesome App"
              />
              {errors.name && <span style={{ color: '#ff4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#000000',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '15px',
                  minHeight: '100px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="What does your app do?"
              />
            </div>
          </div>
        </div>

        {/* URLs */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500' }}>OAuth Configuration</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Redirect URIs *</label>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: '0 0 12px 0' }}>Where should we redirect users after they authorize your app?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.redirect_uris.map((uri, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={uri}
                      onChange={(e) => handleUriChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: '#000000',
                        border: `1px solid ${errors[`redirect_uris.${index}`] ? '#ff4444' : '#444'}`,
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontFamily: 'monospace'
                      }}
                      placeholder="https://yourapp.com/callback"
                    />
                    {formData.redirect_uris.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeUri(index)}
                        style={{
                          width: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#222',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ff4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {errors[`redirect_uris.${index}`] && (
                    <span style={{ color: '#ff4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                      {errors[`redirect_uris.${index}`]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {formData.redirect_uris.length < 10 && (
              <button 
                type="button"
                onClick={addUri}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  padding: '12px 0',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                <Plus size={16} /> Add another URI
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button 
            type="button"
            onClick={() => navigate('/developer/apps')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #444',
              borderRadius: '24px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 32px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '24px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '140px'
            }}
          >
            {isSubmitting ? (
              <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                <MicrosoftLoadingDots />
              </div>
            ) : 'Create App'}
          </button>
        </div>

      </form>
    </div>
  );
};
