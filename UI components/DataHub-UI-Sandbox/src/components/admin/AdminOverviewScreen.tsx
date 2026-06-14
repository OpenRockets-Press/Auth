import React, { useState, useEffect } from 'react';
import { Users, AppWindow, ShieldCheck, FileWarning, Activity } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

// Mock interface for Analytics data
interface AnalyticsData {
  total_users: number;
  active_users: number;
  suspended_users: number;
  total_apps: number;
  verified_apps: number;
  pending_apps: number;
  total_consents: number;
  total_audit_events: number;
  pending_data_requests: number;
  users_last_24h: number;
  logins_last_24h: number;
}

export const AdminOverviewScreen: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API Fetch
    setTimeout(() => {
      setStats({
        total_users: 14205,
        active_users: 13900,
        suspended_users: 305,
        total_apps: 42,
        verified_apps: 18,
        pending_apps: 5,
        total_consents: 45291,
        total_audit_events: 1250392,
        pending_data_requests: 12,
        users_last_24h: 124,
        logins_last_24h: 8402
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
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>Platform Overview</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>High-level telemetry and metrics for the DataHub ecosystem.</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        {/* Users KPI */}
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Total Users</h3>
            <Users size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{stats.total_users.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.8 }}>
            <span>{stats.users_last_24h} new (24h)</span>
            <span style={{ color: '#ff4444' }}>{stats.suspended_users} suspended</span>
          </div>
        </div>

        {/* Apps KPI */}
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Applications</h3>
            <AppWindow size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{stats.total_apps.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.8 }}>
            <span>{stats.verified_apps} verified</span>
            <span style={{ color: '#ffaa00' }}>{stats.pending_apps} pending</span>
          </div>
        </div>

        {/* Consents KPI */}
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Active Consents</h3>
            <ShieldCheck size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{stats.total_consents.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            Secure data handshakes
          </div>
        </div>

        {/* Audit Logs KPI */}
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Audit Events</h3>
            <Activity size={20} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px' }}>{(stats.total_audit_events / 1000000).toFixed(1)}M</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            {stats.logins_last_24h.toLocaleString()} logins (24h)
          </div>
        </div>

        {/* Data Requests KPI */}
        <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Compliance Tasks</h3>
            <FileWarning size={20} color={stats.pending_data_requests > 0 ? '#ffaa00' : '#ffffff'} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500', marginBottom: '8px', color: stats.pending_data_requests > 0 ? '#ffaa00' : '#ffffff' }}>
            {stats.pending_data_requests}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            Pending Data Requests
          </div>
        </div>

      </div>
    </div>
  );
};
