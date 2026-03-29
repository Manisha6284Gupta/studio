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
];

const controlRoomNav = [
    { name: "Overview", href: "/dashboard/control-room", icon: LayoutDashboard },
    { name: "Departments", href: "/dashboard/control-room/departments", icon: Building },
]

const getRoleFromPathname = (pathname: string) => {
    if (pathname.startsWith('/dashboard/department')) {
        return 'department';
    }
    if (pathname.startsWith('/dashboard/control-room')) {
        return 'control-room';
    }
    return 'citizen';
}

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
  const role = getRoleFromPathname(pathname);
  const navItems = getNavItems(role);
  const baseDashboardPath = getBaseDashboardPath(role);

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
