"use client"

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Complaint, ComplaintStatus } from "@/lib/types";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Send, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import FormattedDate from "./formatted-date";
import { useFirestore, errorEmitter, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { deleteDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface ComplaintsTableProps {
  complaints: Complaint[];
  view?: 'citizen' | 'department' | 'control-room';
}

const departments = [
    "Public Works",
    "Utilities",
    "Health",
    "Environment",
    "Water Department",
    "Road Department",
    "Electricity"
];

export function ComplaintsTable({ complaints, view = 'citizen' }: ComplaintsTableProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [complaintToDelete, setComplaintToDelete] = React.useState<Complaint | null>(null);
  const [complaintToEscalate, setComplaintToEscalate] = React.useState<Complaint | null>(null);
  const [escalationComment, setEscalationComment] = React.useState<string>("");
  const [complaintToReassign, setComplaintToReassign] = React.useState<Complaint | null>(null);
  const [reassignDepartment, setReassignDepartment] = React.useState<string>("");

  const sortedComplaints = React.useMemo(() => {
    if (view === 'citizen') {
        // For citizens, sort by most recent first
        return [...complaints].sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    }

    // For department and control room, use priority sorting
    const statusOrder: Record<ComplaintStatus, number> = {
        'Overdue': 1,
        'Pending': 2,
        'In Progress': 3,
        'Resolved': 4,
    };

    return [...complaints].sort((a, b) => {
        const statusA = statusOrder[a.status] || 99;
        const statusB = statusOrder[b.status] || 99;
        if (statusA !== statusB) {
            return statusA - statusB;
        }
        // Secondary sort: newer first for items with the same status
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
  }, [complaints, view]);

  const handleViewDetails = (complaintId: string) => {
    let path = '';
    switch(view) {
        case 'department':
            path = `/dashboard/department/complaints/${complaintId}`;
            break;
        case 'control-room':
            path = `/dashboard/control-room/complaints/${complaintId}`;
            break;
        case 'citizen':
        default:
            path = `/dashboard/citizen/complaints/${complaintId}`;
            break;
    }
    router.push(path);
  }

  const handleDelete = () => {
    if (!complaintToDelete) return;

    const docRef = doc(firestore, 'complaints', complaintToDelete._id);
    
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Complaint Deleted",
                description: `Complaint #${complaintToDelete.applicationNumber} has been deleted.`,
            });
        })
        .catch((error) => {
            console.error("Error deleting complaint:", error);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);

            if (error.code !== 'permission-denied') {
                 toast({
                    variant: "destructive",
                    title: "Deletion Failed",
                    description: "There was an error deleting the complaint. Please try again.",
                });
            }
        })
        .finally(() => {
            setComplaintToDelete(null);
        });
  };

  const handleSendBack = async () => {
    if (!complaintToEscalate || !user) return;
    if (!escalationComment.trim()) {
        toast({
            variant: "destructive",
            title: "Comment Required",
            description: "Please provide a reason for sending the complaint back.",
        });
        return;
    }

    setIsUpdating(true);
    const docRef = doc(firestore, 'complaints', complaintToEscalate._id);
    const historyEntry = {
        action: 'Sent Back to Control Room',
        status: complaintToEscalate.status,
        comment: escalationComment,
        date: new Date(),
        updatedBy: user.uid,
    };

    try {
        await updateDoc(docRef, {
            isEscalated: true,
            escalationReason: escalationComment,
            escalationDate: serverTimestamp(),
            history: arrayUnion(historyEntry),
            updatedAt: serverTimestamp(),
        });
        toast({ title: "Complaint Sent Back", description: "The complaint has been returned to the Control Room for reassignment." });
    } catch (error: any) {
        console.error("Error sending back complaint:", error);
        toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
        setIsUpdating(false);
        setComplaintToEscalate(null);
        setEscalationComment("");
    }
  }

  const handleReassign = async () => {
      if (!complaintToReassign || !reassignDepartment || !user) return;
      setIsUpdating(true);
      const docRef = doc(firestore, 'complaints', complaintToReassign._id);
      const historyEntry = {
        action: 'Reassigned Department',
        status: complaintToReassign.status,
        comment: `Control Room reassigned complaint to ${reassignDepartment}.`,
        date: new Date(),
        updatedBy: user.uid,
    };

    try {
        await updateDoc(docRef, {
            initialDepartmentId: reassignDepartment,
            isEscalated: false,
            escalationReason: null,
            escalationDate: null,
            history: arrayUnion(historyEntry),
            updatedAt: serverTimestamp(),
        });
        toast({ title: "Complaint Reassigned", description: `Successfully reassigned to ${reassignDepartment}.`});
    } catch (error: any) {
        console.error("Error reassigning complaint:", error);
        toast({ variant: "destructive", title: "Reassignment Failed", description: error.message });
    } finally {
        setIsUpdating(false);
        setComplaintToReassign(null);
        setReassignDepartment("");
    }
  }

  return (
    <>
      <div className="relative h-[600px] overflow-auto border-t">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application #</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedComplaints.length > 0 ? sortedComplaints.map((complaint) => (
              <TableRow key={complaint.applicationNumber} className={complaint.isEscalated ? "bg-escalated/10" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {complaint.isEscalated && <AlertTriangle className="h-4 w-4 text-escalated" />}
                    {complaint.applicationNumber}
                  </div>
                </TableCell>
                <TableCell>{complaint.category}</TableCell>
                <TableCell>
                  <ComplaintStatusBadge status={complaint.status} />
                </TableCell>
                <TableCell><FormattedDate date={complaint.createdAt} formatString="PPP" /></TableCell>
                <TableCell>{complaint.deadline ? <FormattedDate date={complaint.deadline} formatString="PPP" /> : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(complaint._id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {view === 'citizen' && (
                        <>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/citizen/complaints/${complaint._id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setComplaintToDelete(complaint)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {view === 'department' && (
                        <DropdownMenuItem onClick={() => setComplaintToEscalate(complaint)}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Back to Control Room
                        </DropdownMenuItem>
                      )}
                      {view === 'control-room' && complaint.isEscalated && (
                        <DropdownMenuItem onClick={() => setComplaintToReassign(complaint)}>
                          <Send className="mr-2 h-4 w-4" />
                          Reassign
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No complaints found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!complaintToDelete} onOpenChange={(open) => !open && setComplaintToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the complaint
                    with application number <span className="font-bold">{complaintToDelete?.applicationNumber}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setComplaintToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Send Back Dialog */}
       <Dialog open={!!complaintToEscalate} onOpenChange={(open) => {
            if (!open) {
              setComplaintToEscalate(null);
              setEscalationComment("");
            }
          }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send Complaint Back to Control Room</DialogTitle>
                <DialogDescription>
                    Provide a reason for returning this complaint. This comment will be visible to the Control Room.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
                <Label htmlFor="escalation-comment">Comment (Required)</Label>
                <Textarea
                    id="escalation-comment"
                    placeholder="e.g., This complaint belongs to the Water Department, not Utilities."
                    value={escalationComment}
                    onChange={(e) => setEscalationComment(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => { setComplaintToEscalate(null); setEscalationComment(""); }}>Cancel</Button>
                <Button onClick={handleSendBack} disabled={isUpdating || !escalationComment.trim()}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Send Back
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={!!complaintToReassign} onOpenChange={(open) => !open && setComplaintToReassign(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reassign Complaint #{complaintToReassign?.applicationNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>Current Department: <span className="font-semibold">{complaintToReassign?.initialDepartmentId}</span></p>
                <div className="space-y-2">
                    <Label htmlFor="department-select">New Department</Label>
                    <Select onValueChange={setReassignDepartment} value={reassignDepartment}>
                        <SelectTrigger id="department-select">
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleReassign} disabled={isUpdating || !reassignDepartment}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Reassign Complaint
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
  </>
  );
}
