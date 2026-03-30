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
import type { ComplaintStatus } from "@/lib/types"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

interface ComplaintsFiltersProps {
    onFilterChange: (filters: { 
        applicationNumber?: string; 
        status?: ComplaintStatus | 'all'; 
        date?: Date;
        showEscalatedOnly?: boolean;
     }) => void;
}

export function ComplaintsFilters({ onFilterChange }: ComplaintsFiltersProps) {
    const [applicationNumber, setApplicationNumber] = React.useState("");
    const [status, setStatus] = React.useState<ComplaintStatus | 'all'>('all');
    const [date, setDate] = React.useState<Date | undefined>();
    const [showEscalatedOnly, setShowEscalatedOnly] = React.useState(false);

     React.useEffect(() => {
        onFilterChange({ 
            applicationNumber: applicationNumber || undefined, 
            status, 
            date,
            showEscalatedOnly
        });
    }, [applicationNumber, status, date, showEscalatedOnly, onFilterChange]);


    const handleClear = () => {
        setApplicationNumber("");
        setStatus("all");
        setDate(undefined);
        setShowEscalatedOnly(false);
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
            <div className="flex items-center space-x-2">
                <Switch 
                    id="escalated-only" 
                    checked={showEscalatedOnly}
                    onCheckedChange={setShowEscalatedOnly}
                />
                <Label htmlFor="escalated-only" className="text-sm">Escalated</Label>
            </div>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={handleClear}>
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    )
}
