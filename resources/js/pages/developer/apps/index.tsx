import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Plus, LayoutGrid, Settings, TerminalSquare } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface Props {
  apps: App[];
}

export default function DeveloperApps({ apps }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4ade80'; // Green
      case 'pending': return '#60a5fa'; // Blue
      case 'suspended': return '#f87171'; // Red
      default: return '#ffffff';
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Developer Hub', href: '/developer/apps' }]} fullWidth={true}>
      <Head title="Developer Hub" />
      
      {/* Sub-header specifically for Developer Hub */}
      <div style={{ backgroundColor: '#111111', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TerminalSquare size={24} color="#8ab4f8" />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: '#ffffff' }}>Developer Hub</h1>
          </div>
          <Link 
            href="/developer/apps/create"
            style={{ 
              backgroundColor: '#ffffff', color: '#000000', padding: '8px 16px', borderRadius: '16px',
              textDecoration: 'none', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} /> Register App
          </Link>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '8px', color: '#ffffff' }}>Your Applications</h2>
        <p style={{ fontSize: '15px', color: '#ffffff', opacity: 0.8, marginBottom: '32px' }}>
          Manage your OAuth applications, credentials, and API access.
        </p>

        {apps.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', border: '1px dashed #555', borderRadius: '24px', backgroundColor: '#0a0a0a' }}>
            <LayoutGrid size={48} color="#555" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>No Applications Yet</h3>
            <p style={{ fontSize: '15px', color: '#ffffff', opacity: 0.6, maxWidth: '400px', margin: '0 auto 24px auto' }}>
              Get started by creating your first OAuth application to authenticate users with OpenRockets.
            </p>
            <Link 
              href="/developer/apps/create"
              style={{ 
                backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '10px 24px', borderRadius: '24px',
                textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Plus size={16} /> Register Application
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {apps.map(app => (
              <div 
                key={app.id} 
                style={{ 
                  backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px', padding: '24px',
                  display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff', wordBreak: 'break-word', paddingRight: '12px' }}>{app.name}</h3>
                  <div style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
                    color: getStatusColor(app.status), backgroundColor: `${getStatusColor(app.status)}20`, border: `1px solid ${getStatusColor(app.status)}40`
                  }}>
                    {app.status}
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, marginBottom: '24px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #222' }}>
                  <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.5 }}>
                    Created {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  <Link 
                    href={`/developer/apps/${app.id}`}
                    style={{ 
                      backgroundColor: '#222', color: '#ffffff', padding: '6px 12px', borderRadius: '12px',
                      textDecoration: 'none', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222'}
                  >
                    <Settings size={14} /> Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

DeveloperApps.layout = (page: any) => page;
