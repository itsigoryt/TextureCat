import { PackMetadata, MinecraftTextComponent } from '../types';

interface PackPreviewProps {
  metadata: PackMetadata;
  packName: string;
}

const MINECRAFT_COLORS: { [key: string]: string } = {
  black: '#000000',
  dark_blue: '#0000AA',
  dark_green: '#00AA00',
  dark_aqua: '#00AAAA',
  dark_red: '#AA0000',
  dark_purple: '#AA00AA',
  gold: '#FFAA00',
  gray: '#AAAAAA',
  dark_gray: '#555555',
  blue: '#5555FF',
  green: '#55FF55',
  aqua: '#55FFFF',
  red: '#FF5555',
  light_purple: '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF',
};

const COLOR_CODE_MAP: { [key: string]: string } = {
  '0': '#000000',
  '1': '#0000AA',
  '2': '#00AA00',
  '3': '#00AAAA',
  '4': '#AA0000',
  '5': '#AA00AA',
  '6': '#FFAA00',
  '7': '#AAAAAA',
  '8': '#555555',
  '9': '#5555FF',
  'a': '#55FF55',
  'b': '#55FFFF',
  'c': '#FF5555',
  'd': '#FF55FF',
  'e': '#FFFF55',
  'f': '#FFFFFF',
};

function parseLegacyColorCodes(text: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  const regex = /([§&])([0-9a-fk-or])/gi;
  let lastIndex = 0;
  let currentColor = MINECRAFT_COLORS.white;
  let isBold = false;
  let isItalic = false;
  let isUnderlined = false;
  let isStrikethrough = false;
  let key = 0;

  const matches = Array.from(text.matchAll(regex));

  matches.forEach((match, index) => {
    if (match.index !== undefined && match.index > lastIndex) {
      const textPart = text.substring(lastIndex, match.index);
      if (textPart) {
        const style: React.CSSProperties = {
          color: currentColor,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: (() => {
            const decorations = [];
            if (isUnderlined) decorations.push('underline');
            if (isStrikethrough) decorations.push('line-through');
            return decorations.join(' ') || 'none';
          })(),
        };
        parts.push(<span key={key++} style={style}>{textPart}</span>);
      }
    }

    const code = match[2].toLowerCase();
    if (COLOR_CODE_MAP[code]) {
      currentColor = COLOR_CODE_MAP[code];
      isBold = false;
      isItalic = false;
      isUnderlined = false;
      isStrikethrough = false;
    } else if (code === 'l') {
      isBold = true;
    } else if (code === 'o') {
      isItalic = true;
    } else if (code === 'n') {
      isUnderlined = true;
    } else if (code === 'm') {
      isStrikethrough = true;
    } else if (code === 'r') {
      currentColor = MINECRAFT_COLORS.white;
      isBold = false;
      isItalic = false;
      isUnderlined = false;
      isStrikethrough = false;
    } else if (code === 'k') {
      // Obfuscated - ignore for now
    }

    lastIndex = (match.index || 0) + match[0].length;
  });

  if (lastIndex < text.length) {
    const textPart = text.substring(lastIndex);
    if (textPart) {
      const style: React.CSSProperties = {
        color: currentColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: (() => {
          const decorations = [];
          if (isUnderlined) decorations.push('underline');
          if (isStrikethrough) decorations.push('line-through');
          return decorations.join(' ') || 'none';
        })(),
      };
      parts.push(<span key={key++} style={style}>{textPart}</span>);
    }
  }

  return parts.length > 0 ? parts : [<span key={0} style={{ color: MINECRAFT_COLORS.white }}>{text}</span>];
}

function renderMinecraftText(text: string | MinecraftTextComponent | Array<string | MinecraftTextComponent>): JSX.Element {
  if (typeof text === 'string') {
    if (text.includes('§') || text.includes('&')) {
      return <>{parseLegacyColorCodes(text)}</>;
    }
    return <span style={{ color: MINECRAFT_COLORS.white }}>{text}</span>;
  }

  if (Array.isArray(text)) {
    return (
      <>
        {text.map((item, i) => (
          <span key={i}>{renderMinecraftText(item)}</span>
        ))}
      </>
    );
  }

  const component = text as MinecraftTextComponent;
  const style: React.CSSProperties = {
    color: component.color ? MINECRAFT_COLORS[component.color] || component.color : MINECRAFT_COLORS.white,
    fontWeight: component.bold ? 'bold' : 'normal',
    fontStyle: component.italic ? 'italic' : 'normal',
    textDecoration: (() => {
      const decorations = [];
      if (component.underlined) decorations.push('underline');
      if (component.strikethrough) decorations.push('line-through');
      return decorations.join(' ') || 'none';
    })(),
  };

  return (
    <span style={style}>
      {component.text}
      {component.extra && renderMinecraftText(component.extra)}
    </span>
  );
}

export default function PackPreview({ metadata, packName }: PackPreviewProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3 text-gray-400">Resource Pack Preview</h3>
      <div className="relative bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg p-1 shadow-xl">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-600 to-stone-700 rounded shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                📦
              </div>
              <div className="absolute inset-0 rounded shadow-inner" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(255,255,255,0.1)'
              }} />
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="text-lg mb-1 drop-shadow-md"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                }}
              >
                {packName}
              </div>

              <div
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
                }}
              >
                {renderMinecraftText(metadata.pack.description)}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Compatible</span>
                </div>
                <div className="text-xs text-gray-500">
                  Format: {metadata.pack.pack_format}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur-sm -z-10 opacity-50" />
      </div>
    </div>
  );
}
