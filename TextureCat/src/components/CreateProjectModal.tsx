import { useState, useEffect } from 'react';
import { X, Folder, Download } from 'lucide-react';
import PackPreview from './PackPreview';
import { PackMetadata } from '../types';
import { supabase } from '../lib/supabase';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, packFormat: number) => void;
  onImportTemplate?: (templateUrl: string, name: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  file_url: string;
  pack_format: number;
}

const VERSION_FORMATS: { [key: string]: number } = {
  '1.21.11': 94.1,
  '1.21.9 - 1.21.10': 88.0,
  '1.21.7 - 1.21.8': 81,
  '1.21.6': 80,
  '1.21.5': 71,
  '1.21.4': 61,
  '1.21.2 - 1.21.3': 57,
  '1.21 - 1.21.1': 48,
  '1.20.5 - 1.20.6': 41,
  '1.20.3 - 1.20.4': 26,
  '1.20.2': 18,
  '1.20 - 1.20.1': 15,
  '1.19.4': 12,
  '1.19 - 1.19.3': 10,
  '1.18.2': 9,
  '1.18 - 1.18.1': 8,
  '1.17 - 1.17.1': 7,
  '1.16.2 - 1.16.5': 6,
  '1.15 - 1.16.1': 5,
  '1.13 - 1.14.4': 4,
};

export default function CreateProjectModal({ onClose, onCreate, onImportTemplate }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [packFormat, setPackFormat] = useState(15);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
  };

  const handleCreate = () => {
    if (selectedTemplate && onImportTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        onImportTemplate(template.file_url, name.trim() || template.name);
        onClose();
        return;
      }
    }

    if (name.trim()) {
      onCreate(name.trim(), description.trim(), packFormat);
    }
  };

  const previewMetadata: PackMetadata = {
    pack: {
      pack_format: packFormat,
      description: description || 'My Resource Pack'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Folder size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Resource Pack"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A custom resource pack for Minecraft"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Minecraft Version</label>
              <select
                value={packFormat}
                onChange={(e) => setPackFormat(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!selectedTemplate}
              >
                {Object.entries(VERSION_FORMATS).map(([version, format]) => (
                  <option key={format} value={format}>
                    {version} (Pack Format {format})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Or use one of our templates</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template && !name.trim()) {
                      setName(template.name);
                    }
                    if (template && !description.trim()) {
                      setDescription(template.description);
                    }
                    if (template) {
                      setPackFormat(template.pack_format);
                    }
                  }
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={templates.length === 0}
              >
                <option value="">
                  {templates.length === 0 ? 'No templates available' : 'None - Start from scratch'}
                </option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.description && `- ${template.description}`}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="mt-2 text-xs text-blue-400">
                  Template selected. The project will be created from this template.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 flex items-center">
              <PackPreview
                metadata={previewMetadata}
                packName={name || 'My Resource Pack'}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedTemplate
              ? 'Using template: ' + (templates.find(t => t.id === selectedTemplate)?.name || '')
              : templates.length > 0
                ? `${templates.length} templates available`
                : 'Start from scratch'
            }
          </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedTemplate && !name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedTemplate ? 'Create from Template' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
