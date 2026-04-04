"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  query,
  where,
} from "firebase/firestore";
import { isSameDay } from "date-fns";

import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  useDoc,
} from "@/firebase";
import type { Complaint, ComplaintStatus } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { DepartmentStatusChart } from "@/components/department-status-chart";
import { DepartmentComplaintsFilters } from "@/components/department-complaints-filters";

const PageSkeleton = () => (
  <div className="space-y-8">
    <div className="grid gap-4 md:grid-cols-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
    </div>
    <Card>
        <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-16 mb-4" />
            <Skeleton className="h-[400px]" />
        </CardContent>
    </Card>
  </div>
);

export default function DepartmentDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [isUserLoading, user, router]);

  const staffRef = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'staff', user.uid);
  }, [firestore, user?.uid]);

  const { data: staffProfile, isLoading: isStaffLoading } =
    useDoc<{ departmentId: string }>(staffRef);

  const complaintsQuery = useMemoFirebase(() => {
    // We MUST wait for the staff profile to load and check it has a departmentId
    // before creating the query.
    if (isStaffLoading || !staffProfile?.departmentId) {
      return null;
    }
    return query(
      collection(firestore, 'complaints'),
      where('initialDepartmentId', '==', staffProfile.departmentId)
    );
  }, [firestore, staffProfile, isStaffLoading]);

  const { data: rawComplaints, isLoading: isComplaintsLoading } =
    useCollection<Omit<Complaint, '_id'>>(complaintsQuery);

  const departmentComplaints = React.useMemo(() => {
    if (!rawComplaints) return [];
    return rawComplaints.map((c) => ({ ...c, _id: c.id } as Complaint));
  }, [rawComplaints]);

  const [filteredComplaints, setFilteredComplaints] = React.useState<Complaint[]>([]);

  React.useEffect(() => {
    setFilteredComplaints(departmentComplaints);
  }, [departmentComplaints]);

  const stats = React.useMemo(() => {
    if (!departmentComplaints || departmentComplaints.length === 0)
      return { total: 0, resolved: 0, pending: 0, overdue: 0 };
    return {
      total: departmentComplaints.length,
      resolved: departmentComplaints.filter((c) => c.status === 'Resolved').length,
      pending: departmentComplaints.filter(
        (c) => c.status === 'Pending' || c.status === 'In Progress'
      ).length,
      overdue: departmentComplaints.filter((c) => c.status === 'Overdue').length,
    };
  }, [departmentComplaints]);

  const handleFilterChange = React.useCallback(
    (filters: {
      applicationNumber?: string;
      status?: ComplaintStatus | 'all';
      date?: Date;
    }) => {
      let complaints = [...departmentComplaints];

      if (filters.applicationNumber) {
        complaints = complaints.filter((c) =>
          c.applicationNumber
            .toLowerCase()
            .includes(filters.applicationNumber!.toLowerCase())
        );
      }

      if (filters.status && filters.status !== 'all') {
        complaints = complaints.filter((c) => c.status === filters.status);
      }

      if (filters.date) {
        complaints = complaints.filter((c) =>
          isSameDay(new Date(c.createdAt), filters.date!)
        );
      }

      setFilteredComplaints(complaints);
    },
    [departmentComplaints]
  );
  
  // Show main skeleton while user/staff profile is loading
  if (isUserLoading || isStaffLoading) {
    return <PageSkeleton />;
  }

  // After loading, if there's no user or staff profile, deny access
  if (!user || !staffProfile?.departmentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This dashboard is for Department personnel only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // At this point, we know we have a valid staff member.
  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Locations</CardTitle>
            <CardDescription>Map of filtered complaint locations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isComplaintsLoading ? <Skeleton className="h-[400px] w-full" /> : <ComplaintsMap complaints={filteredComplaints} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Breakdown of complaint statuses assigned to your department.</CardDescription>
          </CardHeader>
          <CardContent>
            {isComplaintsLoading ? <Skeleton className="h-[400px] w-full" /> : <DepartmentStatusChart complaints={departmentComplaints} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Complaints</CardTitle>
          <CardDescription>
            All complaints currently assigned to the {staffProfile.departmentId}{' '}
            department.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DepartmentComplaintsFilters onFilterChange={handleFilterChange} />
           {isComplaintsLoading ? <Skeleton className="h-[600px] w-full" /> : <ComplaintsTable complaints={filteredComplaints} view="department" />}
        </CardContent>
      </Card>
    </div>
  );
}
