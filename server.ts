import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getDb, saveDb } from "./src/db/dbStore.js";
import { 
  UserRole, ProjectStatus, ProjectPriority, ProjectHealth, 
  TaskStatus, TaskPriority, ActivityLog, Notification, Project, Milestone, Task, TimeLog, Risk, Issue, Meeting
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will fallback to offline mock engine.");
    }
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// DB Helper Logs
// ----------------------------------------------------
function logActivity(projectId: string | undefined, userId: string, userName: string, role: string, action: string, details: string) {
  const db = getDb();
  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId,
    userId,
    userName,
    userRole: role,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);
  saveDb(db);
}

function sendInAppNotification(userId: string, title: string, message: string, type: "info" | "success" | "warning" | "alert") {
  const db = getDb();
  const newNotif: Notification = {
    id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  saveDb(db);
}

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
// Standard Login Endpoint
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  
  // High usability: Find or create user to make onboarding frictionless
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Frictionless onboarding: automatically seed a user with Orga Admin or PM based on email
    const name = email.split("@")[0].split(".").map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
    let role = UserRole.TEAM_MEMBER;
    let designation = "Software Engineer";
    let department = "Engineering";

    if (email.includes("admin")) {
      role = UserRole.ORG_ADMIN;
      designation = "Director of Project Operations";
      department = "Operations";
    } else if (email.includes("pm") || email.includes("manager")) {
      role = UserRole.PROJECT_MANAGER;
      designation = "Project Manager";
      department = "Management";
    }

    user = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name: name || "New Team Member",
      role,
      organizationId: "org-1",
      department,
      designation,
      skills: ["Agile", "Teamwork", "Problem Solving"],
      experience: "3 years",
      availability: 100,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
    };
    db.users.push(user);
    saveDb(db);
    logActivity(undefined, user.id, user.name, user.role, "User Joined", `User registered and logged in with role ${user.role}.`);
  }

  res.json({
    status: "success",
    user,
    token: `mock-jwt-token-${user.id}`
  });
});

// ----------------------------------------------------
// TEMPLATES API & HELPERS
// ----------------------------------------------------
const STANDARD_TEMPLATES = [
  {
    id: "software-development",
    name: "Software Development Template",
    description: "Designed for modern agile software cycles. Pre-seeds requirements alignment, system architecture spec folders, frontend/backend milestones, unit tests, and QA phases.",
    projectType: "Infrastructure",
    category: "Software Development",
    defaultName: "Phoenix Software Deployment",
    defaultCode: "PHX-SOFT",
    defaultTechStack: "React, TypeScript, Node.js, PostgreSQL, Docker",
    defaultTags: "Agile, SaaS, Cloud, Security",
    colorLabel: "#6366f1",
    milestones: [
      "Requirements & Scope Alignment (+14 days)",
      "Architecture & Design Specs (+30 days)",
      "Sprint 1 Development & Core APIs (+60 days)",
      "System Integration & QA Phase (+90 days)",
      "Beta Release & Client Acceptance (+120 days)"
    ],
    tasks: [
      "Draft Product Requirements Document (PRD)",
      "Conduct Kickoff & Stakeholder Alignment Sync",
      "Design Database Schema & Draft API Endpoints",
      "Set up Core Project Repository & Boilerplate",
      "Implement Authentication & User Roles Access Layer",
      "Build Core Dashboard UI with Responsive Charts",
      "Configure CI/CD Pipelines & Dev Environment Staging",
      "Write Unit & Integration Test Suites",
      "Conduct Client Acceptance Demo"
    ],
    folders: [
      "Requirements & PRDs",
      "System Architecture",
      "Security & Compliance",
      "User Guides & API Docs"
    ]
  },
  {
    id: "marketing-campaign",
    name: "Marketing Campaign Template",
    description: "Perfect for multi-channel growth campaigns. Pre-seeds audience demographic analysis, creative ad assets folders, landing page configurations, live ad sets, and ROI calculators.",
    projectType: "Outreach",
    category: "Outreach & Growth",
    defaultName: "Apex Multi-Channel Launch",
    defaultCode: "APX-MKT",
    defaultTechStack: "Google Ads, Meta Ads Manager, GA4, Mailchimp",
    defaultTags: "Marketing, Growth, Paid Ads, Brand",
    colorLabel: "#10b981",
    milestones: [
      "Market Analysis & Brand Alignment (+14 days)",
      "Creative Concept & Asset Design (+30 days)",
      "Pre-launch Warmup & Channels Setup (+45 days)",
      "Campaign Launch & Live Ad Spend (+75 days)",
      "Post-Campaign Review & ROI Report (+90 days)"
    ],
    tasks: [
      "Research Target Demographic Trends & Personas",
      "Establish Campaign Budget caps & Channel Allocation",
      "Draft Visual Design Styleguide & Image Assets",
      "Create Campaign Landing Page Copy & Ad Scripts",
      "Implement Custom Lead Capture forms & Tracking Pixels",
      "Schedule Warmup Email Sequence & Social Blasts",
      "Launch High-Intent Google & Meta Ad Sets",
      "Perform Weekly Budget Optimization & A/B testing",
      "Consolidate ROI Data & Present Analytics Deck"
    ],
    folders: [
      "Market Research",
      "Creative Assets",
      "Copywriting Drafts",
      "Performance Analytics"
    ]
  },
  {
    id: "research-project",
    name: "Research Project Template",
    description: "Structured for peer-reviewed academic, clinical, or scientific research pipelines. Pre-seeds study objective documentation, IRB ethics board checklists, raw dataset normalization, regression modeling, and publication bibliographies.",
    projectType: "Research",
    category: "Design",
    defaultName: "Quantum Cognitive Inquiry",
    defaultCode: "QTM-RES",
    defaultTechStack: "Python, R, LaTeX, SPSS, Google Scholar",
    defaultTags: "Academic, Science, Data, IRB",
    colorLabel: "#f59e0b",
    milestones: [
      "Literature Review & Hypothesis Setup (+21 days)",
      "Experimental Design & IRB Ethical Approval (+45 days)",
      "Primary Data Collection & Surveys Phase (+75 days)",
      "Statistical Modeling & Results Synthesis (+105 days)",
      "Manuscript Draft & Peer Review Submission (+135 days)"
    ],
    tasks: [
      "Search Research Databases & Compile Reference Index",
      "Formulate Core Hypothesis & Study Objectives Statement",
      "Draft Methodology Protocol & Laboratory Checklists",
      "Submit Institutional IRB Ethical Approval Request",
      "Conduct Lab Assays / Recruit Interview Respondents",
      "Clean Raw Survey Data & Prepare Baseline Dataset",
      "Run Regression Models & Validate Statistical Power",
      "Generate High-Resolution Charts & Figure Panels",
      "Draft Discussion Section & Format References Bibliography"
    ],
    folders: [
      "Literature Review",
      "Ethics & Approvals",
      "Raw Datasets",
      "Manuscript Drafts"
    ]
  }
];

