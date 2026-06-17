import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Consent {
    id: string;
    app_name: string;
    created_at: string;
    logo_url: string | null;
    privacy_policy_url: string | null;
    terms_of_service_url: string | null;
}

interface Props {
    consents: Consent[];
}

export default function ConsentsIndex({ consents }: Props) {
    const { delete: destroy, processing } = useForm();

    const revokeConsent = (id: string) => {
        destroy(route('consents.destroy', id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Manage Consents', href: '/consents' }]}>
            <Head title="Manage Consents" />
            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">Active Consents</h1>
                    <p className="text-muted-foreground mt-2">
                        These third-party applications currently have access to your OpenRockets profile data.
                        You can revoke their access at any time.
                    </p>
                </div>

                {consents.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <KeyRound className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <CardTitle className="mb-2">No Active Consents</CardTitle>
                        <CardDescription>
                            You haven't granted access to any third-party applications yet.
                        </CardDescription>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {consents.map((consent) => (
                            <Card key={consent.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {consent.logo_url ? (
                                                <img src={consent.logo_url} alt={`${consent.app_name} logo`} className="w-12 h-12 rounded-xl object-cover bg-muted" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                                    {consent.app_name.substring(0, 1)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-lg">{consent.app_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Access granted on {new Date(consent.created_at).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {consent.privacy_policy_url && (
                                                        <a href={consent.privacy_policy_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            Privacy Policy <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                    {consent.terms_of_service_url && (
                                                        <a href={consent.terms_of_service_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            Terms <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Revoke Access
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                        Revoke access for {consent.app_name}?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This application will no longer be able to access your profile data or log you in automatically.
                                                        However, they may still retain data they have already collected in accordance with their privacy policy.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => revokeConsent(consent.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        disabled={processing}
                                                    >
                                                        {processing ? 'Revoking...' : 'Yes, Revoke Access'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
