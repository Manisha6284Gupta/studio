"use client";

import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { StatsCards } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { ComplaintsChart } from "@/components/complaints-chart";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { useRouter } from "next/navigation";
import type { Complaint } from "@/lib/types";
import FormattedDate from "@/components/formatted-date";

const CitizenDashboardSkeleton = () => (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Your Complaints by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px]" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                     </div>
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function CitizenDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login/citizen');
        }
    }, [isUserLoading, user, router]);

    const citizenRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, "citizens", user.uid);
    }, [firestore, user]);

    const { data: citizen, isLoading: isCitizenLoading } = useDoc<{fullName: string}>(citizenRef);
    
    const complaintsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'complaints'), where('citizenId', '==', user.uid));
    }, [firestore, user]);

    const { data: rawComplaints, isLoading: isComplaintsLoading } = useCollection<Omit<Complaint, '_id'>>(complaintsQuery);

    const citizenComplaints = React.useMemo(() => {
        if (!rawComplaints) return [];
        return rawComplaints.map(c => ({ ...c, _id: c.id } as Complaint));
    }, [rawComplaints]);

    const stats = React.useMemo(() => {
        if (!citizenComplaints) return { total: 0, resolved: 0, pending: 0, overdue: 0 };
        return {
            total: citizenComplaints.length,
            resolved: citizenComplaints.filter(c => c.status === 'Resolved').length,
            pending: citizenComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
            overdue: citizenComplaints.filter(c => c.status === 'Overdue').length,
        }
    }, [citizenComplaints]);

    const recentActivity = React.useMemo(() => {
        if (!citizenComplaints) return [];
        // The createdAt field might be a server timestamp which is not a Date object until it's read.
        // Let's create a defensive copy and convert to Date before sorting.
        return [...citizenComplaints]
            .map(c => ({...c, createdAt: new Date(c.createdAt)}))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 2);
    }, [citizenComplaints]);


    const isLoading = isUserLoading || isCitizenLoading || isComplaintsLoading;
    
    if (isLoading || !user) {
        return <CitizenDashboardSkeleton />;
    }
    
    const citizenName = citizen?.fullName?.split(' ')[0] || 'Citizen';

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div>
                    <>
                        <h1 className="text-3xl font-headline font-bold">Welcome, {citizenName}!</h1>
                        <p className="text-muted-foreground">Here&apos;s a summary of your civic engagement.</p>
                    </>
                </div>
                <Button asChild>
                    <Link href="/dashboard/citizen/complaints/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Complaint
                    </Link>
                </Button>
            </div>

            <StatsCards stats={stats} />
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Complaints by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ComplaintsChart complaints={citizenComplaints} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map(complaint => (
                                <div className="flex items-start gap-4" key={complaint._id}>
                                    <div className="bg-secondary p-3 rounded-full">
                                        <FileText className={`h-5 w-5 ${complaint.status === 'Resolved' ? 'text-green-500' : 'text-primary'}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{complaint.status === 'Resolved' ? 'Complaint Resolved' : 'Complaint Submitted'}</p>
                                        <p className="text-sm text-muted-foreground truncate">{complaint.applicationNumber} - {complaint.title}</p>
                                        <p className="text-xs text-muted-foreground"><FormattedDate date={complaint.createdAt} formatString="PP" /></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                        )}
                         <Button variant="outline" className="w-full" asChild>
                            <Link href="/dashboard/citizen/complaints">
                                View All My Complaints <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
