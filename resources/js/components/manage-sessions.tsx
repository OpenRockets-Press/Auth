import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Laptop, Smartphone, Globe } from 'lucide-react';

interface Session {
    id: string;
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
    agent: {
        is_desktop: boolean;
        platform: string;
        browser: string;
    };
}

interface Props {
    sessions?: Session[];
}

export default function ManageSessions({ sessions = [] }: Props) {
    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Active Sessions"
                description="Manage and log out your active sessions on other browsers and devices."
            />

            <Card>
                <CardContent className="p-6">
                    <div className="max-w-xl text-sm text-muted-foreground mb-4">
                        If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive.
                    </div>

                    {sessions.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {sessions.map((session, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="text-muted-foreground">
                                        {session.agent.is_desktop ? (
                                            <Laptop className="h-8 w-8" />
                                        ) : (
                                            <Smartphone className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {session.agent.platform} - {session.agent.browser}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {session.ip_address}, {session.is_current_device ? <span className="text-green-500 font-medium">This device</span> : `Last active ${session.last_active}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-muted-foreground">
                                <Globe className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">Windows - Chrome</div>
                                <div className="text-xs text-muted-foreground">
                                    127.0.0.1, <span className="text-green-500 font-medium">This device</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center">
                        <Button variant="secondary">Log Out Other Browser Sessions</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
