import { useState, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough } from 'lucide-react';

interface MinecraftTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const COLORS = [
  { code: '0', name: 'Black', hex: '#000000' },
  { code: '1', name: 'Dark Blue', hex: '#0000AA' },
  { code: '2', name: 'Dark Green', hex: '#00AA00' },
  { code: '3', name: 'Dark Aqua', hex: '#00AAAA' },
  { code: '4', name: 'Dark Red', hex: '#AA0000' },
  { code: '5', name: 'Dark Purple', hex: '#AA00AA' },
  { code: '6', name: 'Gold', hex: '#FFAA00' },
  { code: '7', name: 'Gray', hex: '#AAAAAA' },
  { code: '8', name: 'Dark Gray', hex: '#555555' },
  { code: '9', name: 'Blue', hex: '#5555FF' },
  { code: 'a', name: 'Green', hex: '#55FF55' },
  { code: 'b', name: 'Aqua', hex: '#55FFFF' },
  { code: 'c', name: 'Red', hex: '#FF5555' },
  { code: 'd', name: 'Light Purple', hex: '#FF55FF' },
  { code: 'e', name: 'Yellow', hex: '#FFFF55' },
  { code: 'f', name: 'White', hex: '#FFFFFF' },
];

export default function MinecraftTextEditor({ value, onChange }: MinecraftTextEditorProps) {
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatCode = (code: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + '§' + code + selectedText + '§r' + after;
      setText(newText);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 0);
    } else {
      const before = text.substring(0, start);
      const after = text.substring(start);
      const newText = before + '§' + code + after;
      setText(newText);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const handleTextChange = (newText: string) => {
    const processedText = newText.replace(/&([0-9a-fklmnor])/g, '§$1');
    setText(processedText);
    onChange(processedText);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">Colors</div>
        <div className="flex gap-1 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color.code}
              onClick={() => insertFormatCode(color.code)}
              className="w-8 h-8 rounded-lg border-2 border-gray-600 hover:border-white transition-all hover:scale-110"
              style={{ backgroundColor: color.hex }}
              title={`${color.name} (§${color.code})`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">Formatting</div>
        <div className="flex gap-2">
          <button
            onClick={() => insertFormatCode('l')}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="Bold (§l)"
          >
            <Bold size={18} />
            <span className="text-sm">Bold</span>
          </button>
          <button
            onClick={() => insertFormatCode('o')}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="Italic (§o)"
          >
            <Italic size={18} />
            <span className="text-sm">Italic</span>
          </button>
          <button
            onClick={() => insertFormatCode('n')}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="Underline (§n)"
          >
            <Underline size={18} />
            <span className="text-sm">Underline</span>
          </button>
          <button
            onClick={() => insertFormatCode('m')}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="Strikethrough (§m)"
          >
            <Strikethrough size={18} />
            <span className="text-sm">Strike</span>
          </button>
          <button
            onClick={() => insertFormatCode('r')}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Reset (§r)"
          >
            <span className="text-sm">Reset</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">Text</div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          placeholder="Enter text... Use § or & for color codes"
        />
        <div className="text-xs text-gray-400">
          Tip: Select text and click a formatting button to apply it. Both § and & symbols work as color codes.
        </div>
      </div>
    </div>
  );
}
