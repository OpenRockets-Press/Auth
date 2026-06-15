import React, { useState } from 'react';
import { Database, ShieldAlert } from 'lucide-react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

import type {  DataSharingAgreement  } from '../models/types';

// Mocks the DataSharingAgreementResource array
const MOCK_AGREEMENTS: DataSharingAgreement[] = [
  {
    id: 1,
    source_app_id: 2,
    target_app_id: 1,
    source_app: { id: 2, owner_id: 2, client_id: 'c2', name: 'Telemetry Dashboard', description: null, icon_url: null, status: 'verified', is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 2, name: 'SpaceY Data', email: 'admin@spacey.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
    target_app: { id: 1, owner_id: 1, client_id: 'c1', name: 'OpenRockets Community', description: null, icon_url: null, status: 'verified', is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 1, name: 'OpenRockets Inc.', email: 'admin@openrockets.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
    scopes: ['read_profile', 'read_telemetry'],
    created_at: '2026-06-01T10:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    source_app_id: 3,
    target_app_id: 1,
    source_app: { id: 3, owner_id: 3, client_id: 'c3', name: 'HR Portal', description: null, icon_url: null, status: 'verified', is_system: true, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 3, name: 'Internal Tools', email: 'hr@openrockets.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
    target_app: { id: 1, owner_id: 1, client_id: 'c1', name: 'OpenRockets Community', description: null, icon_url: null, status: 'verified', is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 1, name: 'OpenRockets Inc.', email: 'admin@openrockets.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
    scopes: ['read_profile'],
    created_at: '2026-05-15T10:00:00Z',
    status: 'active'
  }
];

export const DataAgreementsScreen: React.FC = () => {
  const [agreements, setAgreements] = useState(MOCK_AGREEMENTS);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Simulates DELETE /api/data-hub/agreements/{agreementId}
  const handleRevoke = (id: number) => {
    setLoadingId(id);
    
    // Simulate API delay
    setTimeout(() => {
      setAgreements(prev => prev.filter(a => a.id !== id));
      setLoadingId(null);
    }, 1500);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'var(--ms-text)' }}>Data Sharing Agreements</h1>
      <p style={{ fontSize: '15px', color: 'var(--ms-text-secondary)', marginBottom: '32px', maxWidth: '800px' }}>
        Review and manage cross-app data sharing. These agreements allow specific applications to exchange data directly via the Data Hub using RFC 8693 Token Exchange. Revoking an agreement stops data flow immediately.
      </p>

      {agreements.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '24px' }}>
          <ShieldAlert size={48} color="#ffffff" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>No Active Agreements</h3>
          <p style={{ fontSize: '14px', color: '#ffffff' }}>You have not authorized any cross-app data sharing.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '24px', overflow: 'hidden' }}>
          {agreements.map((agreement, index) => (
            <div key={agreement.id} style={{ 
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              borderBottom: index < agreements.length - 1 ? '1px solid #ffffff' : 'none',
              transition: 'background-color 0.2s'
            }}>
              {loadingId === agreement.id && (
                <div className="ms-loader-overlay fast-loader">
                  <MicrosoftLoadingDots />
                </div>
              )}
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Database size={20} color="#ffffff" />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: '500', color: '#ffffff', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agreement.source_app?.name}</span>
                    <span style={{ color: '#ffffff', fontSize: '14px', flexShrink: 0 }}>→</span>
                    <span style={{ fontWeight: '500', color: '#ffffff', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agreement.target_app?.name}</span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Scopes: {agreement.scopes.join(', ')}
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#ffffff' }}>
                    Authorized {agreement.created_at}
                  </div>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => handleRevoke(agreement.id)}
                  disabled={loadingId === agreement.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#8ab4f8',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: loadingId === agreement.id ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loadingId === agreement.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                >
                  {loadingId === agreement.id ? 'Removing...' : 'Remove access'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// Force Vite HMR reload
