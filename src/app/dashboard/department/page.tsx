"use client";

import * as React from "react";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Complaint, ComplaintLocation, ComplaintStatus } from "@/lib/types";
import { isSameDay } from "date-fns";
import { DepartmentComplaintsFilters } from "@/components/department-complaints-filters";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
    <div className="-mt-4 sm:-mt-6 lg:-mt-8">
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <Card className="rounded-none border-x-0 border-t-0">
                <CardContent className="p-0">
                    <Skeleton className="w-full aspect-[18/9]" />
                </CardContent>
            </Card>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
             <div className="flex flex-col gap-4 border-y bg-card p-4 sm:flex-row sm:flex-wrap">
                 <Skeleton className="h-10 flex-1 min-w-[200px]" />
                 <Skeleton className="h-10 w-full sm:w-[180px]" />
                 <Skeleton className="h-10 w-full sm:w-auto" />
                 <Skeleton className="h-10 w-full sm:w-auto" />
             </div>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <div className="relative h-[600px] overflow-auto border-y">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    </div>
);


export default function DepartmentDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const staffRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'staff', user.uid);
    }, [firestore, user]);

    const { data: staffProfile, isLoading: isStaffLoading } = useDoc<{ departmentId: string }>(staffRef);
    
    const departmentId = staffProfile?.departmentId;

    const complaintsQuery = useMemoFirebase(() => {
        // Only fetch after we have a department ID and staff profile is loaded
        if (isStaffLoading || !departmentId) return null;
        return query(collection(firestore, 'complaints'), where('initialDepartmentId', '==', departmentId));
    }, [firestore, departmentId, isStaffLoading]);

    const { data: rawComplaints, isLoading: isComplaintsLoading } = useCollection<Omit<Complaint, '_id'>>(complaintsQuery);
    
    const departmentComplaints = React.useMemo(() => {
        if (!rawComplaints) return [];
        return rawComplaints.map(c => ({ ...c, _id: c.id } as Complaint));
    }, [rawComplaints]);
    
    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>([]);

    React.useEffect(() => {
        setFilteredComplaints(departmentComplaints);
    }, [departmentComplaints]);
    
    const handleFilterChange = React.useCallback((filters: { applicationNumber?: string; status?: ComplaintStatus | 'all'; date?: Date }) => {
        let complaints = [...departmentComplaints];

        if (filters.applicationNumber) {
            complaints = complaints.filter(c => c.applicationNumber.toLowerCase().includes(filters.applicationNumber!.toLowerCase()));
        }

        if (filters.status && filters.status !== 'all') {
            complaints = complaints.filter(c => c.status === filters.status);
        }
        
        if (filters.date) {
            complaints = complaints.filter(c => isSameDay(new Date(c.createdAt), filters.date!));
        }
        
        setFilteredComplaints(complaints);
    }, [departmentComplaints]);
    
    const locations = React.useMemo(() => filteredComplaints.map(c => c.location).filter((l): l is ComplaintLocation => !!l), [filteredComplaints]);

    const isLoading = isUserLoading || isStaffLoading;

    // If role check is done and user is not staff, show access denied.
    if (!isLoading && !staffProfile) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This dashboard is for Department personnel only.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (isLoading || (staffProfile && isComplaintsLoading)) {
        return <PageSkeleton />;
    }


    return (
        <div className="-mt-4 sm:-mt-6 lg:-mt-8">
             <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                <Card className="rounded-none border-x-0 border-t-0">
                    <CardContent className="aspect-[18/9] p-0">
                        <ComplaintsMap locations={locations} />
                    </CardContent>
                </Card>
            </div>
            
            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                <DepartmentComplaintsFilters onFilterChange={handleFilterChange} />
            </div>

            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                <ComplaintsTable complaints={filteredComplaints} view="department" />
            </div>
        </div>
    )
}
