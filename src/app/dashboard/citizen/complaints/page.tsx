import { ComplaintsTable } from "@/components/complaints-table";
import { Button } from "@/components/ui/button";
import { mockComplaints } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";


export default function CitizenComplaintsPage() {

    // Filter for citizen's complaints. In a real app, this would be a DB query.
    const citizenComplaints = mockComplaints.filter(c => c.citizenId === "citizen-123");

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">My Complaints</h1>
                    <p className="text-muted-foreground">View, track, and manage all your submitted complaints.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/citizen/complaints/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Complaint
                    </Link>
                </Button>
            </div>

            <ComplaintsTable complaints={citizenComplaints} />
        </div>
    )
}
