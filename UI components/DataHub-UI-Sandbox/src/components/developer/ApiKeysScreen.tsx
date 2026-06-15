import React, { useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';
import axios from 'axios';

import { useAuth } from '../../contexts/AuthProvider';

export const ApiKeysScreen: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [successData, setSuccessData] = useState<{ token: string, name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim() || !token) return;

    setIsCreating(true);
    setError(null);
    
    try {
      const response = await axios.post('https://openrocketsauth.alwaysdata.net/api/personal-access-tokens', {
        name: tokenName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessData({
        name: tokenName,
        token: response.data.token || response.data.accessToken || 'Unknown'
      });
      setTokenName('');
    } catch (err: any) {
      console.error('Error creating PAT:', err);
      setError('Failed to create token. Ensure your backend has the /api/personal-access-tokens route implemented.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToken = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '700px' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>Personal Access Tokens</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>Manage Personal Access Tokens for scripts and CLI tools.</p>
      </div>

      {successData && (
        <div style={{ backgroundColor: '#111111', border: '1px solid #00cc66', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '500', color: '#00cc66' }}>Token Created: {successData.name}</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.8 }}>
            Make sure to copy your personal access token now. You won't be able to see it again!
          </p>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '16px', padding: '12px', backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px', overflowX: 'auto', color: '#fff' }}>
              {successData.token}
            </div>
            <button 
              onClick={copyToken}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', backgroundColor: copied ? '#ffffff' : '#222222',
                color: copied ? '#000000' : '#ffffff', border: 'none', borderRadius: '8px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          
          <button 
            onClick={() => setSuccessData(null)}
            style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      )}

      {/* Creation Form */}
      <div style={{ backgroundColor: '#111111', border: '1px solid #333', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>Generate New Token</h2>
        
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#fff' }}>Token Name</label>
            <input 
              type="text" 
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', backgroundColor: '#000000',
                border: '1px solid #444', borderRadius: '8px', color: '#ffffff',
                fontSize: '15px', boxSizing: 'border-box'
              }}
              placeholder="e.g. CLI Deploy Script"
              required
            />
          </div>
          
          {error && <div style={{ color: '#ff4444', fontSize: '14px' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              type="submit"
              disabled={isCreating || !tokenName.trim()}
              style={{
                padding: '12px 24px', backgroundColor: '#ffffff', color: '#000000',
                border: 'none', borderRadius: '24px', fontSize: '15px', fontWeight: '600',
                cursor: (isCreating || !tokenName.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isCreating ? (
                <div style={{ position: 'relative', height: '20px', width: '40px' }}>
                  <MicrosoftLoadingDots />
                </div>
              ) : <><Plus size={18} /> Generate Token</>}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
