"use client";

import * as React from "react";
import { ComplaintsChart } from "@/components/complaints-chart";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 space-y-4">
                <Card>
                    <CardContent className="p-2">
                        <ComplaintsMap locations={locations} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-2">
                        <ComplaintsTable complaints={filteredComplaints} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-4">
                 <DepartmentComplaintsFilters onFilterChange={handleFilterChange} />
                 <Card>
                    <CardHeader>
                        <CardTitle>Volume by Category</CardTitle>
                        <CardDescription>Breakdown of complaint types.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <ComplaintsChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
