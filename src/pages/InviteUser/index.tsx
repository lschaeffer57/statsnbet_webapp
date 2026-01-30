import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Eye,
  PauseCircle,
  PlayCircle,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { userApi } from '@/api/userApi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { RoutesEnum } from '@/enums/router';
import { jsonApiInstance } from '@/lib/apiInstance';

// Define the User Shape based on your DB schema
interface AdminUser {
  _id: string;
  clerk_id: string;
  username: string;
  email: string;
  bankroll_current: number | null;
  bankroll_reference: number;
  subscription: {
    active: boolean;
    end: string;
  };
}

export const InviteUser = () => {
  const { t } = useTranslation('common');
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- TAB 1: MANAGE USERS STATE ---
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FETCH REAL USERS
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Assuming a new endpoint /admin/users exists or reusing get-users with admin privileges
      return jsonApiInstance<AdminUser[]>('admin/users');
    },
    // Fallback to empty array if endpoint fails for now (so UI doesn't crash)
    initialData: [],
  });

  // 2. TOGGLE SUBSCRIPTION MUTATION
  const toggleSubMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: 'pause' | 'resume';
    }) => {
      return jsonApiInstance('admin/subscription-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Subscription ${variables.action === 'pause' ? 'paused' : 'resumed'} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to update subscription status');
    },
  });

  // --- TAB 2: INVITE FORM STATE ---
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [duration, setDuration] = useState('30');
  const [customDays, setCustomDays] = useState('');

  const inviteMutation = useMutation({
    mutationFn: userApi.inviteUser,
    onSuccess: () => {
      toast.success(t('invite.form.successMessage'));
      setEmail('');
    },
    onError: () => {
      toast.error(t('invite.form.errorMessage'));
    },
  });

  // --- HANDLERS ---

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return toast.error(t('invite.form.errorMessage'));

    const finalDuration =
      duration === 'custom' ? parseInt(customDays) : parseInt(duration);

    inviteMutation.mutate({
      email,
      userRole: role,
      subscriptionDuration: finalDuration,
      token,
    });
  };

  const handleGodMode = (userId: string) => {
    navigate(`${RoutesEnum.DASHBOARD}?userId=${userId}`);
  };

  const handleToggleSubscription = (user: AdminUser) => {
    const action = user.subscription.active ? 'pause' : 'resume';
    toggleSubMutation.mutate({ userId: user.clerk_id, action });
  };

  // Filter users based on search
  const filteredUsers = users?.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative z-20">
      <header className="flex items-center gap-3 border-b px-8 pt-6 pb-8">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
          <Users className="text-primary size-5" />
        </div>
        <div>
          <h1 className="text-foreground text-xl leading-none font-medium">
            Admin Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your clients and invitations
          </p>
        </div>
      </header>

      <div className="px-7 py-6">
        <Tabs defaultValue="manage" className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="manage" className="gap-2">
              <Users className="size-4" /> Manage Users
            </TabsTrigger>
            <TabsTrigger value="invite" className="gap-2">
              <UserPlus className="size-4" /> Invite New
            </TabsTrigger>
          </TabsList>

          {/* --- TAB 1: MANAGE USERS --- */}
          <TabsContent value="manage" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-[300px]">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">User Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bankroll</TableHead>
                    <TableHead>Subscription End</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    // Skeleton Loading
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="size-8 rounded-md" />
                            <Skeleton className="size-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <p className="text-muted-foreground text-sm">
                          No users found.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((u) => (
                      <TableRow
                        key={u._id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {u.username}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {u.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              u.subscription.active
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                                : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500'
                            }`}
                          >
                            <span
                              className={`mr-1.5 size-1.5 rounded-full ${u.subscription.active ? 'animate-pulse bg-emerald-500' : 'bg-yellow-500'}`}
                            />
                            {u.subscription.active ? 'Active' : 'Paused'}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {u.bankroll_current
                            ? `${u.bankroll_current}€`
                            : `${u.bankroll_reference || 0}€`}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.subscription.end
                            ? format(
                                new Date(u.subscription.end),
                                'dd MMM yyyy',
                              )
                            : '—'}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="size-8 p-0"
                              onClick={() => handleToggleSubscription(u)}
                              disabled={toggleSubMutation.isPending}
                              title={
                                u.subscription.active
                                  ? 'Pause Subscription'
                                  : 'Resume Subscription'
                              }
                            >
                              {toggleSubMutation.isPending ? (
                                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : u.subscription.active ? (
                                <PauseCircle className="size-4 text-yellow-500" />
                              ) : (
                                <PlayCircle className="size-4 text-emerald-500" />
                              )}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 size-8 border p-0"
                              onClick={() => handleGodMode(u.clerk_id)}
                              title="View Dashboard (God Mode)"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* --- TAB 2: INVITE FORM --- */}
          <TabsContent value="invite">
            <Card className="max-w-2xl p-8">
              <div className="mb-8 space-y-1">
                <h2 className="text-foreground text-lg font-medium">
                  {t('invite.title')}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t('invite.description')}
                </p>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('invite.form.emailLabel')}</Label>
                    <Input
                      placeholder={t('invite.form.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('invite.form.roleLabel')}</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t('invite.form.rolePlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          {t('invite.role.user')}
                        </SelectItem>
                        <SelectItem value="admin">
                          {t('invite.role.admin')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('invite.form.subscriptionLabel')}</Label>
                  <Select
                    value={duration}
                    onValueChange={(value) => {
                      setDuration(value);
                      if (value !== 'custom') setCustomDays('');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t('invite.form.subscriptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">
                        {t('invite.subscription.30days')}
                      </SelectItem>
                      <SelectItem value="60">
                        {t('invite.subscription.60days')}
                      </SelectItem>
                      <SelectItem value="90">
                        {t('invite.subscription.90days')}
                      </SelectItem>
                      <SelectItem value="120">
                        {t('invite.subscription.120days')}
                      </SelectItem>
                      <SelectItem value="180">
                        {t('invite.subscription.6months')}
                      </SelectItem>
                      <SelectItem value="365">
                        {t('invite.subscription.1year')}
                      </SelectItem>
                      <SelectItem value="custom">
                        {t('invite.subscription.custom')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {duration === 'custom' && (
                    <div className="space-y-2">
                      <Label>{t('invite.form.customDaysLabel')}</Label>
                      <Input
                        type="number"
                        placeholder={t('invite.form.customDaysPlaceholder')}
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        min="1"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      !email ||
                      (duration === 'custom' && !customDays) ||
                      inviteMutation.isPending
                    }
                  >
                    {inviteMutation.isPending
                      ? 'Sending...'
                      : t('invite.form.sendButton')}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
