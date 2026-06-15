import React, { useState } from 'react';
import { Shield, ChevronRight, Key, Search } from 'lucide-react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

import type {  App, UserDataStore  } from '../models/types';

// Mock data based on Laravel's expected App model and DataHub data
const MOCK_APPS: App[] = [
  { id: 1, owner_id: 1, client_id: 'c1', name: 'OpenRockets Community', description: null, icon_url: null, status: 'verified', is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 1, name: 'OpenRockets Inc.', email: 'admin@openrockets.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
  { id: 2, owner_id: 2, client_id: 'c2', name: 'Telemetry Dashboard', description: null, icon_url: null, status: 'verified', is_system: false, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 2, name: 'SpaceY Data', email: 'admin@spacey.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
  { id: 3, owner_id: 3, client_id: 'c3', name: 'HR Portal', description: null, icon_url: null, status: 'verified', is_system: true, redirect_uris: [], homepage_url: null, privacy_policy_url: null, terms_url: null, category: null, verified_at: null, suspended_at: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z', owner: { id: 3, name: 'Internal Tools', email: 'hr@openrockets.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, locked_until: null, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' } },
];

export const ConnectedAppsScreen: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appData, setAppData] = useState<UserDataStore[]>([]);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDelete = (key: string) => {
    setDeletingKey(key);
    setTimeout(() => {
      setAppData(prev => prev.filter(d => d.key !== key));
      setDeletingKey(null);
    }, 1500);
  };

  // Simulates GET /api/data-hub/{app}/data
  const handleAppClick = (app: App) => {
    setIsLoading(true);
    setSelectedApp(app);
    
    setTimeout(() => {
      // Mocked key-value data stored by the app in the Data Hub
      setAppData([
        { id: 1, user_id: 1, app_id: app.id, key: 'theme_preference', value: 'dark', updated_at: '2026-06-12T10:00:00Z' },
        { id: 2, user_id: 1, app_id: app.id, key: 'dashboard_layout', value: '{"panels":["telemetry","alerts"]}', updated_at: '2026-06-10T15:30:00Z' }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  if (selectedApp) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000000' }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: 'var(--ms-text)' }}>{selectedApp.name}</h1>
            <div style={{ fontSize: '13px', color: 'var(--ms-text-secondary)' }}>Publisher: {selectedApp.owner?.name}</div>
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: '200px' }}>
          {isLoading && (
            <div className="ms-loader-overlay" style={{ zIndex: 10 }}>
              <MicrosoftLoadingDots />
            </div>
          )}

          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Data Stored in Hub</h2>
        <p style={{ fontSize: '14px', color: 'var(--ms-text-secondary)', marginBottom: '24px' }}>
          This application has stored the following configuration keys in your centralized Data Hub.
        </p>

        <div style={{ backgroundColor: '#000000', borderRadius: '24px', border: '1px solid #ffffff', overflow: 'hidden' }}>
          {!isLoading && appData.length > 0 ? appData.map((data, index) => (
            <div key={data.key} style={{ 
              padding: '20px 24px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: index < appData.length - 1 ? '1px solid #ffffff' : 'none',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              {deletingKey === data.key && (
                <div className="ms-loader-overlay fast-loader">
                  <MicrosoftLoadingDots />
                </div>
              )}
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Key size={20} color="#ffffff" />
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '500', color: '#ffffff', fontSize: '16px', fontFamily: 'monospace' }}>{data.key}</span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px', fontFamily: 'monospace' }}>
                    Value: {data.value.length > 40 ? data.value.substring(0, 40) + '...' : data.value}
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#ffffff' }}>
                    Last updated {data.updated_at}
                  </div>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => handleDelete(data.key)}
                  disabled={deletingKey === data.key}
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
                    cursor: deletingKey === data.key ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: deletingKey === data.key ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!deletingKey) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deletingKey) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                >
                  {deletingKey === data.key ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#ffffff' }}>
              {isLoading ? 'Loading data...' : 'No data stored.'}
            </div>
          )}
        </div>
      </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'var(--ms-text)' }}>Connected Apps</h1>
      <p style={{ fontSize: '15px', color: 'var(--ms-text-secondary)', marginBottom: '32px' }}>
        Manage the applications you have granted access to your OpenRockets account and view the data they store in your Data Hub.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {MOCK_APPS.map(app => (
          <div 
            key={app.id} 
            onClick={() => handleAppClick(app)}
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <div style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000000', flexShrink: 0 }}>
              <Shield size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</h3>
              <div style={{ fontSize: '14px', color: '#ffffff' }}>{app.owner?.name}</div>
            </div>
            <ChevronRight color="#ffffff" />
          </div>
        ))}
      </div>
    </div>
  );
};
