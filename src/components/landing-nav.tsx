"use client";

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const AshokaChakraLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-12 w-12 text-primary"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="none"
    />
    <path
      d="M12 4a.999.999 0 00-1 1v2.58c-1.3.52-2.37 1.4-3.08 2.59l-2.16-.72a1 1 0 10-.72 1.86l2.16.72C7.37 13.6 8.44 14.48 9.74 15L7.58 15.72a1 1 0 10.72 1.86l2.16-.72c1.09.71 2.37 1.14 3.74 1.14s2.65-.43 3.74-1.14l2.16.72a1 1 0 10.72-1.86L14.26 15c1.3-.52 2.37-1.4 3.08-2.59l2.16.72a1 1 0 10.72-1.86l-2.16-.72C17.27 8.7 16.2 7.82 14.9 7.29V5a1 1 0 00-1-1zm0 2.5c2.49 0 4.5 2.01 4.5 4.5S14.49 15.5 12 15.5 7.5 13.49 7.5 11 9.51 6.5 12 6.5z"
    />
    <path
      d="M12 10a1 1 0 110 2 1 1 0 010-2zM12 6.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 14.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM15.57 7.72a.5.5 0 01.63.31l.5 1.73a.5.5 0 11-.94.27l-.5-1.73a.5.5 0 01.31-.63zM7.22 13.04a.5.5 0 01.63.31l.5 1.73a.5.5 0 01-.94.27l-.5-1.73a.5.5 0 01.31-.63zM8.43 7.72a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM14.36 13.04a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM6.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM15.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM9.64 14.36a.5.5 0 01.63-.31l1.73.5a.5.5 0 01.27.94l-1.73.5a.5.5 0 01-.63-.31.5.5 0 01.31-.63zM13.04 7.22a.5.5 0 01.63-.31l1.73.5a.5.5 0 11-.27.94l-1.73-.5a.5.5 0 01-.31-.63zM8.96 14.36a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63zM14.36 8.96a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63z"
      fill="currentColor"
    />
  </svg>
);

const navLinks = [
    { href: "#features", label: "Services" },
    { href: "#", label: "Departments" },
    { href: "/register/citizen", label: "Grievance" },
    { href: "/dashboard/citizen/complaints", label: "Track Status" },
    { href: "/dashboard/citizen", label: "User Dashboard" },
];


export function LandingNav() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background border-b shadow-sm">
        <div className="container flex h-20 items-center">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                    <AshokaChakraLogo />
                    <div>
                        <span className="block font-headline text-2xl font-bold text-foreground leading-tight">
                        JanSevaConnect
                        </span>
                        <span className="block text-sm font-medium text-muted-foreground leading-tight">
                        सत्यमेव जयते
                        </span>
                    </div>
                </Link>
            </div>
            
            {/* Desktop Nav */}
            <nav className="ml-12 hidden lg:flex gap-1 sm:gap-2 items-center">
              {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={cn(buttonVariants({ variant: "ghost" }), "text-muted-foreground font-medium")}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-4">
                 <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search services..." className="pl-10 w-48" />
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        Login <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push('/login/citizen')}>
                        Citizen Login
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/login/organization')}>
                        Organization Login
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                        Register <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push('/register/citizen')}>
                        Citizen Registration
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/register/staff')}>
                        Staff Registration
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Nav */}
                <div className="flex md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/20 hover:text-foreground">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        {/* Mobile menu content would be redesigned here */}
                    </SheetContent>
                </Sheet>
                </div>
            </div>
        </div>
    </nav>
  );
}
