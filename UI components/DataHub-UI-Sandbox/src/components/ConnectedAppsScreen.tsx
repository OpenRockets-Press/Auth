import React, { useState } from 'react';
import { Shield, ChevronRight, Key, Search } from 'lucide-react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

// Mock data based on Laravel's expected App model and DataHub data
const MOCK_APPS = [
  { id: 'app_1', name: 'OpenRockets Community', publisher: 'OpenRockets Inc.', lastActive: '2 hours ago', iconColor: '#0067b8' },
  { id: 'app_2', name: 'Telemetry Dashboard', publisher: 'SpaceY Data', lastActive: 'Yesterday', iconColor: '#107c10' },
  { id: 'app_3', name: 'HR Portal', publisher: 'Internal Tools', lastActive: '3 days ago', iconColor: '#d13438' },
];

export const ConnectedAppsScreen: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appData, setAppData] = useState<any[]>([]);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDelete = (key: string) => {
    setDeletingKey(key);
    setTimeout(() => {
      setAppData(prev => prev.filter(d => d.key !== key));
      setDeletingKey(null);
    }, 1500);
  };

  // Simulates GET /api/data-hub/{app}/data
  const handleAppClick = (app: any) => {
    setIsLoading(true);
    setSelectedApp(app);
    
    setTimeout(() => {
      // Mocked key-value data stored by the app in the Data Hub
      setAppData([
        { key: 'theme_preference', value: 'dark', updated_at: '2026-06-12 10:00:00' },
        { key: 'dashboard_layout', value: '{"panels":["telemetry","alerts"]}', updated_at: '2026-06-10 15:30:00' }
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
            <div style={{ fontSize: '13px', color: 'var(--ms-text-secondary)' }}>Publisher: {selectedApp.publisher}</div>
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
              <div style={{ fontSize: '14px', color: '#ffffff' }}>{app.publisher}</div>
            </div>
            <ChevronRight color="#ffffff" />
          </div>
        ))}
      </div>
    </div>
  );
};
