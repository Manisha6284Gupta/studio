import { StatsCards } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { ComplaintsChart } from "@/components/complaints-chart";

export default function CitizenDashboardPage() {
    // In a real app, this data would be fetched for the logged-in user
    const stats = {
        total: 12,
        resolved: 8,
        pending: 3,
        overdue: 1,
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Welcome, John!</h1>
                    <p className="text-muted-foreground">Here&apos;s a summary of your civic engagement.</p>
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
                        <ComplaintsChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-secondary p-3 rounded-full">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">New Complaint Submitted</p>
                                <p className="text-sm text-muted-foreground">#CN-583920 - Pothole on Main St</p>
                                <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-secondary p-3 rounded-full">
                                <FileText className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="font-semibold">Complaint Resolved</p>
                                <p className="text-sm text-muted-foreground">#CN-583712 - Streetlight Outage</p>
                                <p className="text-xs text-muted-foreground">5 days ago</p>
                            </div>
                        </div>
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
