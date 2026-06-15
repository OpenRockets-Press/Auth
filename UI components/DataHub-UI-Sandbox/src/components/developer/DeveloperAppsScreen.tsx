import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Globe, Users, Activity } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

import type {  App  } from '../../models/types';

export const DeveloperAppsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API Call - Will be replaced by developerApi.ts
    setTimeout(() => {
      setApps([
        {
          id: 1,
          owner_id: 1,
          client_id: '12345-abcde',
          name: 'My Custom Integration',
          description: 'Used for sinking data between our ERP and DataHub.',
          status: 'verified',
          is_system: false,
          redirect_uris: [],
          homepage_url: 'https://my-erp-integration.com',
          privacy_policy_url: null,
          terms_url: null,
          category: null,
          verified_at: '2026-05-20T10:00:00Z',
          suspended_at: null,
          created_at: '2026-05-20T10:00:00Z',
          updated_at: '2026-05-20T10:00:00Z'
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>OAuth Applications</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>Manage your custom applications, credentials, and telemetry.</p>
        </div>
        
        <button 
          onClick={() => navigate('/developer/apps/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '24px',
            fontWeight: '500',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={18} />
          Create New App
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <MicrosoftLoadingDots />
        </div>
      ) : apps.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '64px',
          border: '1px dashed #ffffff',
          borderRadius: '24px',
          backgroundColor: '#000000'
        }}>
          <AppWindow size={48} color="#ffffff" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#ffffff', fontWeight: '500' }}>No Applications Yet</h3>
          <p style={{ margin: '0 0 24px 0', color: '#ffffff', textAlign: 'center', maxWidth: '400px' }}>
            Build custom integrations to securely request and sync user data via our OAuth 2.0 API.
          </p>
          <button 
            onClick={() => navigate('/developer/apps/new')}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #ffffff',
              padding: '8px 24px',
              borderRadius: '24px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
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
            Create Your First App
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {apps.map(app => (
            <div 
              key={app.id} 
              onClick={() => navigate(`/developer/apps/${app.id}`)}
              style={{
                backgroundColor: '#000000',
                border: '1px solid #ffffff',
                borderRadius: '24px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
                
                // Also invert children text to black
                const elements = e.currentTarget.querySelectorAll('.invert-on-hover');
                elements.forEach((el: any) => el.style.color = '#000000');
                
                // Invert badge
                const badge = e.currentTarget.querySelector('.status-badge') as HTMLElement;
                if (badge) {
                  badge.style.backgroundColor = '#000000';
                  badge.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#ffffff';
                
                // Revert children text to white
                const elements = e.currentTarget.querySelectorAll('.invert-on-hover');
                elements.forEach((el: any) => el.style.color = '#ffffff');
                
                // Revert badge
                const badge = e.currentTarget.querySelector('.status-badge') as HTMLElement;
                if (badge) {
                  badge.style.backgroundColor = '#ffffff';
                  badge.style.color = '#000000';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: '#000000'
                }}>
                  <Shield size={24} />
                </div>
                
                <span 
                  className="status-badge"
                  style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {app.status}
                </span>
              </div>
              
              <h3 className="invert-on-hover" style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '500', color: '#ffffff', transition: 'color 0.2s' }}>
                {app.name}
              </h3>
              
              <p className="invert-on-hover" style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#ffffff', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }}>
                {app.description || 'No description provided.'}
              </p>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} className="invert-on-hover" color="#ffffff" style={{ transition: 'color 0.2s' }} />
                  <span className="invert-on-hover" style={{ fontSize: '13px', color: '#ffffff', transition: 'color 0.2s' }}>42 Users</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} className="invert-on-hover" color="#ffffff" style={{ transition: 'color 0.2s' }} />
                  <span className="invert-on-hover" style={{ fontSize: '13px', color: '#ffffff', transition: 'color 0.2s' }}>1.2k Req</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
