import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';

export default function CreateApp() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        homepage_url: '',
        privacy_policy_url: '',
        redirect_uris: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('developer.apps.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Developer Hub', href: '/developer/apps' },
            { title: 'Register Application', href: '/developer/apps/create' }
        ]}>
            <Head title="Register Application" />
            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/developer/apps">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Register Application</h1>
                        <p className="text-muted-foreground mt-1">
                            Create a new OAuth client to authenticate users with OpenRockets.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                        <CardDescription>
                            This information will be shown to users when they authorize your application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">App Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. My Cool App"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What does your app do?"
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="homepage_url">Homepage URL *</Label>
                                <Input
                                    id="homepage_url"
                                    type="url"
                                    value={data.homepage_url}
                                    onChange={(e) => setData('homepage_url', e.target.value)}
                                    placeholder="https://mycoolapp.com"
                                    required
                                />
                                <InputError message={errors.homepage_url} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="privacy_policy_url">Privacy Policy URL *</Label>
                                <Input
                                    id="privacy_policy_url"
                                    type="url"
                                    value={data.privacy_policy_url}
                                    onChange={(e) => setData('privacy_policy_url', e.target.value)}
                                    placeholder="https://mycoolapp.com/privacy"
                                    required
                                />
                                <InputError message={errors.privacy_policy_url} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="redirect_uris">Authorized Redirect URIs *</Label>
                                <textarea
                                    id="redirect_uris"
                                    value={data.redirect_uris}
                                    onChange={(e) => setData('redirect_uris', e.target.value)}
                                    placeholder="https://mycoolapp.com/callback, https://mycoolapp.com/api/auth/callback"
                                    rows={3}
                                    required
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate multiple URIs with commas. These are the endpoints OpenRockets will redirect users to after successful authentication.
                                </p>
                                <InputError message={errors.redirect_uris} />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Registering...' : 'Register Application'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
