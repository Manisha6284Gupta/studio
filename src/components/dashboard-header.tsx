"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

const citizenUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://picsum.photos/seed/avatar/100/100"
};

const departmentUser = {
    name: "Department User",
    email: "public.works@example.gov",
    avatar: ""
};

const controlRoomUser = {
    name: "Control Room Staff",
    email: "control.room@example.gov",
    avatar: ""
};

const getRoleFromPathname = (pathname: string) => {
    if (pathname.startsWith('/dashboard/department')) return 'department';
    if (pathname.startsWith('/dashboard/control-room')) return 'control-room';
    return 'citizen';
}

const getUserForRole = (role: string) => {
    switch (role) {
        case 'department': return departmentUser;
        case 'control-room': return controlRoomUser;
        default: return citizenUser;
    }
}

export function DashboardHeader() {
    const pathname = usePathname();
    const role = getRoleFromPathname(pathname);
    const user = getUserForRole(role);

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden font-semibold md:block">Dashboard</div>
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
