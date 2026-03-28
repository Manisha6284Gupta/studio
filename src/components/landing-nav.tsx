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
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-20 flex items-center transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent border-b-transparent"
    )}>
      <Link href="/" className="flex items-center justify-center">
        <Shield className="h-7 w-7 text-primary" />
        <span className={cn(
            "ml-2 font-headline text-2xl font-semibold",
            scrolled ? "text-foreground" : "text-primary-foreground"
        )}>CivicConnect</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="#features"
          className={cn(
              "text-sm font-medium underline-offset-4 hover:underline",
              scrolled ? "text-foreground" : "text-primary-foreground"
          )}
        >
          Features
        </Link>
        {isClient ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={scrolled ? "default" : "secondary"}>
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
        ) : (
          <Button variant={scrolled ? "default" : "secondary"} disabled>
            Login <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </nav>
    </header>
  );
}
