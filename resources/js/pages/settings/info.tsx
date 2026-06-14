import { Form, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    CountryModel,
    UserProfileModel,
} from 'resources/js/types/generated';

type Props = {
    countries: CountryModel[];
    onboarding_status: string;
    required_fields: string[];
    optional_fields: string[];
    profile?: UserProfileModel;
};

export default function Info(props: Props) {
    const { countries = [] } = props;
    const [countryCode, setCountryCode] = useState('');

    const form = useForm({
        country_code: '',
        state: '',
        city: '',
        date_of_birth: '',
    });

    return (
        <>
            <Head />
            <Form>
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between"
                            >
                                <span className="truncate">
                                    {countryCode || 'Select country'}
                                </span>
                                <span className="text-muted-foreground">▾</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="start"
                            sideOffset={8}
                            className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                        >
                            {countries.map((country, idx) => (
                                <DropdownMenuItem
                                    key={String(country.code ?? idx)}
                                    onSelect={() => {
                                        const value = String(
                                            country.code ?? '',
                                        );
                                        setCountryCode(value);
                                        form.setData('country_code', value);
                                    }}
                                >
                                    {String(country.name)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                        id="state"
                        type="text"
                        placeholder="Enter your state or province"
                        onChange={(e) => {
                            const value = e.target.value;
                            form.setData('state', value);
                        }}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="city">
                        City{' '}
                        <span className="text-muted-foreground">
                            (optional)
                        </span>
                    </Label>
                    <Input
                        id="city"
                        type="text"
                        placeholder="Enter your city"
                        onChange={(e) => {
                            const value = e.target.value;
                            form.setData('city', value);
                        }}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="date_of_birth">Date of birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        onChange={(e) => {
                            const value = e.target.value;
                            form.setData('date_of_birth', value);
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Saving...' : 'Finish'}
                    </Button>
                </div>
            </Form>
        </>
    );
}
