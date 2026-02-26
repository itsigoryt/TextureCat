import { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileTreeProps {
  tree: FileNode;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

function FileTreeNode({
  node,
  level = 0,
  onFileSelect,
  selectedFile
}: {
  node: FileNode;
  level?: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}) {
  const [isOpen, setIsOpen] = useState(level < 2);

  if (node.type === 'file') {
    const isSelected = node.path === selectedFile;
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-blue-600' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => node.path && onFileSelect(node.path)}
      >
        <File size={16} className="text-gray-400" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Folder size={16} className="text-yellow-500" />
        <span className="text-sm font-medium">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileTreeNode
              key={`${child.name}-${i}`}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree, onFileSelect, selectedFile }: FileTreeProps) {
  return (
    <div className="py-2">
      {tree.children?.map((node, i) => (
        <FileTreeNode
          key={`${node.name}-${i}`}
          node={node}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}
