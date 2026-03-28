import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
