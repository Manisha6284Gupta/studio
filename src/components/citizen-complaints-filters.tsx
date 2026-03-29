"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import * as React from "react"
import type { ComplaintCategory, ComplaintStatus } from "@/lib/types"

interface CitizenComplaintsFiltersProps {
    onFilterChange: (filters: { applicationNumber?: string; category?: ComplaintCategory | 'all'; status?: ComplaintStatus | 'all'; date?: Date }) => void;
}

export function CitizenComplaintsFilters({ onFilterChange }: CitizenComplaintsFiltersProps) {
    const [applicationNumber, setApplicationNumber] = React.useState("");
    const [category, setCategory] = React.useState<ComplaintCategory | 'all'>('all');
    const [status, setStatus] = React.useState<ComplaintStatus | 'all'>('all');
    const [date, setDate] = React.useState<Date | undefined>();

    React.useEffect(() => {
        onFilterChange({ applicationNumber: applicationNumber || undefined, category, status, date });
    }, [applicationNumber, category, status, date, onFilterChange]);

    const handleClear = () => {
        setApplicationNumber("");
        setCategory("all");
        setStatus("all");
        setDate(undefined);
    }

    return (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by Application #" 
                    className="pl-10" 
                    value={applicationNumber}
                    onChange={(e) => setApplicationNumber(e.target.value)}
                />
            </div>
            <Select value={category} onValueChange={(value) => setCategory(value as ComplaintCategory | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Utility">Utility</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Water Department">Water Department</SelectItem>
                    <SelectItem value="Road Department">Road Department</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setStatus(value as ComplaintStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal sm:w-auto",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Filter by Date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={handleClear}>
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    )
}
