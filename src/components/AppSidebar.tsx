import { useClerk, useUser } from '@clerk/clerk-react';
import { LogOut as LogOutIcon, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';

import {
  AccountIcon,
  DashboardIcon,
  PublicDashboardIcon,
  TrainingIcon,
} from '@/assets/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { RoutesEnum } from '@/enums/router';

import { Separator } from './ui/Separator';
import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  SidebarGroupContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
} from './ui/Sidebar';

const AppSidebar = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const firstInitial = firstName?.[0]?.toUpperCase() || '';
    const lastInitial = lastName?.[0]?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate(RoutesEnum.LOGIN);
    }
  };

  const isAdmin = user?.publicMetadata?.role === 'admin';

  console.warn(user?.publicMetadata.role)

  const items = [
    {
      title: t('sidebar.dashboard'),
      url: RoutesEnum.DASHBOARD,
      icon: DashboardIcon,
    },
    {
      title: t('sidebar.training'),
      url: RoutesEnum.TRAINING,
      icon: TrainingIcon,
    },
    {
      title: t('sidebar.publicDashboard'),
      url: RoutesEnum.PUBLIC_DASHBOARD,
      icon: PublicDashboardIcon,
    },
    ...(isAdmin ? [{
      title: t('sidebar.invite'),
      url: RoutesEnum.INVITE,
      icon: UserPlus,
    }] : []),
  ];
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="pt-8">
          <Link to={RoutesEnum.DASHBOARD}>
            <img src="/images/logo.png" alt="logo" className="w-[128px]" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Separator className="mt-8" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === location.pathname}
                  >
                    <Link to={item.url} className="group">
                      <item.icon className="group-hover:text-foreground text-muted-foreground group-data-[active=true]:text-foreground" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-auto">
              {user?.hasImage && user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
              )}
              <div className="max-w-[65%]">
                <p className="text-foreground truncate text-sm font-medium">
                  {user?.username}
                </p>
                <p className="text-foreground/50 truncate text-xs">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] gap-2" sideOffset={8} align="start">
            <div className="space-y-[2px]">
              <DropdownMenuItem
                onClick={() => navigate(RoutesEnum.SETTINGS)}
                className="text-sm text-custom-warm-grey-700"
              >
                <AccountIcon width={20} height={20} className="text-custom-warm-grey-400" />
                {t('sidebar.accountSettings')}
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={handleLogout} className="text-sm text-custom-warm-grey-700">
                <LogOutIcon width={20} height={20} className="text-custom-warm-grey-400" /> Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
