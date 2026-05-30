import { KeyRound } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Api/Social/SocialController';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = {
    provider?: string;
    label?: string;
    separator?: string;
    image?: string;
};

export default function SocialLogin({
    provider,
    label,
    separator,
    image,
}: Props) {
    if (!provider) {
        return null;
    }

    return (
        <>
            <div className="grid gap-2">
                <Button asChild variant="outline" className="w-full">
                    <a href={redirect(provider).url}>
                        {image && <img src={image} alt="social login image" className='icon'/>}
                        {label ?? `Sign in with ${provider}`}
                    </a>
                </Button>
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {separator ?? 'Or continue with email'}
                    </span>
                </div>
            </div>
        </>
    );
}
