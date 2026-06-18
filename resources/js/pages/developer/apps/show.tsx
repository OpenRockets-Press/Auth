import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Copy, CheckCircle2, TerminalSquare, AlertCircle } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  homepage_url: string;
}

interface Stats {
  total_consents: number;
  active_consents: number;
}

interface Props {
  app: App;
  client_id: string;
  client_secret?: string; // Only passed on creation
  redirect_uris: string[];
  stats: Stats;
}

export default function AppDetails({ app, client_id, client_secret, redirect_uris, stats }: Props) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const copyToClipboard = (text: string, isSecret: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSecret) {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4ade80'; // Green
      case 'pending': return '#60a5fa'; // Blue
      case 'suspended': return '#f87171'; // Red
      default: return '#ffffff';
    }
  };

  const cardStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px'
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Developer Hub', href: '/developer/apps' }, { title: app.name, href: `/developer/apps/${app.id}` }]} fullWidth={true}>
      <Head title={`${app.name} | Developer Hub`} />
      
      {/* Sub-header specifically for Developer Hub */}
      <div style={{ backgroundColor: '#111111', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>{app.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase',
                  color: getStatusColor(app.status), backgroundColor: `${getStatusColor(app.status)}20`, border: `1px solid ${getStatusColor(app.status)}40`
                }}>
                  {app.status}
                </div>
                <span style={{ fontSize: '14px', color: '#888' }}>
                  Created {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {client_secret && (
            <div style={{ ...cardStyle, borderColor: '#4ade8050', backgroundColor: '#4ade800a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#4ade80' }}>
                <CheckCircle2 size={24} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Application Created!</h3>
              </div>
              <p style={{ fontSize: '15px', color: '#4ade80', opacity: 0.9, marginBottom: '24px' }}>
                Please copy your new Client Secret below. <strong>This is the only time it will be shown to you.</strong> If you lose it, you will need to generate a new one.
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={client_secret} 
                  readOnly 
                  style={{ flex: 1, backgroundColor: '#000', border: '1px solid #4ade8050', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontFamily: 'monospace', fontSize: '15px' }}
                />
                <button 
                  onClick={() => copyToClipboard(client_secret, true)}
                  style={{ backgroundColor: '#4ade8020', color: '#4ade80', border: '1px solid #4ade8050', padding: '0 20px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Copy size={16} /> {copiedSecret ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>OAuth Credentials</h3>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
              Use these credentials to authenticate users via the OpenRockets OAuth 2.0 API.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#aaa', marginBottom: '8px' }}>CLIENT ID</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={client_id} 
                  readOnly 
                  style={{ flex: 1, backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px 16px', color: '#ddd', fontFamily: 'monospace', fontSize: '15px' }}
                />
                <button 
                  onClick={() => copyToClipboard(client_id, false)}
                  style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #444', padding: '0 20px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222'}
                >
                  <Copy size={16} /> {copiedId ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {!client_secret && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#aaa' }}>CLIENT SECRET</label>
                  <button style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                    Generate New Secret
                  </button>
                </div>
                <input 
                  type="password" 
                  value="••••••••••••••••••••••••••••••••••••••••" 
                  readOnly 
                  style={{ width: '100%', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', padding: '12px 16px', color: '#666', fontFamily: 'monospace', fontSize: '15px' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  The client secret is hidden for security. You can generate a new one if it was compromised.
                </p>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>Authorized Redirect URIs</h3>
                <p style={{ fontSize: '14px', color: '#888' }}>Users will be redirected to these URIs after authentication.</p>
              </div>
              <button style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 16px', borderRadius: '16px', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}>
                Edit URIs
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {redirect_uris.map((uri, index) => (
                <div key={index} style={{ backgroundColor: '#111', border: '1px solid #222', padding: '12px 16px', borderRadius: '12px', fontFamily: 'monospace', color: '#ddd', fontSize: '14px' }}>
                  {uri}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff', marginBottom: '24px' }}>Statistics</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #222', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#888' }}>Active Users</span>
              <span style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>{stats.active_consents}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#888' }}>Total Consents Ever</span>
              <span style={{ fontSize: '20px', fontWeight: '500', color: '#ccc' }}>{stats.total_consents}</span>
            </div>
          </div>
          
          <div style={{ ...cardStyle, borderColor: '#f8717140', backgroundColor: '#f8717105' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '12px' }}>
              <AlertCircle size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Danger Zone</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#f87171', opacity: 0.8, marginBottom: '16px' }}>
              Suspending this app will prevent any new users from authenticating and revoke all active access tokens.
            </p>
            <button style={{ width: '100%', backgroundColor: '#f8717120', color: '#f87171', border: '1px solid #f8717140', padding: '10px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Suspend Application
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

AppDetails.layout = (page: any) => page;
