export interface Annotation {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export type PlanType = "Construction" | "MEP" | "Code/Specification";
export type ExtendedPlanType = PlanType | 'Unknown';

export interface ExtractedInformation {
  materialSchedules: string;
  equipmentSpecifications: string;
  spatialDimensions: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamLeadId: string;
  teamLead?: {
    id: string;
    name: string;
  };
  teamMembers?: {
    id: string;
    name: string;
  }[];
  _count?: {
    documents: number;
  };
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  reporterId: string;
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  parentId?: string; // For nested comments
  entityType: 'task' | 'document' | 'project';
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  uploadedBy?: User;
  fileType: string;
  dataUri: string;
  classification: PlanType;
  extractedInfo: ExtractedInformation;
  annotations: any[];
  size: number;
  status: "pending" | "reviewed" | "approved" | "rejected";
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'document_review' | 'comment' | 'meeting' | 'project_update';
  title: string;
  message: string;
  read: boolean;
  entityType: 'task' | 'document' | 'project' | 'meeting';
  entityId: string;
  createdAt: string;
}
