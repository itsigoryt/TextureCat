export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  children?: FileNode[];
}

export interface PackMetadata {
  pack: {
    pack_format: number;
    description: string | MinecraftText;
  };
}

export type MinecraftText =
  | string
  | MinecraftTextComponent
  | Array<string | MinecraftTextComponent>;

export interface MinecraftTextComponent {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  color?: string;
  extra?: Array<string | MinecraftTextComponent>;
}

export interface Tool {
  type: 'pencil' | 'brush' | 'eraser';
  size: number;
}

export interface HistoryState {
  imageData: ImageData;
  timestamp: number;
}
