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
    {
        title: 'Webhooks',
        href: '/admin/webhooks',
        icon: Webhook,
    },
    {
        title: 'Platform Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Console', href: '/admin' }]}>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 border-r bg-muted/30 flex-col hidden md:flex">
                    <div className="p-6">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            Admin Console
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Platform Management
                        </p>
                    </div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {sidebarNavItems.map((item) => {
                            const isActive = isCurrentOrParentUrl(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <item.icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </AppLayout>
    );
}