app.get("/api/v1/templates", (req, res) => {
  const db = getDb();
  const customTemplates = db.customTemplates || [];
  res.json([...STANDARD_TEMPLATES, ...customTemplates]);
});

app.post("/api/v1/templates", (req, res) => {
  const db = getDb();
  const { name, description, sourceProjectId, projectType, category } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const sourceProj = db.projects.find(p => p.id === sourceProjectId);
  if (!sourceProj) {
    return res.status(404).json({ error: "Source project not found" });
  }

  const sourceMilestones = db.milestones.filter(m => m.projectId === sourceProjectId);
  const sourceTasks = db.tasks.filter(t => t.projectId === sourceProjectId);
  const sourceDocs = db.documents.filter(d => d.projectId === sourceProjectId);

  const milestoneMap: Record<string, { title: string }> = {};
  sourceMilestones.forEach(m => {
    milestoneMap[m.id] = { title: m.title };
  });

  // Map milestones relative to project start date
  const milestonesTemplate = sourceMilestones.map(m => {
    const daysOffset = Math.max(0, Math.round((new Date(m.targetDate).getTime() - new Date(sourceProj.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    return {
      title: m.title,
      description: m.description,
      daysOffset,
      priority: m.priority
    };
  });

  // Map tasks relative to project start date
  const tasksTemplate = sourceTasks.map(t => {
    const daysOffset = Math.max(0, Math.round((new Date(t.dueDate).getTime() - new Date(sourceProj.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    return {
      milestoneTitle: t.milestoneId ? milestoneMap[t.milestoneId]?.title : undefined,
      title: t.title,
      description: t.description,
      daysOffset,
      priority: t.priority,
      severity: t.severity,
      estimatedHours: t.estimatedHours,
      labels: t.labels || []
    };
  });

  // Folders setup
  const folders = Array.from(new Set(sourceDocs.map(d => d.folderName).filter(Boolean))) as string[];

  const customTemplate = {
    id: `custom-${Date.now()}`,
    name: name || `Template of ${sourceProj.name}`,
    description: description || sourceProj.description || "",
    projectType: projectType || sourceProj.projectType || "Software",
    category: category || sourceProj.category || "Development",
    defaultName: `Cloned ${sourceProj.name}`,
    defaultCode: `CL-${sourceProj.code || "CLONE"}`,
    defaultTechStack: sourceProj.techStack.join(", "),
    defaultTags: sourceProj.tags.join(", "),
    colorLabel: sourceProj.colorLabel || "#4f46e5",
    milestones: milestonesTemplate.map(m => `${m.title} (+${m.daysOffset} days)`),
    tasks: tasksTemplate.map(t => t.title),
    folders,
    rawMilestones: milestonesTemplate,
    rawTasks: tasksTemplate
  };

  if (!db.customTemplates) {
    db.customTemplates = [];
  }
  db.customTemplates.push(customTemplate);
  saveDb(db);

  logActivity(sourceProjectId, user.id, user.name, user.role, "Template Created", `Created a new template '${customTemplate.name}' duplicating structure from project '${sourceProj.name}'.`);
  res.status(201).json(customTemplate);
});

function seedProjectFromCustomTemplate(db: any, projectId: string, templateId: string, startDate: string, managerId: string, createdByUserId: string) {
  if (!db.customTemplates) return;
  const tpl = db.customTemplates.find((t: any) => t.id === templateId);
  if (!tpl) return;

  const milestoneMap: Record<string, string> = {};

  // 1. Seed Milestones
  if (tpl.rawMilestones && Array.isArray(tpl.rawMilestones)) {
    tpl.rawMilestones.forEach((m: any) => {
      const milestoneId = `miles-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      milestoneMap[m.title] = milestoneId;

      const newMilestone = {
        id: milestoneId,
        projectId,
        title: m.title,
        description: m.description || "",
        startDate,
        targetDate: addDays(startDate, m.daysOffset || 0),
        status: "Pending",
        progress: 0,
        priority: m.priority || "Medium",
        ownerId: managerId,
        deliverables: [],
        dependencies: [],
        approvalStatus: "Draft"
      };

      db.milestones.push(newMilestone);
    });
  }

  // 2. Seed Tasks
  if (tpl.rawTasks && Array.isArray(tpl.rawTasks)) {
    tpl.rawTasks.forEach((t: any) => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const linkedMilestoneId = t.milestoneTitle ? milestoneMap[t.milestoneTitle] : undefined;

      const newTask = {
        id: taskId,
        projectId,
        milestoneId: linkedMilestoneId,
        title: t.title,
        description: t.description || "",
        assignedToId: managerId,
        createdById: createdByUserId,
        priority: t.priority || "Medium",
        severity: t.severity || "Medium",
        status: "To Do",
        estimatedHours: t.estimatedHours || 0,
        actualHours: 0,
        dueDate: addDays(startDate, t.daysOffset || 0),
        checklist: [],
        subtasks: [],
        attachments: [],
        comments: [],
        labels: t.labels || [],
        dependencies: []
      };

      db.tasks.push(newTask);
    });
  }

  // 3. Seed Folders
  if (tpl.folders && Array.isArray(tpl.folders)) {
    tpl.folders.forEach((folderName: string) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newDoc = {
        id: docId,
        projectId,
        name: "Initialized_Folder_Placeholder.md",
        size: "1 KB",
        type: "md",
        uploadedBy: "ProjectHub Templates",
        uploadedAt: new Date().toISOString(),
        url: "#",
        version: 1,
        folderName: folderName
      };

      db.documents.push(newDoc);
    });
  }
}

function seedProjectFromExistingProject(db: any, newProjectId: string, sourceProjectId: string, startDate: string, managerId: string, createdByUserId: string) {
  const sourceProj = db.projects.find((p: any) => p.id === sourceProjectId);
  if (!sourceProj) return;

  const sourceMilestones = db.milestones.filter((m: any) => m.projectId === sourceProjectId);
  const sourceTasks = db.tasks.filter((t: any) => t.projectId === sourceProjectId);
  const sourceDocs = db.documents.filter((d: any) => d.projectId === sourceProjectId);

  const milestoneMap: Record<string, string> = {};

  // 1. Map Milestones
  sourceMilestones.forEach((m: any) => {
    const milestoneId = `miles-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    milestoneMap[m.id] = milestoneId;

    // Calculate days offset from source start date
    const dOffset = Math.max(0, Math.round((new Date(m.targetDate).getTime() - new Date(sourceProj.startDate).getTime()) / (1000 * 60 * 60 * 24)));

    const newMilestone = {
      id: milestoneId,
      projectId: newProjectId,
      title: m.title,
      description: m.description,
      startDate: startDate,
      targetDate: addDays(startDate, dOffset),
      status: "Pending",
      progress: 0,
      priority: m.priority,
      ownerId: m.ownerId || managerId,
      deliverables: m.deliverables || [],
      dependencies: [],
      approvalStatus: "Draft"
    };
    db.milestones.push(newMilestone);
  });

  // 2. Map Tasks
  sourceTasks.forEach((t: any) => {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const linkedMilestoneId = t.milestoneId ? milestoneMap[t.milestoneId] : undefined;

    // Calculate days offset from source start date
    const dOffset = Math.max(0, Math.round((new Date(t.dueDate).getTime() - new Date(sourceProj.startDate).getTime()) / (1000 * 60 * 60 * 24)));

    const newTask = {
      id: taskId,
      projectId: newProjectId,
      milestoneId: linkedMilestoneId,
      title: t.title,
      description: t.description,
      assignedToId: t.assignedToId || managerId,
      createdById: createdByUserId,
      priority: t.priority,
      severity: t.severity,
      status: "To Do",
      estimatedHours: t.estimatedHours || 0,
      actualHours: 0,
      dueDate: addDays(startDate, dOffset),
      checklist: (t.checklist || []).map((c: any) => ({ ...c, done: false })),
      subtasks: (t.subtasks || []).map((s: any) => ({ ...s, done: false })),
      attachments: [],
      comments: [],
      labels: t.labels || [],
      dependencies: []
    };
    db.tasks.push(newTask);
  });

  // 3. Map folders/documents (folder setup)
  const uniqueFolders = Array.from(new Set(sourceDocs.map((d: any) => d.folderName).filter(Boolean)));
  if (uniqueFolders.length > 0) {
    uniqueFolders.forEach((folderName: any) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newDoc = {
        id: docId,
        projectId: newProjectId,
        name: `Initialized_Folder_Placeholder.md`,
        size: "1 KB",
        type: "md",
        uploadedBy: "ProjectHub Cloner",
        uploadedAt: new Date().toISOString(),
        url: "#",
        version: 1,
        folderName: folderName
      };
      db.documents.push(newDoc);
    });
  } else {
    // default folders
    ["Requirements & Scopes", "Implementation Logs", "Review Documents"].forEach((folderName: string) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newDoc = {
        id: docId,
        projectId: newProjectId,
        name: `Initialized_Folder_Placeholder.md`,
        size: "1 KB",
        type: "md",
        uploadedBy: "ProjectHub Cloner",
        uploadedAt: new Date().toISOString(),
        url: "#",
        version: 1,
        folderName: folderName
      };
      db.documents.push(newDoc);
    });
  }
}

// ----------------------------------------------------
// PROJECTS API
// ----------------------------------------------------
app.get("/api/v1/projects", (req, res) => {
  const db = getDb();
  res.json(db.projects.filter(p => !p.isArchived));
});

app.get("/api/v1/projects/archived", (req, res) => {
  const db = getDb();
  res.json(db.projects.filter(p => p.isArchived));
});

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function seedProjectFromTemplate(db: any, projectId: string, templateId: string, startDate: string, managerId: string, createdByUserId: string) {
  if (!templateId) return;

  const templates: Record<string, {
    milestones: Array<{
      key: string;
      title: string;
      description: string;
      daysOffset: number;
      priority: string;
    }>;
    tasks: Array<{
      milestoneKey?: string;
      title: string;
      description: string;
      daysOffset: number;
      priority: any;
      severity: string;
      estimatedHours: number;
      labels: string[];
    }>;
    documents: Array<{
      name: string;
      folderName: string;
      size: string;
      type: string;
    }>;
  }> = {
    "software-development": {
      milestones: [
        { key: "m1", title: "Requirements & Scope Alignment", description: "Finalize product requirements doc (PRD), map core milestones, and align with key stakeholders.", daysOffset: 14, priority: "High" },
        { key: "m2", title: "Architecture & Design Specs", description: "Publish relational database diagrams, design API endpoints, and establish repository boilerplates.", daysOffset: 30, priority: "High" },
        { key: "m3", title: "Sprint 1 Development & Core APIs", description: "Complete backend user-auth system, user registration, and active telemetry dashboards.", daysOffset: 60, priority: "High" },
        { key: "m4", title: "System Integration & QA Phase", description: "Set up continuous integration pipelines on Google Cloud and execute comprehensive QA test suites.", daysOffset: 90, priority: "High" },
        { key: "m5", title: "Beta Release & Client Acceptance", description: "Deliver final staging deployment, fix blocker items, and secure client sign-off.", daysOffset: 120, priority: "High" }
      ],
      tasks: [
        { milestoneKey: "m1", title: "Draft Product Requirements Document (PRD)", description: "List feature scopes, out-of-scope tasks, user roles and authentication rules.", daysOffset: 7, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 16, labels: ["Requirements", "Scope"] },
        { milestoneKey: "m1", title: "Conduct Kickoff & Stakeholder Alignment Sync", description: "Host a meeting with clients and stakeholders to outline project objectives and high-level milestones.", daysOffset: 10, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 4, labels: ["Meetings", "Kickoff"] },
        { milestoneKey: "m2", title: "Design Database Schema & Draft API Endpoints", description: "Review third-party integrations and outline normal form SQL diagrams for all data objects.", daysOffset: 20, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 24, labels: ["Database", "Architecture"] },
        { milestoneKey: "m2", title: "Set up Core Project Repository & Boilerplate", description: "Configure Vite dev servers, Tailwind CSS styling, ESLint rules and typescript-stripping.", daysOffset: 25, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 12, labels: ["DevOps", "Codebase"] },
        { milestoneKey: "m3", title: "Implement Authentication & User Roles Access Layer", description: "Write JWT authorization middlewares, secure login/signup APIs, and encrypt databases passwords.", daysOffset: 40, priority: TaskPriority.HIGH, severity: "Critical", estimatedHours: 32, labels: ["Security", "Backend"] },
        { milestoneKey: "m3", title: "Build Core Dashboard UI with Responsive Charts", description: "Construct React UI layouts featuring beautiful grid components, custom color labels, and interactive Recharts.", daysOffset: 50, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 24, labels: ["Frontend", "UI"] },
        { milestoneKey: "m4", title: "Configure CI/CD Pipelines & Dev Environment Staging", description: "Write automated deployment workflows targeting elastic Google Cloud Run containers.", daysOffset: 70, priority: TaskPriority.MEDIUM, severity: "Minor", estimatedHours: 16, labels: ["DevOps", "CI/CD"] },
        { milestoneKey: "m4", title: "Write Unit & Integration Test Suites", description: "Cover core business logic routers with high-quality regression tests.", daysOffset: 85, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 20, labels: ["QA", "Testing"] },
        { milestoneKey: "m5", title: "Conduct Client Acceptance Demo", description: "Run walkthrough sessions, review risk registers and approve completed milestones.", daysOffset: 110, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 8, labels: ["Client", "Release"] }
      ],
      documents: [
        { name: "Product_Requirements_Document_Template.md", folderName: "Requirements & PRDs", size: "14 KB", type: "md" },
        { name: "Architecture_Design_Specs_Blank.pdf", folderName: "System Architecture", size: "1.2 MB", type: "pdf" },
        { name: "Security_Control_Matrix.xlsx", folderName: "Security & Compliance", size: "450 KB", type: "xlsx" },
        { name: "API_Reference_Manual.md", folderName: "User Guides & API Docs", size: "28 KB", type: "md" }
      ]
    },
    "marketing-campaign": {
      milestones: [
        { key: "m1", title: "Market Analysis & Brand Alignment", description: "Align brand objectives, perform competitor reviews and survey user personas.", daysOffset: 14, priority: "Medium" },
        { key: "m2", title: "Creative Concept & Asset Design", description: "Design promotional ad banners, draft copy vectors, and compile design styleguides.", daysOffset: 30, priority: "High" },
        { key: "m3", title: "Pre-launch Warmup & Channels Setup", description: "Deploy custom signup landing pages and configure search-engine keywords bids.", daysOffset: 45, priority: "High" },
        { key: "m4", title: "Campaign Launch & Live Ad Spend", description: "Initialize pay-per-click budgets on search and social channels, optimize bid tiers.", daysOffset: 75, priority: "High" },
        { key: "m5", title: "Post-Campaign Review & ROI Report", description: "Aggregate channel traffic performance, count conversions and compile the executive summary.", daysOffset: 90, priority: "Medium" }
      ],
      tasks: [
        { milestoneKey: "m1", title: "Research Target Demographic Trends & Personas", description: "Run survey panels, compile audience personas and list target keywords.", daysOffset: 7, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 20, labels: ["Research", "Strategy"] },
        { milestoneKey: "m1", title: "Establish Campaign Budget caps & Channel Allocation", description: "Decide financial split between Search Engine Marketing and Social Sponsor campaigns.", daysOffset: 12, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 8, labels: ["Finance", "Budget"] },
        { milestoneKey: "m2", title: "Draft Visual Design Styleguide & Image Assets", description: "Design cohesive ad templates, brand logos and color palettes.", daysOffset: 22, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 30, labels: ["Creative", "Design"] },
        { milestoneKey: "m2", title: "Create Campaign Landing Page Copy & Ad Scripts", description: "Write high-converting call-to-actions, hero headers, and introductory video scripts.", daysOffset: 28, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 15, labels: ["Creative", "Copywriting"] },
        { milestoneKey: "m3", title: "Implement Custom Lead Capture forms & Tracking Pixels", description: "Set up analytics tags, cookies and user sign-up forms for retargeting.", daysOffset: 38, priority: TaskPriority.HIGH, severity: "Critical", estimatedHours: 16, labels: ["Tech-Setup", "Analytics"] },
        { milestoneKey: "m3", title: "Schedule Warmup Email Sequence & Social Blasts", description: "Draft automated emails and social media teasers to raise initial product awareness.", daysOffset: 42, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 10, labels: ["Outreach", "Social"] },
        { milestoneKey: "m4", title: "Launch High-Intent Google & Meta Ad Sets", description: "Activate paid campaigns, monitor real-time impressions and click-through rates.", daysOffset: 50, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 12, labels: ["Paid-Ads", "Launch"] },
        { milestoneKey: "m4", title: "Perform Weekly Budget Optimization & A/B testing", description: "Optimize negative keywords list, shift budget from underperforming ad variations.", daysOffset: 65, priority: TaskPriority.MEDIUM, severity: "Minor", estimatedHours: 16, labels: ["Paid-Ads", "Optimization"] },
        { milestoneKey: "m5", title: "Consolidate ROI Data & Present Analytics Deck", description: "Summarize total lead acquisitions, calculation cost-per-lead, and document creative wins.", daysOffset: 85, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 12, labels: ["Analytics", "Report"] }
      ],
      documents: [
        { name: "Audience_Analysis_Personas.docx", folderName: "Market Research", size: "2.1 MB", type: "docx" },
        { name: "Visual_Design_Brand_Guidelines.pdf", folderName: "Creative Assets", size: "4.8 MB", type: "pdf" },
        { name: "Ad_Copy_and_Slogans.docx", folderName: "Copywriting Drafts", size: "180 KB", type: "docx" },
        { name: "Ad_Set_Performance_ROI_Tracker.xlsx", folderName: "Performance Analytics", size: "1.1 MB", type: "xlsx" }
      ]
    },
    "research-project": {
      milestones: [
        { key: "m1", title: "Literature Review & Hypothesis Setup", description: "Identify knowledge gaps, formulate study objectives, and index academic references.", daysOffset: 21, priority: "Medium" },
        { key: "m2", title: "Experimental Design & IRB Ethical Approval", description: "Draft laboratory protocols, submit ethical applications, and assemble research materials.", daysOffset: 45, priority: "High" },
        { key: "m3", title: "Primary Data Collection & Surveys Phase", description: "Conduct subject assays, gather questionnaire data, and build raw databases.", daysOffset: 75, priority: "High" },
        { key: "m4", title: "Statistical Modeling & Results Synthesis", description: "Execute statistical tests, run regression models, and create tables/figures.", daysOffset: 105, priority: "High" },
        { key: "m5", title: "Manuscript Draft & Peer Review Submission", description: "Write manuscript draft sections, format bibliographies, and submit to targeted journals.", daysOffset: 135, priority: "High" }
      ],
      tasks: [
        { milestoneKey: "m1", title: "Search Research Databases & Compile Reference Index", description: "Query academic search indices (Google Scholar, PubMed, IEEE) and compile reference indexes.", daysOffset: 10, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 40, labels: ["Academic", "Lit-Review"] },
        { milestoneKey: "m1", title: "Formulate Core Hypothesis & Study Objectives Statement", description: "Write down falsifiable research hypotheses, independent and dependent variables definition.", daysOffset: 18, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 15, labels: ["Planning", "Hypothesis"] },
        { milestoneKey: "m2", title: "Draft Methodology Protocol & Laboratory Checklists", description: "Establish step-by-step experiment instructions, control mechanisms, and safe storage instructions.", daysOffset: 30, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 24, labels: ["Methodology", "Ethics"] },
        { milestoneKey: "m2", title: "Submit Institutional IRB Ethical Approval Request", description: "Fill out ethical review board forms, secure human/subject consent documents.", daysOffset: 38, priority: TaskPriority.HIGH, severity: "Critical", estimatedHours: 12, labels: ["Compliance", "Ethics"] },
        { milestoneKey: "m3", title: "Conduct Lab Assays / Recruit Interview Respondents", description: "Gather field observations, record trial measurements, or interview active panel participants.", daysOffset: 60, priority: TaskPriority.HIGH, severity: "Critical", estimatedHours: 80, labels: ["Lab-Work", "Fieldwork"] },
        { milestoneKey: "m3", title: "Clean Raw Survey Data & Prepare Baseline Dataset", description: "Resolve missing records, normalise outliers, and export clean .csv datasets.", daysOffset: 70, priority: TaskPriority.MEDIUM, severity: "Medium", estimatedHours: 20, labels: ["Data-Cleaning"] },
        { milestoneKey: "m4", title: "Run Regression Models & Validate Statistical Power", description: "Verify normality, run t-tests or ANOVA, and confirm statistical power thresholds.", daysOffset: 90, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 40, labels: ["Analytics", "Modeling"] },
        { milestoneKey: "m4", title: "Generate High-Resolution Charts & Figure Panels", description: "Plot distribution distributions, trend scatters, and error bar plots.", daysOffset: 100, priority: TaskPriority.MEDIUM, severity: "Minor", estimatedHours: 16, labels: ["Visualization"] },
        { milestoneKey: "m5", title: "Draft Discussion Section & Format References Bibliography", description: "Interpret results, mention study caveats, format citation lists, and finalize paper submission.", daysOffset: 120, priority: TaskPriority.HIGH, severity: "Major", estimatedHours: 50, labels: ["Writing", "Manuscript"] }
      ],
      documents: [
        { name: "Academic_References_Bibliography.md", folderName: "Literature Review", size: "35 KB", type: "md" },
        { name: "IRB_Ethical_Review_Request_Form.docx", folderName: "Ethics & Approvals", size: "95 KB", type: "docx" },
        { name: "Research_Subject_Anonymized_Data.xlsx", folderName: "Raw Datasets", size: "3.4 MB", type: "xlsx" },
        { name: "Research_Findings_Manuscript_v1.docx", folderName: "Manuscript Drafts", size: "1.2 MB", type: "docx" }
      ]
    }
  };

  const selectedTemplate = templates[templateId];
  if (!selectedTemplate) return;

  const milestoneMap: Record<string, string> = {};

  // 1. Seed Milestones
  selectedTemplate.milestones.forEach((m) => {
    const milestoneId = `miles-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    milestoneMap[m.key] = milestoneId;

    const newMilestone: Milestone = {
      id: milestoneId,
      projectId,
      title: m.title,
      description: m.description,
      startDate,
      targetDate: addDays(startDate, m.daysOffset),
      status: "Pending",
      progress: 0,
      priority: m.priority as any,
      ownerId: managerId,
      deliverables: [],
      dependencies: [],
      approvalStatus: "Draft"
    };

    db.milestones.push(newMilestone);
  });

  // 2. Seed Tasks
  selectedTemplate.tasks.forEach((t) => {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const linkedMilestoneId = t.milestoneKey ? milestoneMap[t.milestoneKey] : undefined;

    let mappedSeverity: "Low" | "Medium" | "High" | "Critical" = "Medium";
    if (t.severity === "Critical") mappedSeverity = "Critical";
    else if (t.severity === "Major") mappedSeverity = "High";
    else if (t.severity === "Medium") mappedSeverity = "Medium";
    else if (t.severity === "Minor") mappedSeverity = "Low";

    const newTask: Task = {
      id: taskId,
      projectId,
      milestoneId: linkedMilestoneId,
      title: t.title,
      description: t.description,
      assignedToId: managerId,
      createdById: createdByUserId,
      priority: t.priority,
      severity: mappedSeverity,
      status: TaskStatus.TODO,
      estimatedHours: t.estimatedHours,
      actualHours: 0,
      dueDate: addDays(startDate, t.daysOffset),
      checklist: [],
      subtasks: [],
      attachments: [],
      comments: [],
      labels: t.labels,
      dependencies: []
    };

    db.tasks.push(newTask);
  });

  // 3. Seed Documents (folders Setup)
  selectedTemplate.documents.forEach((d) => {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDoc = {
      id: docId,
      projectId,
      name: d.name,
      size: d.size,
      type: d.type,
      uploadedBy: "ProjectHub Templates",
      uploadedAt: new Date().toISOString(),
      url: "#",
      version: 1,
      folderName: d.folderName
    };

    db.documents.push(newDoc);
  });
}

app.post("/api/v1/projects", (req, res) => {
  const db = getDb();
  const { name, code, description, projectType, category, priority, clientName, startDate, targetEndDate, estimatedBudget, techStack, projectManagerId, teamMemberIds, colorLabel, tags, templateId, sourceProjectId } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    organizationId: "org-1",
    name,
    code: code || `PROJ-${Math.floor(Math.random() * 1000)}`,
    description: description || "",
    projectType: projectType || "Software",
    category: category || "Development",
    priority: priority || ProjectPriority.MEDIUM,
    status: ProjectStatus.PLANNING,
    clientName: clientName || "Internal",
    startDate: startDate || new Date().toISOString().split("T")[0],
    targetEndDate: targetEndDate || new Date().toISOString().split("T")[0],
    estimatedBudget: Number(estimatedBudget) || 0,
    actualBudget: 0,
    techStack: Array.isArray(techStack) ? techStack : [],
    projectManagerId: projectManagerId || user.id,
    teamMemberIds: Array.isArray(teamMemberIds) ? teamMemberIds : [],
    health: ProjectHealth.HEALTHY,
    progress: 0,
    riskLevel: "Low",
    colorLabel: colorLabel || "#4f46e5",
    tags: Array.isArray(tags) ? tags : [],
    isArchived: false
  };

  db.projects.push(newProject);

  // Seeding Logic
  if (templateId) {
    if (templateId.startsWith("custom-")) {
      seedProjectFromCustomTemplate(db, newProject.id, templateId, newProject.startDate, newProject.projectManagerId, user.id);
    } else {
      seedProjectFromTemplate(db, newProject.id, templateId, newProject.startDate, newProject.projectManagerId, user.id);
    }
  } else if (sourceProjectId) {
    seedProjectFromExistingProject(db, newProject.id, sourceProjectId, newProject.startDate, newProject.projectManagerId, user.id);
  }

  saveDb(db);

  let creationDetail = `Created project '${newProject.name}' with code ${newProject.code}`;
  if (templateId) {
    creationDetail += ` using '${templateId}' template`;
  } else if (sourceProjectId) {
    creationDetail += ` cloned from project '${sourceProjectId}' structure`;
  }
  logActivity(newProject.id, user.id, user.name, user.role, "Project Created", creationDetail);
  
  // Notify Manager and Members
  if (newProject.projectManagerId !== user.id) {
    sendInAppNotification(newProject.projectManagerId, "Project Assigned", `You have been assigned as Project Manager for '${newProject.name}'.`, "info");
  }
  newProject.teamMemberIds.forEach(mId => {
    if (mId !== user.id) {
      sendInAppNotification(mId, "Added to Project", `You have been added to the project '${newProject.name}'.`, "success");
    }
  });

  res.status(201).json(newProject);
});

app.put("/api/v1/projects/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.projects.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Project not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const oldProj = db.projects[index];
  const updated = { ...oldProj, ...req.body, id }; // Prevent ID overwrite
  db.projects[index] = updated;
  saveDb(db);

  logActivity(id, user.id, user.name, user.role, "Project Updated", `Modified project details for '${updated.name}'.`);
  res.json(updated);
});

app.post("/api/v1/projects/:id/archive", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const proj = db.projects.find(p => p.id === id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  proj.isArchived = true;
  saveDb(db);

  logActivity(id, user.id, user.name, user.role, "Project Archived", `Archived project '${proj.name}'.`);
  res.json({ message: "Project archived", project: proj });
});

app.post("/api/v1/projects/:id/restore", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const proj = db.projects.find(p => p.id === id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  proj.isArchived = false;
  saveDb(db);

  logActivity(id, user.id, user.name, user.role, "Project Restored", `Restored project '${proj.name}'.`);
  res.json({ message: "Project restored", project: proj });
});

// ----------------------------------------------------
// MILESTONES API
// ----------------------------------------------------
app.get("/api/v1/projects/:projectId/milestones", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.milestones.filter(m => m.projectId === projectId));
});

app.post("/api/v1/milestones", (req, res) => {
  const db = getDb();
  const { projectId, title, description, startDate, targetDate, priority, ownerId, deliverables, dependencies } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newMilestone: Milestone = {
    id: `miles-${Date.now()}`,
    projectId,
    title,
    description: description || "",
    startDate: startDate || new Date().toISOString().split("T")[0],
    targetDate: targetDate || new Date().toISOString().split("T")[0],
    status: "Pending",
    progress: 0,
    priority: priority || "Medium",
    ownerId: ownerId || user.id,
    deliverables: Array.isArray(deliverables) ? deliverables : [],
    dependencies: Array.isArray(dependencies) ? dependencies : [],
    approvalStatus: "Draft"
  };

  db.milestones.push(newMilestone);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Milestone Added", `Added milestone '${newMilestone.title}'.`);
  res.status(201).json(newMilestone);
});

app.put("/api/v1/milestones/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.milestones.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Milestone not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const oldMilestone = db.milestones[index];
  const updated = { ...oldMilestone, ...req.body, id };
  db.milestones[index] = updated;

  // Sync project progress when milestones change status/progress
  const proj = db.projects.find(p => p.id === updated.projectId);
  if (proj) {
    const projMilestones = db.milestones.filter(m => m.projectId === proj.id);
    if (projMilestones.length > 0) {
      const avgProgress = projMilestones.reduce((acc, curr) => acc + curr.progress, 0) / projMilestones.length;
      proj.progress = Math.round(avgProgress);
    }
  }

  saveDb(db);
  logActivity(updated.projectId, user.id, user.name, user.role, "Milestone Updated", `Updated milestone '${updated.title}'.`);
  res.json(updated);
});

// ----------------------------------------------------
// TASKS API
// ----------------------------------------------------
app.get("/api/v1/projects/:projectId/tasks", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.tasks.filter(t => t.projectId === projectId));
});

app.post("/api/v1/tasks", (req, res) => {
  const db = getDb();
  const { projectId, milestoneId, title, description, assignedToId, priority, severity, estimatedHours, dueDate, labels, dependencies } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newTask: Task = {
    id: `task-${Date.now()}`,
    projectId,
    milestoneId: milestoneId || undefined,
    title,
    description: description || "",
    assignedToId: assignedToId || user.id,
    createdById: user.id,
    priority: priority || TaskPriority.MEDIUM,
    severity: severity || "Medium",
    status: TaskStatus.TODO,
    estimatedHours: Number(estimatedHours) || 0,
    actualHours: 0,
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    checklist: [],
    subtasks: [],
    attachments: [],
    comments: [],
    labels: Array.isArray(labels) ? labels : [],
    dependencies: Array.isArray(dependencies) ? dependencies : []
  };

  db.tasks.push(newTask);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Task Created", `Created task '${newTask.title}' and assigned to team member.`);
  
  if (newTask.assignedToId !== user.id) {
    sendInAppNotification(newTask.assignedToId, "New Task Assigned", `Task: '${newTask.title}' was assigned to you.`, "info");
  }

  res.status(201).json(newTask);
});

app.put("/api/v1/tasks/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const oldTask = db.tasks[index];
  const updated = { ...oldTask, ...req.body, id };
  db.tasks[index] = updated;
  saveDb(db);

  logActivity(updated.projectId, user.id, user.name, user.role, "Task Updated", `Updated task '${updated.title}' to status '${updated.status}'.`);
  res.json(updated);
});

app.post("/api/v1/tasks/:id/comments", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const db = getDb();
  const task = db.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newComment = {
    id: `com-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    text,
    timestamp: new Date().toISOString()
  };

  task.comments.push(newComment);
  saveDb(db);

  logActivity(task.projectId, user.id, user.name, user.role, "Comment Added", `Added comment to task '${task.title}': "${text.substring(0, 30)}..."`);
  
  if (task.assignedToId !== user.id) {
    sendInAppNotification(task.assignedToId, "Comment Added on Task", `${user.name} commented on your task: '${task.title}'.`, "info");
  }

  res.status(201).json(newComment);
});

// ----------------------------------------------------
// TIME LOGS API
// ----------------------------------------------------
app.get("/api/v1/projects/:projectId/timelogs", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.timeLogs.filter(t => t.projectId === projectId));
});

app.post("/api/v1/timelogs", (req, res) => {
  const db = getDb();
  const { projectId, taskId, hours, description, isBillable } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newLog: TimeLog = {
    id: `log-${Date.now()}`,
    projectId,
    taskId,
    userId: user.id,
    date: new Date().toISOString().split("T")[0],
    hours: Number(hours) || 0,
    description: description || "",
    isBillable: isBillable ?? true
  };

  db.timeLogs.push(newLog);

  // Update cumulative task hours
  const task = db.tasks.find(t => t.id === taskId);
  if (task) {
    task.actualHours += newLog.hours;
  }

  saveDb(db);
  logActivity(projectId, user.id, user.name, user.role, "Time Logged", `Logged ${newLog.hours}h on task.`);
  res.status(201).json(newLog);
});

// ----------------------------------------------------
// RISKS & ISSUES & MEETINGS & USERS API
// ----------------------------------------------------
app.get("/api/v1/projects/:projectId/risks", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.risks.filter(r => r.projectId === projectId));
});

app.post("/api/v1/risks", (req, res) => {
  const db = getDb();
  const { projectId, name, description, probability, impact, ownerId, mitigationPlan } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newRisk: Risk = {
    id: `risk-${Date.now()}`,
    projectId,
    name,
    description: description || "",
    probability: probability || "Medium",
    impact: impact || "Medium",
    ownerId: ownerId || user.id,
    mitigationPlan: mitigationPlan || "",
    status: "Open",
    reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 2 weeks review
  };

  db.risks.push(newRisk);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Risk Logged", `Added risk '${newRisk.name}' to register.`);
  res.status(201).json(newRisk);
});

app.put("/api/v1/risks/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.risks.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Risk not found" });

  const oldRisk = db.risks[idx];
  db.risks[idx] = { ...oldRisk, ...req.body, id };
  saveDb(db);
  res.json(db.risks[idx]);
});

