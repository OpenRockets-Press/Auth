import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth/auth-layout';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Country {
    code: string;
    name: string;
}

interface Props {
    countries: Country[];
    onboarding_status: string;
    required_fields: string[];
}

export default function Onboarding({ countries, onboarding_status, required_fields }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        country_code: '',
        state: '',
        city: '',
        date_of_birth: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    return (
        <AuthLayout
            title="Complete your profile"
            description="We need a few more details to set up your account securely."
        >
            <Head title="Complete Profile" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="country_code">Country *</Label>
                    <Select onValueChange={(val) => setData('country_code', val)} value={data.country_code}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.country_code} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="state">State / Province *</Label>
                    <Input
                        id="state"
                        name="state"
                        value={data.state}
                        onChange={(e) => setData('state', e.target.value)}
                        placeholder="e.g. California"
                        required
                    />
                    <InputError message={errors.state} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="city">City (Optional)</Label>
                    <Input
                        id="city"
                        name="city"
                        value={data.city}
                        onChange={(e) => setData('city', e.target.value)}
                        placeholder="e.g. Los Angeles"
                    />
                    <InputError message={errors.city} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        name="date_of_birth"
                        value={data.date_of_birth}
                        onChange={(e) => setData('date_of_birth', e.target.value)}
                        required
                    />
                    <InputError message={errors.date_of_birth} />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Saving...' : 'Complete Profile'}
                </Button>
            </form>
        </AuthLayout>
    );
}
