"use client";

import { ComplaintsTable } from "@/components/complaints-table";
import { Button } from "@/components/ui/button";
import { mockComplaints } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CitizenComplaintsFilters } from "@/components/citizen-complaints-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintsChart } from "@/components/complaints-chart";
import type { Complaint, ComplaintCategory } from "@/lib/types";
import { isSameDay } from "date-fns";


export default function CitizenComplaintsPage() {

    // In a real app, this would be a DB query.
    const citizenComplaints = mockComplaints.filter(c => c.citizenId === "citizen-123");
    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>(citizenComplaints);

    const handleFilterChange = React.useCallback((filters: { applicationNumber?: string; category?: ComplaintCategory | 'all'; date?: Date }) => {
        let complaints = [...citizenComplaints];

        if (filters.applicationNumber) {
            complaints = complaints.filter(c => c.applicationNumber.toLowerCase().includes(filters.applicationNumber!.toLowerCase()));
        }

        if (filters.category && filters.category !== 'all') {
            complaints = complaints.filter(c => c.category === filters.category);
        }
        
        if (filters.date) {
            complaints = complaints.filter(c => isSameDay(new Date(c.createdAt), filters.date!));
        }
        
        setFilteredComplaints(complaints);
    }, [citizenComplaints]);


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

            <Card>
                <CardHeader>
                    <CardTitle>Your Complaints by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ComplaintsChart />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <CitizenComplaintsFilters onFilterChange={handleFilterChange} />
                <ComplaintsTable complaints={filteredComplaints} />
            </div>
        </div>
    )
}