app.get("/api/v1/projects/:projectId/issues", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.issues.filter(i => i.projectId === projectId));
});

app.post("/api/v1/issues", (req, res) => {
  const db = getDb();
  const { projectId, summary, description, priority, severity, assignedToId } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newIssue: Issue = {
    id: `issue-${Date.now()}`,
    projectId,
    summary,
    description: description || "",
    priority: priority || "Medium",
    severity: severity || "Major",
    assignedToId: assignedToId || user.id,
    status: "Open",
    createdAt: new Date().toISOString()
  };

  db.issues.push(newIssue);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Issue Created", `Created issue tickets: '${newIssue.summary}'`);
  res.status(201).json(newIssue);
});

app.put("/api/v1/issues/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.issues.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Issue not found" });

  const oldIssue = db.issues[idx];
  db.issues[idx] = { ...oldIssue, ...req.body, id };
  saveDb(db);
  res.json(db.issues[idx]);
});

app.get("/api/v1/projects/:projectId/meetings", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.meetings.filter(m => m.projectId === projectId));
});

app.post("/api/v1/meetings", (req, res) => {
  const db = getDb();
  const { projectId, title, agenda, participants, dateTime } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newMeeting: Meeting = {
    id: `meet-${Date.now()}`,
    projectId,
    title,
    agenda: agenda || "",
    participants: Array.isArray(participants) ? participants : [user.id],
    actionItems: [],
    dateTime: dateTime || new Date().toISOString()
  };

  db.meetings.push(newMeeting);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Meeting Scheduled", `Scheduled meeting '${newMeeting.title}'.`);
  res.status(201).json(newMeeting);
});

