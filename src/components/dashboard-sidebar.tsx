"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Building,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const citizenNav = [
  { name: "Dashboard", href: "/dashboard/citizen", icon: LayoutDashboard },
  { name: "My Complaints", href: "/dashboard/citizen/complaints", icon: FileText },
  { name: "New Complaint", href: "/dashboard/citizen/complaints/new", icon: PlusCircle },
];

const departmentNav = [
  { name: "Dashboard", href: "/dashboard/department", icon: LayoutDashboard },
  { name: "Assigned Complaints", href: "/dashboard/department/complaints", icon: Building },
];

const controlRoomNav = [
    { name: "Overview", href: "/dashboard/control-room", icon: LayoutDashboard },
    { name: "All Complaints", href: "/dashboard/control-room/complaints", icon: Shield },
    { name: "Departments", href: "/dashboard/control-room/departments", icon: Building },
]

// In a real app, this would come from session
const user = {
    role: "citizen", // "citizen", "department", "control-room"
};

const getNavItems = (role: string) => {
    switch(role) {
        case "department":
            return departmentNav;
        case "control-room":
            return controlRoomNav;
        case "citizen":
        default:
            return citizenNav;
    }
}

function getBaseDashboardPath(role: string) {
    switch(role) {
        case "department":
            return "/dashboard/department";
        case "control-room":
            return "/dashboard/control-room";
        case "citizen":
        default:
            return "/dashboard/citizen";
    }
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const navItems = getNavItems(user.role);
  const baseDashboardPath = getBaseDashboardPath(user.role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-20 justify-center">
        <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
                CivicConnect
            </h1>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = item.href === baseDashboardPath ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>

      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/dashboard/settings'}>
                    <Link href="/dashboard/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
