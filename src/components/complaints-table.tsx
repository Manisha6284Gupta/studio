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
import type { Complaint } from "@/lib/types";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";


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
  const [complaintToReassign, setComplaintToReassign] = React.useState<Complaint | null>(null);
  const [reassignDepartment, setReassignDepartment] = React.useState<string>("");

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
    setIsUpdating(true);
    const docRef = doc(firestore, 'complaints', complaintToEscalate._id);
    const historyEntry = {
        action: 'Sent Back to Control Room',
        status: complaintToEscalate.status,
        comment: 'Department staff marked as incorrectly assigned.',
        date: new Date(),
        updatedBy: user.uid,
    };

    try {
        await updateDoc(docRef, {
            isEscalated: true,
            escalationReason: "Incorrectly assigned",
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
      <div className="relative h-[600px] overflow-auto border-y">
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
            {complaints.map((complaint) => (
              <TableRow key={complaint.applicationNumber} className={complaint.isEscalated ? "bg-amber-50" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {complaint.isEscalated && <AlertTriangle className="h-4 w-4 text-amber-500" />}
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
            ))}
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

       {/* Send Back Confirmation Dialog */}
       <AlertDialog open={!!complaintToEscalate} onOpenChange={(open) => !open && setComplaintToEscalate(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Send Complaint Back?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure this complaint was assigned incorrectly? This will return it to the Control Room for reassignment.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSendBack} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Yes, Send Back
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
