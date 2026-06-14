import React, { useState, useEffect } from 'react';
import { Search, FileWarning, Shield, CheckCircle, Database } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

// Mock Interfaces
interface DataRequest {
  id: number;
  user: { name: string; email: string };
  request_type: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export const ComplianceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'audit'>('requests');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API Fetch
    setTimeout(() => {
      setRequests([
        { id: 101, user: { name: 'Alice Smith', email: 'alice@example.com' }, request_type: 'export', status: 'pending', created_at: '2026-06-12T10:00:00Z' },
        { id: 102, user: { name: 'Bob Jones', email: 'bob@example.com' }, request_type: 'deletion', status: 'processing', created_at: '2026-06-11T10:00:00Z' },
        { id: 103, user: { name: 'Charlie', email: 'charlie@example.com' }, request_type: 'export', status: 'completed', created_at: '2026-05-10T10:00:00Z' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleFulfill = (id: number) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: 'processing' } : req));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>Compliance & Audit</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>Manage GDPR/CCPA data requests and view system-wide audit logs.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            backgroundColor: activeTab === 'requests' ? '#ffffff' : 'transparent',
            color: activeTab === 'requests' ? '#000000' : '#ffffff',
            border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <FileWarning size={16} />
          Data Requests
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            backgroundColor: activeTab === 'audit' ? '#ffffff' : 'transparent',
            color: activeTab === 'audit' ? '#000000' : '#ffffff',
            border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Shield size={16} />
          System Audit Logs
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'requests' ? (
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', overflowX: 'auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
              <MicrosoftLoadingDots />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Request ID</th>
                  <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>User</th>
                  <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Type</th>
                  <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: '14px' }}>REQ-{req.id}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{req.user.name}</div>
                      <div style={{ fontSize: '13px', opacity: 0.6 }}>{req.user.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                        backgroundColor: '#222222', color: '#ffffff' 
                      }}>
                        {req.request_type === 'export' ? <Database size={12} /> : <FileWarning size={12} />}
                        {req.request_type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                        backgroundColor: req.status === 'completed' ? '#ffffff' : req.status === 'pending' ? '#ffaa00' : '#222222',
                        color: req.status === 'completed' ? '#000000' : '#ffffff' 
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {req.status === 'pending' && (
                        <button 
                          onClick={() => handleFulfill(req.id)}
                          style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '16px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Fulfill Request
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <Shield size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '500' }}>Audit Log Viewer</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', opacity: 0.8, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            System-wide audit logs provide an immutable history of all authentication, authorization, and administrative events.
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', backgroundColor: '#111', padding: '12px 24px', borderRadius: '24px', border: '1px solid #333' }}>
            <Search size={18} style={{ opacity: 0.5 }} />
            <input type="text" placeholder="Search event type or ID..." style={{ background: 'none', border: 'none', color: '#ffffff', outline: 'none', width: '250px' }} />
          </div>
        </div>
      )}

    </div>
  );
};
