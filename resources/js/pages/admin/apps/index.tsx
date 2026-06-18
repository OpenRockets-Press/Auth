import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
  homepage_url: string;
}

interface PaginatedData {
  data: App[];
  links: any[];
  current_page: number;
  last_page: number;
  total: number;
}

interface Props {
  apps: PaginatedData;
}

export default function AdminApps({ apps }: Props) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span style={{ 
            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
            color: '#4ade80', backgroundColor: '#4ade8020', border: '1px solid #4ade8040'
          }}>Active</span>
        );
      case 'pending':
        return (
          <span style={{ 
            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
            color: '#60a5fa', backgroundColor: '#60a5fa20', border: '1px solid #60a5fa40'
          }}>Pending Review</span>
        );
      case 'suspended':
        return (
          <span style={{ 
            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
            color: '#f87171', backgroundColor: '#f8717120', border: '1px solid #f8717140'
          }}>Suspended</span>
        );
      default:
        return (
          <span style={{ 
            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
            color: '#aaa', backgroundColor: '#222', border: '1px solid #333'
          }}>{status}</span>
        );
    }
  };

  return (
    <AdminLayout>
      <Head title="OAuth Apps Management" />
      <div style={{ paddingBottom: '40px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>OAuth Apps</h1>
            <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
              Review, approve, and suspend third-party developer applications.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', backgroundColor: '#111' }}>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>App Name</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Developer</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Registered</th>
                <th style={{ padding: '16px', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {apps.data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
                    No OAuth applications registered.
                  </td>
                </tr>
              ) : (
                apps.data.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #222', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', color: '#ffffff' }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{app.name}</div>
                      {app.homepage_url && (
                        <a href={app.homepage_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#60a5fa', textDecoration: 'none' }}>
                          Website <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '500', color: '#ddd', fontSize: '14px' }}>{app.owner_name}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{app.owner_email}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(app.status)}
                    </td>
                    <td style={{ padding: '16px', color: '#888' }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', position: 'relative' }}>
                      <button 
                        onClick={() => setMenuOpen(menuOpen === app.id ? null : app.id)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      
                      {menuOpen === app.id && (
                        <>
                          <div 
                            style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                            onClick={() => setMenuOpen(null)}
                          />
                          <div style={{
                            position: 'absolute', right: '32px', top: '16px', backgroundColor: '#111', border: '1px solid #333', 
                            borderRadius: '12px', padding: '8px', zIndex: 20, minWidth: '200px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                          }}>
                            <div style={{ padding: '4px 12px 8px', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '1px solid #222', marginBottom: '8px' }}>
                              Actions
                            </div>
                            <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ddd', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              Copy App ID
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#222', margin: '4px 0' }} />
                            
                            {app.status === 'pending' && (
                              <button onClick={() => router.patch(`/admin/apps/${app.id}/status`, { status: 'active' }, { preserveScroll: true, onSuccess: () => setMenuOpen(null) })} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#4ade80', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4ade8020'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <CheckCircle2 size={16} /> Approve App
                              </button>
                            )}
                            
                            {app.status === 'active' && (
                              <button onClick={() => router.patch(`/admin/apps/${app.id}/status`, { status: 'suspended' }, { preserveScroll: true, onSuccess: () => setMenuOpen(null) })} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#f87171', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8717120'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <AlertTriangle size={16} /> Suspend App
                              </button>
                            )}
                            
                            {app.status === 'suspended' && (
                              <button onClick={() => router.patch(`/admin/apps/${app.id}/status`, { status: 'active' }, { preserveScroll: true, onSuccess: () => setMenuOpen(null) })} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ddd', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <CheckCircle2 size={16} /> Reinstate App
                              </button>
                            )}
                            
                            <div style={{ height: '1px', backgroundColor: '#222', margin: '4px 0' }} />
                            <button onClick={() => setMenuOpen(null)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#f87171', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8717120'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <XCircle size={16} /> Delete App
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Simple Pagination Footer */}
          {apps.last_page > 1 && (
            <div style={{ padding: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#888' }}>
              <div>Showing page {apps.current_page} of {apps.last_page} ({apps.total} total)</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {apps.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url || '#'}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', textDecoration: 'none',
                      backgroundColor: link.active ? '#ffffff' : 'transparent',
                      color: link.active ? '#000000' : '#888',
                      border: '1px solid', borderColor: link.active ? '#ffffff' : '#333',
                      opacity: link.url ? 1 : 0.5, pointerEvents: link.url ? 'auto' : 'none'
                    }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

AdminApps.layout = (page: any) => page;
