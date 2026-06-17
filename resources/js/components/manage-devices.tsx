import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Laptop } from 'lucide-react';

export default function ManageDevices() {
    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Trusted Devices"
                description="Devices that bypass two-factor authentication."
            />

            <Card>
                <CardContent className="p-6">
                    <div className="max-w-xl text-sm text-muted-foreground mb-4">
                        When you sign in on a trusted device, you won't be asked for a two-factor authentication code. You should only trust devices that you own and are securely locked.
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-muted-foreground">
                            <Laptop className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">Windows - Chrome (This device)</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <ShieldCheck className="w-3 h-3 text-green-500" /> Trusted today
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            Remove
                        </Button>
                    </div>

                    <div className="flex items-center">
                        <Button variant="secondary">Trust Current Device</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
