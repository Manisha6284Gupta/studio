
"use client";

import { useMemo, useState } from "react";
import { ComplaintStatusBadge } from "@/components/complaint-status-badge";
import { ComplaintsMap } from "@/components/complaints-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Complaint, ComplaintHistory, ComplaintStatus } from "@/lib/types";
import { ArrowLeft, Calendar, Check, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import FormattedDate from "@/components/formatted-date";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

const HistoryItem = ({ item }: { item: ComplaintHistory }) => {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                </div>
                <div className="h-full w-px bg-border"></div>
            </div>
            <div>
                <p className="font-semibold">{item.action} - <span className="font-normal text-muted-foreground">{item.status}</span></p>
                <p className="text-sm text-muted-foreground">{item.comment}</p>
                <p className="text-xs text-muted-foreground"><FormattedDate date={item.date} formatString="PPP p" /></p>
            </div>
        </div>
    )
}

const ComplaintDetailSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-1" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                        <Skeleton className="mt-4 rounded-lg w-full h-64" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <Skeleton className="h-7 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-24" />
                    </CardHeader>
                     <CardContent className="space-y-6">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <Skeleton className="h-7 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="w-full aspect-video rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);


export default function DepartmentComplaintDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const { user } = useUser();
    const { toast } = useToast();
    const [newStatus, setNewStatus] = useState<ComplaintStatus | "">("");
    const [comment, setComment] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);


    const complaintRef = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return doc(firestore, 'complaints', id);
    }, [firestore, id]);

    const { data: rawComplaint, isLoading } = useDoc<Omit<Complaint, '_id'>>(complaintRef);

    const complaint = useMemo(() => {
        if (!rawComplaint) return null;
        return { ...rawComplaint, _id: rawComplaint.id } as Complaint;
    }, [rawComplaint]);

     const handleStatusUpdate = async () => {
        if (!newStatus) {
            toast({ variant: "destructive", title: "Please select a status." });
            return;
        }
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in." });
            return;
        }

        setIsUpdating(true);

        const newHistoryEntry = {
            action: "Status Changed",
            status: newStatus,
            comment: comment || `Status updated to ${newStatus}.`,
            date: new Date(),
            updatedBy: user.uid,
        };

        try {
            await updateDoc(complaintRef!, {
                status: newStatus,
                history: arrayUnion(newHistoryEntry),
                updatedAt: serverTimestamp(),
            });
            toast({ title: "Status Updated", description: "The complaint status has been successfully updated." });
            setNewStatus("");
            setComment("");
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <ComplaintDetailSkeleton />;
    }

    if (!complaint) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/department">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-headline font-bold">Complaint Details</h1>
                        <p className="text-muted-foreground">Application #{complaint.applicationNumber}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{complaint.title}</CardTitle>
                            <CardDescription>
                                Submitted on <FormattedDate date={complaint.createdAt} formatString="PPP" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground">{complaint.description}</p>
                            <div className="mt-4 flex flex-col gap-4">
                                {complaint.imageUrl && (
                                    <Image
                                        src={complaint.imageUrl}
                                        alt="Complaint Image"
                                        width={400}
                                        height={300}
                                        className="rounded-lg w-full h-auto max-w-md"
                                    />
                                )}
                                {complaint.videoUrl && (
                                    <video
                                        src={complaint.videoUrl}
                                        controls
                                        className="rounded-lg w-full h-auto max-w-md"
                                    />
                                )}
                                {/* Backward compatibility for old 'image' field */}
                                {complaint.image && !complaint.imageUrl && !complaint.videoUrl && (
                                    complaint.image.startsWith('data:image') ? (
                                        <Image
                                            src={complaint.image}
                                            alt="Complaint Media"
                                            width={400}
                                            height={300}
                                            className="rounded-lg w-full h-auto max-w-md"
                                        />
                                    ) : (
                                        <video
                                            src={complaint.image}
                                            controls
                                            className="rounded-lg w-full h-auto max-w-md"
                                        />
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {complaint.history?.map((item, index) => <HistoryItem key={index} item={item} />)}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Status</CardTitle>
                            <ComplaintStatusBadge status={complaint.status} />
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <DetailItem icon={<Calendar className="h-5 w-5"/>} label="Deadline" value={complaint.deadline ? <FormattedDate date={complaint.deadline} formatString="PPP" /> : 'N/A'} />
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Assigned Department" value={complaint.initialDepartmentId} />
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Priority" value={complaint.priority} />
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Severity" value={complaint.severity} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status-select">New Status</Label>
                                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ComplaintStatus)}>
                                    <SelectTrigger id="status-select">
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="update-comment">Comment (Optional)</Label>
                                <Textarea
                                    id="update-comment"
                                    placeholder="Add a comment about the status change..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleStatusUpdate} disabled={isUpdating || !newStatus} className="w-full">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Status
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ComplaintsMap locations={complaint.location ? [complaint.location] : []} />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
