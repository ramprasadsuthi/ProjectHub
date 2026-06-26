import React, { useState } from "react";
import { Project, Risk, Issue, User } from "../types";
import { 
  ShieldAlert, Bug, Plus, Search, Filter, AlertTriangle, 
  CheckCircle, Play, FileText, ArrowRight, Activity, ChevronRight
} from "lucide-react";

interface RiskIssueProps {
  projects: Project[];
  risks: Risk[];
  issues: Issue[];
  users: User[];
  onAddRisk: (riskData: any) => void;
  onUpdateRisk: (riskId: string, updatedFields: any) => void;
  onAddIssue: (issueData: any) => void;
  onUpdateIssue: (issueId: string, updatedFields: any) => void;
}

export default function RiskIssueView({
  projects, risks, issues, users, onAddRisk, onUpdateRisk, onAddIssue, onUpdateIssue
}: RiskIssueProps) {
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");
  const [subTab, setSubTab] = useState<"risks" | "issues">("risks");

  // Form toggles
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [newRisk, setNewRisk] = useState({
    name: "",
    description: "",
    probability: "Medium" as "Low" | "Medium" | "High",
    impact: "Medium" as "Low" | "Medium" | "High",
    ownerId: "",
    mitigationPlan: ""
  });

  const [newIssue, setNewIssue] = useState({
    summary: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    severity: "Major" as "Minor" | "Major" | "Critical" | "Blocker",
    assignedToId: ""
  });

  const projectRisks = risks.filter(r => r.projectId === activeProjectId);
  const projectIssues = issues.filter(i => i.projectId === activeProjectId);

  const handleSubmitRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRisk.name) return;

    onAddRisk({ ...newRisk, projectId: activeProjectId });
    setNewRisk({ name: "", description: "", probability: "Medium", impact: "Medium", ownerId: "", mitigationPlan: "" });
    setShowRiskModal(false);
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.summary) return;

    onAddIssue({ ...newIssue, projectId: activeProjectId });
    setNewIssue({ summary: "", description: "", priority: "Medium", severity: "Major", assignedToId: "" });
    setShowIssueModal(false);
  };

  return (
    <div className="space-y-6" id="risk-issue-module-container">
      {/* Top selection row */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Folder:</label>
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

        {/* Sub tabs switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-slate-600 text-xs font-semibold">
          <button
            onClick={() => setSubTab("risks")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${subTab === "risks" ? "bg-white text-indigo-700 font-bold shadow-xs" : "hover:text-slate-900"}`}
          >
            <ShieldAlert className="h-4 w-4" />
            Risk Register ({projectRisks.length})
          </button>
          <button
            onClick={() => setSubTab("issues")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${subTab === "issues" ? "bg-white text-indigo-700 font-bold shadow-xs" : "hover:text-slate-900"}`}
          >
            <Bug className="h-4 w-4" />
            Issue Tracker ({projectIssues.length})
          </button>
        </div>
      </div>

      {/* RISKS VIEW */}
      {subTab === "risks" && (
        <div className="space-y-4" id="risk-register-content">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Relational Risk Register</span>
              <span className="text-[10px] text-slate-400">Review probability / impact analysis matrices.</span>
            </div>
            <button
              onClick={() => setShowRiskModal(true)}
              className="flex items-center gap-1 bg-indigo-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Risk
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectRisks.length === 0 ? (
              <div className="md:col-span-2 glass-card rounded-xl p-12 text-center border text-slate-400 text-xs">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No project risks logged. Clean portfolio health!
              </div>
            ) : (
              projectRisks.map(r => {
                const owner = users.find(u => u.id === r.ownerId);
                const probColor = r.probability === "High" ? "text-rose-600 bg-rose-50 border-rose-100" : "text-amber-600 bg-amber-50 border-amber-100";
                const impactColor = r.impact === "High" ? "text-rose-600 bg-rose-50 border-rose-100" : "text-amber-600 bg-amber-50 border-amber-100";

                return (
                  <div key={r.id} className="glass-card rounded-xl p-5 border border-slate-100 hover:shadow-md transition flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-slate-950 text-sm leading-tight">{r.name}</h4>
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase ${
                          r.status === "Open" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600"
                        }`}>{r.status}</span>
                      </div>
                      
                      <p className="text-xs text-slate-500 leading-normal">{r.description}</p>
                    </div>

                    <div className="space-y-3 border-t pt-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                        <span className="text-slate-400 block">Probability: <span className={`px-1.5 py-0.5 border rounded ${probColor}`}>{r.probability}</span></span>
                        <span className="text-slate-400 block">Impact: <span className={`px-1.5 py-0.5 border rounded ${impactColor}`}>{r.impact}</span></span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 block">Mitigation Plan:</span>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{r.mitigationPlan || "No mitigation mapped."}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400">
                        <span>Review Date: {r.reviewDate}</span>
                        <div className="flex gap-2">
                          {r.status === "Open" && (
                            <button
                              onClick={() => onUpdateRisk(r.id, { status: "Mitigated" })}
                              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                            >
                              ✓ Mark Mitigated
                            </button>
                          )}
                          <div className="flex items-center gap-1.5">
                            {owner?.photoUrl && <img src={owner.photoUrl} className="h-4.5 w-4.5 rounded-full border" />}
                            <span className="font-medium text-slate-600">{owner?.name.split(" ")[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ISSUES VIEW */}
      {subTab === "issues" && (
        <div className="space-y-4" id="issue-tracker-content">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">Issue Ticketing Tracker</span>
              <span className="text-[10px] text-slate-400">Log software bugs, failing tests, or dependency blocks.</span>
            </div>
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-1 bg-indigo-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Issue
            </button>
          </div>

          <div className="glass-card rounded-xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b font-bold">
                    <th className="p-3">ID</th>
                    <th className="p-3">Summary</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {projectIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No issues or bugs registered! Stable deploy pipeline.</td>
                    </tr>
                  ) : (
                    projectIssues.map(i => {
                      const assignee = users.find(u => u.id === i.assignedToId);
                      return (
                        <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-semibold text-slate-400">{i.id.split("-")[1] || i.id}</td>
                          <td className="p-3 font-semibold text-slate-950 truncate max-w-[200px]" title={i.description}>
                            {i.summary}
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              i.priority === "Critical" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                            }`}>{i.priority}</span>
                          </td>
                          <td className="p-3 font-medium">{i.severity}</td>
                          <td className="p-3 flex items-center gap-1.5">
                            {assignee?.photoUrl && <img src={assignee.photoUrl} className="h-4.5 w-4.5 rounded-full" />}
                            <span>{assignee?.name || "Unassigned"}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              i.status === "Resolved" || i.status === "Closed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600"
                            }`}>{i.status}</span>
                          </td>
                          <td className="p-3 text-right">
                            {i.status === "Open" && (
                              <button
                                onClick={() => {
                                  const resolution = prompt("Enter resolution plan:");
                                  const rootCause = prompt("Enter root cause:");
                                  if (resolution) onUpdateIssue(i.id, { status: "Resolved", resolution, rootCause });
                                }}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-emerald-700 transition cursor-pointer"
                              >
                                Resolve
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
        </div>
      )}

      {/* NEW RISK MODAL */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-risk-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">New Risk Map Entry</h3>
              <button onClick={() => setShowRiskModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitRisk} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Risk Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Third-party service API latency"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newRisk.name}
                  onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Description / Consequences</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  placeholder="Describe failure triggers and consequence details..."
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Probability</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newRisk.probability}
                    onChange={(e) => setNewRisk({ ...newRisk, probability: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Impact Level</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Assigned Risk Owner</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newRisk.ownerId}
                  onChange={(e) => setNewRisk({ ...newRisk, ownerId: e.target.value })}
                >
                  <option value="">Assign Owner...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Mitigation & Action Plans</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  placeholder="Formulate fallback strategies and redundant server tasks..."
                  value={newRisk.mitigationPlan}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigationPlan: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-4 py-2 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition cursor-pointer"
                >
                  Log Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW ISSUE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-issue-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">Create Issue Ticket</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Issue Title / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="Container crashes on docker compose dry-run"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newIssue.summary}
                  onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Bug Description / Steps to reproduce</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                  placeholder="Paste stack traces or layout fail steps here..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Priority</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Severity Level</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newIssue.severity}
                    onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value as any })}
                  >
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                    <option value="Blocker">Blocker</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Assign Ticket Developer</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newIssue.assignedToId}
                  onChange={(e) => setNewIssue({ ...newIssue, assignedToId: e.target.value })}
                >
                  <option value="">Assign Dev...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.designation})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-4 py-2 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition cursor-pointer"
                >
                  Generate Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
