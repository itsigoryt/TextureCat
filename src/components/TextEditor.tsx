import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface TextEditorProps {
  content: string;
  onSave: (content: string) => void;
  fileName: string;
}

export default function TextEditor({ content, onSave, fileName }: TextEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(content);
    setHasChanges(false);
  }, [content, fileName]);

  const handleSave = () => {
    onSave(editedContent);
    setHasChanges(false);
  };

  const handleChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== content);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{fileName}</span>
          {hasChanges && <span className="text-xs text-yellow-500">Unsaved changes</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          Save
        </button>
      </div>
      <textarea
        value={editedContent}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm focus:outline-none resize-none"
        spellCheck={false}
      />
    </div>
  );
}
