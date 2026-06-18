import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Shield, ChevronRight, AlertTriangle } from 'lucide-react';
import { MicrosoftLoadingDots } from '@/components/MicrosoftLoadingDots';

interface Consent {
  id: string;
  app_name: string;
  created_at: string;
  logo_url: string | null;
  privacy_policy_url: string | null;
  terms_of_service_url: string | null;
  scopes: string | string[] | null;
}

interface Props {
  consents: Consent[];
}

export default function ConsentsIndex({ consents }: Props) {
  const { delete: destroy, processing } = useForm();
  const [selectedApp, setSelectedApp] = useState<Consent | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const revokeConsent = (id: string) => {
    setRevokingId(id);
    destroy(route('consents.destroy', id), {
      preserveScroll: true,
      onFinish: () => {
        setRevokingId(null);
        setSelectedApp(null);
      }
    });
  };

  const renderScopes = (scopesData: string | string[] | null) => {
    if (!scopesData) return <div style={{ fontSize: '14px', color: '#888' }}>Standard account access</div>;
    
    let scopes: string[] = [];
    if (typeof scopesData === 'string') {
      try {
        scopes = JSON.parse(scopesData);
      } catch (e) {
        scopes = scopesData.split(',');
      }
    } else if (Array.isArray(scopesData)) {
      scopes = scopesData;
    }

    if (scopes.length === 0) return <div style={{ fontSize: '14px', color: '#888' }}>Standard account access</div>;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {scopes.map(s => (
          <span key={s} style={{ padding: '4px 10px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', fontSize: '13px', color: '#ddd' }}>
            {s}
          </span>
        ))}
      </div>
    );
  };

  if (selectedApp) {
    return (
      <AppLayout breadcrumbs={[{ title: 'Manage Consents', href: '/consents' }]}>
        <Head title={selectedApp.app_name} />
        <div>
          <button 
            onClick={() => setSelectedApp(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginBottom: '24px', opacity: 0.8, fontSize: '14px', textDecoration: 'underline' }}
          >
            ← Back to all apps
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {selectedApp.logo_url ? (
              <img src={selectedApp.logo_url} alt={`${selectedApp.app_name} logo`} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000000' }}>
                <Shield size={24} />
              </div>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>{selectedApp.app_name}</h1>
              <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>Authorized {new Date(selectedApp.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>Data Access Granted</h2>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>This application currently has access to the following data scopes:</p>
            {renderScopes(selectedApp.scopes)}
          </div>

          <div style={{ backgroundColor: '#000000', border: '1px solid #ff4444', borderRadius: '24px', padding: '24px', position: 'relative' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4444' }}>
              <AlertTriangle size={20} /> Revoke Access
            </h2>
            <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.8, marginBottom: '24px' }}>
              This application will no longer be able to access your profile data or log you in automatically.
            </p>
            
            <button 
              onClick={() => revokeConsent(selectedApp.id)}
              disabled={processing || revokingId === selectedApp.id}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#ff4444',
                border: '1px solid #ff4444',
                borderRadius: '24px',
                fontWeight: '600',
                cursor: (processing || revokingId === selectedApp.id) ? 'not-allowed' : 'pointer',
                opacity: (processing || revokingId === selectedApp.id) ? 0.5 : 1
              }}
            >
              {(processing || revokingId === selectedApp.id) ? 'Revoking...' : 'Yes, Revoke Access'}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Manage Consents', href: '/consents' }]}>
      <Head title="Connected Apps" />
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>Connected Apps</h1>
        <p style={{ fontSize: '15px', color: '#ffffff', opacity: 0.8, marginBottom: '32px' }}>
          Manage the applications you have granted access to your OpenRockets account.
        </p>

        {consents.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#ffffff', border: '1px dashed #ffffff', borderRadius: '24px' }}>
            No applications have access to your account.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {consents.map(app => (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                style={{ 
                  backgroundColor: '#000000', 
                  border: '1px solid #ffffff', 
                  borderRadius: '24px', 
                  padding: '20px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  const childrenText = e.currentTarget.querySelectorAll('div, h3');
                  childrenText.forEach((el: any) => el.style.color = '#000000');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  const childrenText = e.currentTarget.querySelectorAll('div, h3');
                  childrenText.forEach((el: any) => el.style.color = '#ffffff');
                }}
              >
                {app.logo_url ? (
                  <img src={app.logo_url} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000000', flexShrink: 0 }}>
                    <Shield size={24} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ffffff' }}>{app.app_name}</h3>
                  <div style={{ fontSize: '14px', color: '#ffffff', opacity: 0.8 }}>Since {new Date(app.created_at).toLocaleDateString()}</div>
                </div>
                <ChevronRight color="inherit" />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

ConsentsIndex.layout = (page: any) => page;
