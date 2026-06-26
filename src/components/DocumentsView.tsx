import React, { useState, useRef } from "react";
import { DocumentFile, Project } from "../types";
import { 
  FileText, FolderOpen, UploadCloud, Download, Plus, Trash2, 
  Search, ShieldAlert, Folder, Tag, AlertCircle, Eye, Sparkles
} from "lucide-react";

interface DocumentsProps {
  projects: Project[];
  documents: DocumentFile[];
  onUploadDoc: (docData: any) => void;
}

export default function DocumentsView({ projects, documents, onUploadDoc }: DocumentsProps) {
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("All");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectDocs = documents.filter(d => d.projectId === activeProjectId);

  // Extract unique folders
  const folders = ["All", ...Array.from(new Set(projectDocs.map(d => d.folderName || "Uploads").filter(Boolean)))];

  // Filters
  const filteredDocs = projectDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === "All" || doc.folderName === activeFolder;
    return matchesSearch && matchesFolder;
  });

  // Simulated Drag & Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;
    
    const ext = file.name.split(".").pop() || "bin";

    onUploadDoc({
      projectId: activeProjectId,
      name: file.name,
      size: sizeFormatted,
      type: ext,
      folderName: activeFolder === "All" ? "Uploads" : activeFolder
    });
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6" id="documents-view-container">
      {/* Top filter row */}
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

        {/* Global doc search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search documents by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="documents-workspace-grid">
        {/* Left Folders view */}
        <div className="lg:col-span-1 glass-card rounded-xl p-4 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-xs font-bold text-slate-800 block">Directory Folders</span>
            <button 
              onClick={() => {
                const fName = prompt("Enter new folder name:");
                if (fName) setActiveFolder(fName);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              + New
            </button>
          </div>

          <div className="space-y-1">
            {folders.map(f => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition ${
                  activeFolder === f ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-indigo-500" />
                  <span>{f}</span>
                </div>
                <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded-full text-slate-400">
                  {f === "All" ? projectDocs.length : projectDocs.filter(d => d.folderName === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right file list & Drag Drop Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* DRAG AND DROP UPLOAD ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerUploadClick}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 bg-slate-50/50 ${
              isDragging ? "border-indigo-500 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <UploadCloud className="h-10 w-10 text-slate-400" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Drag & Drop file to upload here</span>
              <span className="text-[10px] text-slate-400 block">Supports PDF, DOC, XLSX, JPG, ZIP (max 100MB)</span>
            </div>
            <button className="bg-indigo-600 text-white rounded text-[10px] font-bold px-3 py-1.5 transition hover:bg-indigo-700 cursor-pointer">
              Choose File Manual
            </button>
          </div>

          {/* Files List Table */}
          <div className="glass-card rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Files under '{activeFolder}' folder</span>
              <span className="text-[10px] text-slate-400">Version control tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-500 border-b font-bold text-[11px]">
                    <th className="p-3">File Name</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Uploaded At</th>
                    <th className="p-3">Version</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No documents logged in this directory folder.</td>
                    </tr>
                  ) : (
                    filteredDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2 max-w-[200px] truncate">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{doc.size}</td>
                        <td className="p-3">{doc.uploadedBy}</td>
                        <td className="p-3 text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                            v{doc.version}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => alert(`Reviewing PDF/Doc preview for ${doc.name}. Real file download is configured.`)}
                            title="Preview File"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition inline-block cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={doc.url}
                            download={doc.name}
                            title="Download"
                            className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition inline-block"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
