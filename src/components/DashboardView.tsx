import React, { useState } from "react";
import { 
  Project, Task, Milestone, User, TimeLog, Notification, ActivityLog,
  ProjectStatus, ProjectPriority, ProjectHealth, TaskStatus, TaskPriority 
} from "../types";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { 
  Folder, CheckSquare, Calendar, AlertTriangle, Users, 
  Clock, ArrowUpRight, TrendingUp, CheckCircle, Flame, 
  Activity, Bell, Play, Award, Zap
} from "lucide-react";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  users: User[];
  notifications?: Notification[];
  activityLogs?: ActivityLog[];
  onSelectProject?: (projId: string) => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ 
  projects, tasks, milestones, users, notifications, onSelectProject, onNavigate 
}: DashboardProps) {
  
  // Basic Stats Calculation
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELLED).length;
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  const delayedProjects = projects.filter(p => p.status === ProjectStatus.ON_HOLD || p.health === ProjectHealth.CRITICAL).length;
  
  const upcomingMilestonesCount = milestones.filter(m => m.status !== "Completed" && new Date(m.targetDate) >= new Date()).length;
  const overdueTasksCount = tasks.filter(t => t.status !== TaskStatus.COMPLETED && new Date(t.dueDate) < new Date()).length;
  const pendingApprovalsCount = milestones.filter(m => m.approvalStatus === "Pending Approval").length;
  
  // Recent Activities (simulated high fidelity based on projects & tasks)
  const recentDeadlines = tasks
    .filter(t => t.status !== TaskStatus.COMPLETED)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Recharts: Project Progress data
  const progressData = projects.map(p => ({
    name: p.code,
    progress: p.progress,
    budget: p.estimatedBudget / 1000, // in ₹K
    actual: p.actualBudget / 1000,
  }));

  // Recharts: Workload data (tasks assigned per user)
  const workloadData = users.map(user => {
    const userTasks = tasks.filter(t => t.assignedToId === user.id && t.status !== TaskStatus.COMPLETED);
    return {
      name: user.name.split(" ")[0],
      tasks: userTasks.length,
      hours: userTasks.reduce((acc, curr) => acc + curr.estimatedHours, 0)
    };
  });

  // Recharts: Priority distribution
  const priorityCount = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  projects.forEach(p => {
    if (p.priority === ProjectPriority.LOW) priorityCount.Low++;
    else if (p.priority === ProjectPriority.MEDIUM) priorityCount.Medium++;
    else if (p.priority === ProjectPriority.HIGH) priorityCount.High++;
    else if (p.priority === ProjectPriority.CRITICAL) priorityCount.Critical++;
  });
  const priorityData = [
    { name: "Low", value: priorityCount.Low, color: "#94a3b8" },
    { name: "Medium", value: priorityCount.Medium, color: "#3b82f6" },
    { name: "High", value: priorityCount.High, color: "#f59e0b" },
    { name: "Critical", value: priorityCount.Critical, color: "#ef4444" }
  ].filter(d => d.value > 0);

  // Recharts: Project Status count
  const statusCounts: Record<string, number> = {};
  projects.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const statusColors: Record<string, string> = {
    "Planning": "#94a3b8",
    "Requirements Gathering": "#cbd5e1",
    "Design": "#a78bfa",
    "Development": "#6366f1",
    "Testing": "#3b82f6",
    "UAT": "#14b8a6",
    "Deployment": "#06b6d4",
    "Completed": "#10b981",
    "On Hold": "#f59e0b",
    "Cancelled": "#ef4444"
  };
  const statusChartData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
    color: statusColors[status] || "#6366f1"
  }));

  // Quick Notes persistence state (widget feature)
  const [quickNotes, setQuickNotes] = useState(() => {
    return localStorage.getItem("projecthub_quicknotes") || "💡 Pro-Tip: Run regular project reports before sprint planning to track budget allocations.";
  });
  const handleSaveNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuickNotes(e.target.value);
    localStorage.setItem("projecthub_quicknotes", e.target.value);
  };

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 p-6 text-white shadow-lg shadow-indigo-100/50">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute left-1/3 bottom-0 -mb-10 h-24 w-24 rounded-full bg-white/10 blur-lg"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">ProjectHub Portfolio Cockpit</h1>
            <p className="mt-2 text-indigo-100 max-w-xl text-sm">
              Welcome back! Here is a high-level overview of your workspace. Total active projects stand healthy, with resources utilized optimally.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              id="new-project-quick-action"
              onClick={() => onNavigate("projects")}
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 text-xs"
            >
              <Zap className="h-4 w-4 text-indigo-600" />
              New Project
            </button>
            <button 
              id="view-timesheets-quick-action"
              onClick={() => onNavigate("timelog")}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500/30 border border-white/20 px-4 py-2 font-medium text-white transition hover:bg-indigo-500/50 text-xs"
            >
              <Clock className="h-4 w-4" />
              Log Hours
            </button>
          </div>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        {/* Total Projects */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 transition hover:translate-y-[-2px] hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Portfolio Projects</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-950">{totalProjects}</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                Active: {activeProjects}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <Folder className="h-5 w-5" />
          </div>
        </div>

        {/* Milestone Card */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 transition hover:translate-y-[-2px] hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Active Milestones</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-950">{upcomingMilestonesCount}</span>
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                Pending Approval: {pendingApprovalsCount}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 transition hover:translate-y-[-2px] hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Overdue Tasks</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-rose-600">{overdueTasksCount}</span>
              <span className="text-xs text-rose-500 font-medium">Require Attention</span>
            </div>
          </div>
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Team Members Card */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 transition hover:translate-y-[-2px] hover:shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Active Resources</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-950">{users.length}</span>
              <span className="text-xs text-slate-500">Organizations Total</span>
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-analytics-section">
        {/* Area Chart for Project Progress */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-slate-900 text-sm">Project Delivery Completion & Budget</h2>
              <p className="text-xs text-slate-500">Tracking progress percentage vs. project estimated cost (₹ thousands)</p>
            </div>
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="progress" name="Completion %" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
                <Area type="monotone" dataKey="budget" name="Est. Budget (₹K)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts side widget */}
        <div className="glass-card rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-sm">Priority & Status Spread</h2>
          
          {/* Internal Mini Grid */}
          <div className="grid grid-cols-2 gap-2 h-full items-center justify-center">
            {/* Status Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-32 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-xs font-medium text-slate-700 mt-1">Status Allocation</span>
            </div>

            {/* Priority Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-32 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-xs font-medium text-slate-700 mt-1">Priority Weights</span>
            </div>
          </div>

          <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
            <span className="font-semibold text-slate-700 block">Legends</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
              <span className="flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-indigo-500"></span>Dev/High</span>
              <span className="flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Done/Medium</span>
              <span className="flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Hold/Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Level 2: Workload vs Activities/Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-resource-section">
        {/* Resource Allocation & Workload Bar Chart */}
        <div className="lg:col-span-1 glass-card rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
          <div>
            <h2 className="font-display font-semibold text-slate-900 text-sm">Resource Allocation & Load</h2>
            <p className="text-xs text-slate-500 font-sans">Active tasks assigned and projected hours</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", color: "#fff", borderRadius: "8px" }} />
                <Legend verticalAlign="top" height={32} iconType="square" />
                <Bar dataKey="tasks" name="Active Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Est. Hours" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deadlines Widget & Quick Actions */}
        <div className="glass-card rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900 text-sm">Upcoming Key Deadlines</h2>
            <button onClick={() => onNavigate("tasks")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
              Tasks <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">All tasks completed! Healthy sprint status.</p>
            ) : (
              recentDeadlines.map(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition shadow-xs">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-800 block truncate max-w-[160px]">{t.title}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded-sm font-medium ${
                          t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH 
                            ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        }`}>{t.priority}</span>
                        <span>Due: {t.dueDate}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      daysLeft < 0 ? "bg-rose-100 text-rose-700" : daysLeft <= 3 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Notes & Calendar widget */}
        <div className="glass-card rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-slate-900 text-sm">Interactive Scratchpad Widget</h2>
            <textarea
              className="w-full h-28 p-2.5 text-xs text-slate-700 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              placeholder="Jot down quick reminders, meeting logs, or task codes here..."
              value={quickNotes}
              onChange={handleSaveNotes}
            ></textarea>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-indigo-950">
            <Award className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold block">SaaS Multitenancy Ready</span>
              <span className="text-[10px] text-indigo-700 block">Switch settings tabs to review organizational custom domains.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
