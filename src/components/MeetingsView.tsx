import React, { useState } from "react";
import { Project, Meeting, User } from "../types";
import { 
  Video, Calendar, PlayCircle, Users, CheckSquare, Plus, 
  Clock, FileText, ChevronRight, CheckSquare2
} from "lucide-react";

interface MeetingsProps {
  projects: Project[];
  meetings: Meeting[];
  users: User[];
  onAddMeeting: (meetingData: any) => void;
  onUpdateMeeting: (meetingId: string, updatedFields: any) => void;
}

export default function MeetingsView({
  projects, meetings, users, onAddMeeting, onUpdateMeeting
}: MeetingsProps) {
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    agenda: "",
    participants: [] as string[],
    dateTime: "",
    nextMeetingDateTime: "",
    recordingLink: ""
  });

  const [momInput, setMomInput] = useState("");
  const [actionItemInput, setActionItemInput] = useState("");

  const projectMeetings = meetings.filter(m => m.projectId === activeProjectId);
  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title) return;

    onAddMeeting({ ...newMeeting, projectId: activeProjectId });
    setNewMeeting({ title: "", agenda: "", participants: [], dateTime: "", nextMeetingDateTime: "", recordingLink: "" });
    setShowAddModal(false);
  };

  const handleSaveMom = () => {
    if (!selectedMeetingId || !momInput.trim()) return;
    onUpdateMeeting(selectedMeetingId, { mom: momInput });
    setMomInput("");
  };

  const handleAddActionItem = () => {
    if (!selectedMeeting || !actionItemInput.trim()) return;
    const newItem = {
      id: `act-${Date.now()}`,
      text: actionItemInput,
      assignee: users[0]?.name || "Team Member",
      done: false
    };
    onUpdateMeeting(selectedMeeting.id, {
      actionItems: [...selectedMeeting.actionItems, newItem]
    });
    setActionItemInput("");
  };

  const handleToggleActionItem = (itemIdx: number) => {
    if (!selectedMeeting) return;
    const items = [...selectedMeeting.actionItems];
    items[itemIdx].done = !items[itemIdx].done;
    onUpdateMeeting(selectedMeeting.id, { actionItems: items });
  };

  return (
    <div className="space-y-6" id="meetings-view-container">
      {/* Top selector */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Focus:</label>
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={activeProjectId}
            onChange={(e) => { setActiveProjectId(e.target.value); setSelectedMeetingId(null); }}
          >
            {projects.filter(p => !p.isArchived).map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-indigo-600 text-white rounded px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Schedule Scrum
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="meetings-workspace-grid">
        {/* Left listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">Meetings & Scrum timelines</span>
            <span className="text-[10px] text-slate-400">Sync status updates, product design, and architectural checkins.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectMeetings.length === 0 ? (
              <div className="md:col-span-2 glass-card rounded-xl p-12 text-center text-slate-400 text-xs border border-slate-100">
                <Video className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No meetings scheduled for this week.
              </div>
            ) : (
              projectMeetings.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`glass-card rounded-xl p-5 border shadow-xs transition hover:shadow-md cursor-pointer flex flex-col justify-between h-48 ${
                    selectedMeetingId === m.id ? "ring-2 ring-indigo-500 border-indigo-100" : "border-slate-100"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                        Sync Scrum
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(m.dateTime).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-slate-950 text-sm truncate leading-tight hover:text-indigo-600 transition">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Agenda: {m.agenda || "No agenda mapped."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>{m.participants.length} Active Participants</span>
                    </div>
                    <span>{new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-1">
          {selectedMeeting ? (
            <div className="glass-card rounded-xl p-5 border border-slate-200 shadow-md space-y-5 bg-slate-50/50 sticky top-6">
              <div className="border-b pb-3">
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Meeting Workspace</span>
                <h4 className="font-display font-bold text-slate-900 text-sm leading-tight">{selectedMeeting.title}</h4>
                <span className="text-[10px] text-slate-500 mt-1 block">Scheduled: {new Date(selectedMeeting.dateTime).toLocaleString()}</span>
              </div>

              {/* Record Links */}
              {selectedMeeting.recordingLink ? (
                <a
                  href={selectedMeeting.recordingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="h-4.5 w-4.5" />
                    Access Scrum Recording link
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : (
                <div className="text-[10px] text-slate-400 italic">No meeting recording available. Click schedule to configure links.</div>
              )}

              {/* Minutes of Meeting logs */}
              <div className="space-y-2 border-t pt-3">
                <span className="text-xs font-bold text-slate-800 block">Minutes of Meeting (MOM)</span>
                {selectedMeeting.mom ? (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100 leading-relaxed font-sans">{selectedMeeting.mom}</p>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add key summary decisions, updates, and blockers discussed..."
                      className="w-full bg-white border rounded p-2 text-xs text-slate-700 focus:outline-none"
                      value={momInput}
                      onChange={(e) => setMomInput(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handleSaveMom}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold px-3 py-1.5 transition cursor-pointer"
                    >
                      Save Minutes
                    </button>
                  </div>
                )}
              </div>

              {/* Action items checklists */}
              <div className="space-y-2.5 border-t pt-3">
                <span className="text-xs font-bold text-slate-800 block">Assigned Action Items</span>
                <div className="space-y-1.5 text-xs">
                  {selectedMeeting.actionItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-2 border border-slate-100 rounded">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleActionItem(idx)}>
                          {item.done ? <CheckSquare2 className="h-4 w-4 text-indigo-600" /> : <div className="h-4 w-4 rounded-sm border border-slate-300"></div>}
                        </button>
                        <span className={`text-[11px] ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>{item.text}</span>
                      </div>
                      <span className="text-[9px] bg-slate-50 border px-1.5 py-0.5 rounded text-slate-500 font-medium">{item.assignee.split(" ")[0]}</span>
                    </div>
                  ))}

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="New action item..."
                      className="bg-white border rounded px-2 py-1 text-[11px] w-full focus:outline-none"
                      value={actionItemInput}
                      onChange={(e) => setActionItemInput(e.target.value)}
                    />
                    <button
                      onClick={handleAddActionItem}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold px-3 py-1 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200">
              Select a meeting timeline card to record minutes, schedule next followups, and complete assignable action checklists.
            </div>
          )}
        </div>
      </div>

      {/* NEW MEETING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-meeting-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">Schedule Project Sync</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Meeting Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="Phoenix API Schema Audit"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Agenda Outline</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  placeholder="Identify core decisions and review Docker configs..."
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Meeting Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newMeeting.dateTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, dateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Next Followup DateTime</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newMeeting.nextMeetingDateTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, nextMeetingDateTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Video/Recording Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/meetingid"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newMeeting.recordingLink}
                  onChange={(e) => setNewMeeting({ ...newMeeting, recordingLink: e.target.value })}
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
                  Schedule Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
