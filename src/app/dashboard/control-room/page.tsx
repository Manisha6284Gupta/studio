import { ComplaintsChart } from "@/components/complaints-chart";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockComplaints } from "@/lib/data";

export default function ControlRoomDashboardPage() {
    const stats = {
        total: mockComplaints.length,
        resolved: mockComplaints.filter(c => c.status === 'Resolved').length,
        pending: mockComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
        overdue: mockComplaints.filter(c => c.status === 'Overdue').length,
    }

    const locations = mockComplaints.map(c => c.location);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Control Room Overview</h1>
                <p className="text-muted-foreground">City-wide complaint monitoring and management.</p>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Updated Complaints</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsTable complaints={mockComplaints.slice(0, 5)} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Complaint Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsMap locations={locations} />
                        </CardContent>
                    </Card>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Total Complaint Volume by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ComplaintsChart />
                </CardContent>
            </Card>

        </div>
    )
}
