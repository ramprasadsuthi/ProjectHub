export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  projectType: string;
  category: string;
  defaultName: string;
  defaultCode: string;
  defaultTechStack: string;
  defaultTags: string;
  colorLabel: string;
  milestones: string[];
  tasks: string[];
  folders: string[];
}

export const TEMPLATE_REPOS: TemplateMetadata[] = [
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
