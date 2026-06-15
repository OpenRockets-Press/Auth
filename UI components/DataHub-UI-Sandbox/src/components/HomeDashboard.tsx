import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Database, Shield, Search, ArrowRight, Terminal, Lock } from 'lucide-react';
import { MicrosoftLoadingDots } from './MicrosoftLoadingDots';
import type {  User  } from '../models/types';

interface HomeDashboardProps {
  user?: User;
}

const mockUser: User = {
  id: 1,
  name: "R.K de Silva",
  email: "enterprise@openrockets.com",
  status: "active",
  last_login_at: new Date().toISOString(),
  login_method: "password",
  failed_login_attempts: 0,
  locked_until: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ user = mockUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', marginTop: '16px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: '#8ab4f8', 
            color: '#000000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: '400',
            fontSize: '36px'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '400', color: '#ffffff' }}>{user.name}</h1>
        <div style={{ fontSize: '14px', color: '#ffffff' }}>{user.email}</div>
      </div>

      {/* Search Bar */}
      <div style={{ width: '100%', marginBottom: '32px', position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          backgroundColor: '#000000',
          border: '1px solid #ffffff',
          borderRadius: '24px',
          color: '#ffffff'
        }}>
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search Account"
            value={searchQuery}
            onChange={handleSearch}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', fontFamily: 'inherit', color: '#ffffff' }}
          />
        </div>
        {isSearching && (
          <div className="ms-loader-overlay fast-loader" style={{ borderRadius: '24px', overflow: 'hidden' }}>
            <MicrosoftLoadingDots />
          </div>
        )}
      </div>

      {/* Navigation Cards Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '48px' }}>
        
        {/* Linked Apps Card */}
        <div className="mat-card" onClick={() => navigate('/apps')}>
          <div className="mat-icon-bg" style={{ backgroundColor: '#ffffff' }}>
            <Network size={20} color="#000000" />
          </div>
          <div>
            <h3 className="mat-title">Linked apps</h3>
            <p className="mat-subtitle">Your connected apps and integrations</p>
          </div>
        </div>

        {/* Data Agreements Card */}
        <div className="mat-card" onClick={() => navigate('/agreements')}>
          <div className="mat-icon-bg" style={{ backgroundColor: '#ffffff' }}>
            <Database size={20} color="#000000" />
          </div>
          <div>
            <h3 className="mat-title">Data agreements</h3>
            <p className="mat-subtitle">Cross-app data sharing and revocations</p>
          </div>
        </div>

        {/* Settings Card */}
        <div className="mat-card" onClick={() => navigate('/settings')}>
          <div className="mat-icon-bg" style={{ backgroundColor: '#ffffff' }}>
            <Shield size={20} color="#000000" />
          </div>
          <div>
            <h3 className="mat-title">Security & devices</h3>
            <p className="mat-subtitle">Manage trusted devices and sign-ins</p>
          </div>
        </div>

      </div>

      {/* Portals & Tools Navigation */}
      <section style={{ width: '100%' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '24px', letterSpacing: '-0.5px' }}>Portals & Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div 
            onClick={() => navigate('/developer')}
            style={{ 
              backgroundColor: '#000000', border: '1px solid #333', borderRadius: '24px', padding: '32px 24px', 
              cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#111111', padding: '12px', borderRadius: '16px' }}>
                <Terminal size={24} color="#ffffff" />
              </div>
              <ArrowRight size={20} color="#ffffff" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>Developer Portal</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#ffffff', opacity: 0.6, lineHeight: '1.5' }}>
              Register OAuth applications, manage API keys, and view developer documentation.
            </p>
          </div>

          <div 
            onClick={() => navigate('/admin')}
            style={{ 
              backgroundColor: '#000000', border: '1px solid #333', borderRadius: '24px', padding: '32px 24px', 
              cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#111111', padding: '12px', borderRadius: '16px' }}>
                <Lock size={24} color="#ffffff" />
              </div>
              <ArrowRight size={20} color="#ffffff" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>Admin Console</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#ffffff', opacity: 0.6, lineHeight: '1.5' }}>
              Moderate applications, manage users, and fulfill compliance data requests.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};
