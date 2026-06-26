import React, { useState, useEffect } from "react";
import { 
  User, Project, Milestone, Task, TimeLog, Risk, Issue, 
  Meeting, Notification, ActivityLog, DocumentFile, UserRole, ProjectPriority 
} from "./types";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import TasksView from "./components/TasksView";
import MilestonesView from "./components/MilestonesView";
import TimesheetView from "./components/TimesheetView";
import RiskIssueView from "./components/RiskIssueView";
import MeetingsView from "./components/MeetingsView";
import DocumentsView from "./components/DocumentsView";
import TeamView from "./components/TeamView";
import SettingsView from "./components/SettingsView";
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Flag, Clock, 
  ShieldAlert, Video, FileText, Users, Settings, LogOut, 
  Bell, Search, Menu, Sparkles, Building2, UserCheck
} from "lucide-react";

type ActiveTab = 
  | "dashboard" | "projects" | "tasks" | "milestones" 
  | "timesheet" | "risks" | "meetings" | "documents" 
  | "team" | "settings";

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState("admin@projecthub.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [authError, setAuthError] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core collections
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Selected project specific collections
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // UI States
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // ----------------------------------------------------
  // API Fetch helpers
  // ----------------------------------------------------
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-User-Id": currentUser?.id || "user-super"
    };
  };

  // On successful login or user reload, pull Master data
  const fetchMasterData = async () => {
    try {
      const usersRes = await fetch("/api/v1/users");
      const usersData = await usersRes.json();
      setUsers(usersData);

      const projectsRes = await fetch("/api/v1/projects");
      const projectsData = await projectsRes.json();
      
      const archivedRes = await fetch("/api/v1/projects/archived");
      const archivedData = await archivedRes.json();

      setProjects([...projectsData, ...archivedData]);

      const notifsRes = await fetch("/api/v1/notifications", {
        headers: getAuthHeaders()
      });
      const notifsData = await notifsRes.json();
      setNotifications(notifsData);

      const logsRes = await fetch("/api/v1/activity-logs");
      const logsData = await logsRes.json();
      setActivityLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch master portfolio database", err);
    }
  };

  // Pull all project sub-modules data when active project changes or tab changes
  const fetchProjectDetails = async (projId: string) => {
    if (!projId) return;
    try {
      const headers = getAuthHeaders();

      const milesRes = await fetch(`/api/v1/projects/${projId}/milestones`);
      const milesData = await milesRes.json();
      setMilestones(milesData);

      const tasksRes = await fetch(`/api/v1/projects/${projId}/tasks`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      const timesheetsRes = await fetch(`/api/v1/projects/${projId}/timelogs`);
      const timesheetsData = await timesheetsRes.json();
      setTimesheets(timesheetsData);

      const risksRes = await fetch(`/api/v1/projects/${projId}/risks`);
      const risksData = await risksRes.json();
      setRisks(risksData);

      const issuesRes = await fetch(`/api/v1/projects/${projId}/issues`);
      const issuesData = await issuesRes.json();
      setIssues(issuesData);

      const meetingsRes = await fetch(`/api/v1/projects/${projId}/meetings`);
      const meetingsData = await meetingsRes.json();
      setMeetings(meetingsData);

      const docsRes = await fetch(`/api/v1/projects/${projId}/documents`);
      const docsData = await docsRes.json();
      setDocuments(docsData);
    } catch (err) {
      console.error(`Failed to sync details for project ${projId}`, err);
    }
  };

  // Trigger loading project specific scopes
  useEffect(() => {
    if (currentUser) {
      fetchMasterData();
    }
  }, [currentUser]);

  // Dynamically load details for the active project
  const firstActiveProjectId = projects.find(p => !p.isArchived)?.id || "";
  const [activeProjectId, setActiveProjectId] = useState("");

  useEffect(() => {
    if (firstActiveProjectId && !activeProjectId) {
      setActiveProjectId(firstActiveProjectId);
    }
  }, [firstActiveProjectId, activeProjectId]);

  useEffect(() => {
    if (activeProjectId && currentUser) {
      fetchProjectDetails(activeProjectId);
    }
  }, [activeProjectId, currentUser]);

  // ----------------------------------------------------
  // REST Handlers for Project actions
  // ----------------------------------------------------
  const handleAddProject = async (projData: any) => {
    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(projData)
      });
      const data = await res.json();
      setProjects(prev => [data, ...prev]);
      setActiveProjectId(data.id);
      fetchMasterData();
    } catch (err) {
      console.error("Error creating project", err);
    }
  };

  const handleUpdateProject = async (projId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/v1/projects/${projId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setProjects(prev => prev.map(p => p.id === projId ? data : p));
    } catch (err) {
      console.error("Error updating project details", err);
    }
  };

  const handleArchiveProject = async (projId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projId}/archive`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, isArchived: true } : p));
      fetchMasterData();
    } catch (err) {
      console.error("Error archiving project", err);
    }
  };

  const handleRestoreProject = async (projId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projId}/restore`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, isArchived: false } : p));
      fetchMasterData();
    } catch (err) {
      console.error("Error restoring project", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Tasks actions
  // ----------------------------------------------------
  const handleAddTask = async (taskData: any) => {
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      setTasks(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? data : t));
      fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error("Error updating task status", err);
    }
  };

  const handleAddTaskComment = async (taskId: string, commentText: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, comments: [...t.comments, data] };
        }
        return t;
      }));
      fetchMasterData();
    } catch (err) {
      console.error("Error posting task feedback comment", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Milestones actions
  // ----------------------------------------------------
  const handleAddMilestone = async (milestoneData: any) => {
    try {
      const res = await fetch("/api/v1/milestones", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(milestoneData)
      });
      const data = await res.json();
      setMilestones(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error creating milestone", err);
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/v1/milestones/${milestoneId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setMilestones(prev => prev.map(m => m.id === milestoneId ? data : m));
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error updating milestone progress", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Timesheet actions
  // ----------------------------------------------------
  const handleAddTimesheet = async (timesheetData: any) => {
    try {
      const res = await fetch("/api/v1/timelogs", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(timesheetData)
      });
      const data = await res.json();
      setTimesheets(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error logging timesheet hours", err);
    }
  };

  const handleApproveTimesheet = async (logId: string) => {
    try {
      // Mock log state approval triggers
      setTimesheets(prev => prev.map(l => l.id === logId ? { ...l, status: "Approved" } : l));
      alert("Logged hours approved! Resource costs adjusted.");
    } catch (err) {
      console.error("Timesheet approval failed", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Risks & Issues actions
  // ----------------------------------------------------
  const handleAddRisk = async (riskData: any) => {
    try {
      const res = await fetch("/api/v1/risks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(riskData)
      });
      const data = await res.json();
      setRisks(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error creating risk register entry", err);
    }
  };

  const handleUpdateRisk = async (riskId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/v1/risks/${riskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setRisks(prev => prev.map(r => r.id === riskId ? data : r));
      fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error("Error updating risk status", err);
    }
  };

  const handleAddIssue = async (issueData: any) => {
    try {
      const res = await fetch("/api/v1/issues", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(issueData)
      });
      const data = await res.json();
      setIssues(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error creating issue ticket", err);
    }
  };

  const handleUpdateIssue = async (issueId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/v1/issues/${issueId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      setIssues(prev => prev.map(i => i.id === issueId ? data : i));
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error updating issue bug status", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Meetings actions
  // ----------------------------------------------------
  const handleAddMeeting = async (meetingData: any) => {
    try {
      const res = await fetch("/api/v1/meetings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(meetingData)
      });
      const data = await res.json();
      setMeetings(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error scheduling meeting", err);
    }
  };

  const handleUpdateMeeting = async (meetingId: string, updatedFields: any) => {
    try {
      // Direct local state sync to support rich nested checklists MOM updates nicely
      setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, ...updatedFields } : m));
    } catch (err) {
      console.error("Failed to update meeting details", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Documents upload
  // ----------------------------------------------------
  const handleUploadDoc = async (docData: any) => {
    try {
      const res = await fetch("/api/v1/documents", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(docData)
      });
      const data = await res.json();
      setDocuments(prev => [data, ...prev]);
      fetchProjectDetails(activeProjectId);
      fetchMasterData();
    } catch (err) {
      console.error("Error uploading document file details", err);
    }
  };

  // ----------------------------------------------------
  // REST Handlers for Team onboarding
  // ----------------------------------------------------
  const handleAddUser = async (userData: any) => {
    try {
      // Automatically register user using standard frictionless endpoint triggers
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email })
      });
      const data = await res.json();
      fetchMasterData();
    } catch (err) {
      console.error("Failed to onboard team member", err);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/v1/notifications/read-all", {
        method: "POST",
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed marking notifications read", err);
    }
  };

  // ----------------------------------------------------
  // Auth Submit Handlers
  // ----------------------------------------------------
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.status === "success") {
        setCurrentUser(data.user);
      } else {
        setAuthError(data.error || "Authentication failed. Provide valid credentials.");
      }
    } catch (err) {
      console.error("Auth server connection failed", err);
      setAuthError("Could not connect to full-stack server. Check logs.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail("admin@projecthub.com");
  };

  // UN-AUTHENTICATED LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans" id="login-layout">
        {/* Visual ambient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
            Enterprise Project Management Platform
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
            ProjectHub Pro
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log in to manage organizational sprints, log timesheets, and predict bottlenecks using server-side Gemini.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 p-4">
          <div className="bg-slate-900/40 backdrop-blur-md py-8 px-6 border border-slate-800/80 shadow-2xl rounded-2xl space-y-6">
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs leading-normal">
                  {authError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Workspace Email Account</label>
                <input
                  type="email"
                  required
                  placeholder="admin@projecthub.com"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                id="login-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-semibold text-xs tracking-wide transition shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Access Platform Workspace
              </button>
            </form>

            <div className="border-t border-slate-800/60 pt-4 text-center space-y-2">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Onboarding Demo Profiles</span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => { setLoginEmail("admin@projecthub.com"); }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-medium transition cursor-pointer"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => { setLoginEmail("sarah.pm@projecthub.com"); }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-medium transition cursor-pointer"
                >
                  Project Manager
                </button>
                <button
                  onClick={() => { setLoginEmail("david.dev@projecthub.com"); }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-medium transition cursor-pointer"
                >
                  Frontend Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PLATFORM WORKSPACE
  const unreadNotifs = notifications.filter(n => !n.isRead);

  const sidebarTabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Cockpit Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Portfolio Projects", icon: FolderKanban },
    { id: "tasks", label: "Sprint Tasks & Kanban", icon: CheckSquare },
    { id: "milestones", label: "Gated Milestones", icon: Flag },
    { id: "timesheet", label: "Resource Timesheets", icon: Clock },
    { id: "risks", label: "Risks & Bug Tracker", icon: ShieldAlert },
    { id: "meetings", label: "Meetings Scrum Syncs", icon: Video },
    { id: "documents", label: "File Directory", icon: FileText },
    { id: "team", label: "Roster Directory", icon: Users },
    { id: "settings", label: "Settings Administration", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 font-sans" id="authenticated-workspace">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`bg-slate-950 text-slate-400 w-64 flex flex-col justify-between shrink-0 fixed lg:relative inset-y-0 z-30 transition-transform lg:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`} id="sidebar-navigation">
        <div className="space-y-6 pt-6 flex flex-col overflow-y-auto">
          {/* Organization logo */}
          <div className="px-6 flex items-center justify-between border-b border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-indigo-500" />
              <div>
                <h1 className="font-display font-extrabold text-white text-sm leading-tight">ProjectHub Pro</h1>
                <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider">Enterprise Suite</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">✕</button>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {sidebarTabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === t.id 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" 
                      : "hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom section */}
        <div className="p-4 border-t border-slate-900 space-y-3 bg-slate-950/50">
          <div className="flex items-center gap-3">
            {currentUser.photoUrl ? (
              <img src={currentUser.photoUrl} alt={currentUser.name} className="h-10 w-10 rounded-full border border-slate-800" />
            ) : (
              <span className="h-10 w-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </span>
            )}
            <div className="space-y-0.5 truncate max-w-[120px]">
              <h5 className="text-white font-bold text-xs leading-none truncate">{currentUser.name}</h5>
              <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase block leading-none">{currentUser.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            id="logout-btn"
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition border border-slate-800 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout Account
          </button>
        </div>
      </aside>

      {/* PRIMARY WORKSPACE CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden" id="workspace-main-panel">
        
        {/* HEADER BAR */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20" id="top-header-bar">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-slate-800 font-bold">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Global telemetry search..."
                className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
              />
            </div>

            {/* Live project selection header shortcut */}
            {activeTab !== "projects" && activeTab !== "team" && activeTab !== "settings" && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-semibold hidden sm:inline">Active Project:</span>
                <select
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-700"
                  value={activeProjectId}
                  onChange={(e) => { setActiveProjectId(e.target.value); }}
                >
                  {projects.filter(p => !p.isArchived).map(p => (
                    <option key={p.id} value={p.id}>{p.code}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Notifications Center */}
            <div className="relative">
              <button
                onClick={() => { setShowNotificationDropdown(!showNotificationDropdown); handleMarkNotificationsRead(); }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              {/* Dropdown menu */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border rounded-xl shadow-xl z-30 p-4 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-slate-800">Telemetry Notifications</span>
                    <button onClick={() => setShowNotificationDropdown(false)} className="text-[10px] text-indigo-600 font-bold hover:underline">Dismiss</button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">No alerts logged.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded text-[10px] space-y-0.5 border ${
                          n.isRead ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-indigo-50/40 border-indigo-100 text-slate-700"
                        }`}>
                          <span className="font-bold block">{n.title}</span>
                          <p className="leading-snug">{n.message}</p>
                          <span className="text-[8px] text-slate-400 block pt-1">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              milestones={milestones}
              users={users}
              activityLogs={activityLogs}
              onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsView
              projects={projects}
              users={users}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onArchiveProject={handleArchiveProject}
              onRestoreProject={handleRestoreProject}
            />
          )}

          {activeTab === "tasks" && (
            <TasksView
              projects={projects}
              tasks={tasks}
              milestones={milestones}
              users={users}
              currentUserId={currentUser.id}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onAddComment={handleAddTaskComment}
            />
          )}

          {activeTab === "milestones" && (
            <MilestonesView
              projects={projects}
              milestones={milestones}
              users={users}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
            />
          )}

          {activeTab === "timesheet" && (
            <TimesheetView
              projects={projects}
              tasks={tasks}
              timesheets={timesheets}
              users={users}
              onAddTimesheet={handleAddTimesheet}
              onApproveTimesheet={handleApproveTimesheet}
            />
          )}

          {activeTab === "risks" && (
            <RiskIssueView
              projects={projects}
              risks={risks}
              issues={issues}
              users={users}
              onAddRisk={handleAddRisk}
              onUpdateRisk={handleUpdateRisk}
              onAddIssue={handleAddIssue}
              onUpdateIssue={handleUpdateIssue}
            />
          )}

          {activeTab === "meetings" && (
            <MeetingsView
              projects={projects}
              meetings={meetings}
              users={users}
              onAddMeeting={handleAddMeeting}
              onUpdateMeeting={handleUpdateMeeting}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsView
              projects={projects}
              documents={documents}
              onUploadDoc={handleUploadDoc}
            />
          )}

          {activeTab === "team" && (
            <TeamView
              users={users}
              onAddUser={handleAddUser}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </div>
      </main>
    </div>
  );
}
