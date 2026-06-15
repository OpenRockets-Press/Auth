import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Shield, Plus } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

import type {  DeveloperStats  } from '../../models/types';

export const DeveloperOverviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API Fetch parsing index endpoint
    setTimeout(() => {
      setStats({
        total_apps: 3,
        total_consents: 1248,
        total_api_requests: 450200,
        active_webhooks: 2,
        recent_activity: [
          { id: 1, action: 'Consent Granted', date: '2 minutes ago', app: 'ERP Sync Tool' },
          { id: 2, action: 'Webhook Fired', date: '1 hour ago', app: 'ERP Sync Tool' },
          { id: 3, action: 'App Created', date: '2 days ago', app: 'Mobile Client' },
        ]
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <MicrosoftLoadingDots />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>Developer Dashboard</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>High-level overview of your applications and integration health.</p>
        </div>
        
        <button 
          onClick={() => navigate('/developer/apps/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: '#000000', border: 'none',
            padding: '10px 20px', borderRadius: '24px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={18} />
          Create New App
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>My Apps</h3>
            <Shield size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{stats.total_apps}</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Active OAuth Clients</div>
        </div>

        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: '0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Consents</h3>
            <Users size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{stats.total_consents.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Across all apps</div>
        </div>

        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: '0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>API Requests</h3>
            <Activity size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{(stats.total_api_requests / 1000).toFixed(1)}k</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Last 30 days</div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '500' }}>Recent Activity</h2>
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden' }}>
          {stats.recent_activity.map((activity, index) => (
            <div key={activity.id} style={{ 
              padding: '16px 24px', 
              borderBottom: index !== stats.recent_activity.length - 1 ? '1px solid #222' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '15px', marginBottom: '4px' }}>{activity.action}</div>
                <div style={{ fontSize: '13px', opacity: 0.6 }}>{activity.app}</div>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.6 }}>{activity.date}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
