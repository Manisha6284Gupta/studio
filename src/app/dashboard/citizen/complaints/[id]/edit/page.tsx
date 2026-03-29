"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { ComplaintForm } from "@/components/complaint-form";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Complaint } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const EditPageSkeleton = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
            <Skeleton className="h-9 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
        </div>
        <div className="space-y-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
            <Skeleton className="h-64" />
        </div>
    </div>
);


export default function EditComplaintPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const complaintRef = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return doc(firestore, 'complaints', id);
    }, [firestore, id]);

    const { data: rawComplaint, isLoading } = useDoc<Omit<Complaint, '_id'>>(complaintRef);
    
    const complaint = useMemo(() => {
        if (!rawComplaint) return null;
        return { ...rawComplaint, _id: rawComplaint.id } as Complaint;
    }, [rawComplaint]);
    
    if (isLoading) {
        return <EditPageSkeleton />;
    }

    if (!complaint) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-headline font-bold">Edit Complaint</h1>
                <p className="text-muted-foreground">
                    Update the details for complaint #{complaint.applicationNumber}.
                </p>
            </div>
            <ComplaintForm complaint={complaint} />
        </div>
    )
}
