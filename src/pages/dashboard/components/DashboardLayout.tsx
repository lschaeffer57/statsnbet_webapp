import { Outlet } from 'react-router';

import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/Sidebar';

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative py-3 pr-3">
        <div className="border-border relative z-10 w-full flex-1 rounded-3xl border py-10">
          <div
            className="absolute inset-0 rounded-3xl bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url('/images/dashboard-bg.png')" }}
          />
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
