import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
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

type Step = {
    id: number;
    title: string;
    content: ReactNode;
};

export default function Onboarding(props: Props) {
    const { countries = [] } = props;

    const [active, setActive] = useState(0);
    const [countryCode, setCountryCode] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    const form = useForm({
        country_code: '',
        state: '',
        city: '',
        date_of_birth: '',
    });

    const pages: Step[] = [
        {
            id: 1,
            title: 'Select your country',
            content: (
                <div className="grid gap-4">
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
                                    <span className="text-muted-foreground">
                                        ▾
                                    </span>
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
                                            const value = String(country.code ?? '');
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

                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setActive(active + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 2,
            title: 'Select your address',
            content: (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                            id="state"
                            value={province}
                            type="text"
                            placeholder="Enter your state or province"
                            onChange={(e) => {
                                const value = e.target.value;
                                setProvince(value);
                                form.setData('state', value);
                            }}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="city">
                            City <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            id="city"
                            value={city}
                            type="text"
                            placeholder="Enter your city"
                            onChange={(e) => {
                                const value = e.target.value;
                                setCity(value);
                                form.setData('city', value);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" onClick={() => setActive(active - 1)}>
                            Back
                        </Button>
                        <Button type="button" onClick={() => setActive(active + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 3,
            title: 'Personal information',
            content: (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date_of_birth">Date of birth</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                                const value = e.target.value;
                                setDateOfBirth(value);
                                form.setData('date_of_birth', value);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" onClick={() => setActive(active - 1)}>
                            Back
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Finish'}
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    const activeStep = pages[active];

    return (
        <>
            <Head title="onboarding" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(window.location.pathname);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, x: 12, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="space-y-6"
                    >
                        {activeStep.content}
                    </motion.div>
                </AnimatePresence>

                <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Step {activeStep.id} of {pages.length}
                </p>
            </form>
        </>
    );
}

Onboarding.layout = {
    title: 'Onboarding',
    description: 'lets get you started',
};
