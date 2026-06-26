import fs from "fs";
import path from "path";
import { 
  User, Organization, Project, Milestone, Task, 
  TimeLog, Risk, Issue, Meeting, Notification, 
  ActivityLog, DocumentFile, UserRole, ProjectPriority, 
  ProjectStatus, ProjectHealth, TaskPriority, TaskStatus 
} from "../types.js";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DatabaseSchema {
  users: User[];
  organizations: Organization[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  timeLogs: TimeLog[];
  risks: Risk[];
  issues: Issue[];
  meetings: Meeting[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  documents: DocumentFile[];
  customTemplates?: any[];
}

// Helper to ensure directory and load DB
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

const DEFAULT_DB: DatabaseSchema = {
  organizations: [
    {
      id: "org-1",
      name: "ProjectHub Global",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
      themeColor: "#4f46e5",
      timezone: "UTC-8",
      emailTemplates: {
        welcome: "Welcome to ProjectHub Pro!",
        taskAssigned: "You have been assigned a new task: {taskTitle}."
      }
    }
  ],
  users: [
    {
      id: "user-super",
      email: "admin@projecthub.com",
      name: "Alexander Mercer",
      role: UserRole.SUPER_ADMIN,
      organizationId: "org-1",
      department: "Executive",
      designation: "Chief Operating Officer",
      skills: ["Operations", "Strategic Planning", "Finance"],
      experience: "12 years",
      availability: 100,
      photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: "user-pm-1",
      email: "sarah.pm@projecthub.com",
      name: "Sarah Jenkins",
      role: UserRole.PROJECT_MANAGER,
      organizationId: "org-1",
      department: "Product",
      designation: "Senior Project Lead",
      skills: ["Agile", "Scrum", "Team Leadership", "Risk Management"],
      experience: "8 years",
      availability: 80,
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: "user-dev-1",
      email: "david.dev@projecthub.com",
      name: "David Chen",
      role: UserRole.TEAM_MEMBER,
      organizationId: "org-1",
      department: "Engineering",
      designation: "Lead Frontend Developer",
      skills: ["React", "TypeScript", "Tailwind CSS", "Vite", "Chart.js"],
      experience: "5 years",
      availability: 90,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: "user-dev-2",
      email: "emily.dev@projecthub.com",
      name: "Emily Watson",
      role: UserRole.TEAM_MEMBER,
      organizationId: "org-1",
      department: "Engineering",
      designation: "Senior Backend Developer",
      skills: ["Node.js", "Express.js", "MySQL", "PostgreSQL", "Docker"],
      experience: "6 years",
      availability: 100,
      photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ],
  projects: [
    {
      id: "proj-1",
      organizationId: "org-1",
      name: "Phoenix Cloud Migration",
      code: "PHX-MIG",
      description: "Migration of core legacy web infrastructure to a fully elastic Cloud Run environment with managed DB clusters and strict compliance certifications.",
      projectType: "Infrastructure",
      category: "Software Development",
      priority: ProjectPriority.HIGH,
      status: ProjectStatus.DEVELOPMENT,
      clientName: "Phoenix Financial Corp",
      startDate: "2026-05-01",
      targetEndDate: "2026-10-15",
      estimatedBudget: 150000,
      actualBudget: 42000,
      techStack: ["Node.js", "Docker", "Terraform", "Google Cloud", "PostgreSQL"],
      projectManagerId: "user-pm-1",
      teamMemberIds: ["user-dev-1", "user-dev-2"],
      health: ProjectHealth.HEALTHY,
      progress: 45,
      riskLevel: "Medium",
      colorLabel: "#6366f1",
      tags: ["Cloud", "Security", "Migration", "DevOps"],
      isArchived: false
    },
    {
      id: "proj-2",
      organizationId: "org-1",
      name: "Helix Mobile Portal",
      code: "HLX-MOB",
      description: "Designing and developing a responsive modern client portal focusing on high accessibility, instant speed, and customizable widget layouts.",
      projectType: "Product",
      category: "Software Development",
      priority: ProjectPriority.MEDIUM,
      status: ProjectStatus.PLANNING,
      clientName: "Helix Healthcare Inc",
      startDate: "2026-07-01",
      targetEndDate: "2026-12-20",
      estimatedBudget: 85000,
      actualBudget: 0,
      techStack: ["React", "TypeScript", "Tailwind CSS", "Recharts", "Framer Motion"],
      projectManagerId: "user-pm-1",
      teamMemberIds: ["user-dev-1"],
      health: ProjectHealth.HEALTHY,
      progress: 10,
      riskLevel: "Low",
      colorLabel: "#10b981",
      tags: ["Frontend", "UX/UI", "Analytics"],
      isArchived: false
    },
    {
      id: "proj-3",
      organizationId: "org-1",
      name: "Zephyr Marketing Campaign",
      code: "ZEP-MKT",
      description: "A comprehensive digital outreach campaign to launch Zephyr v4.0 to global enterprise clients through personalized drip and visual animations.",
      projectType: "Marketing",
      category: "Outreach & Growth",
      priority: ProjectPriority.LOW,
      status: ProjectStatus.COMPLETED,
      clientName: "Internal Growth Dept",
      startDate: "2026-01-10",
      targetEndDate: "2026-05-30",
      actualEndDate: "2026-05-28",
      estimatedBudget: 35000,
      actualBudget: 33500,
      techStack: ["Figma", "Mailchimp", "Tailwind CSS", "SEO Suite"],
      projectManagerId: "user-super",
      teamMemberIds: ["user-dev-1"],
      health: ProjectHealth.HEALTHY,
      progress: 100,
      riskLevel: "Low",
      colorLabel: "#3b82f6",
      tags: ["SEO", "Design", "Campaign"],
      isArchived: false
    }
  ],
  milestones: [
    {
      id: "miles-1-1",
      projectId: "proj-1",
      title: "Infrastructure Assessment & Mapping",
      description: "Complete cataloging of all existing on-premises server payloads, code bases, and environment variables.",
      startDate: "2026-05-01",
      targetDate: "2026-06-15",
      completionDate: "2026-06-12",
      status: "Completed",
      progress: 100,
      priority: "High",
      ownerId: "user-pm-1",
      deliverables: ["Legacy Audit Document", "Dependency Mapping Graph"],
      dependencies: [],
      approvalStatus: "Approved"
    },
    {
      id: "miles-1-2",
      projectId: "proj-1",
      title: "Dockerization & Environment Standardization",
      description: "Containerize microservices and align local development configuration with Google Cloud Run guidelines.",
      startDate: "2026-06-16",
      targetDate: "2026-08-01",
      status: "In Progress",
      progress: 60,
      priority: "High",
      ownerId: "user-dev-2",
      deliverables: ["Multi-stage Dockerfiles", "Docker Compose stacks", "Mock environment profiles"],
      dependencies: ["miles-1-1"],
      approvalStatus: "Pending Approval"
    },
    {
      id: "miles-1-3",
      projectId: "proj-1",
      title: "Data Integrity & Production Sync",
      description: "Establish safe database migration script sequences with rollback triggers and real-time streaming replication.",
      startDate: "2026-08-02",
      targetDate: "2026-09-10",
      status: "Pending",
      progress: 0,
      priority: "Medium",
      ownerId: "user-dev-2",
      deliverables: ["Migration Pipelines", "Rollback Plan Verification", "Dry-Run Log Files"],
      dependencies: ["miles-1-2"],
      approvalStatus: "Draft"
    },
    {
      id: "miles-2-1",
      projectId: "proj-2",
      title: "Core UX Mockups & Interactive Prototypes",
      description: "Establish beautiful responsive glassmorphic cards and layout designs aligned with project requirements.",
      startDate: "2026-07-01",
      targetDate: "2026-07-25",
      status: "In Progress",
      progress: 25,
      priority: "Medium",
      ownerId: "user-dev-1",
      deliverables: ["Figma Interactive Flow", "Tailwind Component Design Specs"],
      dependencies: [],
      approvalStatus: "Pending Approval"
    }
  ],
  tasks: [
    {
      id: "task-1-1",
      projectId: "proj-1",
      milestoneId: "miles-1-2",
      title: "Write Multi-Stage Dockerfiles for API Services",
      description: "Create standard production-grade Dockerfiles that support caching layers, secure alpine foundations, and type stripping.",
      assignedToId: "user-dev-2",
      createdById: "user-pm-1",
      priority: TaskPriority.HIGH,
      severity: "High",
      status: TaskStatus.IN_PROGRESS,
      estimatedHours: 12,
      actualHours: 8,
      dueDate: "2026-07-10",
      checklist: [
        { id: "c1", text: "Configure multi-stage build optimization", done: true },
        { id: "c2", text: "Add non-root execution guidelines", done: true },
        { id: "c3", text: "Test container performance with custom bundle files", done: false }
      ],
      subtasks: [
        { id: "s1", title: "Audit base Node-alpine dependencies", done: true },
        { id: "s2", title: "Expose runtime metadata endpoints", done: false }
      ],
      attachments: [],
      comments: [
        { id: "com-1", userId: "user-dev-2", userName: "Emily Watson", text: "Docker configuration compiles cleanly locally. Moving to build pipeline tests.", timestamp: "2026-06-25T14:30:00Z" }
      ],
      labels: ["DevOps", "Infrastructure"],
      dependencies: []
    },
    {
      id: "task-1-2",
      projectId: "proj-1",
      milestoneId: "miles-1-2",
      title: "Set up CI/CD Cloud Run Pipelines",
      description: "Design automated build actions to deploy preview branches to cloud locations on pull-request events.",
      assignedToId: "user-dev-1",
      createdById: "user-pm-1",
      priority: TaskPriority.HIGH,
      severity: "High",
      status: TaskStatus.TODO,
      estimatedHours: 16,
      actualHours: 0,
      dueDate: "2026-07-20",
      checklist: [
        { id: "c2-1", text: "Create GitHub Action triggers for test suite", done: false },
        { id: "c2-2", text: "Inject runtime development secrets from environment panels", done: false }
      ],
      subtasks: [],
      attachments: [],
      comments: [],
      labels: ["CI/CD", "Cloud"],
      dependencies: ["task-1-1"]
    },
    {
      id: "task-1-3",
      projectId: "proj-1",
      milestoneId: "miles-1-1",
      title: "Audit Database Relational Schema",
      description: "Review current legacy tables and propose normal form updates mapping clean user, task, and project references.",
      assignedToId: "user-dev-2",
      createdById: "user-pm-1",
      priority: TaskPriority.MEDIUM,
      severity: "Medium",
      status: TaskStatus.COMPLETED,
      estimatedHours: 10,
      actualHours: 11,
      dueDate: "2026-06-10",
      completionDate: "2026-06-09",
      checklist: [
        { id: "c3-1", text: "Export SQL schema file", done: true },
        { id: "c3-2", text: "Verify relational integrity indices", done: true }
      ],
      subtasks: [],
      attachments: [],
      comments: [
        { id: "com-2", userId: "user-pm-1", userName: "Sarah Jenkins", text: "Great work David. Schema is verified. Relational integrity indices are approved.", timestamp: "2026-06-10T09:15:00Z" }
      ],
      labels: ["Database", "Legacy-Audit"],
      dependencies: []
    },
    {
      id: "task-2-1",
      projectId: "proj-2",
      milestoneId: "miles-2-1",
      title: "Generate SVG and Figma Wireframes",
      description: "Build beautiful layouts featuring modern responsive tables, timeline charts, and glassmorphic quick action metrics.",
      assignedToId: "user-dev-1",
      createdById: "user-pm-1",
      priority: TaskPriority.MEDIUM,
      severity: "Medium",
      status: TaskStatus.IN_PROGRESS,
      estimatedHours: 20,
      actualHours: 5,
      dueDate: "2026-07-15",
      checklist: [
        { id: "c4-1", text: "Draft dashboard desktop mockup", done: true },
        { id: "c4-2", text: "Draft mobile layout navigation structure", done: false }
      ],
      subtasks: [],
      attachments: [],
      comments: [],
      labels: ["UI/UX", "Design"],
      dependencies: []
    }
  ],
  timeLogs: [
    {
      id: "log-1",
      projectId: "proj-1",
      taskId: "task-1-1",
      userId: "user-dev-2",
      date: "2026-06-25",
      hours: 6,
      description: "Created first container optimization layers and validated alpine package sizes.",
      isBillable: true
    },
    {
      id: "log-2",
      projectId: "proj-1",
      taskId: "task-1-1",
      userId: "user-dev-2",
      date: "2026-06-24",
      hours: 2,
      description: "Drafted modular docker configuration architecture draft.",
      isBillable: true
    },
    {
      id: "log-3",
      projectId: "proj-1",
      taskId: "task-1-3",
      userId: "user-dev-2",
      date: "2026-06-08",
      hours: 8,
      description: "Conducted mapping audit and loaded standard index validation structures.",
      isBillable: true
    }
  ],
  risks: [
    {
      id: "risk-1",
      projectId: "proj-1",
      name: "Database Sync Lag",
      description: "High database replication delay may trigger temporary session lockups in peak periods.",
      probability: "Medium",
      impact: "High",
      ownerId: "user-dev-2",
      mitigationPlan: "Run sync operations strictly during off-peak hours (01:00-04:00 UTC) with dedicated write buffers.",
      status: "Open",
      reviewDate: "2026-07-15"
    },
    {
      id: "risk-2",
      projectId: "proj-1",
      name: "Team Competency Skill Gap",
      description: "Advanced Terraform scripts may require specific operations setup that delay early milestones.",
      probability: "Low",
      impact: "Medium",
      ownerId: "user-pm-1",
      mitigationPlan: "Pre-seed standard blueprint scripts and schedule daily 30-minute knowledge sharing meetings.",
      status: "Mitigated",
      reviewDate: "2026-06-20"
    }
  ],
  issues: [
    {
      id: "issue-1",
      projectId: "proj-1",
      summary: "Docker Base Image Deprecation Notice",
      description: "The third-party Alpine package base layer is issuing high severity deprecation notices for its current node subcomponent.",
      priority: "High",
      severity: "Major",
      assignedToId: "user-dev-2",
      resolution: "Migrate container base to official Node-slim 20 release.",
      rootCause: "External service vendor lifecycle transition.",
      status: "Resolved",
      createdAt: "2026-06-20T10:00:00Z"
    },
    {
      id: "issue-2",
      projectId: "proj-1",
      summary: "Failing test suite on environment setup script",
      description: "The environment validation suite is throwing a null pointer check on local build machines without specific caching folders.",
      priority: "Critical",
      severity: "Critical",
      assignedToId: "user-dev-1",
      status: "In Progress",
      createdAt: "2026-06-25T11:45:00Z"
    }
  ],
  meetings: [
    {
      id: "meet-1",
      projectId: "proj-1",
      title: "Phoenix Cloud Architecture Blueprint Check",
      agenda: "Review Dockerfile structures, clarify continuous delivery pipelines, and check risk mitigations.",
      participants: ["user-pm-1", "user-dev-1", "user-dev-2"],
      mom: "Emily demonstrated optimized Alpine multi-stage Docker builds which saved over 45% image storage. David Jenkins noted that GitHub Run runner credentials will be stored as encrypted secrets.",
      actionItems: [
        { id: "act-1", text: "Upload final Dockerfiles to repository", assignee: "Emily Watson", done: true },
        { id: "act-2", text: "Coordinate database replica access credentials", assignee: "Sarah PM", done: false }
      ],
      recordingLink: "https://example.com/recordings/phx-blue-40123",
      dateTime: "2026-06-24T10:00:00Z",
      nextMeetingDateTime: "2026-07-02T10:00:00Z"
    }
  ],
  notifications: [
    {
      id: "not-1",
      userId: "user-dev-1",
      title: "New Task Assigned",
      message: "Sarah Jenkins assigned you the task: Set up CI/CD Cloud Run Pipelines.",
      type: "info",
      isRead: false,
      createdAt: "2026-06-25T15:00:00Z"
    },
    {
      id: "not-2",
      userId: "user-dev-1",
      title: "System Update",
      message: "ProjectHub Global database files were optimized successfully.",
      type: "success",
      isRead: true,
      createdAt: "2026-06-24T08:00:00Z"
    }
  ],
  activityLogs: [
    {
      id: "act-log-1",
      projectId: "proj-1",
      userId: "user-pm-1",
      userName: "Sarah Jenkins",
      userRole: "PROJECT_MANAGER",
      action: "Project Created",
      details: "Sarah Jenkins created the 'Phoenix Cloud Migration' project structure with standard tags.",
      timestamp: "2026-05-01T09:00:00Z"
    },
    {
      id: "act-log-2",
      projectId: "proj-1",
      userId: "user-pm-1",
      userName: "Sarah Jenkins",
      userRole: "PROJECT_MANAGER",
      action: "Milestone Added",
      details: "Added milestone: Dockerization & Environment Standardization.",
      timestamp: "2026-06-16T11:00:00Z"
    },
    {
      id: "act-log-3",
      projectId: "proj-1",
      userId: "user-dev-2",
      userName: "Emily Watson",
      userRole: "TEAM_MEMBER",
      action: "Task Updated",
      details: "Updated status of 'Audit Database Relational Schema' to Completed.",
      timestamp: "2026-06-09T17:12:00Z"
    }
  ],
  documents: [
    {
      id: "doc-1",
      projectId: "proj-1",
      name: "Phoenix_Cloud_Migration_Architecture_v1.pdf",
      size: "2.4 MB",
      type: "pdf",
      uploadedBy: "Sarah Jenkins",
      uploadedAt: "2026-05-05T14:00:00Z",
      url: "#",
      version: 1,
      folderName: "Architecture"
    },
    {
      id: "doc-2",
      projectId: "proj-1",
      name: "Database_Normal_Form_Proposal.xlsx",
      size: "820 KB",
      type: "xlsx",
      uploadedBy: "Emily Watson",
      uploadedAt: "2026-06-09T16:45:00Z",
      url: "#",
      version: 2,
      folderName: "Database"
    }
  ],
  customTemplates: []
};

export function getDb(): DatabaseSchema {
  ensureDbDir();
  if (!fs.existsSync(DB_FILE)) {
    saveDb(DEFAULT_DB);
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!data.customTemplates) {
      data.customTemplates = [];
    }
    return data;
  } catch (err) {
    console.error("Failed to read database, resetting to default seed data", err);
    saveDb(DEFAULT_DB);
    return DEFAULT_DB;
  }
}

export function saveDb(data: DatabaseSchema) {
  ensureDbDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
