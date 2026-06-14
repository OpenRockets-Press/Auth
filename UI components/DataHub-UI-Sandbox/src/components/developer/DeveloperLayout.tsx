import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppWindow, BookText, KeySquare, LayoutDashboard, ArrowLeft } from 'lucide-react';

export const DeveloperLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/developer/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Apps', path: '/developer/apps', icon: <AppWindow size={18} /> },
    { name: 'API Keys', path: '/developer/keys', icon: <KeySquare size={18} /> },
    { name: 'Documentation', path: '/developer/docs', icon: <BookText size={18} /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px', marginBottom: '16px', display: 'none' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff' }}>Developer Portal</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/developer' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#000000' : '#ffffff',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', fontSize: '15px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#111111'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Escape Hatch */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
              backgroundColor: 'transparent', color: '#ffffff', opacity: 0.7,
              border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', fontSize: '14px',
              width: '100%', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
          >
            <ArrowLeft size={18} />
            Back to Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
