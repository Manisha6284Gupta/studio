"use client";

import { ComplaintsTable } from "@/components/complaints-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CitizenComplaintsFilters } from "@/components/citizen-complaints-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintsMap } from "@/components/complaints-map";
import { StatsCards } from "@/components/stats-cards";
import type { Complaint, ComplaintCategory, ComplaintLocation, ComplaintStatus } from "@/lib/types";
import { isSameDay } from "date-fns";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


const PageSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-16" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-52" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full aspect-video" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-52" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-[600px] w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function CitizenComplaintsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const complaintsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'complaints'), where('citizenId', '==', user.uid));
    }, [firestore, user]);

    const { data: rawComplaints, isLoading: isComplaintsLoading } = useCollection<Omit<Complaint, '_id'>>(complaintsQuery);

    const citizenComplaints = React.useMemo(() => {
        if (!rawComplaints) return [];
        // The useCollection hook returns 'id', but our type uses '_id'.
        return rawComplaints.map(c => ({ ...c, _id: c.id } as Complaint));
    }, [rawComplaints]);
    
    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>([]);
    
    React.useEffect(() => {
        setFilteredComplaints(citizenComplaints);
    }, [citizenComplaints]);


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
    
    const locations = React.useMemo(() => filteredComplaints.map(c => c.location).filter((l): l is ComplaintLocation => !!l), [filteredComplaints]);

    const isLoading = isUserLoading || isComplaintsLoading;

    if (isLoading) {
        return <PageSkeleton />;
    }

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
