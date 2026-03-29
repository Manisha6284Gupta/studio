"use client";

import * as React from "react";
import { ComplaintsChart } from "@/components/complaints-chart";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockComplaints } from "@/lib/data";
import type { Complaint, ComplaintStatus } from "@/lib/types";
import { isSameDay } from "date-fns";
import { DepartmentComplaintsFilters } from "@/components/department-complaints-filters";


export default function DepartmentDashboardPage() {
    // In a real app, this data would be fetched for the logged-in department
    const departmentId = "Public Works";
    const departmentComplaints = React.useMemo(() => mockComplaints.filter(c => c.departmentId === departmentId), []);
    const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>(departmentComplaints);

    const stats = React.useMemo(() => {
        return {
            total: departmentComplaints.length,
            resolved: departmentComplaints.filter(c => c.status === 'Resolved').length,
            pending: departmentComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
            overdue: departmentComplaints.filter(c => c.status === 'Overdue').length,
        }
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
    
    const locations = React.useMemo(() => filteredComplaints.map(c => c.location), [filteredComplaints]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Department Dashboard</h1>
                <p className="text-muted-foreground">Overview for the {departmentId} Department.</p>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Complaints</CardTitle>
                            <CardDescription>Filter and manage all complaints assigned to your department.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <DepartmentComplaintsFilters onFilterChange={handleFilterChange} />
                           <ComplaintsTable complaints={filteredComplaints} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Complaint Locations</CardTitle>
                            <CardDescription>Hotspots for filtered complaints.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsMap locations={locations} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Volume by Category</CardTitle>
                             <CardDescription>Breakdown of complaint types.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsChart />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
