import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
}

const statusStyles: Record<ComplaintStatus, string> = {
  Pending: "bg-warning/20 text-warning-foreground border-warning/30",
  "In Progress": "bg-primary/20 text-primary border-primary/30",
  Resolved: "bg-success/20 text-success-foreground border-success/30",
  Overdue: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-semibold capitalize", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
