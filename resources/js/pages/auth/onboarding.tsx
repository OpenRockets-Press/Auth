import { Head, useForm } from '@inertiajs/react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
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

export default function Onboarding(props: Props) {
    const { countries } = props;

    const [active, setActive] = useState(0);
    const [countryCode, setCountryCode] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const form = useForm({
        country_code: '',
        state: '',
        city: '',
        date_of_birth: '',
    });

    const pages = [
        {
            id: 1,
            title: 'Select your country',
            content: (
                <motion.div className="grid gap-2" layoutId="1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline">
                                {countryCode || 'select country'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {countries.map((country, idx) => {
                                return (
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
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => {
                                setActive(active + 1);
                            }}
                        >
                            next
                        </Button>
                    </div>
                </motion.div>
            ),
        },
        {
            id: 2,
            title: 'select your adress',
            content: (
                <motion.div className="grid gap-2" layoutId="2">
                    <div>
                        <Label htmlFor="state">Enter your State/Province</Label>
                        <Input
                            value={province}
                            type="text"
                            placeholder="(max 255 symbols)"
                            onChange={(e) => {
                                const value = e.target.value;
                                setProvince(value);
                                form.setData('state', value);
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="city">Enter your City (optional)</Label>
                        <Input
                            value={city}
                            type="text"
                            placeholder="(max 255 symbols)"
                            onChange={(e) => {
                                const value = e.target.value;
                                setCity(value);
                                form.setData('city', value);
                            }}
                        />
                    </div>
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => {
                                setActive(active - 1);
                            }}
                        >
                            back
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => {
                                setActive(active + 1);
                            }}
                        >
                            next
                        </Button>
                    </div>
                </motion.div>
            ),
        },
        {
            id: 3,
            title: 'personal information',
            content: (
                <motion.div className="grid gap-2" layoutId="3">
                    <div>
                        <Label htmlFor="date_of_birth">
                            Enter your date of birth (YYYY-MM-DD)
                        </Label>
                        <Datepicker
                            asSingle
                            value={
                                date
                                    ? { startDate: date, endDate: date }
                                    : { startDate: null, endDate: null }
                            }
                            onChange={(value) => {
                                const selectedDate = value?.startDate ?? null;
                                setDate(selectedDate);
                                form.setData(
                                    'date_of_birth',
                                    selectedDate
                                        ? selectedDate
                                              .toISOString()
                                              .slice(0, 10)
                                        : '',
                                );
                            }}
                            displayFormat="YYYY-MM-DD"
                            inputClassName="w-full rounded-md border px-3 py-2"
                        />
                    </div>
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => {
                                setActive(active - 1);
                            }}
                        >
                            back
                        </Button>
                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            tabIndex={4}
                            disabled={form.processing}
                        >
                            {form.processing ? 'Saving...' : 'Finish'}
                        </Button>
                    </div>
                </motion.div>
            ),
        },
    ];

    return (
        <>
            <Head title="onboarding" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(window.location.pathname);
                }}
            >
                <div>
                    <AnimatePresence mode="wait">
                        <h2>{pages[active].title}</h2>
                        {pages[active].content}
                        <p>{`${pages[active].id} of ${pages.length}`}</p>
                    </AnimatePresence>
                </div>
            </form>
        </>
    );
}

Onboarding.layout = {
    title: 'Onboarding',
    description: 'lets get you started',
};
