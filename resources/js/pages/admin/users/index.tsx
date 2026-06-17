import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, Shield, UserX, LogIn } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Profile {
    id: number;
    onboarding_status: string;
    country_code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified_at: string | null;
    profile: Profile | null;
}

interface PaginatedData {
    data: User[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    users: PaginatedData;
    filters: { search?: string };
}

export default function AdminUsers({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage platform users, view their profiles, and handle moderation.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex max-w-sm w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..." 
                            className="pl-9"
                        />
                    </form>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {users.data.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td colSpan={5} className="p-4 align-middle h-24 text-center">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{user.name}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-2">
                                                {user.email_verified_at ? (
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Unverified</Badge>
                                                )}
                                                
                                                {user.profile?.onboarding_status === 'completed' && (
                                                    <Badge variant="secondary">Onboarded</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
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
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id.toString())}>
                                                        Copy User ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" /> View Audit Logs
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2">
                                                        <LogIn className="h-4 w-4 text-muted-foreground" /> Impersonate User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2">
                                                        <UserX className="h-4 w-4" /> Suspend Account
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
