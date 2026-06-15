import React, { useState, useEffect } from 'react';
import { Search, Shield, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

import type {  App  } from '../../models/types';

export const AppModerationScreen: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Mock API Fetch
    setTimeout(() => {
      setApps([
        { id: 1, owner_id: 1, client_id: "c_1", description: null, icon_url: null, is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: '2026-05-10T10:00:00Z', suspended_at: null, updated_at: '2026-05-10T10:00:00Z', name: 'ERP Sync Tool', owner: { id: 1, name: 'Alice Smith', email: 'alice@example.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-10T10:00:00Z' }, status: 'verified', created_at: '2026-05-10T10:00:00Z' },
        { id: 2, owner_id: 2, client_id: "c_2", description: null, icon_url: null, is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, updated_at: '2026-06-12T10:00:00Z', name: 'Sketchy Data Miner', owner: { id: 2, name: 'Bad Actor', email: 'bad@example.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-10T10:00:00Z' }, status: 'development', created_at: '2026-06-12T10:00:00Z' },
        { id: 3, owner_id: 3, client_id: "c_3", description: null, icon_url: null, is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-10T10:00:00Z', name: 'Old Integration', owner: { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-10T10:00:00Z' }, status: 'suspended', created_at: '2025-01-10T10:00:00Z' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredApps = apps.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.owner?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return '#ffffff';
      case 'pending': return '#ffaa00';
      case 'suspended': return '#ff4444';
      case 'rejected': return '#444444';
      default: return '#ffffff';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>Application Moderation</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>Verify, reject, or suspend third-party OAuth applications.</p>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search apps by name or developer email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', backgroundColor: '#000000', border: '1px solid #444', borderRadius: '24px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Apps Table */}
      <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
            <MicrosoftLoadingDots />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Application</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Developer</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Shield size={16} color="#000" />
                      </div>
                      <div style={{ fontWeight: '500', fontSize: '15px' }}>{app.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{app.owner?.name}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6 }}>{app.owner?.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                      backgroundColor: getStatusColor(app.status), 
                      color: app.status === 'verified' ? '#000000' : '#ffffff' 
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button title="Verify App" style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', cursor: 'pointer' }}>
                        <CheckCircle size={16} />
                      </button>
                      <button title="Suspend App" style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#ff4444', cursor: 'pointer' }}>
                        <PauseCircle size={16} />
                      </button>
                      <button title="Reject App" style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#444444', cursor: 'pointer' }}>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
