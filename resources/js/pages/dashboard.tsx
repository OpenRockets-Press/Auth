import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ShieldCheck, Link2, MonitorSmartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
    active_consents: number;
    connected_accounts: number;
    active_sessions: number;
    security_status: string;
}

interface Props {
    stats: DashboardStats;
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your connected apps, privacy settings, and overall account security.
                    </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_consents}</div>
                            <p className="text-xs text-muted-foreground">Apps accessing your data</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Linked Accounts</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.connected_accounts}</div>
                            <p className="text-xs text-muted-foreground">Social logins connected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_sessions}</div>
                            <p className="text-xs text-muted-foreground">Devices currently logged in</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                            <ShieldCheck className={`h-4 w-4 ${stats.security_status === 'Strong' ? 'text-green-500' : 'text-amber-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.security_status}</div>
                            <p className="text-xs text-muted-foreground">Based on your 2FA settings</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">New login from Windows PC</p>
                                        <p className="text-sm text-muted-foreground">Just now</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Profile completed</p>
                                        <p className="text-sm text-muted-foreground">Today</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 flex flex-col justify-between bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Privacy Control Center</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Review which third-party applications have access to your OpenRockets account and revoke any permissions you no longer need.
                            </p>
                            <Button asChild className="w-full sm:w-auto gap-2">
                                <Link href="/consents">
                                    Manage Consents <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
