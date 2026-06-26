import React, { useState } from "react";
import { TEMPLATE_REPOS, TemplateMetadata } from "../data/templates";
import { 
  Calendar, CheckCircle2, FolderOpen, ListTodo, Layers, Clock, Sparkles, Tag, ChevronRight, FileText, Search
} from "lucide-react";

interface TemplatePreviewProps {
  templateId?: string;
  template?: any;
  startDate: string;
}

export default function TemplatePreview({ templateId, template: directTemplate, startDate }: TemplatePreviewProps) {
  const template = directTemplate || TEMPLATE_REPOS.find((t) => t.id === templateId);
  const [activeTab, setActiveTab] = useState<"milestones" | "tasks" | "folders">("milestones");
  const [taskSearch, setTaskSearch] = useState("");

  if (!template) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
        Select a template blueprint above to display a live interactive preview of milestones, tasks, and file storage folders.
      </div>
    );
  }

  // Date helper
  const calculateTargetDate = (dateStr: string, daysOffset: number): string => {
    try {
      const d = new Date(dateStr || new Date().toISOString().split("T")[0]);
      if (isNaN(d.getTime())) return "N/A";
      d.setDate(d.getDate() + daysOffset);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "N/A";
    }
  };

  // Extract offset number from template milestone string e.g., "Requirements & Scope Alignment (+14 days)"
  const parseMilestoneOffset = (mStr: string): { title: string; offset: number } => {
    const match = mStr.match(/(.+?)\s*\(\+(\d+)\s*days\)/);
    if (match) {
      return {
        title: match[1].trim(),
        offset: parseInt(match[2], 10),
      };
    }
    return { title: mStr, offset: 0 };
  };

  const parsedMilestones = template.milestones.map(m => parseMilestoneOffset(m));
  
  // Custom mock estimated hours for tasks or simple display
  const getTaskEstHours = (index: number) => {
    const hours = [16, 4, 24, 12, 32, 24, 16, 20, 8];
    return hours[index % hours.length];
  };

  const getTaskPriority = (index: number) => {
    const priorities = ["High", "Medium", "High", "High", "Critical", "Medium", "Medium", "High", "High"];
    return priorities[index % priorities.length];
  };

  const filteredTasks = template.tasks.filter(t => 
    t.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col h-full min-h-[420px] max-h-[580px] overflow-hidden justify-between shadow-xs" id="template-blueprint-preview">
      <div className="space-y-4 overflow-hidden flex flex-col flex-1">
        
        {/* Template Header Card */}
        <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider" style={{ backgroundColor: template.colorLabel }}>
                Blueprint Live Preview
              </span>
              <span className="bg-slate-200/70 text-slate-700 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-sm">
                {template.projectType}
              </span>
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">{template.name}</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">{template.description}</p>
          </div>
          <Sparkles className="h-5 w-5 animate-pulse" style={{ color: template.colorLabel }} />
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white border border-slate-100 rounded-lg p-2 shadow-xs">
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-wider block">Milestones</span>
            <span className="font-display font-bold text-slate-800 text-sm block">{template.milestones.length} Stages</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-2 shadow-xs">
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-wider block">Tasks Seeded</span>
            <span className="font-display font-bold text-slate-800 text-sm block">{template.tasks.length} Tasks</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-2 shadow-xs">
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-wider block">Directories</span>
            <span className="font-display font-bold text-slate-800 text-sm block">{template.folders.length} Folders</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200/50">
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`flex-1 pb-2 text-center text-[11px] font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === "milestones"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Milestones Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 pb-2 text-center text-[11px] font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === "tasks"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ListTodo className="h-3.5 w-3.5" />
            Tasks Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("folders")}
            className={`flex-1 pb-2 text-center text-[11px] font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === "folders"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Folders Tree
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 overflow-y-auto pr-1 text-slate-700 min-h-0">
          
          {/* MILESTONES TAB */}
          {activeTab === "milestones" && (
            <div className="space-y-4 py-2 relative pl-4 border-l border-slate-200 ml-2">
              {parsedMilestones.map((m, idx) => {
                const targetDate = calculateTargetDate(startDate, m.offset);
                return (
                  <div key={idx} className="relative group space-y-0.5">
                    {/* Circle timeline marker */}
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-white transition-colors duration-200" 
                         style={{ borderColor: template.colorLabel }} />
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">
                        {m.title}
                      </span>
                      <span className="text-[9px] font-mono font-semibold bg-white border border-slate-200/80 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                        Day +{m.offset} ({targetDate})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Pre-seeds initial deliverables & status checklists.
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-2 py-1">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter blueprint tasks..."
                  className="w-full bg-white border border-slate-200 rounded px-8 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-slate-400">No matching tasks in blueprint.</div>
                ) : (
                  filteredTasks.map((t, idx) => {
                    const est = getTaskEstHours(idx);
                    const prio = getTaskPriority(idx);
                    const isHigh = prio === "High" || prio === "Critical";
                    
                    return (
                      <div key={idx} className="bg-white border border-slate-100 p-2 rounded-lg flex items-start gap-2 shadow-2xs hover:border-slate-200 transition">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <span className="text-[10.5px] font-medium text-slate-700 leading-tight block">{t}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono px-1 py-0.2 rounded-sm ${isHigh ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-600"}`}>
                              {prio}
                            </span>
                            <span className="text-[8px] text-slate-400 flex items-center gap-0.5">
                              <Clock className="h-2 w-2" /> {est}h est.
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* FOLDERS TAB */}
          {activeTab === "folders" && (
            <div className="space-y-2 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Directory Layout</span>
              <div className="bg-white border border-slate-100 rounded-lg p-3 space-y-2 shadow-2xs">
                {template.folders.map((folder, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{folder}</span>
                    <ChevronRight className="h-3 w-3 text-slate-300 ml-auto" />
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                  <FileText className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span>Includes dynamic standard document templates.</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Preview Footer / Status Card */}
      <div className="mt-3 bg-indigo-50/50 border border-indigo-100/40 rounded-lg p-2.5 flex items-center gap-2 text-[10px] text-indigo-800 leading-normal shrink-0">
        <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
        <span>
          Click <strong>'Create Entry'</strong> below to instantly deploy these configured records to the portfolio.
        </span>
      </div>
    </div>
  );
}
