import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Settings, Shield, Webhook, AlertTriangle, 
  Copy, Check, Users, ShieldAlert 
} from 'lucide-react';
import { MicrosoftLoadingDots } from '../MicrosoftLoadingDots';

// Mock interface for App data
interface AppDetails {
  id: number;
  client_id: string;
  name: string;
  description: string;
  status: string;
  redirect_uris: string[];
  created_at: string;
}

export const AppDashboardScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [app, setApp] = useState<AppDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Mock API Fetch
    setTimeout(() => {
      setApp({
        id: Number(id) || 1,
        client_id: '12345-abcde-67890-fghij',
        name: 'My Custom Integration',
        description: 'Used for sinking data between our ERP and DataHub.',
        status: 'verified',
        redirect_uris: ['https://my-erp-integration.com/callback'],
        created_at: '2026-05-20T10:00:00Z'
      });
      setIsLoading(false);
    }, 800);
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const tabs = [
    { id: 'overview', name: 'Overview & Analytics', icon: <Activity size={16} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={16} /> },
    { id: 'webhooks', name: 'Webhooks', icon: <Webhook size={16} /> },
    { id: 'consents', name: 'Consents & Scopes', icon: <Users size={16} /> },
    { id: 'danger', name: 'Danger Zone', icon: <AlertTriangle size={16} /> },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <MicrosoftLoadingDots />
      </div>
    );
  }

  if (!app) return <div>App not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div>
        <button 
          onClick={() => navigate('/developer/apps')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            fontSize: '15px',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '24px',
            opacity: 0.8
          }}
        >
          <ArrowLeft size={18} />
          Back to Apps
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: '#000000'
              }}>
                <Shield size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '500', color: '#ffffff' }}>{app.name}</h1>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '500', 
                backgroundColor: '#ffffff', 
                color: '#000000',
                textTransform: 'capitalize'
              }}>
                {app.status}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', opacity: 0.8 }}>
              Client ID: {app.client_id}
              <button 
                onClick={() => copyToClipboard(app.client_id)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '8px', opacity: 0.8 }}
              >
                {copiedId ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #333', paddingBottom: '16px', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', padding: '32px' }}>
        {activeTab === 'overview' && <OverviewTab app={app} />}
        {activeTab === 'settings' && <SettingsTab app={app} />}
        {activeTab === 'webhooks' && <WebhooksTab app={app} />}
        {activeTab === 'consents' && <ConsentsTab app={app} />}
        {activeTab === 'danger' && <DangerTab app={app} />}
      </div>

    </div>
  );
};

// Sub-components for Tabs

const OverviewTab: React.FC<{ app: AppDetails }> = ({ app }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '500' }}>Analytics Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', opacity: 0.6 }}>Total Consents</h3>
          <div style={{ fontSize: '32px', fontWeight: '600' }}>1,248</div>
        </div>
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', opacity: 0.6 }}>Active Consents</h3>
          <div style={{ fontSize: '32px', fontWeight: '600' }}>1,102</div>
        </div>
        <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', opacity: 0.6 }}>Revoked</h3>
          <div style={{ fontSize: '32px', fontWeight: '600', color: '#ff4444' }}>146</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>Basic Details</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.8 }}><strong>Created:</strong> {new Date(app.created_at).toLocaleDateString()}</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.8 }}><strong>Description:</strong> {app.description}</p>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ app: AppDetails }> = ({ app }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '500' }}>Application Settings</h2>
      <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>Update your app's basic information and redirect URIs.</p>
      
      {/* Settings form placeholder matching CreateAppScreen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Application Name</label>
          <input type="text" defaultValue={app.name} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#000000', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Description</label>
          <textarea defaultValue={app.description} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#000000', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', minHeight: '100px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Redirect URIs</label>
          {app.redirect_uris.map((uri, i) => (
            <input key={i} type="text" defaultValue={uri} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#000000', border: '1px solid #444', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box', marginBottom: '8px', fontFamily: 'monospace' }} />
          ))}
        </div>
        <button style={{ alignSelf: 'flex-start', padding: '10px 24px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '24px', fontWeight: '600', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

const WebhooksTab: React.FC<{ app: AppDetails }> = ({ app }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>Webhooks</h2>
        <button style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '24px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}>
          Add Webhook
        </button>
      </div>
      <div style={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <Webhook size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>No Webhooks Configured</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Subscribe to events like consent granted or revoked.</p>
      </div>
    </div>
  );
};

const ConsentsTab: React.FC<{ app: AppDetails }> = ({ app }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '500' }}>Active Consents</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px 16px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>User ID</th>
              <th style={{ padding: '12px 16px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Granted At</th>
              <th style={{ padding: '12px 16px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Scopes</th>
              <th style={{ padding: '12px 16px', color: '#ffffff', opacity: 0.6, fontWeight: '500', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'nowrap' }}>user_8f7d6c5b</td>
              <td style={{ padding: '16px', fontSize: '14px', whiteSpace: 'nowrap' }}>2026-06-10</td>
              <td style={{ padding: '16px', fontSize: '14px', whiteSpace: 'nowrap' }}>profile, email</td>
              <td style={{ padding: '16px', whiteSpace: 'nowrap' }}><span style={{ backgroundColor: '#ffffff', color: '#000000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DangerTab: React.FC<{ app: AppDetails }> = ({ app }) => {
  return (
    <div>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '500', color: '#ff4444' }}>Danger Zone</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000000', border: '1px solid #ff4444', borderRadius: '12px', padding: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Regenerate Client Secret</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>This will immediately invalidate the current secret. Any active integrations using the old secret will break.</p>
          </div>
          <button style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '24px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Regenerate Secret
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000000', border: '1px solid #ff4444', borderRadius: '12px', padding: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Revoke All Consents</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Immediately force all users to re-authorize the application.</p>
          </div>
          <button style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '24px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Revoke All
          </button>
        </div>

      </div>
    </div>
  );
};
