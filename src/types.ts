export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER"
}

export enum ProjectStatus {
  PLANNING = "Planning",
  REQUIREMENTS = "Requirements Gathering",
  DESIGN = "Design",
  DEVELOPMENT = "Development",
  TESTING = "Testing",
  UAT = "UAT",
  DEPLOYMENT = "Deployment",
  MAINTENANCE = "Maintenance",
  COMPLETED = "Completed",
  ON_HOLD = "On Hold",
  CANCELLED = "Cancelled"
}

export enum ProjectPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum ProjectHealth {
  HEALTHY = "Healthy",
  AT_RISK = "At Risk",
  CRITICAL = "Critical"
}

export enum TaskStatus {
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  REVIEW = "Review",
  TESTING = "Testing",
  BLOCKED = "Blocked",
  COMPLETED = "Completed"
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  department?: string;
  designation?: string;
  skills?: string[];
  experience?: string;
  availability?: number; // percentage (e.g. 100 for fully available)
  photoUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  themeColor?: string;
  timezone?: string;
  emailTemplates?: {
    welcome: string;
    taskAssigned: string;
  };
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
  projectType: string;
  category: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  clientName: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  estimatedBudget: number;
  actualBudget: number;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  projectManagerId: string;
  teamMemberIds: string[];
  health: ProjectHealth;
  progress: number; // 0 to 100
  riskLevel: string; // Low, Medium, High
  colorLabel?: string; // hex code or color name
  tags: string[];
  isArchived?: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
  completionDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  progress: number; // 0 to 100
  priority: "Low" | "Medium" | "High";
  ownerId: string;
  deliverables: string[];
  dependencies: string[]; // milestone IDs
  approvalStatus: "Draft" | "Pending Approval" | "Approved" | "Rejected";
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  assignedToId: string;
  createdById: string;
  priority: TaskPriority;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  completionDate?: string;
  checklist: { id: string; text: string; done: boolean }[];
  subtasks: { id: string; title: string; done: boolean }[];
  attachments: string[];
  comments: { id: string; userId: string; userName: string; text: string; timestamp: string }[];
  labels: string[];
  dependencies: string[]; // task IDs
}

export interface TimeLog {
  id: string;
  projectId: string;
  taskId: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  status?: string;
  userName?: string;
}

export interface Risk {
  id: string;
  projectId: string;
  name: string;
  description: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  ownerId: string;
  mitigationPlan: string;
  status: "Open" | "Mitigated" | "Closed";
  reviewDate: string;
}

export interface Issue {
  id: string;
  projectId: string;
  summary: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical" | "Blocker";
  assignedToId: string;
  resolution?: string;
  rootCause?: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  agenda: string;
  participants: string[]; // user IDs or names
  mom?: string; // Minutes of Meeting
  actionItems: { id: string; text: string; assignee: string; done: boolean }[];
  recordingLink?: string;
  dateTime: string;
  nextMeetingDateTime?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string; // e.g. "Project Created", "Task Assigned", etc.
  details: string;
  timestamp: string;
}

export interface DocumentFile {
  id: string;
  projectId: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  version: number;
  folderName?: string;
}
