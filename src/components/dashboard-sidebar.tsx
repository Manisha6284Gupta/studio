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
  User,
  Settings,
  LogOut,
  Building,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
    name: "John Doe",
    email: "john.doe@example.com",
    role: "citizen", // "citizen", "department", "control-room"
    avatar: "https://picsum.photos/seed/avatar/100/100"
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const navItems = getNavItems(user.role);

  return (
    <Sidebar>
      <SidebarHeader className="h-20 justify-center">
        <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
                CivicConnect
            </h1>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/dashboard/citizen' && pathname.startsWith(item.href))}
              tooltip={item.name}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
         </div>
         <Button variant="ghost" className="justify-start mt-2 w-full text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
         </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
