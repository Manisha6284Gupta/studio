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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState, useEffect } from "react";

const AshokaChakraLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-8 w-8 text-primary"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="none"
    />
    <path
      d="M12 4a.999.999 0 00-1 1v2.58c-1.3.52-2.37 1.4-3.08 2.59l-2.16-.72a1 1 0 10-.72 1.86l2.16.72C7.37 13.6 8.44 14.48 9.74 15L7.58 15.72a1 1 0 10.72 1.86l2.16-.72c1.09.71 2.37 1.14 3.74 1.14s2.65-.43 3.74-1.14l2.16.72a1 1 0 10.72-1.86L14.26 15c1.3-.52 2.37-1.4 3.08-2.59l2.16.72a1 1 0 10.72-1.86l-2.16-.72C17.27 8.7 16.2 7.82 14.9 7.29V5a1 1 0 00-1-1zm0 2.5c2.49 0 4.5 2.01 4.5 4.5S14.49 15.5 12 15.5 7.5 13.49 7.5 11 9.51 6.5 12 6.5z"
      fill="hsl(var(--sidebar-foreground))"
    />
    <path
      d="M12 10a1 1 0 110 2 1 1 0 010-2zM12 6.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 14.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM15.57 7.72a.5.5 0 01.63.31l.5 1.73a.5.5 0 11-.94.27l-.5-1.73a.5.5 0 01.31-.63zM7.22 13.04a.5.5 0 01.63.31l.5 1.73a.5.5 0 01-.94.27l-.5-1.73a.5.5 0 01.31-.63zM8.43 7.72a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM14.36 13.04a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM6.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM15.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM9.64 14.36a.5.5 0 01.63-.31l1.73.5a.5.5 0 01.27.94l-1.73.5a.5.5 0 01-.63-.31.5.5 0 01.31-.63zM13.04 7.22a.5.5 0 01.63-.31l1.73.5a.5.5 0 11-.27.94l-1.73-.5a.5.5 0 01-.31-.63zM8.96 14.36a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63zM14.36 8.96a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63z"
      fill="hsl(var(--sidebar-foreground))"
    />
  </svg>
);


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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [role, setRole] = useState<'citizen' | 'department' | 'control-room'>(() => getRoleFromPathname(pathname));

  const staffProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'staff', user.uid);
  }, [firestore, user]);

  const { data: staffProfile, isLoading: isStaffLoading } = useDoc<{ role: 'Department Staff' | 'Control Room Staff' }>(staffProfileRef);

  useEffect(() => {
    // This effect ensures the role is updated based on profile data, which is more reliable than the URL path.
    if (!isUserLoading && !isStaffLoading) {
      if (staffProfile) {
        if (staffProfile.role === 'Control Room Staff') {
          setRole('control-room');
        } else {
          setRole('department');
        }
      } else {
        // If there's no staff profile, they must be a citizen.
        setRole('citizen');
      }
    }
  }, [user, staffProfile, isUserLoading, isStaffLoading]);


  const navItems = getNavItems(role);
  const baseDashboardPath = getBaseDashboardPath(role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-20 justify-center">
        <Link href="/" className="flex items-center gap-3">
            <AshokaChakraLogo />
            <div className="group-data-[collapsible=icon]:hidden">
                <h1 className="block font-headline text-2xl font-bold text-primary-foreground leading-tight">
                    CivicConnect
                </h1>
                <p className="block text-sm font-medium text-sidebar-foreground/80 leading-tight">
                    सत्यमेव जयते
                </p>
            </div>
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
