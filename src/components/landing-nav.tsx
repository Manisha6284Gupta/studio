"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
];

const AshokaChakraLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-7 w-7 text-primary"
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


export function LandingNav() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  const handleMobileLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
        setTimeout(() => {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 300); // delay to allow sheet to close
    } else {
      router.push(href);
    }
  };

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-20 flex items-center transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-background/80 backdrop-blur-sm border-b border-transparent"
    )}>
      <Link href="/" className="flex items-center justify-start gap-3">
        <AshokaChakraLogo />
        <div>
            <span className="block font-headline text-2xl font-semibold text-foreground leading-tight">
              CivicConnect
            </span>
            <span className="block text-sm font-medium text-muted-foreground leading-tight">
              सत्यमेव जयते
            </span>
        </div>
      </Link>
      
      {/* Desktop Nav */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        {navLinks.map((link) => (
             <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline cursor-pointer"
            >
                {link.label}
            </a>
        ))}
       
        {isClient ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
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
          <Button disabled>
            Login <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </nav>

      {/* Mobile Nav */}
      <div className="ml-auto md:hidden">
        {isClient ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/20 hover:text-foreground">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                  <div className="flex flex-col gap-6 pt-16">
                       <Link href="/" className="flex items-center justify-center mb-4" onClick={() => setMobileMenuOpen(false)}>
                          <AshokaChakraLogo />
                          <span className="ml-2 font-headline text-2xl font-semibold text-foreground">CivicConnect</span>
                      </Link>
                      {navLinks.map((link) => (
                          <button key={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-lg font-medium text-center">
                              {link.label}
                          </button>
                      ))}
                      <div className="mt-6 flex flex-col gap-4 px-4">
                           <Button onClick={() => handleMobileLinkClick('/login/citizen')} className="w-full">
                              Citizen Login
                          </Button>
                          <Button onClick={() => handleMobileLinkClick('/login/organization')} variant="outline" className="w-full">
                              Organization Login
                          </Button>
                      </div>
                  </div>
              </SheetContent>
          </Sheet>
        ) : (
             <Button variant="ghost" size="icon" disabled className="text-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>
        )}
      </div>
    </header>
  );
}
