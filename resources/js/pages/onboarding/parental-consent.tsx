import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth/auth-layout';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
    parental_consent_status: string;
    parent_email?: string;
}

export default function ParentalConsentRequired({ parental_consent_status, parent_email }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        parent_email: parent_email || '',
        parent_name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('api.compliance.parental-consent.request'));
    };

    if (parental_consent_status === 'pending') {
        return (
            <AuthLayout
                title="Parental Consent Pending"
                description="We've sent an email to your parent or guardian."
            >
                <Head title="Consent Pending" />
                <div className="flex flex-col gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Because you are under the digital age of consent, a parent or guardian must approve your account creation.
                    </p>
                    <div className="rounded-md bg-secondary/50 p-4">
                        <p className="text-sm font-medium">Waiting for response from:</p>
                        <p className="text-sm text-primary">{parent_email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Please ask them to check their inbox and click the link to approve your account.
                        Once approved, refresh this page to continue.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                        Refresh Status
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Parental Consent Required"
            description="Because of your age, we need permission from a parent or guardian."
        >
            <Head title="Parental Consent Required" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="parent_email">Parent's Email Address *</Label>
                    <Input
                        id="parent_email"
                        type="email"
                        name="parent_email"
                        value={data.parent_email}
                        onChange={(e) => setData('parent_email', e.target.value)}
                        placeholder="parent@example.com"
                        required
                    />
                    <InputError message={errors.parent_email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="parent_name">Parent's Name (Optional)</Label>
                    <Input
                        id="parent_name"
                        name="parent_name"
                        value={data.parent_name}
                        onChange={(e) => setData('parent_name', e.target.value)}
                        placeholder="Jane Doe"
                    />
                    <InputError message={errors.parent_name} />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Sending...' : 'Send Consent Request'}
                </Button>
            </form>
        </AuthLayout>
    );
}
