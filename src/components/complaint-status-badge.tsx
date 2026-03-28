import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
}

const statusStyles: Record<ComplaintStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
  Overdue: "bg-red-100 text-red-800 border-red-200",
};

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-semibold", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
