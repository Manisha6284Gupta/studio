import { ComplaintsChart } from "@/components/complaints-chart";
import { ComplaintsFilters } from "@/components/complaints-filters";
import { ComplaintsMap } from "@/components/complaints-map";
import { ComplaintsTable } from "@/components/complaints-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Complaint Hotspots</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsMap locations={locations} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Volume by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ComplaintsChart />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-4">
                <StatsCards stats={stats} />
                <Card>
                    <CardHeader>
                        <CardTitle>All Complaints</CardTitle>
                        <CardDescription>
                            Filter, search, and manage all submitted complaints.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ComplaintsFilters />
                       <ComplaintsTable complaints={mockComplaints} />
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
