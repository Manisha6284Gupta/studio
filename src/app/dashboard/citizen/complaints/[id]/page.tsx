"use client";

import { useMemo } from "react";
import { ComplaintStatusBadge } from "@/components/complaint-status-badge";
import { ComplaintsMap } from "@/components/complaints-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Complaint, ComplaintHistory } from "@/lib/types";
import { ArrowLeft, Calendar, Check, Edit, MessageSquare, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import FormattedDate from "@/components/formatted-date";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

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


export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const firestore = useFirestore();

    const complaintRef = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return doc(firestore, 'complaints', id as string);
    }, [firestore, id]);

    const { data: rawComplaint, isLoading } = useDoc<Omit<Complaint, '_id'>>(complaintRef);

    const complaint = useMemo(() => {
        if (!rawComplaint) return null;
        // The useDoc hook returns 'id', but our type uses '_id'.
        return { ...rawComplaint, _id: rawComplaint.id } as Complaint;
    }, [rawComplaint]);

    const complaintImage = PlaceHolderImages.find(p => p.id === 'complaint-image-1');

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
                        <Link href="/dashboard/citizen/complaints">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-headline font-bold">Complaint Details</h1>
                        <p className="text-muted-foreground">Application #{complaint.applicationNumber}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="w-full sm:w-auto"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
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
                            {complaintImage && (
                                <Image
                                    src={complaintImage.imageUrl}
                                    data-ai-hint={complaintImage.imageHint}
                                    alt="Complaint Image"
                                    width={400}
                                    height={300}
                                    className="mt-4 rounded-lg w-full h-auto max-w-md"
                                />
                            )}
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
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Assigned Department" value={complaint.departmentId} />
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Priority" value={complaint.priority} />
                             <DetailItem icon={<User className="h-5 w-5"/>} label="Severity" value={complaint.severity} />
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

                    {complaint.status === 'Resolved' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Provide Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">How satisfied are you with the resolution?</p>
                                <div className="flex gap-1 text-yellow-400">
                                    <Star className="cursor-pointer" />
                                    <Star className="cursor-pointer" />
                                    <Star className="cursor-pointer" />
                                    <Star className="cursor-pointer" />
                                    <Star className="cursor-pointer text-muted" />
                                </div>
                                 <div className="space-y-2">
                                    <label htmlFor="feedback-comment" className="text-sm font-medium">Comments</label>
                                    <textarea id="feedback-comment" placeholder="Any additional feedback..." className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"></textarea>
                                </div>
                                <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4"/> Submit Feedback</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    )
}
