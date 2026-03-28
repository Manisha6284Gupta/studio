import { ComplaintsChart } from "@/components/complaints-chart";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockComplaints } from "@/lib/data";


export default function DepartmentDashboardPage() {
    // In a real app, this data would be fetched for the logged-in department
    const departmentId = "Public Works";
    const departmentComplaints = mockComplaints.filter(c => c.departmentId === departmentId);

    const stats = {
        total: departmentComplaints.length,
        resolved: departmentComplaints.filter(c => c.status === 'Resolved').length,
        pending: departmentComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
        overdue: departmentComplaints.filter(c => c.status === 'Overdue').length,
    }

    const locations = departmentComplaints.map(c => c.location);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Department Dashboard</h1>
                <p className="text-muted-foreground">Overview for the {departmentId} Department.</p>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Complaints</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsTable complaints={departmentComplaints.slice(0, 5)} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Complaint Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsMap locations={locations} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Complaint Volume by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ComplaintsChart />
                </CardContent>
            </Card>

        </div>
    )
}
