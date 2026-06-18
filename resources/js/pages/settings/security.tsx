import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Shield, Smartphone, Laptop, Globe, AlertCircle } from 'lucide-react';

interface Session {
  id: string;
  ip_address: string;
  is_current_device: boolean;
  last_active: string;
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
}

interface Props {
  sessions?: Session[];
}

export default function Security({ sessions = [] }: Props) {
  const cardStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px'
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Security & Devices', href: '/settings/security' }]} fullWidth={false}>
      <Head title="Security & Devices" />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Security & Devices</h1>
        <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px' }}>
          Manage your account security, active sessions, and trusted devices.
        </p>

        {/* Identity Provider Redirect Notice */}
        <div style={{ ...cardStyle, borderColor: '#60a5fa40', backgroundColor: '#60a5fa05' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#60a5fa' }}>
            <Shield size={24} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Core Security Settings</h2>
          </div>
          <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.9, marginBottom: '24px', lineHeight: 1.6 }}>
            Password changes, Two-Factor Authentication (2FA), and Passkey management are handled centrally by the OpenRockets Identity Provider to keep your account secure across all platforms.
          </p>
          <a 
            href="https://accounts.openrockets.com/settings/security" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#60a5fa20', color: '#60a5fa', border: '1px solid #60a5fa40',
              padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none'
            }}
          >
            Go to OpenRockets Accounts
          </a>
        </div>

        {/* Active Sessions */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Active Sessions</h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
            These are the browsers and devices where you are currently logged in. If you see an unfamiliar session, log it out immediately.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {sessions.length > 0 ? (
              sessions.map((session, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222' }}>
                  <div style={{ color: '#888' }}>
                    {session.agent.is_desktop ? <Laptop size={32} /> : <Smartphone size={32} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
                      {session.agent.platform} - {session.agent.browser}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      {session.ip_address} • 
                      {session.is_current_device ? (
                        <span style={{ color: '#4ade80', fontWeight: '500', marginLeft: '4px' }}>This device</span>
                      ) : (
                        <span style={{ marginLeft: '4px' }}>Last active {session.last_active}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Mock current session if none passed
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222' }}>
                <div style={{ color: '#888' }}><Globe size={32} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>Windows - Chrome</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    127.0.0.1 • <span style={{ color: '#4ade80', fontWeight: '500', marginLeft: '4px' }}>This device</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button style={{ 
            backgroundColor: '#222', color: '#ffffff', border: '1px solid #444',
            padding: '10px 20px', borderRadius: '12px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222'}>
            Log Out Other Browser Sessions
          </button>
        </div>

        {/* Connected Devices (Hardware) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Connected Hardware</h2>
            <span style={{ padding: '2px 8px', backgroundColor: '#222', color: '#888', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Coming Soon</span>
          </div>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
            Physical hardware devices linked directly to your OpenRockets account via DataHub.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#111', borderRadius: '16px', border: '1px dashed #333' }}>
            <AlertCircle size={24} color="#666" />
            <div style={{ color: '#888', fontSize: '14px' }}>
              Hardware device management is currently being upgraded. Your linked hardware continues to function normally.
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

Security.layout = (page: any) => page;
