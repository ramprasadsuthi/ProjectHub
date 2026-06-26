import React, { useState } from "react";
import { Milestone, Project, User } from "../types";
import { 
  Calendar, Award, Flag, Users, HelpCircle, CheckCircle, 
  XCircle, Play, Plus, Clock, FileText, ChevronRight
} from "lucide-react";

interface MilestonesProps {
  projects: Project[];
  milestones: Milestone[];
  users: User[];
  onAddMilestone: (milestoneData: any) => void;
  onUpdateMilestone: (milestoneId: string, updatedFields: any) => void;
}

export default function MilestonesView({
  projects, milestones, users, onAddMilestone, onUpdateMilestone
}: MilestonesProps) {
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    startDate: "",
    targetDate: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    ownerId: "",
    deliverables: "",
    dependencies: [] as string[]
  });

  const projectMilestones = milestones.filter(m => m.projectId === activeProjectId);
  const activeProj = projects.find(p => p.id === activeProjectId);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title) return;

    onAddMilestone({
      ...newMilestone,
      projectId: activeProjectId,
      deliverables: newMilestone.deliverables.split(",").map(d => d.trim()).filter(Boolean)
    });

    setNewMilestone({
      title: "",
      description: "",
      startDate: "",
      targetDate: "",
      priority: "Medium",
      ownerId: "",
      deliverables: "",
      dependencies: []
    });
    setShowAddModal(false);
  };

  const handleUpdateStatus = (mId: string, status: any, progress: number) => {
    const fields: any = { status, progress };
    if (status === "Completed") {
      fields.completionDate = new Date().toISOString().split("T")[0];
    }
    onUpdateMilestone(mId, fields);
  };

  const handleApproveWorkflow = (mId: string, approvalStatus: "Approved" | "Rejected") => {
    onUpdateMilestone(mId, { approvalStatus });
  };

  return (
    <div className="space-y-6" id="milestones-view-container">
      {/* Top Selector row */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Focus:</label>
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
          >
            {projects.filter(p => !p.isArchived).map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      </div>

      {/* Milestones grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="milestones-grid-list">
        {projectMilestones.length === 0 ? (
          <div className="md:col-span-2 glass-card rounded-xl p-12 text-center border border-slate-100">
            <Flag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Milestones established</p>
            <p className="text-xs text-slate-400 mt-1">Milestones map core business delivery goals and project deadlines.</p>
          </div>
        ) : (
          projectMilestones.map(m => {
            const owner = users.find(u => u.id === m.ownerId);
            const statusBg: Record<string, string> = {
              "Pending": "bg-slate-100 text-slate-700",
              "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-100",
              "Completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
              "Delayed": "bg-rose-50 text-rose-700 border-rose-100"
            };

            const approvalBg: Record<string, string> = {
              "Draft": "bg-slate-50 text-slate-500",
              "Pending Approval": "bg-amber-50 text-amber-700 border-amber-100",
              "Approved": "bg-emerald-50 text-emerald-700 border-emerald-100",
              "Rejected": "bg-rose-50 text-rose-700 border-rose-100"
            };

            return (
              <div key={m.id} className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between hover:shadow-md transition space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-semibold text-indigo-600 block uppercase">Project Gate</span>
                      <h4 className="font-display font-bold text-slate-900 text-sm leading-tight">{m.title}</h4>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${statusBg[m.status]}`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
                </div>

                <div className="space-y-3.5 border-t border-slate-50 pt-3">
                  {/* Progress slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium text-slate-400">
                      <span>Gate Progress</span>
                      <span>{m.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={m.progress}
                      onChange={(e) => onUpdateMilestone(m.id, { progress: Number(e.target.value) })}
                    />
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px]">
                    <span className="font-bold text-slate-700 block">Deliverables checklist</span>
                    <ul className="space-y-1">
                      {m.deliverables.map((d, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status update Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(m.id, "In Progress", 25)}
                        className="bg-white border text-[10px] font-bold text-slate-700 hover:bg-slate-50 px-2 py-1 rounded transition flex items-center gap-0.5 cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(m.id, "Completed", 100)}
                        className="bg-indigo-600 text-[10px] font-bold text-white hover:bg-indigo-700 px-2.5 py-1 rounded transition flex items-center gap-0.5 cursor-pointer"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Complete
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {owner?.photoUrl ? (
                        <img src={owner.photoUrl} alt={owner.name} className="h-5 w-5 rounded-full border" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">O</span>
                      )}
                      <span className="text-[10px] font-medium text-slate-600">{owner?.name.split(" ")[0]}</span>
                    </div>
                  </div>

                  {/* Gatekeeper approval section */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">Approval Status:</span>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${approvalBg[m.approvalStatus]}`}>
                        {m.approvalStatus}
                      </span>
                    </div>

                    {m.approvalStatus === "Pending Approval" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveWorkflow(m.id, "Approved")}
                          className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveWorkflow(m.id, "Rejected")}
                          className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded hover:bg-rose-700 transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {m.approvalStatus === "Draft" && (
                      <button
                        onClick={() => onUpdateMilestone(m.id, { approvalStatus: "Pending Approval" })}
                        className="bg-white border text-[9px] font-bold text-slate-700 px-2 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                      >
                        Submit Approval
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW MILESTONE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-milestone-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">Create Project Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Phase 2 - Core Beta Sandbox Release"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Description / Deliverable Goals</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                  placeholder="Briefly describe what marks the completion of this milestone..."
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Starts Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newMilestone.startDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Target Gate Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newMilestone.targetDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Priority Weight</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newMilestone.priority}
                    onChange={(e) => setNewMilestone({ ...newMilestone, priority: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Milestone Owner</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newMilestone.ownerId}
                    onChange={(e) => setNewMilestone({ ...newMilestone, ownerId: e.target.value })}
                  >
                    <option value="">Assign Owner...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Specific Deliverables (comma separated)</label>
                <input
                  type="text"
                  placeholder="Draft API schemas, Complete stress testing"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={newMilestone.deliverables}
                  onChange={(e) => setNewMilestone({ ...newMilestone, deliverables: e.target.value })}
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
