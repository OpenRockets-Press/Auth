import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface App {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    homepage_url: string;
}

interface Stats {
    total_consents: number;
    active_consents: number;
}

interface Props {
    app: App;
    client_id: string;
    client_secret?: string; // Only passed on creation
    redirect_uris: string[];
    stats: Stats;
}

export default function AppDetails({ app, client_id, client_secret, redirect_uris, stats }: Props) {
    const [showSecret, setShowSecret] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    const copyToClipboard = (text: string, isSecret: boolean) => {
        navigator.clipboard.writeText(text);
        if (isSecret) {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } else {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

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
        <AppLayout breadcrumbs={[
            { title: 'Developer Hub', href: '/developer/apps' },
            { title: app.name, href: `/developer/apps/${app.id}` }
        ]}>
            <Head title={`${app.name} | Developer Hub`} />
            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/developer/apps">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                {getStatusBadge(app.status)}
                                <span className="text-sm text-muted-foreground">
                                    Created {new Date(app.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {client_secret && (
                            <Card className="border-green-500/50 bg-green-500/5">
                                <CardHeader>
                                    <CardTitle className="text-green-600 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Application Created
                                    </CardTitle>
                                    <CardDescription className="text-green-600/80">
                                        Please copy your new Client Secret below. This is the only time it will be shown to you.
                                        If you lose it, you will need to generate a new one.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Input value={client_secret} readOnly className="font-mono" />
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => copyToClipboard(client_secret, true)}
                                            className="w-24"
                                        >
                                            {copiedSecret ? 'Copied!' : <><Copy className="h-4 w-4 mr-2" /> Copy</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>OAuth Credentials</CardTitle>
                                <CardDescription>
                                    Use these credentials to authenticate users via the OpenRockets OAuth 2.0 API.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Client ID</Label>
                                    <div className="flex items-center gap-2">
                                        <Input value={client_id} readOnly className="font-mono bg-muted/50" />
                                        <Button 
                                            variant="outline" 
                                            onClick={() => copyToClipboard(client_id, false)}
                                            className="w-24"
                                        >
                                            {copiedId ? 'Copied!' : <><Copy className="h-4 w-4 mr-2" /> Copy</>}
                                        </Button>
                                    </div>
                                </div>
                                
                                {!client_secret && (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Client Secret</Label>
                                            <Button variant="link" className="h-auto p-0 text-destructive">Generate New Secret</Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                value="••••••••••••••••••••••••••••••••••••••••" 
                                                type={showSecret ? "text" : "password"} 
                                                readOnly 
                                                className="font-mono bg-muted/50 text-muted-foreground" 
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            The client secret is hidden for security. You can generate a new one if it was compromised.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Authorized Redirect URIs</CardTitle>
                                <CardDescription>
                                    Users will be redirected to these URIs after authentication.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {redirect_uris.map((uri, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 rounded-md border bg-muted/20">
                                            <code className="text-sm flex-1">{uri}</code>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" size="sm">Edit URIs</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                                    <span className="text-2xl font-bold">{stats.active_consents}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Total Consents Ever</span>
                                    <span className="text-lg font-semibold">{stats.total_consents}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
