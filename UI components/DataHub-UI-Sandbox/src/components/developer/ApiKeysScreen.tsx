import React from 'react';
import { KeySquare, Lock } from 'lucide-react';

export const ApiKeysScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>API Keys</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>Manage Personal Access Tokens for scripts and CLI tools.</p>
      </div>

      {/* Feature Locked / Coming Soon State */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '80px 32px',
        border: '1px solid #333',
        borderRadius: '24px',
        backgroundColor: '#0a0a0a',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <KeySquare size={48} color="#ffffff" style={{ opacity: 0.2 }} />
          <div style={{ 
            position: 'absolute', 
            bottom: '-8px', 
            right: '-8px', 
            backgroundColor: '#ffffff', 
            borderRadius: '50%', 
            padding: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Lock size={16} color="#000000" />
          </div>
        </div>
        
        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#ffffff', fontWeight: '500' }}>Personal Access Tokens Disabled</h3>
        <p style={{ margin: '0 0 24px 0', color: '#ffffff', opacity: 0.7, maxWidth: '480px', lineHeight: '1.5' }}>
          Your backend server's `Auth` module does not currently expose endpoints for generating Personal Access Tokens (PATs). 
          To use API keys, an administrator must implement the Passport Token routes in the API.
        </p>
        
        <div style={{ backgroundColor: '#111111', padding: '12px 24px', borderRadius: '12px', border: '1px solid #333', fontSize: '14px', fontFamily: 'monospace' }}>
          <span style={{ color: '#ff4444' }}>Route::post</span>('/personal-access-tokens', ...); // Missing
        </div>
      </div>

    </div>
  );
};
