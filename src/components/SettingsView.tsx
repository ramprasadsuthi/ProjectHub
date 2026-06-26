import React, { useState } from "react";
import { 
  Settings, Key, Shield, Layers, HelpCircle, Palette, 
  Globe, Info, RefreshCw, Eye, Sparkles
} from "lucide-react";

export default function SettingsView() {
  const [orgName, setOrgName] = useState("ProjectHub Enterprise Partners");
  const [orgDomain, setOrgDomain] = useState("enterprise.projecthub.com");
  const [timezone, setTimezone] = useState("UTC - 05:00 Eastern Time");
  const [themeAccent, setThemeAccent] = useState("#4f46e5");
  const [allowPublicInvites, setAllowPublicInvites] = useState(true);

  return (
    <div className="space-y-6" id="settings-view-container">
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-0.5">
        <span className="text-xs font-bold text-slate-800 block">Workspace Administration Console</span>
        <span className="text-[10px] text-slate-400">Configure global organizational roles, custom colors branding, and API key states.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column general preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* General settings card */}
          <div className="glass-card rounded-xl p-5 border border-slate-100 space-y-4">
            <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-indigo-600" />
              General Workspace Preferences
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Organization Brand Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">System Domain Account</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Default System Timezone</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC - 05:00 Eastern Time">UTC - 05:00 Eastern Time (US & Canada)</option>
                  <option value="UTC + 00:00 London">UTC + 00:00 London Time (GMT)</option>
                  <option value="UTC + 08:00 Singapore">UTC + 08:00 Singapore / Hong Kong (SGT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Organization Theme Color Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                    value={themeAccent}
                    onChange={(e) => setThemeAccent(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono focus:outline-none"
                    value={themeAccent}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs pt-2">
              <input
                type="checkbox"
                id="allow-public-invites"
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={allowPublicInvites}
                onChange={(e) => setAllowPublicInvites(e.target.checked)}
              />
              <label htmlFor="allow-public-invites" className="font-semibold text-slate-700">Allow team members to request invites externally</label>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button
                onClick={() => alert("Global organization settings saved successfully!")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold px-4 py-2 transition cursor-pointer"
              >
                Save Workspace Configurations
              </button>
            </div>
          </div>

          {/* Secure Integrations Guide panel */}
          <div className="glass-card rounded-xl p-5 border border-slate-100 space-y-4">
            <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-indigo-600" />
              API Integrations & AI Settings
            </h4>

            <p className="text-xs text-slate-500 leading-relaxed">
              ProjectHub Pro integrates directly with server-side AI providers to calculate critical deadlines and risk analysis metrics.
              Secrets and private API keys are kept entirely secure within our back-end environment.
            </p>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                  Gemini API Principal Models Integration
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                  Secure Server Secret Connected
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                We pull telemetry details from project milestone calendars and task checklists to send to standard Gemini APIs.
                This powers your portfolio summaries and delay prediction engines automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Right column system details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-xl p-5 border border-slate-100 space-y-4">
            <h4 className="font-display font-bold text-slate-950 text-sm flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-indigo-600" />
              Organizational Security Roles
            </h4>

            <div className="space-y-3 text-xs leading-normal">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="font-bold text-slate-800 block">Super Admin</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Full root control over platform accounts, database resets, and organizational memberships.</p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="font-bold text-slate-800 block">Organization Admin</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Control billing states, custom integration profiles, and timesheet approvals logs.</p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="font-bold text-slate-800 block">Project Manager</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage tasks allocations, sprint roadmap configurations, and milestones approvals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
