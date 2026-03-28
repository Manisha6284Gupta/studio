"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
];

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
        scrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent border-b-transparent"
    )}>
      <Link href="/" className="flex items-center justify-center">
        <Shield className="h-7 w-7 text-primary" />
        <span className={cn(
            "ml-2 font-headline text-2xl font-semibold",
            scrolled ? "text-foreground" : "text-primary-foreground"
        )}>CivicConnect</span>
      </Link>
      
      {/* Desktop Nav */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        {navLinks.map((link) => (
             <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={cn(
                    "text-sm font-medium underline-offset-4 hover:underline cursor-pointer",
                    scrolled ? "text-foreground" : "text-primary-foreground"
                )}
            >
                {link.label}
            </a>
        ))}
       
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

      {/* Mobile Nav */}
      <div className="ml-auto md:hidden">
        {isClient ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(
                      "hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                      scrolled ? "text-foreground hover:text-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-white/20"
                      )}>
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                  <div className="flex flex-col gap-6 pt-16">
                       <Link href="/" className="flex items-center justify-center mb-4" onClick={() => setMobileMenuOpen(false)}>
                          <Shield className="h-7 w-7 text-primary" />
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
             <Button variant="ghost" size="icon" disabled className={cn(
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                scrolled ? "text-foreground" : "text-primary-foreground"
             )}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>
        )}
      </div>
    </header>
  );
}
