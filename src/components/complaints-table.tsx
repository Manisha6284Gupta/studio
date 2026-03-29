"use client"

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
import { Button } from "./ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import FormattedDate from "./formatted-date";

interface ComplaintsTableProps {
  complaints: Complaint[];
  view?: 'citizen' | 'department' | 'control-room';
}

export function ComplaintsTable({ complaints, view = 'citizen' }: ComplaintsTableProps) {
  const router = useRouter();

  return (
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
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/citizen/complaints/${complaint._id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {view === 'citizen' && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
  );
}