app.get("/api/v1/users", (req, res) => {
  const db = getDb();
  res.json(db.users);
});

app.get("/api/v1/notifications", (req, res) => {
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const db = getDb();
  res.json(db.notifications.filter(n => n.userId === userHeader));
});

app.post("/api/v1/notifications/read-all", (req, res) => {
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const db = getDb();
  db.notifications.forEach(n => {
    if (n.userId === userHeader) n.isRead = true;
  });
  saveDb(db);
  res.json({ message: "All notifications marked as read" });
});

app.get("/api/v1/activity-logs", (req, res) => {
  const db = getDb();
  res.json(db.activityLogs.slice(0, 50)); // Send recent 50 activities
});

// ----------------------------------------------------
// DOCUMENT MANAGEMENT
// ----------------------------------------------------
app.get("/api/v1/projects/:projectId/documents", (req, res) => {
  const { projectId } = req.params;
  const db = getDb();
  res.json(db.documents.filter(d => d.projectId === projectId));
});

app.post("/api/v1/documents", (req, res) => {
  const db = getDb();
  const { projectId, name, size, type, folderName } = req.body;
  const userHeader = req.headers["x-user-id"] as string || "user-super";
  const user = db.users.find(u => u.id === userHeader) || db.users[0];

  const newDoc = {
    id: `doc-${Date.now()}`,
    projectId,
    name,
    size: size || "1.2 MB",
    type: type || "pdf",
    uploadedBy: user.name,
    uploadedAt: new Date().toISOString(),
    url: "#",
    version: 1,
    folderName: folderName || "Uploads"
  };

  db.documents.push(newDoc);
  saveDb(db);

  logActivity(projectId, user.id, user.name, user.role, "Document Uploaded", `Uploaded file '${newDoc.name}' to folder '${newDoc.folderName}'.`);
  res.status(201).json(newDoc);
});

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
app.get("/api/v1/settings/organization", (req, res) => {
  const db = getDb();
  res.json(db.organizations[0]);
});

