import React from 'react';
import { BookText, Code, CheckCircle, ArrowRight } from 'lucide-react';

export const ApiDocsScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>API Documentation</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>Integrate your application securely with DataHub's OAuth 2.0 API.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Table of Contents (Desktop only for simplicity) */}
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '100px' }} className="docs-toc">
          <div style={{ fontWeight: '500', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Contents</div>
          <a href="#discovery" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>OIDC Discovery</a>
          <a href="#authorization" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Authorization Code Flow</a>
          <a href="#webhooks" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Webhooks</a>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          <section id="discovery">
            <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookText size={20} /> OpenID Connect Discovery
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
              DataHub supports standard OIDC discovery. You can fetch our server's configuration metadata, including authorization endpoints, token endpoints, and supported scopes, from the well-known URL.
            </p>
            <div style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: '#ffffff', color: '#000000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>GET</span>
                <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>/.well-known/openid-configuration</span>
              </div>
              <pre style={{ margin: 0, color: '#a8c7fa', fontFamily: 'monospace', fontSize: '13px' }}>
{`curl -X GET "https://api.datahub.local/.well-known/openid-configuration" \\
     -H "Accept: application/json"`}
              </pre>
            </div>
          </section>

          <section id="authorization">
            <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={20} /> Authorization Code Flow
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
              To request access to user data, redirect the user's browser to the `/oauth/authorize` endpoint. Ensure you have registered your `redirect_uris` in the Developer Dashboard first.
            </p>
            
            <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 16px 0' }}>1. Request Authorization</h3>
              <div style={{ backgroundColor: '#111111', borderRadius: '8px', padding: '12px', overflowX: 'auto', marginBottom: '16px' }}>
                <span style={{ backgroundColor: '#ffffff', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginRight: '12px' }}>GET</span>
                <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=...</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0', opacity: 0.5 }}>
                <ArrowRight size={24} />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 16px 0' }}>2. Exchange Code for Token</h3>
              <div style={{ backgroundColor: '#111111', borderRadius: '8px', padding: '12px', overflowX: 'auto' }}>
                <span style={{ backgroundColor: '#ffffff', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginRight: '12px' }}>POST</span>
                <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>/oauth/token</span>
              </div>
            </div>
          </section>

          <section id="webhooks">
            <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} /> Webhooks
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
              Subscribe to platform events using Webhooks. DataHub will dispatch `POST` requests to your registered endpoint when events occur.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '16px', fontSize: '13px', textTransform: 'uppercase', opacity: 0.6 }}>Event Name</th>
                  <th style={{ padding: '16px', fontSize: '13px', textTransform: 'uppercase', opacity: 0.6 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>consent.granted</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>Fired when a user authorizes your application.</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>consent.revoked</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>Fired when a user revokes access to your application.</td>
                </tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  );
};
