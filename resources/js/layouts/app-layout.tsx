import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { ArrowLeft, Grip, User, Terminal, Lock } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
    fullWidth = false
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const { url } = usePage();
  const isHome = url === '/dashboard';
  const { auth } = usePage().props as any;
  const user = auth?.user;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', backgroundColor: '#000000', color: '#ffffff' }}>
      
      {/* Top Navbar */}
      <header style={{ 
        height: '64px', 
        backgroundColor: '#000000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isHome && (
            <button 
              onClick={() => window.history.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', color: '#ffffff', borderRadius: '50%' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer' }}>
            <img src="/openrocketsvc1.png" alt="OpenRockets Logo" style={{ height: '28px', width: 'auto', filter: 'invert(1)' }} />
            <span style={{ fontSize: '22px', fontWeight: '500', color: '#ffffff', letterSpacing: '-0.5px' }}>
              Account
            </span>
          </Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
          {/* Global Portal Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowPortalMenu(!showPortalMenu)}
              style={{ 
                background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', 
                padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: showPortalMenu ? '#333' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showPortalMenu ? '#333' : 'transparent'}
            >
              <Grip size={20} />
            </button>

            {showPortalMenu && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
                  onClick={() => setShowPortalMenu(false)} 
                />
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  backgroundColor: '#111111', border: '1px solid #333', borderRadius: '16px',
                  width: '280px', padding: '8px', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                }}>
                  <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>
                    Switch Portal
                  </div>
                  
                  <Link 
                    href="/dashboard"
                    onClick={() => setShowPortalMenu(false)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', borderRadius: '12px', textAlign: 'left', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '8px' }}><User size={16} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Personal Account</div>
                      <div style={{ fontSize: '12px', opacity: 0.6 }}>Manage your data</div>
                    </div>
                  </Link>

                  <Link 
                    href="/developer/apps"
                    onClick={() => setShowPortalMenu(false)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', borderRadius: '12px', textAlign: 'left', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '8px' }}><Terminal size={16} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Developer Portal</div>
                      <div style={{ fontSize: '12px', opacity: 0.6 }}>Build applications</div>
                    </div>
                  </Link>

                  {auth?.is_admin && (
                    <Link 
                      href="/admin"
                      onClick={() => setShowPortalMenu(false)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', borderRadius: '12px', textAlign: 'left', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '8px' }}><Lock size={16} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Admin Console</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>Platform management</div>
                      </div>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          <Link href="/settings/profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#8ab4f8', 
              color: '#000000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: '500',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          maxWidth: fullWidth ? '100%' : '600px', 
          margin: '0 auto', 
          padding: fullWidth ? '0' : '24px 16px 48px 16px',
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </div>
      </main>
      
    </div>
  );
}
