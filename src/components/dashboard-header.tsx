"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon, Building, Shield, Loader2 } from "lucide-react";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const getRoleFromPathname = (pathname: string) => {
    if (pathname.startsWith('/dashboard/department')) return 'department';
    if (pathname.startsWith('/dashboard/control-room')) return 'control-room';
    return 'citizen';
}

export function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const role = getRoleFromPathname(pathname);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        const collection = role === 'citizen' ? 'citizens' : 'staff';
        return doc(firestore, collection, user.uid);
    }, [firestore, user, role]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<{fullName: string, email: string, avatar?: string}>(userProfileRef);

    const handleLogout = () => {
        signOut(auth).then(() => {
            toast({ title: "Logged out", description: "You have been successfully logged out." });
            router.push('/');
        });
    }
    
    const isLoading = isUserLoading || (user && isProfileLoading);

    const displayName = userProfile?.fullName || user?.email || "User";
    const displayEmail = userProfile?.email || user?.email || "";
    const displayAvatar = userProfile?.avatar;

    const fallbackInitial = displayName ? displayName.charAt(0).toUpperCase() : <UserIcon />;

    let fallbackIcon = <UserIcon />;
    if (role === 'department') fallbackIcon = <Building />;
    if (role === 'control-room') fallbackIcon = <Shield />;


    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden font-semibold md:block">Dashboard</div>
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                       {isLoading ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                       ) : (
                         <Avatar className="h-8 w-8">
                            {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
                            <AvatarFallback>{fallbackInitial}</AvatarFallback>
                        </Avatar>
                       )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    {!isLoading && user && (
                        <>
                            <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                {displayEmail}
                                </p>
                            </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
