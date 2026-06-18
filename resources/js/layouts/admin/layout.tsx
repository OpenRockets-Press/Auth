import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, LayoutGrid, Webhook, Settings, ShieldAlert } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

const sidebarNavItems = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'OAuth Apps',
        href: '/admin/apps',
        icon: LayoutGrid,
    },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Console', href: '/admin' }]} fullWidth={true}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside style={{ 
                    width: '260px', 
                    borderRight: '1px solid #333', 
                    backgroundColor: '#111111', 
                    display: 'flex', 
                    flexDirection: 'column'
                }} className="hidden md:flex">
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px', color: '#ffffff' }}>
                            <ShieldAlert size={20} color="#ff4444" />
                            Admin Console
                        </div>
                        <p style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '4px' }}>
                            Platform Management
                        </p>
                    </div>
                    <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {sidebarNavItems.map((item) => {
                            const isActive = isCurrentOrParentUrl(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                                        fontSize: '14px', fontWeight: '500', textDecoration: 'none', transition: 'all 0.2s',
                                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                                        color: isActive ? '#000000' : '#ffffff'
                                    }}
                                    onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = '#222'; }}
                                    onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <item.icon size={16} color={isActive ? '#000000' : '#888'} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
