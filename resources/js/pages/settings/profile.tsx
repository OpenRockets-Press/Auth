import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { User as UserIcon, AlertCircle } from 'lucide-react';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;

    const cardStyle = {
        backgroundColor: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px'
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Profile Settings', href: '/settings/profile' }]} fullWidth={false}>
            <Head title="Profile Settings" />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Profile Settings</h1>
                <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px' }}>
                    View your basic profile information.
                </p>

                {/* Info Notice */}
                <div style={{ ...cardStyle, borderColor: '#f59e0b40', backgroundColor: '#f59e0b05' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#f59e0b' }}>
                        <AlertCircle size={24} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Profile Editing Unavailable Here</h2>
                    </div>
                    <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.9, marginBottom: '24px', lineHeight: 1.6 }}>
                        Profile editing is currently not available in this portal. To change your name, email, avatar, or other core profile details, please manage your profile directly through the main OpenRockets Account Center.
                    </p>
                    <a 
                        href="https://accounts.openrockets.com/settings/profile" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            backgroundColor: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40',
                            padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none'
                        }}
                    >
                        Edit Profile at OpenRockets
                    </a>
                </div>

                {/* Profile Read-Only Form */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '24px' }}>Personal Information</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: 0.7 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>Full Name</label>
                            <input 
                                type="text"
                                value={auth.user.name}
                                disabled
                                style={{
                                    width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #333',
                                    borderRadius: '12px', color: '#ffffff', fontSize: '15px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>Email Address</label>
                            <input 
                                type="email"
                                value={auth.user.email}
                                disabled
                                style={{
                                    width: '100%', padding: '12px 16px', backgroundColor: '#111', border: '1px solid #333',
                                    borderRadius: '12px', color: '#ffffff', fontSize: '15px'
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

Profile.layout = (page: any) => page;
