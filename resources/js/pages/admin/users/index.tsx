import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { Search, MoreHorizontal, Shield, UserX, LogIn } from 'lucide-react';

interface Profile {
  id: number;
  onboarding_status: string;
  country_code: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  email_verified_at: string | null;
  profile: Profile | null;
}

interface PaginatedData {
  data: User[];
  links: any[];
  current_page: number;
  last_page: number;
  total: number;
}

interface Props {
  users: PaginatedData;
  filters: { search?: string };
}

export default function AdminUsers({ users, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/users', { search }, { preserveState: true });
  };

  const getStatusBadge = (verified: boolean) => {
    if (verified) {
      return (
        <span style={{ 
          padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
          color: '#4ade80', backgroundColor: '#4ade8020', border: '1px solid #4ade8040'
        }}>
          Verified
        </span>
      );
    }
    return (
      <span style={{ 
        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
        color: '#eab308', backgroundColor: '#eab30820', border: '1px solid #eab30840'
      }}>
        Unverified
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head title="User Management" />
      <div style={{ paddingBottom: '40px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>Users</h1>
              <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
                Manage platform users, view their profiles, and handle moderation.
              </p>
            </div>
            
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={18} color="#888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px',
                  padding: '12px 16px 12px 44px', color: '#ffffff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
              />
            </form>
          </div>
        </div>

        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', backgroundColor: '#111' }}>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Name</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Email</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '500', color: '#aaa' }}>Joined</th>
                <th style={{ padding: '16px', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.data.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #222', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', color: '#ffffff', fontWeight: '500' }}>{user.name}</td>
                    <td style={{ padding: '16px', color: '#ddd' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {getStatusBadge(!!user.email_verified_at)}
                        {user.profile?.onboarding_status === 'completed' && (
                          <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#aaa', backgroundColor: '#222', border: '1px solid #333' }}>
                            Onboarded
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#888' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', position: 'relative' }}>
                      <button 
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      
                      {menuOpen === user.id && (
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
                              Copy User ID
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ddd', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <Shield size={16} color="#888" /> View Audit Logs
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ddd', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <LogIn size={16} color="#888" /> Impersonate User
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#222', margin: '4px 0' }} />
                            <button onClick={() => router.patch(`/admin/users/${user.id}/status`, { status: 'suspended' }, { preserveScroll: true, onSuccess: () => setMenuOpen(null) })} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#f87171', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8717120'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <UserX size={16} /> Suspend Account
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
          {users.last_page > 1 && (
            <div style={{ padding: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#888' }}>
              <div>Showing page {users.current_page} of {users.last_page} ({users.total} total)</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {users.links.map((link, i) => (
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

AdminUsers.layout = (page: any) => page;
