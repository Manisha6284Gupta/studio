export type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Overdue";
export type ComplaintPriority = "Low" | "Medium" | "High";
export type ComplaintSeverity = "Critical" | "High" | "Medium" | "Low";
export type ComplaintCategory = "Infrastructure" | "Utility" | "Health" | "Environment" | "Other";
export type ResolutionActionType = "Repair" | "Replacement" | "Investigation" | "Clearance" | "Monitoring" | "Other";

export interface ComplaintLocation {
  type: "Point";
  coordinates: [number, number]; // [Longitude, Latitude]
}

export interface ComplaintAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface ComplaintFeedback {
  rating: number; // min 1, max 5
  comment: string;
}

export interface Escalation {
  isEscalated: boolean;
  escalatedTo: string; // ObjectId as string
  escalationReason: string;
  escalationDate: Date;
}

export interface ResolutionDetails {
  status: "Resolved" | "Unresolved";
  resolvedBy: string; // ObjectId as string
  resolutionDate: Date;
  comments: string;
}

export interface ComplaintHistory {
  date: Date;
  action: string;
  updatedBy: string; // ObjectId as string
  status: string;
  comment: string;
}

export interface Complaint {
  _id: string; // ObjectId as string
  title: string;
  description: string;
  location: ComplaintLocation;
  image?: string;
  citizenId: string; // ObjectId as string
  departmentId: string; // ObjectId as string
  priority: ComplaintPriority;
  severity: ComplaintSeverity;
  assignedTo?: string; // ObjectId as string
  tags: string[];
  category: ComplaintCategory;
  deadline?: Date;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt?: Date;
  applicationNumber: string;
  resolutionDetails?: ResolutionDetails;
  resolutionTime?: number; // in minutes
  externalReference?: string;
  escalation?: Escalation;
  feedback?: ComplaintFeedback;
  attachments?: ComplaintAttachment[];
  resolutionActionType?: ResolutionActionType;
  relatedDepartments?: string[]; // Array of ObjectId as string
  history: ComplaintHistory[];
  createdBy: string; // ObjectId as string
  updatedBy?: string; // ObjectId as string
}
