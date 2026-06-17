import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface App {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    owner_name: string;
    owner_email: string;
    homepage_url: string;
}

interface PaginatedData {
    data: App[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    apps: PaginatedData;
}

export default function AdminApps({ apps }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Pending Review</Badge>;
            case 'suspended':
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="OAuth Apps Management" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">OAuth Apps</h1>
                    <p className="text-muted-foreground mt-1">
                        Review, approve, and suspend third-party developer applications.
                    </p>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">App Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Developer</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {apps.data.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td colSpan={5} className="p-4 align-middle h-24 text-center">
                                        No OAuth applications registered.
                                    </td>
                                </tr>
                            ) : (
                                apps.data.map((app) => (
                                    <tr key={app.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{app.name}</div>
                                            {app.homepage_url && (
                                                <a href={app.homepage_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                                    Website <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="font-medium text-sm">{app.owner_name}</div>
                                            <div className="text-xs text-muted-foreground">{app.owner_email}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(app.id)}>
                                                        Copy App ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    
                                                    {app.status === 'pending' && (
                                                        <DropdownMenuItem className="text-green-600 focus:text-green-600 focus:bg-green-50 gap-2">
                                                            <CheckCircle2 className="h-4 w-4" /> Approve App
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {app.status === 'active' && (
                                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2">
                                                            <AlertTriangle className="h-4 w-4" /> Suspend App
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {app.status === 'suspended' && (
                                                        <DropdownMenuItem className="gap-2">
                                                            <CheckCircle2 className="h-4 w-4" /> Reinstate App
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2">
                                                        <XCircle className="h-4 w-4" /> Delete App
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
