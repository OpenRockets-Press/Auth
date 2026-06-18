import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Database, ShieldAlert } from 'lucide-react';

interface App {
  id: number;
  name: string;
  owner: {
    name: string;
  };
}

interface DataSharingAgreement {
  id: number;
  source_app: App;
  target_app: App;
  created_at: string;
}

const MOCK_AGREEMENTS: DataSharingAgreement[] = [
  {
    id: 1,
    source_app: { id: 2, name: 'Telemetry Dashboard', owner: { name: 'SpaceY Data' } },
    target_app: { id: 1, name: 'OpenRockets Community', owner: { name: 'OpenRockets Inc.' } },
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: 2,
    source_app: { id: 3, name: 'Flight Logger API', owner: { name: 'AstroDevs' } },
    target_app: { id: 2, name: 'Telemetry Dashboard', owner: { name: 'SpaceY Data' } },
    created_at: '2026-06-10T14:30:00Z',
  }
];

export default function AgreementsIndex() {
  const [agreements, setAgreements] = useState<DataSharingAgreement[]>(MOCK_AGREEMENTS);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleRevoke = (id: number) => {
    setLoadingId(id);
    setTimeout(() => {
      setAgreements(prev => prev.filter(a => a.id !== id));
      setLoadingId(null);
    }, 1500);
  };

  const cardStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px'
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Data Agreements', href: '/agreements' }]} fullWidth={false}>
      <Head title="Data Agreements" />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Data Agreements</h1>
        <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px' }}>
          Manage direct data sharing authorizations between your connected applications.
        </p>

        {agreements.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '64px 32px' }}>
            <Database size={48} color="#555" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>No Active Agreements</h3>
            <p style={{ fontSize: '15px', color: '#888', maxWidth: '400px', margin: '0 auto' }}>
              You haven't authorized any applications to share your data directly with other applications.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {agreements.map(agreement => (
              <div 
                key={agreement.id} 
                style={{ 
                  backgroundColor: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#222', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={24} color="#8ab4f8" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500', color: '#ffffff' }}>
                      <span style={{ color: '#8ab4f8' }}>{agreement.source_app.name}</span> is sharing data with <span style={{ color: '#4ade80' }}>{agreement.target_app.name}</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#888' }}>
                      <div>Source: {agreement.source_app.owner.name}</div>
                      <div>Target: {agreement.target_app.owner.name}</div>
                      <div style={{ marginTop: '4px', color: '#666' }}>
                        Authorized {new Date(agreement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRevoke(agreement.id)}
                  disabled={loadingId === agreement.id}
                  style={{
                    padding: '8px 16px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f8717140',
                    borderRadius: '12px', fontWeight: '500', fontSize: '14px', cursor: loadingId === agreement.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', opacity: loadingId === agreement.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = '#f8717120';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {loadingId === agreement.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

AgreementsIndex.layout = (page: any) => page;
