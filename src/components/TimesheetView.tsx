import React, { useState } from "react";
import { Project, Task, TimeLog, User } from "../types";
import { 
  Clock, Plus, Filter, Calendar, FileText, Download, CheckCircle, 
  XCircle, AlertCircle, TrendingUp, IndianRupee
} from "lucide-react";

interface TimesheetProps {
  projects: Project[];
  tasks: Task[];
  timesheets: TimeLog[];
  users: User[];
  onAddTimesheet: (timesheetData: any) => void;
  onApproveTimesheet: (logId: string) => void;
}

export default function TimesheetView({
  projects, tasks, timesheets, users, onAddTimesheet, onApproveTimesheet
}: TimesheetProps) {
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");
  const [billableFilter, setBillableFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newLog, setNewLog] = useState({
    taskId: "",
    hours: 8,
    date: new Date().toISOString().split("T")[0],
    description: "",
    isBillable: true
  });

  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const projectTimesheets = timesheets.filter(t => t.projectId === activeProjectId);

  // Filters
  const filteredLogs = projectTimesheets.filter(log => {
    if (billableFilter === "billable") return log.isBillable;
    if (billableFilter === "non-billable") return !log.isBillable;
    return true;
  });

  // Calculate stats
  const totalHours = projectTimesheets.reduce((acc, curr) => acc + curr.hours, 0);
  const billableHours = projectTimesheets.filter(t => t.isBillable).reduce((acc, curr) => acc + curr.hours, 0);
  const approvedHours = projectTimesheets.filter(t => t.status === "Approved").reduce((acc, curr) => acc + curr.hours, 0);

  const handleCreateTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.taskId) return;

    onAddTimesheet({
      ...newLog,
      projectId: activeProjectId
    });

    setNewLog({ taskId: "", hours: 8, date: new Date().toISOString().split("T")[0], description: "", isBillable: true });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="timesheet-module-container">
      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="timesheet-stats-cards">
        <div className="glass-card rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Logged Hours</span>
            <span className="text-xl font-bold text-slate-900 block">{totalHours} Hrs</span>
            <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Approved: {approvedHours} Hrs</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Billable Ratio</span>
            <span className="text-xl font-bold text-slate-900 block">
              {totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{billableHours} Billable Hrs</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Est. Resource Cost</span>
            <span className="text-xl font-bold text-slate-900 block">
              ₹{(totalHours * 6225).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Calculated at flat ₹6,225/hr average</span>
          </div>
        </div>
      </div>

      {/* Top selection row */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Focus:</label>
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
            >
              {projects.filter(p => !p.isArchived).map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              value={billableFilter}
              onChange={(e) => setBillableFilter(e.target.value)}
            >
              <option value="all">All Logs</option>
              <option value="billable">Billable</option>
              <option value="non-billable">Non-Billable</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-indigo-600 text-white rounded px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Log Hours
        </button>
      </div>

      {/* Timesheets List Table */}
      <div className="glass-card rounded-xl border border-slate-100 shadow-xs overflow-hidden" id="timesheets-table-content">
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800">Resource timesheet logs for current project</span>
          <button
            onClick={() => alert("Downloading formatted timesheet report in CSV/Excel. Direct PDF generation initialized.")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/30 text-slate-500 border-b font-bold">
                <th className="p-3">Resource</th>
                <th className="p-3">Date</th>
                <th className="p-3">Task Focus</th>
                <th className="p-3">Logged Description</th>
                <th className="p-3">Type</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No timesheet entries logged on this project.</td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const task = tasks.find(t => t.id === log.taskId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{log.userName}</td>
                      <td className="p-3 text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-3 font-medium text-indigo-700 truncate max-w-[150px]" title={task?.title}>
                        {task?.title || "General Sprint Task"}
                      </td>
                      <td className="p-3 text-slate-600 truncate max-w-[200px]" title={log.description}>
                        {log.description}
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.isBillable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{log.isBillable ? "Billable" : "Non-Billable"}</span>
                      </td>
                      <td className="p-3 font-mono font-bold">{log.hours} Hrs</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          log.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>{log.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        {log.status === "Pending" && (
                          <button
                            onClick={() => onApproveTimesheet(log.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                          >
                            ✓ Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW LOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-log-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">Log Resources Hours</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Select Task *</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={newLog.taskId}
                  onChange={(e) => setNewLog({ ...newLog, taskId: e.target.value })}
                >
                  <option value="">Choose task...</option>
                  {projectTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Hours Logged</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newLog.hours}
                    onChange={(e) => setNewLog({ ...newLog, hours: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Date Worked</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Work Description</label>
                <textarea
                  required
                  placeholder="Completed backend database indexing schemas and docker test dry-runs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none h-20 resize-none"
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-billable"
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  checked={newLog.isBillable}
                  onChange={(e) => setNewLog({ ...newLog, isBillable: e.target.checked })}
                />
                <label htmlFor="is-billable" className="font-semibold text-slate-700">This log is client billable</label>
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
                  Log Hours Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
