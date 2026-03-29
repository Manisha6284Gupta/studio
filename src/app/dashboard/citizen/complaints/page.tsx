"use client";

import { ComplaintsTable } from "@/components/complaints-table";
import { Button } from "@/components/ui/button";
import { mockComplaints } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CitizenComplaintsFilters } from "@/components/citizen-complaints-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintsMap } from "@/components/complaints-map";
import { StatsCards } from "@/components/stats-cards";
import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/lib/types";
import { isSameDay } from "date-fns";


export default function CitizenComplaintsPage() {
    const citizenComplaints = React.useMemo(() => mockComplaints.filter(c => c.citizenId === "citizen-123"), []);
    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>(citizenComplaints);

    const stats = React.useMemo(() => {
        return {
            total: citizenComplaints.length,
            resolved: citizenComplaints.filter(c => c.status === 'Resolved').length,
            pending: citizenComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
            overdue: citizenComplaints.filter(c => c.status === 'Overdue').length,
        }
    }, [citizenComplaints]);
    
    const handleFilterChange = React.useCallback((filters: { applicationNumber?: string; category?: ComplaintCategory | 'all'; status?: ComplaintStatus | 'all'; date?: Date }) => {
        let complaints = [...citizenComplaints];

        if (filters.applicationNumber) {
            complaints = complaints.filter(c => c.applicationNumber.toLowerCase().includes(filters.applicationNumber!.toLowerCase()));
        }

        if (filters.category && filters.category !== 'all') {
            complaints = complaints.filter(c => c.category === filters.category);
        }

        if (filters.status && filters.status !== 'all') {
            complaints = complaints.filter(c => c.status === filters.status);
        }
        
        if (filters.date) {
            complaints = complaints.filter(c => isSameDay(new Date(c.createdAt), filters.date!));
        }
        
        setFilteredComplaints(complaints);
    }, [citizenComplaints]);
    
    const locations = React.useMemo(() => filteredComplaints.map(c => c.location), [filteredComplaints]);


    return (
        <div className="space-y-8">
             <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div>
                    <h1 className="text-3xl font-headline font-bold">My Complaints</h1>
                    <p className="text-muted-foreground">View, track, and manage all your submitted complaints.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/citizen/complaints/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Complaint
                    </Link>
                </Button>
            </div>

            <StatsCards stats={stats} />

            <div className="space-y-4">
                <CitizenComplaintsFilters onFilterChange={handleFilterChange} />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Complaint Locations</CardTitle>
                        <CardDescription>A map of your filtered complaints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplaintsMap locations={locations} />
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Complaint Details</CardTitle>
                        <CardDescription>A detailed list of your submitted complaints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplaintsTable complaints={filteredComplaints} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
