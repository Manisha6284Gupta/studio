
'use client';

import * as React from "react";
import { DepartmentStatusChart } from "@/components/department-status-chart";
import { ComplaintsFilters } from "@/components/complaints-filters";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import type { Complaint, ComplaintStatus } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { isSameDay } from "date-fns";

const PageSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="w-full aspect-video rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-52" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-[600px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
)

export default function ControlRoomDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const controlRoomStaffRef = useMemoFirebase(() => {
        if (!user?.uid) return null;
        return doc(firestore, 'roles_controlRoomStaff', user.uid);
    }, [firestore, user?.uid]);

    const { data: controlRoomStaff, isLoading: isRoleLoading } = useDoc<{ uid: string }>(controlRoomStaffRef);

    const complaintsQuery = useMemoFirebase(() => {
        if (isRoleLoading === false && controlRoomStaff) {
            return query(collection(firestore, 'complaints'));
        }
        return null;
    }, [firestore, controlRoomStaff, isRoleLoading]);
    
    const { data: rawComplaints, isLoading: isComplaintsLoading } = useCollection<Omit<Complaint, '_id'>>(complaintsQuery);

    const complaints = React.useMemo(() => {
        if (!rawComplaints) return [];
        return rawComplaints.map(c => ({ ...c, _id: c.id } as Complaint));
    }, [rawComplaints]);

    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>([]);
    
    React.useEffect(() => {
        setFilteredComplaints(complaints);
    }, [complaints]);

    const stats = React.useMemo(() => {
        if (!complaints || complaints.length === 0) return { total: 0, resolved: 0, pending: 0, overdue: 0, escalated: 0 };
        return {
            total: complaints.length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
            pending: complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
            overdue: complaints.filter(c => c.status === 'Overdue').length,
            escalated: complaints.filter(c => c.isEscalated).length,
        }
    }, [complaints]);
    
    const handleFilterChange = React.useCallback((filters: { applicationNumber?: string; status?: ComplaintStatus | 'all'; date?: Date; showEscalatedOnly?: boolean; }) => {
        let filtered = [...complaints];

        if (filters.applicationNumber) {
            filtered = filtered.filter(c => c.applicationNumber.toLowerCase().includes(filters.applicationNumber!.toLowerCase()));
        }

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(c => c.status === filters.status);
        }
        
        if (filters.date) {
            filtered = filtered.filter(c => isSameDay(new Date(c.createdAt), filters.date!));
        }

        if (filters.showEscalatedOnly) {
            filtered = filtered.filter(c => c.isEscalated);
        }
        
        setFilteredComplaints(filtered);
    }, [complaints]);

    const locations = React.useMemo(() => filteredComplaints.map(c => c.location).filter(Boolean), [filteredComplaints]);

    const isLoading = isUserLoading || isRoleLoading;

    if (!isLoading && !controlRoomStaff) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This dashboard is for Control Room personnel only.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (isLoading || (controlRoomStaff && isComplaintsLoading)) {
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
            
            <div className="pt-8 space-y-8">
                <StatsCards stats={stats} />
                <div className="space-y-8">
                    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                        <Card className="rounded-none border-x-0">
                            <CardHeader className="px-4 sm:px-6 lg:px-8">
                                <CardTitle className="text-xl">All Complaints</CardTitle>
                                <CardDescription className="text-xs">
                                    Filter, search, and manage all submitted complaints.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 lg:px-8">
                                <ComplaintsFilters onFilterChange={handleFilterChange} />
                            </CardContent>
                            <ComplaintsTable complaints={filteredComplaints} view="control-room" />
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Performance Overview</CardTitle>
                                <CardDescription>Breakdown of complaint statuses across all departments. The most active department is shown first.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DepartmentStatusChart complaints={complaints} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
