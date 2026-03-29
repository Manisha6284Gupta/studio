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
import { MoreHorizontal, Eye, Edit, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import FormattedDate from "./formatted-date";
import { useFirestore, errorEmitter } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { deleteDoc, doc } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";

interface ComplaintsTableProps {
  complaints: Complaint[];
  view?: 'citizen' | 'department' | 'control-room';
}

export function ComplaintsTable({ complaints, view = 'citizen' }: ComplaintsTableProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [complaintToDelete, setComplaintToDelete] = React.useState<Complaint | null>(null);

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

  return (
    <>
      <div className="relative h-[600px] overflow-auto border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.applicationNumber}>
                <TableCell className="font-medium">{complaint.applicationNumber}</TableCell>
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
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send Back
                        </DropdownMenuItem>
                      )}
                      {view === 'control-room' && (
                        <DropdownMenuItem>
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
  </>
  );
}
