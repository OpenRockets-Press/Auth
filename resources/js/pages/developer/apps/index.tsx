import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface App {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
}

interface Props {
    apps: App[];
}

export default function DeveloperApps({ apps }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Pending Review</Badge>;
            case 'suspended':
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Developer Hub', href: '/developer/apps' }]}>
            <Head title="Developer Hub" />
            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Developer Hub</h1>
                        <p className="text-muted-foreground mt-2">
                            Build with OpenRockets. Register and manage your OAuth applications.
                        </p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/developer/apps/create">
                            <Plus className="h-4 w-4" /> Create App
                        </Link>
                    </Button>
                </div>

                {apps.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <CardTitle className="mb-2">No Applications Yet</CardTitle>
                        <CardDescription className="max-w-md">
                            Get started by creating your first OAuth application. You'll get a Client ID and Secret to authenticate users with OpenRockets.
                        </CardDescription>
                        <Button asChild className="mt-6 gap-2" variant="outline">
                            <Link href="/developer/apps/create">
                                <Plus className="h-4 w-4" /> Register App
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {apps.map((app) => (
                            <Card key={app.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl line-clamp-1">{app.name}</CardTitle>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                        {app.description || 'No description provided.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto flex justify-between items-center pt-4">
                                    <span className="text-xs text-muted-foreground">
                                        Created {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                    <Button asChild variant="secondary" size="sm" className="gap-2">
                                        <Link href={`/developer/apps/${app.id}`}>
                                            <Settings className="h-4 w-4" /> Manage
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
