import React, { useState, useEffect } from "react";
import { 
  Project, User, ProjectPriority, ProjectStatus, ProjectHealth 
} from "../types";
import { 
  Plus, Search, Filter, Cpu, Calendar, DollarSign, Archive, 
  ExternalLink, UserCheck, ShieldAlert, Sparkles, CheckCircle2, 
  TrendingUp, RefreshCw, Layers, ArrowLeftRight, Code, BookOpen, GraduationCap, FolderOpen
} from "lucide-react";
import { TEMPLATE_REPOS, TemplateMetadata } from "../data/templates";
import TemplatePreview from "./TemplatePreview";

interface ProjectsViewProps {
  projects: Project[];
  users: User[];
  onAddProject: (projData: any) => void;
  onUpdateProject: (projId: string, updatedData: any) => void;
  onArchiveProject: (projId: string) => void;
  onRestoreProject: (projId: string) => void;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function ProjectsView({
  projects, users, onAddProject, onUpdateProject, onArchiveProject, onRestoreProject
}: ProjectsViewProps) {
  
  // Tab states: Active, Archived, Templates
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "templates">("active");

  // Search, Priority, Status, Category Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Select/View Project Detail Drawer
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // AI Feature triggers and loading states
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiPredictions, setAiPredictions] = useState<{
    riskScore: number;
    predictedDelayDays: number;
    healthStatus: string;
    suggestions: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // New Project Form Modal toggler
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    code: "",
    description: "",
    projectType: "Infrastructure",
    category: "Software Development",
    priority: ProjectPriority.MEDIUM,
    clientName: "",
    startDate: "",
    targetEndDate: "",
    estimatedBudget: "",
    techStack: "",
    projectManagerId: "",
    teamMemberIds: [] as string[],
    colorLabel: "#4f46e5",
    tags: "",
    templateId: ""
  });

  // Filter Projects
  const filteredProjects = projects.filter(proj => {
    const isTabMatch = activeTab === "active" ? !proj.isArchived : proj.isArchived;
    const matchesSearch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? proj.status === statusFilter : true;
    const matchesPriority = priorityFilter ? proj.priority === priorityFilter : true;
    const matchesCategory = categoryFilter ? proj.category === categoryFilter : true;
    return isTabMatch && matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  // Trigger Gemini AI Summary API
  const handleQueryAiSummary = async (projId: string) => {
    setAiLoading(true);
    setAiSummary(null);
    try {
      const response = await fetch("/api/v1/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projId })
      });
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error("AI summarization failed", err);
      setAiSummary("Unable to sync with Gemini server. Please configure your GEMINI_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger Gemini AI Risk/Workload Predictions API
  const handleQueryAiPredictions = async (projId: string) => {
    setAiLoading(true);
    setAiPredictions(null);
    try {
      const response = await fetch("/api/v1/ai/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projId })
      });
      const data = await response.json();
      setAiPredictions(data);
    } catch (err) {
      console.error("AI prediction failed", err);
      setAiPredictions({
        riskScore: 50,
        predictedDelayDays: 7,
        healthStatus: "Caution",
        suggestions: ["Offline fallback. Please check internet availability or API keys settings."]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Dynamic template and project replication states
  const [templates, setTemplates] = useState<any[]>(TEMPLATE_REPOS);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [duplicateTemplateForm, setDuplicateTemplateForm] = useState({
    name: "",
    description: "",
    projectType: "Infrastructure",
    category: "Software Development"
  });
  const [duplicateLoading, setDuplicateLoading] = useState(false);

  // Starting a new project from an existing project's structure states
  const [sourceProjectId, setSourceProjectId] = useState("");
  const [sourceProjectStructure, setSourceProjectStructure] = useState<any | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);

  const loadTemplates = async () => {
    try {
      const res = await fetch("/api/v1/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [projects]);

  const handleSourceProjectChange = async (projId: string) => {
    setSourceProjectId(projId);
    if (!projId) {
      setSourceProjectStructure(null);
      return;
    }
    setSourceLoading(true);
    try {
      const proj = projects.find(p => p.id === projId);
      if (!proj) return;

      const [milesRes, tasksRes, docsRes] = await Promise.all([
        fetch(`/api/v1/projects/${projId}/milestones`),
        fetch(`/api/v1/projects/${projId}/tasks`),
        fetch(`/api/v1/projects/${projId}/documents`)
      ]);
      const milestones = await milesRes.json();
      const tasks = await tasksRes.json();
      const documents = await docsRes.json();

      const folders = Array.from(new Set(documents.map((d: any) => d.folderName).filter(Boolean))) as string[];

      const mappedTemplate = {
        id: `project-${projId}`,
        name: `Structure of ${proj.name}`,
        description: proj.description || "Seeding from existing project structure.",
        projectType: proj.projectType || "Software",
        category: proj.category || "Development",
        defaultName: `New ${proj.name}`,
        defaultCode: `CL-${proj.code}`,
        defaultTechStack: proj.techStack.join(", "),
        defaultTags: proj.tags.join(", "),
        colorLabel: proj.colorLabel || "#4f46e5",
        milestones: milestones.map((m: any) => {
          const daysOffset = Math.max(0, Math.round((new Date(m.targetDate).getTime() - new Date(proj.startDate).getTime()) / (1000 * 60 * 60 * 24)));
          return `${m.title} (+${daysOffset} days)`;
        }),
        tasks: tasks.map((t: any) => t.title),
        folders: folders.length > 0 ? folders : ["Requirements & Scopes", "Implementation Logs", "Review Documents"]
      };
      setSourceProjectStructure(mappedTemplate);
      
      // Auto-populate form fields for higher usability
      setNewProject(prev => ({
        ...prev,
        templateId: "", // Reset template selection
        name: `Copy of ${proj.name}`,
        code: `COPY-${proj.code}`,
        description: proj.description || "",
        projectType: proj.projectType,
        category: proj.category,
        colorLabel: proj.colorLabel,
        techStack: proj.techStack.join(", "),
        tags: proj.tags.join(", "),
        startDate: prev.startDate || new Date().toISOString().split("T")[0],
        targetEndDate: prev.targetEndDate || addDays(new Date().toISOString().split("T")[0], 120),
        estimatedBudget: proj.estimatedBudget.toString()
      }));
    } catch (err) {
      console.error("Failed to load source project structure", err);
    } finally {
      setSourceLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;
    setDuplicateLoading(true);
    try {
      const response = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceProjectId: selectedProj.id,
          name: duplicateTemplateForm.name,
          description: duplicateTemplateForm.description,
          projectType: duplicateTemplateForm.projectType,
          category: duplicateTemplateForm.category
        })
      });
      if (response.ok) {
        setShowTemplateModal(false);
        loadTemplates();
      }
    } catch (err) {
      console.error("Failed to duplicate as template", err);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSourceProjectId("");
    setSourceProjectStructure(null);
    if (!templateId) {
      setNewProject({
        ...newProject,
        templateId: "",
        name: "",
        code: "",
        description: "",
        projectType: "Infrastructure",
        category: "Software Development",
        colorLabel: "#4f46e5",
        techStack: "",
        tags: ""
      });
      return;
    }
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      setNewProject({
        ...newProject,
        templateId: templateId,
        name: tpl.defaultName,
        code: tpl.defaultCode,
        description: tpl.description,
        projectType: tpl.projectType,
        category: tpl.category,
        colorLabel: tpl.colorLabel,
        techStack: tpl.defaultTechStack,
        tags: tpl.defaultTags,
        startDate: newProject.startDate || new Date().toISOString().split("T")[0],
        targetEndDate: newProject.targetEndDate || addDays(new Date().toISOString().split("T")[0], 120),
        estimatedBudget: newProject.estimatedBudget || "100000"
      });
    }
  };

  // Submit New Project Form
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    onAddProject({
      ...newProject,
      techStack: newProject.techStack.split(",").map(s => s.trim()).filter(Boolean),
      tags: newProject.tags.split(",").map(s => s.trim()).filter(Boolean),
      sourceProjectId: sourceProjectId || undefined
    });

    // Reset Form
    setNewProject({
      name: "",
      code: "",
      description: "",
      projectType: "Infrastructure",
      category: "Software Development",
      priority: ProjectPriority.MEDIUM,
      clientName: "",
      startDate: "",
      targetEndDate: "",
      estimatedBudget: "",
      techStack: "",
      projectManagerId: "",
      teamMemberIds: [],
      colorLabel: "#4f46e5",
      tags: "",
      templateId: ""
    });
    setSourceProjectId("");
    setSourceProjectStructure(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="projects-view-container">
      {/* Search and Filters Hub */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active vs Archived Sub-tabs */}
          <div className="flex border-b border-slate-100 gap-4 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab("active"); setSelectedProjectId(null); }}
              className={`pb-2.5 px-1 transition ${activeTab === "active" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              Active Projects ({projects.filter(p => !p.isArchived).length})
            </button>
            <button
              onClick={() => { setActiveTab("archived"); setSelectedProjectId(null); }}
              className={`pb-2.5 px-1 transition ${activeTab === "archived" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              Archived Repository ({projects.filter(p => p.isArchived).length})
            </button>
            <button
              onClick={() => { setActiveTab("templates"); setSelectedProjectId(null); }}
              className={`pb-2.5 px-1 transition ${activeTab === "templates" ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-800"}`}
              id="templates-tab"
            >
              Project Templates ({TEMPLATE_REPOS.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            id="create-project-btn"
            className="flex items-center gap-1 bg-indigo-600 text-white rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>

        {/* Filter Selection Row */}
        {activeTab !== "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search code, name, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(ProjectStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                {Object.values(ProjectPriority).map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Software Development">Software Development</option>
                <option value="Outreach & Growth">Outreach & Growth</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Primary Layout: Left List, Right Details panel */}
      {activeTab === "templates" ? (
        <div className="space-y-6" id="templates-repository-view">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Layers className="h-64 w-64 text-white" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Master Blueprints
              </span>
              <h2 className="text-xl font-display font-bold tracking-tight">Project Template Repository</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standardize your organization's delivery pipelines with curated industry patterns. Launching a project from these templates pre-populates all critical milestones, schedules, assigned core tasks, and structural directory folders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATE_REPOS.map((tpl) => {
              const IconComp = tpl.id === "software-development" ? Code : tpl.id === "marketing-campaign" ? TrendingUp : GraduationCap;
              
              return (
                <div key={tpl.id} className="glass-card bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: tpl.colorLabel }}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-sm">{tpl.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{tpl.projectType} • {tpl.category}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.description}</p>

                    <div className="space-y-3.5 border-t border-slate-50 pt-3">
                      {/* Milestones Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Milestones</span>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {tpl.milestones.map((m, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 leading-normal">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Folder Structure Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document Folders</span>
                        <div className="flex flex-wrap gap-1">
                          {tpl.folders.map((f, i) => (
                            <span key={i} className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-medium px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                              <FolderOpen className="h-2.5 w-2.5 text-slate-400" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Pre-populates {tpl.tasks.length} tasks</span>
                    <button
                      onClick={() => {
                        // Pre-fill template details
                        setNewProject({
                          name: tpl.defaultName,
                          code: tpl.defaultCode,
                          description: tpl.description,
                          projectType: tpl.projectType,
                          category: tpl.category,
                          priority: ProjectPriority.MEDIUM,
                          clientName: "Internal Enterprise Growth",
                          startDate: new Date().toISOString().split("T")[0],
                          targetEndDate: addDays(new Date().toISOString().split("T")[0], 120),
                          estimatedBudget: "100000",
                          techStack: tpl.defaultTechStack,
                          projectManagerId: "",
                          teamMemberIds: [],
                          colorLabel: tpl.colorLabel,
                          tags: tpl.defaultTags,
                          templateId: tpl.id
                        });
                        setShowAddModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Deploy Blueprint
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="projects-workspace-grid">
        {/* Projects List Grid */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center border border-slate-100">
              <Archive className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No projects found</p>
              <p className="text-xs text-slate-400 mt-1">Adjust filters or create a new project to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(proj => {
                const manager = users.find(u => u.id === proj.projectManagerId);
                const healthColors = {
                  [ProjectHealth.HEALTHY]: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  [ProjectHealth.AT_RISK]: "bg-amber-50 text-amber-700 border-amber-100",
                  [ProjectHealth.CRITICAL]: "bg-rose-50 text-rose-700 border-rose-100"
                };

                return (
                  <div
                    key={proj.id}
                    onClick={() => { setSelectedProjectId(proj.id); setAiSummary(null); setAiPredictions(null); }}
                    className={`glass-card rounded-xl p-5 border shadow-xs transition hover:shadow-md cursor-pointer flex flex-col justify-between h-56 ${
                      selectedProjectId === proj.id ? "ring-2 ring-indigo-500 border-indigo-100" : "border-slate-100"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {proj.code}
                        </span>
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${healthColors[proj.health]}`}>
                          {proj.health}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-slate-950 text-sm leading-tight hover:text-indigo-600 transition truncate">
                          {proj.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {proj.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-50">
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500">
                          <span>Progress Rate</span>
                          <span>{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {manager?.photoUrl ? (
                            <img src={manager.photoUrl} alt={manager.name} className="h-5 w-5 rounded-full border border-slate-200" />
                          ) : (
                            <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {manager?.name.charAt(0) || "P"}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-600 font-medium truncate max-w-[100px]">{manager?.name}</span>
                        </div>
                        
                        <div className="text-[10px] font-mono text-slate-500 font-medium">
                          Due: {proj.targetEndDate}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Project Side Panel */}
        <div className="lg:col-span-1">
          {selectedProj ? (
            <div className="glass-card rounded-xl border border-indigo-100/60 shadow-md p-5 space-y-5 sticky top-6 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">{selectedProj.code}</span>
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{selectedProj.name}</h3>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setDuplicateTemplateForm({
                        name: `${selectedProj.name} Blueprint`,
                        description: selectedProj.description || "",
                        projectType: selectedProj.projectType,
                        category: selectedProj.category
                      });
                      setShowTemplateModal(true);
                    }}
                    title="Duplicate Project as Template Blueprint"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                  {selectedProj.isArchived ? (
                    <button
                      onClick={() => onRestoreProject(selectedProj.id)}
                      title="Restore Project"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchiveProject(selectedProj.id)}
                      title="Archive Project"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* General details list */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-slate-700 leading-snug">
                <div>
                  <span className="text-slate-400 block font-medium">Client Account</span>
                  <span className="font-semibold text-slate-900">{selectedProj.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Priority</span>
                  <span className="font-semibold text-slate-900">{selectedProj.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Starts Date</span>
                  <span className="font-semibold text-slate-900">{selectedProj.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Timeline Due</span>
                  <span className="font-semibold text-slate-900">{selectedProj.targetEndDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Est. Budget</span>
                  <span className="font-semibold text-slate-900">${selectedProj.estimatedBudget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Actual Cost</span>
                  <span className="font-semibold text-slate-900">${selectedProj.actualBudget.toLocaleString()}</span>
                </div>
              </div>

              {/* Technology Stack Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">Technology Stack</span>
                <div className="flex flex-wrap gap-1">
                  {selectedProj.techStack.length === 0 ? (
                    <span className="text-xs text-slate-400 font-sans">No technologies logged</span>
                  ) : (
                    selectedProj.techStack.map(tech => (
                      <span key={tech} className="bg-indigo-50/70 border border-indigo-100 text-indigo-700 text-[9px] font-semibold px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                        <Cpu className="h-2.5 w-2.5" />
                        {tech}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* AI Copilot Intelligence Centre */}
              <div className="bg-gradient-to-br from-indigo-50/50 via-indigo-50/80 to-purple-50/60 rounded-xl p-4 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 font-display">
                    <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                    Gemini PM Copilot
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleQueryAiSummary(selectedProj.id)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition shadow-xs flex items-center gap-0.5 cursor-pointer"
                      disabled={aiLoading}
                    >
                      Brief Summary
                    </button>
                    <button
                      onClick={() => handleQueryAiPredictions(selectedProj.id)}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition shadow-xs flex items-center gap-0.5 cursor-pointer"
                      disabled={aiLoading}
                    >
                      Predict Delays
                    </button>
                  </div>
                </div>

                {aiLoading && (
                  <div className="space-y-1.5 py-2">
                    <div className="h-3 bg-indigo-200/50 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-indigo-200/50 rounded animate-pulse w-5/6"></div>
                    <div className="h-3 bg-indigo-200/50 rounded animate-pulse w-4/5"></div>
                    <span className="text-[9px] text-indigo-500 font-medium block animate-pulse text-center">Consulting Gemini Principal Models...</span>
                  </div>
                )}

                {/* Markdown summary display */}
                {aiSummary && (
                  <div className="bg-white rounded-lg p-3 text-[11px] text-slate-700 leading-relaxed border border-indigo-100 max-h-56 overflow-y-auto space-y-1 whitespace-pre-wrap font-sans">
                    {aiSummary}
                  </div>
                )}

                {/* Delay & workload suggestions display */}
                {aiPredictions && (
                  <div className="space-y-2 text-[11px]">
                    <div className="grid grid-cols-3 gap-2 text-center bg-white p-2 rounded-lg border border-indigo-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Risk Score</span>
                        <span className={`text-sm font-bold block ${aiPredictions.riskScore > 60 ? "text-rose-600" : aiPredictions.riskScore > 30 ? "text-amber-500" : "text-emerald-600"}`}>
                          {aiPredictions.riskScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Est. Delay</span>
                        <span className="text-sm font-bold text-slate-900 block">+{aiPredictions.predictedDelayDays}d</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Model Verdict</span>
                        <span className="text-sm font-bold text-indigo-700 block">{aiPredictions.healthStatus}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100 space-y-1">
                      <span className="font-semibold text-slate-800 block">Workload Refinements</span>
                      <ul className="list-disc pl-3 text-[10px] text-slate-600 space-y-1">
                        {aiPredictions.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200">
              Select a project from the portfolio list to review tech stacks, team workloads, and query Gemini AI reports.
            </div>
          )}
        </div>
      </div>
      )}

      {/* NEW PROJECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-project-modal">
          <div className={`bg-white rounded-xl shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 transition-all duration-300 ${(newProject.templateId || sourceProjectId) ? "max-w-5xl" : "max-w-lg"}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">New Portfolio Entry</h3>
              <button onClick={() => { setShowAddModal(false); setSourceProjectId(""); setSourceProjectStructure(null); }} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="text-xs">
              <div className={(newProject.templateId || sourceProjectId) ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" : "space-y-3.5"}>
                {/* Form fields column */}
                <div className={(newProject.templateId || sourceProjectId) ? "lg:col-span-6 space-y-3.5" : "space-y-3.5"}>
                  {/* Template Blueprint selection */}
                  <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>Project Blueprint / Template</span>
                    </div>
                    <p className="text-[10px] text-indigo-700/85">
                      Select a pre-configured template pattern to instantly auto-populate industry standard milestones, assigned tasks, and documentation folder paths.
                    </p>
                    <select
                      className="w-full bg-white border border-indigo-200 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
                      value={newProject.templateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                    >
                      <option value="">None (Custom / Blank Project)</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>

                    <div className="pt-2 border-t border-indigo-100/40 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-950 font-semibold">
                        <Layers className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-[10px]">OR Replicate Structure from Existing Project</span>
                      </div>
                      <select
                        className="w-full bg-white border border-indigo-200 rounded px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
                        value={sourceProjectId}
                        onChange={(e) => handleSourceProjectChange(e.target.value)}
                        disabled={!!newProject.templateId}
                      >
                        <option value="">None (Don't Replicate a Project)</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name} ({proj.code})
                          </option>
                        ))}
                      </select>
                      {sourceLoading && (
                        <p className="text-[9px] text-indigo-600 animate-pulse font-medium">Replicating tasks and milestones...</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Project Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Phoenix CRM Integration"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Code Identifier</label>
                      <input
                        type="text"
                        placeholder="PHX-CRM"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.code}
                        onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Brief Description</label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                      placeholder="Summarize objectives, goals, and stakeholders..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Client Account Name</label>
                      <input
                        type="text"
                        placeholder="Internal Enterprise Growth"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.clientName}
                        onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Priority Level</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.priority}
                        onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as ProjectPriority })}
                      >
                        {Object.values(ProjectPriority).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Starts Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Timeline Due</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.targetEndDate}
                        onChange={(e) => setNewProject({ ...newProject, targetEndDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Estimated Budget ($ USD)</label>
                      <input
                        type="number"
                        placeholder="85000"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={newProject.estimatedBudget}
                        onChange={(e) => setNewProject({ ...newProject, estimatedBudget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Color Theme Code</label>
                      <input
                        type="color"
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                        value={newProject.colorLabel}
                        onChange={(e) => setNewProject({ ...newProject, colorLabel: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, SQLite, Node"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newProject.techStack}
                      onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Assign Project Manager</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newProject.projectManagerId}
                      onChange={(e) => setNewProject({ ...newProject, projectManagerId: e.target.value })}
                    >
                      <option value="">Choose Manager...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Template Preview Column */}
                {(newProject.templateId || sourceProjectStructure) && (
                  <div className="lg:col-span-6 flex flex-col justify-between h-full min-h-[450px]">
                    <TemplatePreview 
                      templateId={newProject.templateId || undefined} 
                      template={sourceProjectStructure || undefined} 
                      startDate={newProject.startDate} 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-4 py-2 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition shadow-xs cursor-pointer"
                >
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DUPLICATE AS TEMPLATE MODAL */}
      {showTemplateModal && selectedProj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="duplicate-template-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-slate-950 text-base">Duplicate as Blueprint Template</h3>
                <p className="text-[10px] text-slate-500">Converts milestones, tasks, and folders of '{selectedProj.name}' into an reusable pattern.</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Template Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  value={duplicateTemplateForm.name}
                  onChange={(e) => setDuplicateTemplateForm({ ...duplicateTemplateForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Brief Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none font-medium"
                  value={duplicateTemplateForm.description}
                  onChange={(e) => setDuplicateTemplateForm({ ...duplicateTemplateForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Project Type</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={duplicateTemplateForm.projectType}
                    onChange={(e) => setDuplicateTemplateForm({ ...duplicateTemplateForm, projectType: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Category</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={duplicateTemplateForm.category}
                    onChange={(e) => setDuplicateTemplateForm({ ...duplicateTemplateForm, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-4 py-2 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicateLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded px-4 py-2 font-semibold transition shadow-xs cursor-pointer text-xs font-bold"
                >
                  {duplicateLoading ? "Creating Blueprint..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
