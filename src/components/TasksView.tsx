import React, { useState } from "react";
import { 
  Project, Task, User, Milestone, TaskStatus, TaskPriority 
} from "../types";
import { 
  Trello, List, Calendar, Layers, Plus, 
  Clock, AlertCircle, MessageSquare, Paperclip, ChevronRight, 
  Trash2, Edit3, UserCheck, ShieldAlert, CheckSquare2, FileText, CheckCircle2, Circle
} from "lucide-react";

interface TasksViewProps {
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  users: User[];
  currentUserId: string;
  onAddTask: (taskData: any) => void;
  onUpdateTask: (taskId: string, updatedFields: any) => void;
  onAddComment: (taskId: string, commentText: string) => void;
}

export default function TasksView({
  projects, tasks, milestones, users, currentUserId, onAddTask, onUpdateTask, onAddComment
}: TasksViewProps) {
  
  // Active Project Selection
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");

  // Display View modes: kanban, list, gantt, calendar
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "gantt" | "calendar">("kanban");

  // Selected Task for Detail Drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // New Comment input
  const [commentInput, setCommentInput] = useState("");

  // Add Task Modal Toggle and state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    milestoneId: "",
    assignedToId: "",
    priority: TaskPriority.MEDIUM,
    severity: "Medium" as "Low" | "Medium" | "High" | "Critical",
    estimatedHours: 8,
    dueDate: "",
    labels: "",
    dependencies: [] as string[]
  });

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const projectMilestones = milestones.filter(m => m.projectId === activeProjectId);

  // Filter project-specific tasks
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // HTML5 Drag and drop handler for Kanban Columns
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onUpdateTask(taskId, { status: targetStatus });
    }
  };

  // Submit task comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTaskId) return;
    onAddComment(selectedTaskId, commentInput);
    setCommentInput("");
  };

  // Checkbox/Subtask status switchers
  const toggleChecklistItem = (task: Task, itemId: string) => {
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateTask(task.id, { checklist: updatedChecklist });
  };

  const addChecklistItem = (task: Task, text: string) => {
    if (!text.trim()) return;
    const newItem = { id: `c-${Date.now()}`, text, done: false };
    onUpdateTask(task.id, { checklist: [...task.checklist, newItem] });
  };

  const toggleSubtaskItem = (task: Task, subId: string) => {
    const updatedSubs = task.subtasks.map(s => 
      s.id === subId ? { ...s, done: !s.done } : s
    );
    onUpdateTask(task.id, { subtasks: updatedSubs });
  };

  const addSubtaskItem = (task: Task, title: string) => {
    if (!title.trim()) return;
    const newSub = { id: `s-${Date.now()}`, title, done: false };
    onUpdateTask(task.id, { subtasks: [...task.subtasks, newSub] });
  };

  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    onAddTask({
      ...newTask,
      projectId: activeProjectId,
      labels: newTask.labels.split(",").map(l => l.trim()).filter(Boolean)
    });

    setNewTask({
      title: "",
      description: "",
      milestoneId: "",
      assignedToId: "",
      priority: TaskPriority.MEDIUM,
      severity: "Medium",
      estimatedHours: 8,
      dueDate: "",
      labels: "",
      dependencies: []
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="tasks-module-container">
      {/* Top selection row */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Workspace:</label>
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={activeProjectId}
            onChange={(e) => { setActiveProjectId(e.target.value); setSelectedTaskId(null); }}
          >
            {projects.filter(p => !p.isArchived).map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>

        {/* View switcher & Quick Add */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg text-slate-600">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-semibold transition ${viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
              title="Kanban Board"
            >
              <Trello className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-semibold transition ${viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-semibold transition ${viewMode === "gantt" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
              title="Gantt Timeline"
            >
              <Clock className="h-3.5 w-3.5" />
              Gantt
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[11px] font-semibold transition ${viewMode === "calendar" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
              title="Calendar Deadlines"
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            id="quick-add-task"
            className="flex items-center gap-1 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* primary layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="tasks-content-grid">
        <div className="lg:col-span-3">
          
          {/* 1. KANBAN BOARD */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="kanban-columns">
              {(Object.values(TaskStatus) as TaskStatus[]).map(colStatus => {
                const colTasks = projectTasks.filter(t => t.status === colStatus);
                const statusLabels: Record<string, { bg: string, text: string, border: string }> = {
                  "To Do": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
                  "In Progress": { bg: "bg-indigo-50/50", text: "text-indigo-700", border: "border-indigo-100" },
                  "Review": { bg: "bg-purple-50/50", text: "text-purple-700", border: "border-purple-100" },
                  "Testing": { bg: "bg-blue-50/50", text: "text-blue-700", border: "border-blue-100" },
                  "Blocked": { bg: "bg-rose-50/50", text: "text-rose-700", border: "border-rose-100" },
                  "Completed": { bg: "bg-emerald-50/50", text: "text-emerald-700", border: "border-emerald-100" }
                };

                const labelConf = statusLabels[colStatus] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };

                return (
                  <div
                    key={colStatus}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, colStatus)}
                    className={`rounded-xl p-3 border ${labelConf.bg} ${labelConf.border} flex flex-col space-y-3 min-h-[450px]`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className={`text-[11px] font-bold ${labelConf.text}`}>{colStatus}</span>
                      <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded-full text-slate-500 font-medium">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-[500px]">
                      {colTasks.map(t => {
                        const assignee = users.find(u => u.id === t.assignedToId);
                        return (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onClick={() => setSelectedTaskId(t.id)}
                            className="bg-white rounded-lg p-3 border border-slate-100 hover:border-indigo-200 shadow-xs hover:shadow-sm cursor-pointer transition space-y-3"
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{t.title}</h4>
                              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
                              <div className="flex items-center gap-1">
                                {assignee?.photoUrl ? (
                                  <img src={assignee.photoUrl} alt={assignee.name} className="h-4.5 w-4.5 rounded-full" />
                                ) : (
                                  <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[8px]">
                                    {assignee?.name.charAt(0)}
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-600 truncate max-w-[60px]">{assignee?.name.split(" ")[0]}</span>
                              </div>

                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                                t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GRID / LIST VIEW */}
          {viewMode === "list" && (
            <div className="glass-card rounded-xl shadow-xs border border-slate-100 overflow-hidden" id="tasks-table-view">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                      <th className="p-3">Task ID</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Assigned To</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timeline Due</th>
                      <th className="p-3 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {projectTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">No tasks currently logged.</td>
                      </tr>
                    ) : (
                      projectTasks.map(t => {
                        const assignee = users.find(u => u.id === t.assignedToId);
                        return (
                          <tr
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="p-3 font-mono font-semibold text-indigo-600">{t.id.split("-")[1] || t.id}</td>
                            <td className="p-3 font-semibold text-slate-900 truncate max-w-[200px]">{t.title}</td>
                            <td className="p-3 flex items-center gap-2">
                              {assignee?.photoUrl && <img src={assignee.photoUrl} className="h-5 w-5 rounded-full" />}
                              <span>{assignee?.name || "Unassigned"}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                t.priority === TaskPriority.URGENT ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                              }`}>{t.priority}</span>
                            </td>
                            <td className="p-3">{t.severity}</td>
                            <td className="p-3">
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                {t.status}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-500">{t.dueDate}</td>
                            <td className="p-3 text-right font-mono font-medium text-slate-600">{t.estimatedHours}h</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INTERACTIVE GANTT TIMELINE */}
          {viewMode === "gantt" && (
            <div className="glass-card rounded-xl p-5 shadow-xs border border-slate-100 space-y-4" id="tasks-gantt-chart">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-semibold text-slate-800">Sprint Roadmap & Timelines</span>
                <span className="text-[10px] text-slate-400">Calculated dynamically based on milestone schedules</span>
              </div>

              <div className="space-y-4 overflow-x-auto">
                <div className="min-w-[600px] space-y-3 text-xs">
                  {/* Gantt Header months */}
                  <div className="grid grid-cols-12 gap-1 text-slate-500 font-bold border-b pb-1 text-center font-mono text-[10px]">
                    <div className="col-span-3 text-left">Task / Milestone</div>
                    <div className="col-span-3">Q1-Q2 (May-June)</div>
                    <div className="col-span-3">Q3 (July-August)</div>
                    <div className="col-span-3">Q4 (Sept-Oct)</div>
                  </div>

                  {projectMilestones.map(m => (
                    <div key={m.id} className="grid grid-cols-12 gap-1 items-center py-1 border-b border-slate-50">
                      <div className="col-span-3 font-bold text-indigo-950 truncate">{m.title}</div>
                      <div className="col-span-9 relative bg-slate-100 h-6 rounded overflow-hidden">
                        <div
                          className="absolute bg-indigo-500 text-white text-[9px] font-bold h-full flex items-center px-2 transition-all duration-300"
                          style={{
                            left: m.status === "Completed" ? "5%" : "15%",
                            width: `${Math.max(30, m.progress)}%`
                          }}
                        >
                          Milestone: {m.progress}%
                        </div>
                      </div>
                    </div>
                  ))}

                  {projectTasks.map(t => (
                    <div key={t.id} className="grid grid-cols-12 gap-1 items-center py-1 border-b border-slate-50">
                      <div className="col-span-3 text-slate-700 truncate pl-3">{t.title}</div>
                      <div className="col-span-9 relative bg-slate-50 h-5 rounded overflow-hidden">
                        <div
                          className={`absolute text-white text-[8px] font-semibold h-full flex items-center px-1.5 transition-all duration-300 ${
                            t.status === TaskStatus.COMPLETED ? "bg-emerald-500" : "bg-indigo-400"
                          }`}
                          style={{
                            left: t.status === TaskStatus.COMPLETED ? "10%" : "30%",
                            width: "40%"
                          }}
                        >
                          {t.status} ({t.estimatedHours}h)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. CALENDAR DEADLINES MATRIX */}
          {viewMode === "calendar" && (
            <div className="glass-card rounded-xl p-5 shadow-xs border border-slate-100 space-y-4" id="tasks-calendar-matrix">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-semibold text-slate-800">Sprint Deadlines Grid</span>
                <span className="text-[10px] font-mono text-indigo-600">June 2026</span>
              </div>

              {/* Grid represent dummy current month */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 border-b pb-1">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2 h-72">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = (i % 31) + 1;
                  const isDeadlined = dayNum === 10 || dayNum === 15 || dayNum === 20;
                  const targetTasks = isDeadlined 
                    ? projectTasks.filter(t => t.dueDate.includes(`-${dayNum < 10 ? "0" + dayNum : dayNum}`)) 
                    : [];

                  return (
                    <div key={i} className={`bg-slate-50 rounded p-1 border text-left flex flex-col justify-between overflow-hidden ${
                      isDeadlined ? "border-indigo-100 bg-indigo-50/20" : "border-slate-100"
                    }`}>
                      <span className="text-[10px] text-slate-400 font-bold">{dayNum}</span>
                      {targetTasks.map(t => (
                        <span
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className="bg-indigo-600 text-white text-[8px] font-medium p-0.5 rounded truncate block cursor-pointer"
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Task Details sidebar column */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="glass-card rounded-xl p-5 border border-slate-200/80 shadow-md space-y-5 sticky top-6 bg-slate-50/50">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Task Details</span>
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTaskId(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              {/* Status selectors */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Task Status</span>
                    <select
                      className="bg-white border rounded px-2 py-1 w-full text-[11px] font-semibold text-slate-800"
                      value={selectedTask.status}
                      onChange={(e) => onUpdateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
                    >
                      {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Priority</span>
                    <select
                      className="bg-white border rounded px-2 py-1 w-full text-[11px] font-semibold text-slate-800"
                      value={selectedTask.priority}
                      onChange={(e) => onUpdateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
                    >
                      {Object.values(TaskPriority).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Estimated Budget Hours</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedTask.estimatedHours} Hours</span>
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-2 border-t pt-3">
                <span className="text-xs font-bold text-slate-800 block">Deliverables Checklist</span>
                <div className="space-y-1.5">
                  {selectedTask.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <button onClick={() => toggleChecklistItem(selectedTask, item.id)}>
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300 hover:text-indigo-400" />
                        )}
                      </button>
                      <span className={`text-[11px] leading-snug ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}

                  {/* Add Checklist mini form */}
                  <input
                    type="text"
                    placeholder="+ New checklist step..."
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-[11px] text-slate-700 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addChecklistItem(selectedTask, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Subtasks details */}
              <div className="space-y-2 border-t pt-3">
                <span className="text-xs font-bold text-slate-800 block">Subtasks Workflow</span>
                <div className="space-y-1.5">
                  {selectedTask.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs">
                      <button onClick={() => toggleSubtaskItem(selectedTask, sub.id)}>
                        {sub.done ? (
                          <CheckSquare2 className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                      <span className={`text-[11px] ${sub.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {sub.title}
                      </span>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="+ New subtask item..."
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-[11px] text-slate-700 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSubtaskItem(selectedTask, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Threaded comments list */}
              <div className="space-y-3 border-t pt-3">
                <span className="text-xs font-bold text-slate-800 block">Comments Feed</span>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No notes logged. Log feedback below.</p>
                  ) : (
                    selectedTask.comments.map(c => (
                      <div key={c.id} className="bg-white p-2.5 rounded border border-slate-100 text-[10px] space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span className="font-bold text-slate-700">{c.userName}</span>
                          <span>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600 leading-normal">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Log comment..."
                    className="bg-white border rounded px-2 py-1 text-[11px] w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 text-white rounded px-3 py-1 text-[10px] font-bold cursor-pointer">Post</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200">
              Select a task from standard Boards or lists to interact with checklists, complete subtasks, or log direct project feedback.
            </div>
          )}
        </div>
      </div>

      {/* NEW TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-task-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">New Task Assignment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={submitAddTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Draft continuous delivery pipeline scripts"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  placeholder="Objectives and definition of done..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Target Milestone</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.milestoneId}
                    onChange={(e) => setNewTask({ ...newTask, milestoneId: e.target.value })}
                  >
                    <option value="">None (Backlog)</option>
                    {projectMilestones.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Assignee</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                  >
                    <option value="">Choose Assignee...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-1">
                  <label className="font-semibold text-slate-700 block">Est. Hours</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-700 block">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Priority</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                  >
                    {Object.values(TaskPriority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Severity</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newTask.severity}
                    onChange={(e) => setNewTask({ ...newTask, severity: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Labels (comma separated)</label>
                <input
                  type="text"
                  placeholder="Backend, Sprint-3, Hotfix"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newTask.labels}
                  onChange={(e) => setNewTask({ ...newTask, labels: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-4 py-2 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
