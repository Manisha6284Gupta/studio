"use client";

import * as React from "react";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { Card, CardContent } from "@/components/ui/card";
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
