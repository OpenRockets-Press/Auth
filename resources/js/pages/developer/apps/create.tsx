import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, TerminalSquare } from 'lucide-react';

export default function CreateApp() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    homepage_url: '',
    privacy_policy_url: '',
    redirect_uris: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('developer.apps.store'));
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: '8px',
    opacity: 0.9
  };

  const errorStyle = {
    color: '#ff4444',
    fontSize: '13px',
    marginTop: '6px'
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Developer Hub', href: '/developer/apps' }]} fullWidth={true}>
      <Head title="Register Application" />
      
      {/* Sub-header specifically for Developer Hub */}
      <div style={{ backgroundColor: '#111111', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TerminalSquare size={24} color="#8ab4f8" />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: '#ffffff' }}>Developer Hub</h1>
          </div>
          <Link 
            href="/developer/apps"
            style={{ 
              backgroundColor: '#222', color: '#ffffff', padding: '8px 16px', borderRadius: '16px',
              textDecoration: 'none', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222'}
          >
            <ArrowLeft size={16} /> Back to Apps
          </Link>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '500', marginBottom: '8px', color: '#ffffff' }}>Register Application</h2>
        <p style={{ fontSize: '15px', color: '#ffffff', opacity: 0.8, marginBottom: '32px' }}>
          Create a new OAuth client to authenticate users with OpenRockets and access the Data Hub APIs.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label htmlFor="name" style={labelStyle}>App Name *</label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g. My Cool App"
              required
              style={{...inputStyle, borderColor: errors.name ? '#ff4444' : '#333'}}
              onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.name ? '#ff4444' : '#333'}
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="What does your app do?"
              rows={3}
              style={{...inputStyle, resize: 'vertical', borderColor: errors.description ? '#ff4444' : '#333'}}
              onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.description ? '#ff4444' : '#333'}
            />
            {errors.description && <div style={errorStyle}>{errors.description}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="homepage_url" style={labelStyle}>Homepage URL *</label>
              <input
                id="homepage_url"
                type="url"
                value={data.homepage_url}
                onChange={(e) => setData('homepage_url', e.target.value)}
                placeholder="https://mycoolapp.com"
                required
                style={{...inputStyle, borderColor: errors.homepage_url ? '#ff4444' : '#333'}}
                onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.homepage_url ? '#ff4444' : '#333'}
              />
              {errors.homepage_url && <div style={errorStyle}>{errors.homepage_url}</div>}
            </div>

            <div>
              <label htmlFor="privacy_policy_url" style={labelStyle}>Privacy Policy URL *</label>
              <input
                id="privacy_policy_url"
                type="url"
                value={data.privacy_policy_url}
                onChange={(e) => setData('privacy_policy_url', e.target.value)}
                placeholder="https://mycoolapp.com/privacy"
                required
                style={{...inputStyle, borderColor: errors.privacy_policy_url ? '#ff4444' : '#333'}}
                onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.privacy_policy_url ? '#ff4444' : '#333'}
              />
              {errors.privacy_policy_url && <div style={errorStyle}>{errors.privacy_policy_url}</div>}
            </div>
          </div>

          <div>
            <label htmlFor="redirect_uris" style={labelStyle}>Authorized Redirect URIs *</label>
            <textarea
              id="redirect_uris"
              value={data.redirect_uris}
              onChange={(e) => setData('redirect_uris', e.target.value)}
              placeholder="https://mycoolapp.com/callback, https://mycoolapp.com/api/auth/callback"
              rows={3}
              required
              style={{...inputStyle, resize: 'vertical', borderColor: errors.redirect_uris ? '#ff4444' : '#333'}}
              onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
              onBlur={(e) => e.currentTarget.style.borderColor = errors.redirect_uris ? '#ff4444' : '#333'}
            />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              Separate multiple URIs with commas. These are the endpoints OpenRockets will redirect users to after successful authentication.
            </p>
            {errors.redirect_uris && <div style={errorStyle}>{errors.redirect_uris}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', marginTop: '8px', borderTop: '1px solid #333' }}>
            <button 
              type="submit" 
              disabled={processing}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '12px 24px',
                borderRadius: '24px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {processing ? 'Registering...' : 'Register Application'}
            </button>
          </div>

        </form>
      </div>
    </AppLayout>
  );
}

CreateApp.layout = (page: any) => page;
