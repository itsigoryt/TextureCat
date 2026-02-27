import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface JsonEditorProps {
  content: string;
  onSave: (content: string) => void;
  fileName: string;
}

export default function JsonEditor({ content, onSave, fileName }: JsonEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
    validateJson(content);
  }, [content, fileName]);

  const validateJson = (text: string) => {
    try {
      JSON.parse(text);
      setError(null);
      setIsValid(true);
      return true;
    } catch (e) {
      setError((e as Error).message);
      setIsValid(false);
      return false;
    }
  };

  const handleSave = () => {
    if (validateJson(editedContent)) {
      try {
        const parsed = JSON.parse(editedContent);
        const formatted = JSON.stringify(parsed, null, 2);
        setEditedContent(formatted);
        onSave(formatted);
        setHasChanges(false);
      } catch (e) {
        setError('Failed to format JSON');
      }
    }
  };

  const handleChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== content);
    validateJson(value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(editedContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditedContent(formatted);
      setHasChanges(formatted !== content);
      setError(null);
      setIsValid(true);
    } catch (e) {
      setError('Cannot format invalid JSON');
    }
  };

  const getFileTypeInfo = () => {
    const path = fileName.toLowerCase();
    if (path.includes('particles')) return { type: 'Particle', icon: '✨', color: 'text-purple-400' };
    if (path.includes('animations') || path.includes('animation')) return { type: 'Animation', icon: '🎬', color: 'text-blue-400' };
    if (path.includes('armor')) return { type: 'Armor', icon: '🛡️', color: 'text-yellow-400' };
    if (path.includes('models')) return { type: 'Model', icon: '🎲', color: 'text-green-400' };
    if (path.includes('sounds')) return { type: 'Sound Definition', icon: '🔊', color: 'text-red-400' };
    if (path.includes('blockstates')) return { type: 'Block State', icon: '🧱', color: 'text-orange-400' };
    return { type: 'JSON', icon: '📄', color: 'text-gray-400' };
  };

  const fileInfo = getFileTypeInfo();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xl ${fileInfo.color}`}>{fileInfo.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fileName}</span>
              {hasChanges && <span className="text-xs text-yellow-500">Unsaved changes</span>}
            </div>
            <div className="text-xs text-gray-400">{fileInfo.type}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircle size={16} />
              Valid
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle size={16} />
              Invalid
            </div>
          )}

          <button
            onClick={formatJson}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Format
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || !isValid}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border-b border-red-700/50 px-4 py-2 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-400">
            <span className="font-medium">JSON Error:</span> {error}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <textarea
            value={editedContent}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 bg-gray-900 text-gray-100 p-4 font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3 text-gray-400">File Info</h3>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">File Type</div>
              <div className="text-gray-200">{fileInfo.type}</div>
            </div>

            <div>
              <div className="text-gray-400 mb-1">Path</div>
              <div className="text-gray-200 text-xs break-all">{fileName}</div>
            </div>

            <div>
              <div className="text-gray-400 mb-1">Status</div>
              <div className={isValid ? 'text-green-400' : 'text-red-400'}>
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-1">Lines</div>
              <div className="text-gray-200">{editedContent.split('\n').length}</div>
            </div>

            {fileInfo.type === 'Particle' && (
              <div className="pt-4 border-t border-gray-700">
                <div className="text-gray-400 mb-2">Particle Tips</div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Define texture paths</li>
                  <li>Set particle behavior</li>
                  <li>Configure lifecycle</li>
                </ul>
              </div>
            )}

            {fileInfo.type === 'Animation' && (
              <div className="pt-4 border-t border-gray-700">
                <div className="text-gray-400 mb-2">Animation Tips</div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Frame timing in ticks</li>
                  <li>Interpolation settings</li>
                  <li>Loop configuration</li>
                </ul>
              </div>
            )}

            {fileInfo.type === 'Armor' && (
              <div className="pt-4 border-t border-gray-700">
                <div className="text-gray-400 mb-2">Armor Tips</div>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Layer textures</li>
                  <li>Material properties</li>
                  <li>Protection values</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
