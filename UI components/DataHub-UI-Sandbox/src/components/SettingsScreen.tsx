import React, { useState } from 'react';
import { Laptop, Smartphone, XCircle, ShieldCheck } from 'lucide-react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';

import type {  TrustedDevice  } from '../models/types';

// Mocks the TrustedDeviceResource array from GET /api/settings/devices
const MOCK_DEVICES: TrustedDevice[] = [
  {
    id: 1,
    name: 'Windows PC',
    browser: 'Chrome 125.0',
    ip_address: '192.168.1.105',
    is_current: true,
    last_active: 'Just now'
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    ip_address: '10.0.0.42',
    is_current: false,
    last_active: '2 days ago'
  },
  {
    id: 3,
    name: 'MacBook Air M2',
    browser: 'Firefox 120.0',
    ip_address: '192.168.1.200',
    is_current: false,
    last_active: 'Last week'
  }
];

export const SettingsScreen: React.FC = () => {
  const [devices, setDevices] = useState<TrustedDevice[]>(MOCK_DEVICES);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Simulates DELETE /api/settings/devices/{device}
  const handleRevoke = (id: number) => {
    setLoadingId(id);
    
    // Simulate API delay
    setTimeout(() => {
      setDevices(prev => prev.filter(d => d.id !== id));
      setLoadingId(null);
    }, 1500);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'var(--ms-text)' }}>Account Settings</h1>
      <p style={{ fontSize: '15px', color: 'var(--ms-text-secondary)', marginBottom: '32px', maxWidth: '800px' }}>
        Manage your security preferences and the devices trusted by your OpenRockets account. 
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--ms-text)' }}>Trusted Devices</h2>
      
      <div style={{ backgroundColor: '#000000', border: '1px solid #ffffff', borderRadius: '24px', overflow: 'hidden' }}>
        {devices.map((device, index) => (
          <div key={device.id} style={{ 
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            borderBottom: index < devices.length - 1 ? '1px solid #ffffff' : 'none',
            transition: 'background-color 0.2s'
          }}>
            {loadingId === device.id && (
              <div className="ms-loader-overlay fast-loader">
                <MicrosoftLoadingDots />
              </div>
            )}
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#ffffff', 
                borderRadius: '50%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                color: '#000000' 
              }}>
                {device.name.includes('iPhone') || device.name.includes('Android') ? <Smartphone size={20} /> : <Laptop size={20} />}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div style={{ fontWeight: '500', color: '#ffffff', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.name}</div>
                  {device.is_current && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', color: '#000000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', flexShrink: 0 }}>
                      <ShieldCheck size={12} />
                      Current Device
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {device.browser} • IP: {device.ip_address}
                </div>
                
                <div style={{ fontSize: '13px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Last active: {device.last_active}
                </div>
              </div>
            </div>

            <div>
              {!device.is_current && (
                <button 
                  onClick={() => handleRevoke(device.id)}
                  disabled={loadingId === device.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: loadingId === device.id ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loadingId === device.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                >
                  {loadingId === device.id ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