app.put("/api/v1/settings/organization", (req, res) => {
  const db = getDb();
  db.organizations[0] = { ...db.organizations[0], ...req.body };
  saveDb(db);
  res.json(db.organizations[0]);
});

// ----------------------------------------------------
// AI INSIGHTS ENGINE (REAL GEMINI API CALLS)
// ----------------------------------------------------
app.post("/api/v1/ai/summary", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: "Missing projectId" });
  }

  const db = getDb();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const tasks = db.tasks.filter(t => t.projectId === projectId);
  const milestones = db.milestones.filter(m => m.projectId === projectId);
  const risks = db.risks.filter(r => r.projectId === projectId);

  const contextPrompt = `
    You are an enterprise principal project counselor. Propose an authoritative executive summary for the following project.
    
    Project details:
    - Name: ${proj.name}
    - Description: ${proj.description}
    - Priority: ${proj.priority}
    - Status: ${proj.status}
    - Timeline: ${proj.startDate} to ${proj.targetEndDate}
    - Health: ${proj.health}
    - Estimated Budget: $${proj.estimatedBudget}
    
    Current Progress: ${proj.progress}%
    
    Milestones:
    ${milestones.map(m => `- ${m.title} (Status: ${m.status}, Progress: ${m.progress}%)`).join("\n")}
    
    Tasks:
    ${tasks.map(t => `- ${t.title} (Status: ${t.status}, Assigned: ${t.assignedToId})`).join("\n")}
    
    Risks:
    ${risks.map(r => `- ${r.name} (Impact: ${r.impact}, Mitigation: ${r.mitigationPlan})`).join("\n")}

    Generate a comprehensive analysis of the project. Include an Executive Summary, milestone progression health check, resource allocation feedback, risk analysis, and actionable next-step priorities. Format your answer nicely in Markdown.
  `;

  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        systemInstruction: "You are ProjectHub Pro, an elite enterprise portfolio director AI. Provide polished, direct, highly professional Markdown feedback on portfolio status without preamble."
      }
    });

    res.json({
      summary: result.text || "AI Summary could not be generated. Please check back shortly."
    });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    // Offline simulation mode
    const fallbackResponse = `
### ⚡ Executive Summary (Simulated Offline Mode)

The **${proj.name}** project is currently tracked in the **${proj.status}** phase with a recorded progress level of **${proj.progress}%**.
The estimated budget is **$${proj.estimatedBudget.toLocaleString()}** with an asset health marker of **${proj.health}**.

#### 🎯 Key Recommendations
1. **Accelerate Milestones**: Ensure all pending dependencies are streamlined.
2. **Review Workloads**: Coordinate team allocations to resolve high-priority backlog tasks.
3. **Mitigate Open Risks**: Active mitigation plan audits are recommended for the ${risks.length} logged project risks.
    `;
    res.json({ summary: fallbackResponse });
  }
});

