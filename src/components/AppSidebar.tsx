import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import {
  AccountIcon,
  DashboardIcon,
  NotificationIcon,
  PublicDashboardIcon,
  TrainingIcon,
} from '@/assets/icons';
import { RoutesEnum } from '@/enums/router';

import { Button } from './ui/Button';
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
    {
      title: t('sidebar.accountSettings'),
      url: RoutesEnum.SETTINGS,
      icon: AccountIcon,
    },
  ];
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center justify-between pt-8">
          <Link to={RoutesEnum.DASHBOARD}>
            <img src="/images/logo.png" alt="logo" className="w-[128px]" />
          </Link>
          <Button variant="secondary" size="icon">
            <NotificationIcon className="size-[14px]" />
          </Button>
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
        <SidebarMenuButton className="h-auto">
          <img
            src="/images/user.png"
            alt="avatar"
            className="size-9 rounded-full"
          />
          <div className="max-w-[65%]">
            <p className="text-foreground truncate text-sm font-medium">
              Théo D.
            </p>
            <p className="text-foreground/50 truncate text-xs">
              theodrcn@pulsor.agasdasd
            </p>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
