import { Upload, Download, FolderOpen, Plus, Save, Edit3, Eye, Shield } from 'lucide-react';

interface ToolbarProps {
  onImport: (file: File) => void;
  onExport: () => void;
  onCreateProject: () => void;
  onBrowseProjects: () => void;
  onSaveProject: () => void;
  onEditMetadata: () => void;
  onTogglePreview: () => void;
  onOpenAdmin: () => void;
  hasContent: boolean;
  currentProjectName: string | null;
  showPreview: boolean;
}

export default function Toolbar({
  onImport,
  onExport,
  onCreateProject,
  onBrowseProjects,
  onSaveProject,
  onEditMetadata,
  onTogglePreview,
  onOpenAdmin,
  hasContent,
  currentProjectName,
  showPreview
}: ToolbarProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
      <h1 className="text-xl font-bold">TextureCat</h1>

      {currentProjectName && (
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm">|</span>
          <span className="text-sm">{currentProjectName}</span>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={onOpenAdmin}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        title="Admin Panel"
      >
        <Shield size={18} />
        Admin
      </button>

      {hasContent && (
        <>
          <button
            onClick={onEditMetadata}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Edit project settings"
          >
            <Edit3 size={18} />
            Settings
          </button>

          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showPreview ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Toggle preview"
          >
            <Eye size={18} />
            Preview
          </button>
        </>
      )}

      <button
        onClick={onCreateProject}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
      >
        <Plus size={18} />
        Create Project
      </button>

      <button
        onClick={onBrowseProjects}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        <FolderOpen size={18} />
        Browse Projects
      </button>

      {hasContent && (
        <button
          onClick={onSaveProject}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Save size={18} />
          Save
        </button>
      )}

      <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
        <Upload size={18} />
        Import ZIP
        <input
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>

      {hasContent && (
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download size={18} />
          Export ZIP
        </button>
      )}
    </div>
  );
}
