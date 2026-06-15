import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Lock, Eye, ShieldAlert } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

import type {  User  } from '../../models/types';

export const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    // Mock API Fetch
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, updated_at: '2025-01-10T10:00:00Z', locked_until: null, created_at: '2025-01-10T10:00:00Z' },
        { id: 2, name: 'Bob Jones', email: 'bob@example.com', status: 'suspended', failed_login_attempts: 0, login_method: null, last_login_at: null, updated_at: '2025-02-14T10:00:00Z', locked_until: null, created_at: '2025-02-14T10:00:00Z' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'active', failed_login_attempts: 0, login_method: null, last_login_at: null, updated_at: '2026-06-20T10:00:00Z', locked_until: '2026-06-20T10:00:00Z', created_at: '2026-01-10T10:00:00Z' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const startImpersonation = (user: User) => {
    setIsImpersonating(true);
    setImpersonatedUser(user.email);
    // In a real app, this would redirect to the main app dashboard with the new token
  };

  const stopImpersonation = () => {
    setIsImpersonating(false);
    setImpersonatedUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Global Impersonation Banner */}
      {isImpersonating && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, 
          backgroundColor: '#ff4444', color: '#ffffff', padding: '12px 24px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 12px rgba(255,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <ShieldAlert size={20} />
            YOU ARE CURRENTLY IMPERSONATING: {impersonatedUser}
          </div>
          <button 
            onClick={stopImpersonation}
            style={{ padding: '6px 16px', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '16px', fontWeight: '600', cursor: 'pointer' }}
          >
            Stop Impersonation
          </button>
        </div>
      )}

      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>User Management</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>View, moderate, and impersonate platform users.</p>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', backgroundColor: '#000000', border: '1px solid #444', borderRadius: '24px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
            <MicrosoftLoadingDots />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>User</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Joined</th>
                <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', fontSize: '15px' }}>{user.name}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                        backgroundColor: user.status === 'active' ? '#ffffff' : '#ff4444', 
                        color: user.status === 'active' ? '#000000' : '#ffffff' 
                      }}>
                        {user.status}
                      </span>
                      {user.locked_until && (
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: '#333333', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', opacity: 0.8 }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => startImpersonation(user)}
                        title="Impersonate"
                        style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', cursor: 'pointer' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        title="More Actions"
                        style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', cursor: 'pointer' }}
                      >
                        <MoreVertical size={16} />
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
