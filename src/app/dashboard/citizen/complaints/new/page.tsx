import { ComplaintForm } from "@/components/complaint-form";

export default function NewComplaintPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-headline font-bold">Submit a New Complaint</h1>
                <p className="text-muted-foreground">
                    Please provide as much detail as possible. Use our AI assistant to help categorize your issue.
                </p>
            </div>
            <ComplaintForm />
        </div>
    )
}
