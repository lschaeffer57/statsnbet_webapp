import {
  AccountIcon,
  DashboardIcon,
  NotificationIcon,
  PublicDashboardIcon,
  TrainingIcon,
} from '@/assets/icons';

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

const items = [
  {
    title: 'Tableau de bord',
    url: '#',
    icon: DashboardIcon,
  },
  {
    title: 'Espace de formation',
    url: '#',
    icon: TrainingIcon,
  },
  {
    title: 'Dashboard publique',
    url: '#',
    icon: PublicDashboardIcon,
  },
  {
    title: 'Paramètres du compte',
    url: '#',
    icon: AccountIcon,
  },
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center justify-between pt-8">
          <a href="/">
            <img src="/images/logo.png" alt="logo" className="w-[128px]" />
          </a>
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
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="group">
                      <item.icon className="group-hover:text-foreground text-muted-foreground group-data-[active=true]:text-foreground" />
                      <span>{item.title}</span>
                    </a>
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
