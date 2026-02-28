import React, { useState, useEffect } from 'react';
import { X, Database, Package, Trash2, Upload, Download, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import JSZip from 'jszip';

interface AdminPanelProps {
  onClose: () => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  user_name: string | null;
  user_avatar_url: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string;
  file_url: string;
  preview_image_url?: string;
  pack_format: number;
  created_at: string;
  is_active: boolean;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    pack_format: 15,
    zipFile: null as File | null,
    previewImage: null as File | null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogin = () => {
    if (password === 'scolia2026') {
      setIsAuthenticated(true);
      setError('');
      loadProjects();
      loadTemplates();
    } else {
      setError('Incorrect password');
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, updated_at, user_id, user_name, user_avatar_url')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load projects');
      console.error(error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to load templates');
      console.error(error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error: filesError } = await supabase
      .from('project_files')
      .delete()
      .eq('project_id', id);

    if (filesError) {
      alert('Failed to delete project files');
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete project');
    } else {
      loadProjects();
    }
  };

  const deleteTemplate = async (id: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    if (fileUrl) {
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('templates').remove([fileName]);
      }
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete template');
    } else {
      loadTemplates();
    }
  };

  const toggleTemplateActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('templates')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      alert('Failed to update template');
    } else {
      loadTemplates();
    }
  };

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.zipFile) {
      alert('Please select a ZIP file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const zipFileName = `${Date.now()}-${templateForm.zipFile.name}`;

      const { data: zipData, error: zipError } = await supabase.storage
        .from('templates')
        .upload(zipFileName, templateForm.zipFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (zipError) throw zipError;

      const { data: { publicUrl } } = supabase.storage
        .from('templates')
        .getPublicUrl(zipFileName);

      let previewImageUrl = null;
      if (templateForm.previewImage) {
        const imageFileName = `preview-${Date.now()}-${templateForm.previewImage.name}`;
        const { error: imageError } = await supabase.storage
          .from('templates')
          .upload(imageFileName, templateForm.previewImage);

        if (!imageError) {
          const { data: { publicUrl: imageUrl } } = supabase.storage
            .from('templates')
            .getPublicUrl(imageFileName);
          previewImageUrl = imageUrl;
        }
      }

      const { error: dbError } = await supabase
        .from('templates')
        .insert({
          name: templateForm.name,
          description: templateForm.description,
          file_url: publicUrl,
          preview_image_url: previewImageUrl,
          pack_format: templateForm.pack_format,
          is_active: true,
        });

      if (dbError) throw dbError;

      setTemplateForm({
        name: '',
        description: '',
        pack_format: 15,
        zipFile: null,
        previewImage: null,
      });
      loadTemplates();
      alert('Template uploaded successfully!');
    } catch (err: any) {
      alert('Failed to upload template: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Admin Login</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Enter admin password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'projects'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database size={20} />
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'templates'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package size={20} />
            Manage Templates ({templates.length})
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-400">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-gray-400">No projects found</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gray-700 rounded-lg p-4 flex justify-between items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{project.name}</h3>
                        <p className="text-gray-400 text-sm">{project.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Created: {new Date(project.created_at).toLocaleString()}
                        </p>
                      </div>
                      {project.user_name && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-600 rounded-lg">
                          {project.user_avatar_url && (
                            <img
                              src={project.user_avatar_url}
                              alt={project.user_name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="text-sm text-gray-200">{project.user_name}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadProject(project.id, project.name)}
                          className="text-blue-400 hover:text-blue-300 p-2"
                          title="Download project"
                          disabled={loading}
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Delete project"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">Upload New Template</h3>
                <form onSubmit={handleUploadTemplate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Template Name *</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Minecraft Version</label>
                    <select
                      value={templateForm.pack_format}
                      onChange={(e) => setTemplateForm({ ...templateForm, pack_format: parseFloat(e.target.value) })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                    >
                      <option value={94.1}>1.21.11 (Pack Format 94.1)</option>
                      <option value={88.0}>1.21.9 - 1.21.10 (Pack Format 88.0)</option>
                      <option value={81}>1.21.7 - 1.21.8 (Pack Format 81)</option>
                      <option value={80}>1.21.6 (Pack Format 80)</option>
                      <option value={71}>1.21.5 (Pack Format 71)</option>
                      <option value={61}>1.21.4 (Pack Format 61)</option>
                      <option value={57}>1.21.2 - 1.21.3 (Pack Format 57)</option>
                      <option value={48}>1.21 - 1.21.1 (Pack Format 48)</option>
                      <option value={41}>1.20.5 - 1.20.6 (Pack Format 41)</option>
                      <option value={26}>1.20.3 - 1.20.4 (Pack Format 26)</option>
                      <option value={18}>1.20.2 (Pack Format 18)</option>
                      <option value={15}>1.20 - 1.20.1 (Pack Format 15)</option>
                      <option value={12}>1.19.4 (Pack Format 12)</option>
                      <option value={10}>1.19 - 1.19.3 (Pack Format 10)</option>
                      <option value={9}>1.18.2 (Pack Format 9)</option>
                      <option value={8}>1.18 - 1.18.1 (Pack Format 8)</option>
                      <option value={7}>1.17 - 1.17.1 (Pack Format 7)</option>
                      <option value={6}>1.16.2 - 1.16.5 (Pack Format 6)</option>
                      <option value={5}>1.15 - 1.16.1 (Pack Format 5)</option>
                      <option value={4}>1.13 - 1.14.4 (Pack Format 4)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">ZIP File *</label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setTemplateForm({ ...templateForm, zipFile: e.target.files?.[0] || null })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Preview Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setTemplateForm({ ...templateForm, previewImage: e.target.files?.[0] || null })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    {loading ? 'Uploading...' : 'Upload Template'}
                  </button>
                </form>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg mb-4">Existing Templates</h3>
                {loading ? (
                  <p className="text-gray-400">Loading templates...</p>
                ) : templates.length === 0 ? (
                  <p className="text-gray-400">No templates found</p>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{template.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              template.is_active
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{template.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Pack Format: {template.pack_format} | Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTemplateActive(template.id, template.is_active)}
                          className={`p-2 ${
                            template.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'
                          }`}
                          title={template.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {template.is_active ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <a
                          href={template.file_url}
                          download
                          className="text-blue-400 hover:text-blue-300 p-2"
                          title="Download template"
                        >
                          <Download size={20} />
                        </a>
                        <button
                          onClick={() => deleteTemplate(template.id, template.file_url)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Delete template"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