app.post("/api/v1/ai/predictions", async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: "Missing projectId" });
  }

  const db = getDb();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const tasks = db.tasks.filter(t => t.projectId === projectId);
  const milestones = db.milestones.filter(m => m.projectId === projectId);
  const risks = db.risks.filter(r => r.projectId === projectId);

  const contextPrompt = `
    Analyze the project scheduling risk profile and suggest resource workload balancing.
    
    Project details:
    - Name: ${proj.name}
    - Health: ${proj.health}
    - Code: ${proj.code}
    - Priority: ${proj.priority}
    - Status: ${proj.status}
    - Target End Date: ${proj.targetEndDate}
    
    Active Milestones:
    ${milestones.map(m => `- ${m.title} (Status: ${m.status}, Due: ${m.targetDate})`).join("\n")}
    
    Tasks Load:
    ${tasks.map(t => `- ${t.title} (Assigned: ${t.assignedToId}, Due: ${t.dueDate}, Hours: ${t.estimatedHours})`).join("\n")}
    
    Open Risks:
    ${risks.map(r => `- ${r.name} (Probability: ${r.probability}, Impact: ${r.impact})`).join("\n")}

    Generate a structured JSON output with risk score (0-100), predicted delay days, and high-level workload/scheduling suggestions.
  `;

  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            riskScore: { type: "number", description: "Risk Score from 0 to 100" },
            predictedDelayDays: { type: "number", description: "Number of predicted delay days beyond the target date" },
            healthStatus: { type: "string", description: "Healthy, Caution, or Critical" },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "Workload and timeline balancing suggestions"
            }
          },
          required: ["riskScore", "predictedDelayDays", "healthStatus", "suggestions"]
        }
      }
    });

    res.json(JSON.parse(result.text || "{}"));
  } catch (error: any) {
    console.error("Gemini AI prediction failed:", error);
    // Offline simulated backup payload
    const isCritical = proj.health === "Critical" || risks.length > 2;
    res.json({
      riskScore: isCritical ? 75 : 35,
      predictedDelayDays: isCritical ? 14 : 4,
      healthStatus: isCritical ? "Caution" : "Healthy",
      suggestions: [
        "Reallocate task load from front-end to idle backend resources to optimize pipeline integration.",
        "Perform a dry-run sync migration rehearsal to avoid launch day delays.",
        "Ensure all project participants resolve their backlog tasks before the next milestone due date."
      ]
    });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION BINDINGS
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with live Vite assets...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProjectHub Pro platform listening on http://localhost:${PORT}`);
  });
}

startServer();
