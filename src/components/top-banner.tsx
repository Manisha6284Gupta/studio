"use client";

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sun, Moon, ChevronDown, Globe } from 'lucide-react';

export function TopBanner() {
    return (
        <div className="bg-sidebar text-sidebar-foreground hidden md:block">
            <div className="container mx-auto flex h-10 items-center justify-between text-xs">
                <span className="font-medium">An official website of the Government of India</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground hover:bg-white/20" aria-label="Toggle theme">
                            <Sun className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                        <button className="p-1 leading-none hover:underline" title="Decrease font size">A-</button>
                        <button className="p-1 leading-none hover:underline" title="Reset font size">A</button>
                        <button className="p-1 leading-none hover:underline" title="Increase font size">A+</button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-1 text-xs text-sidebar-foreground hover:bg-white/20 font-medium">
                                <Globe className="mr-1.5 h-4 w-4"/>
                                English
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>English</DropdownMenuItem>
                            <DropdownMenuItem>हिन्दी</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
