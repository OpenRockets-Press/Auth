import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface MembershipCardProps {
  name: string;
  password?: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ name, password }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null, useCORS: true });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "OpenRockets_Card.png";
        link.click();
      } catch (err) {
        console.error("Failed to download card", err);
      }
    }
  };

  const handleFinish = () => {
    window.location.href = 'https://myaccount.openrockets.com/auth/sso?token=' + localStorage.getItem('_or_auth_tk');
  };

  return (
    <div style={{ padding: '24px', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
        <h3 className="ms-title" style={{ fontSize: '24px', margin: 0, textAlign: 'left' }}>Welcome {name ? name.split(' ')[0] : 'Member'}!</h3>
      </div>
      
      <p style={{ margin: '0 0 24px 0', fontSize: '14px', textAlign: 'left', color: 'var(--ms-text)' }}>
        Keep this card downloaded to your phone or computer in the future to access special benefits such as merchandise offers, book offers, and etc.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div 
          ref={cardRef}
          style={{
            width: '400px',
            height: '250px',
            background: 'linear-gradient(135deg, #2a2a2a 0%, #111 100%)',
            borderRadius: '16px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
            color: 'white',
            overflow: 'hidden',
            fontFamily: '"Space Grotesk", "Inter", sans-serif'
          }}
        >
          {/* Subtle noise texture */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}></div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <img src="https://openrockets.com/v/openrockets.png" crossOrigin="anonymous" alt="OpenRockets" style={{ width: '100px' }} />
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <path d="M4 8a10.66 10.66 0 0 1 3-1.5m6.5 0a10.66 10.66 0 0 1 3 1.5"/>
                <path d="M4 12a14.66 14.66 0 0 1 5-2m6 0a14.66 14.66 0 0 1 5 2"/>
                <path d="M4 16a18.66 18.66 0 0 1 7-2.5m4 0a18.66 18.66 0 0 1 7 2.5"/>
                <circle cx="12" cy="20" r="1" fill="white" stroke="none"/>
              </svg>
            </div>

            {/* Bottom row */}
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {name || 'Your Name'}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7, letterSpacing: '1px' }}>
                  MEMBER
                </div>
              </div>
              
              <div style={{ background: 'white', padding: '6px', borderRadius: '4px' }}>
                <QRCodeSVG value={password || 'NO_DATA'} size={50} level="M" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button className="ms-button ms-button-secondary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Card
        </button>
        <button className="ms-button ms-button-primary" onClick={handleFinish}>
          Finish
        </button>
      </div>
    </div>
  );
};
