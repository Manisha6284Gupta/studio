import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardSidebar />
      <SidebarRail className="hidden md:flex" />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
