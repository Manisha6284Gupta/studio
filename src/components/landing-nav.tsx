"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function LandingNav() {
  const router = useRouter();

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background border-b">
      <Link href="/" className="flex items-center justify-center">
        <Shield className="h-6 w-6 text-primary" />
        <span className="ml-2 font-headline text-xl font-semibold">CivicConnect</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="#features"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Features
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              Login <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/login/citizen')}>
              Citizen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/login/organization')}>
              Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
