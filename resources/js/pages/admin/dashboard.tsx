import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { Users, LayoutGrid, KeyRound, AlertCircle } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_apps: number;
  active_consents: number;
  pending_parental_consents: number;
}

interface Props {
  stats: AdminStats;
}

export default function AdminDashboard({ stats }: Props) {
  const cardStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'border-color 0.2s'
  };

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />
      <div style={{ paddingBottom: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>Overview</h1>
          <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
            High-level metrics for the OpenRockets Platform.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          
          <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>Total Users</span>
              <Users size={20} color="#888" />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
              {stats.total_users}
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Registered accounts on platform</span>
          </div>

          <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>OAuth Apps</span>
              <LayoutGrid size={20} color="#888" />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
              {stats.total_apps}
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Registered by developers</span>
          </div>

          <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#ccc' }}>Active Consents</span>
              <KeyRound size={20} color="#888" />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
              {stats.active_consents}
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Total platform connections</span>
          </div>

          <div style={{ ...cardStyle, borderColor: '#f8717140', backgroundColor: '#f8717105' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#f87171' }}>Pending Consents</span>
              <AlertCircle size={20} color="#f87171" />
            </div>
            <div style={{ fontSize: '36px', fontWeight: '600', color: '#f87171', marginBottom: '4px' }}>
              {stats.pending_parental_consents}
            </div>
            <span style={{ fontSize: '12px', color: '#f87171', opacity: 0.8 }}>Minors awaiting approval</span>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

AdminDashboard.layout = (page: any) => page;
