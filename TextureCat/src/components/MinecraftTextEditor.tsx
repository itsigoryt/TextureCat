import { useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, Palette } from 'lucide-react';

interface MinecraftTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const COLORS = [
  { name: 'black', hex: '#000000' },
  { name: 'dark_blue', hex: '#0000AA' },
  { name: 'dark_green', hex: '#00AA00' },
  { name: 'dark_aqua', hex: '#00AAAA' },
  { name: 'dark_red', hex: '#AA0000' },
  { name: 'dark_purple', hex: '#AA00AA' },
  { name: 'gold', hex: '#FFAA00' },
  { name: 'gray', hex: '#AAAAAA' },
  { name: 'dark_gray', hex: '#555555' },
  { name: 'blue', hex: '#5555FF' },
  { name: 'green', hex: '#55FF55' },
  { name: 'aqua', hex: '#55FFFF' },
  { name: 'red', hex: '#FF5555' },
  { name: 'light_purple', hex: '#FF55FF' },
  { name: 'yellow', hex: '#FFFF55' },
  { name: 'white', hex: '#FFFFFF' },
];

export default function MinecraftTextEditor({ value, onChange }: MinecraftTextEditorProps) {
  const [text, setText] = useState(value);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underlined, setUnderlined] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [selectedColor, setSelectedColor] = useState('white');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleApplyFormatting = () => {
    const formatted: any = { text };
    if (bold) formatted.bold = true;
    if (italic) formatted.italic = true;
    if (underlined) formatted.underlined = true;
    if (strikethrough) formatted.strikethrough = true;
    if (selectedColor !== 'white') formatted.color = selectedColor;

    const hasFormatting = bold || italic || underlined || strikethrough || selectedColor !== 'white';
    onChange(hasFormatting ? JSON.stringify(formatted) : text);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setBold(!bold)}
          className={`p-2 rounded ${
            bold ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => setItalic(!italic)}
          className={`p-2 rounded ${
            italic ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => setUnderlined(!underlined)}
          className={`p-2 rounded ${
            underlined ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors`}
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => setStrikethrough(!strikethrough)}
          className={`p-2 rounded ${
            strikethrough ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="Color"
          >
            <Palette size={18} />
            <div
              className="w-4 h-4 rounded border border-gray-500"
              style={{ backgroundColor: COLORS.find(c => c.name === selectedColor)?.hex }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2 grid grid-cols-8 gap-1 z-10">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.name);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-600 hover:border-white transition-colors"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleApplyFormatting}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors ml-auto"
        >
          Apply Formatting
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter pack description..."
      />
    </div>
  );
}
