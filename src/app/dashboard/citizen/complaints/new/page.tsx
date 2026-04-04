"use client";

import { ComplaintForm } from "@/components/complaint-form";
import * as React from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const NewComplaintSkeleton = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
            <Skeleton className="h-9 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
        </div>
        <Skeleton className="h-[800px] w-full" />
    </div>
);


export default function NewComplaintPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login/citizen');
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || !user) {
        return <NewComplaintSkeleton />;
    }

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
