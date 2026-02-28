import { useState } from 'react';
import { Save } from 'lucide-react';
import { PackMetadata } from '../types';
import MinecraftTextEditor from './MinecraftTextEditor';

interface MetadataEditorProps {
  metadata: PackMetadata;
  packName: string;
  onMetadataUpdate: (metadata: PackMetadata) => void;
  onPackNameUpdate: (name: string) => void;
  onSave: (metadata: PackMetadata) => void;
}

const VERSION_FORMATS: { [key: string]: number } = {
  '1.21.2 - 1.21.4': 48,
  '1.21 - 1.21.1': 41,
  '1.20.5 - 1.20.6': 34,
  '1.20.3 - 1.20.4': 26,
  '1.20.2': 18,
  '1.20 - 1.20.1': 15,
  '1.19.4': 13,
  '1.19.3': 12,
  '1.19 - 1.19.2': 9,
  '1.18.2': 9,
  '1.18 - 1.18.1': 8,
  '1.17 - 1.17.1': 7,
  '1.16.2 - 1.16.5': 6,
  '1.15 - 1.16.1': 5,
  '1.13 - 1.14.4': 4,
};

export default function MetadataEditor({
  metadata,
  packName,
  onMetadataUpdate,
  onPackNameUpdate,
  onSave
}: MetadataEditorProps) {
  const [localMetadata, setLocalMetadata] = useState(metadata);
  const [localPackName, setLocalPackName] = useState(packName);

  const handlePackFormatChange = (format: number) => {
    const updated = {
      ...localMetadata,
      pack: {
        ...localMetadata.pack,
        pack_format: format
      }
    };
    setLocalMetadata(updated);
    onMetadataUpdate(updated);
  };

  const handleDescriptionChange = (description: string) => {
    const updated = {
      ...localMetadata,
      pack: {
        ...localMetadata.pack,
        description
      }
    };
    setLocalMetadata(updated);
    onMetadataUpdate(updated);
  };

  const handleSave = () => {
    onPackNameUpdate(localPackName);
    onSave(localMetadata);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pack Metadata</h2>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save size={18} />
            Save
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pack Name</label>
            <input
              type="text"
              value={localPackName}
              onChange={(e) => setLocalPackName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minecraft Version</label>
            <select
              value={localMetadata.pack.pack_format}
              onChange={(e) => handlePackFormatChange(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(VERSION_FORMATS).map(([version, format]) => (
                <option key={format} value={format}>
                  {version} (Pack Format {format})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <MinecraftTextEditor
              value={
                typeof localMetadata.pack.description === 'string'
                  ? localMetadata.pack.description
                  : JSON.stringify(localMetadata.pack.description)
              }
              onChange={handleDescriptionChange}
            />
          </div>

          <div className="bg-gray-900 rounded p-4">
            <h3 className="text-sm font-medium mb-2">Raw JSON</h3>
            <pre className="text-xs text-gray-400 overflow-auto">
              {JSON.stringify(localMetadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
