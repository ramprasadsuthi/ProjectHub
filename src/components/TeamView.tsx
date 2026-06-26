import React, { useState } from "react";
import { User } from "../types";
import { Users, Plus, Shield, Cpu, Mail, Phone, Calendar, Briefcase, Sparkles } from "lucide-react";

interface TeamProps {
  users: User[];
  onAddUser: (userData: any) => void;
}

export default function TeamView({ users, onAddUser }: TeamProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Team Member",
    designation: "Frontend Engineer",
    photoUrl: "",
    skills: ""
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;

    onAddUser({
      ...newUser,
      skills: newUser.skills.split(",").map(s => s.trim()).filter(Boolean)
    });

    setNewUser({ name: "", email: "", role: "Team Member", designation: "Frontend Engineer", photoUrl: "", skills: "" });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="team-module-container">
      {/* Top filter & action */}
      <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-800 block">Organization Roster</span>
          <span className="text-[10px] text-slate-400">Manage employee directories, designation titles, and technical skills matrices.</span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-indigo-600 text-white rounded px-3.5 py-2 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Onboard Member
        </button>
      </div>

      {/* Grid of employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="team-cards-grid">
        {users.map(u => (
          <div key={u.id} className="glass-card rounded-xl p-5 border border-slate-100 flex flex-col justify-between hover:shadow-md transition space-y-4">
            <div className="flex items-start gap-3.5">
              {u.photoUrl ? (
                <img src={u.photoUrl} alt={u.name} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                  {u.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <h4 className="font-display font-bold text-slate-950 text-sm leading-tight">{u.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Briefcase className="h-3 w-3 text-slate-400" />
                  <span>{u.designation}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span>{u.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-3 border-t border-slate-50">
              {/* Skills section */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Expertise Techs</span>
                <div className="flex flex-wrap gap-1">
                  {u.skills.map(s => (
                    <span key={s} className="bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer status / Role */}
              <div className="flex items-center justify-between text-[10px] font-medium pt-1 text-slate-500">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                  {u.role}
                </span>
                
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Allocation
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-user-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-slate-950 text-base">Onboard Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Finch"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@projecthub.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Platform Role</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Team Member">Team Member</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Organization Admin">Organization Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Designation Title</label>
                  <input
                    type="text"
                    placeholder="DevOps Lead Architect"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={newUser.photoUrl}
                  onChange={(e) => setNewUser({ ...newUser, photoUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Technical Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="AWS Cloud, Terraform, Docker, Python"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={newUser.skills}
                  onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
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
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
