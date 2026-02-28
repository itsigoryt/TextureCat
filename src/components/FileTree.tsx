import { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, File, Folder, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';

interface FileTreeProps {
  tree: FileNode;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  onCreateFile?: (parentPath: string, fileName: string) => void;
  onCreateFolder?: (parentPath: string, folderName: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  onDeleteFolder?: (path: string) => void;
}

function FileTreeNode({
  node,
  level = 0,
  onFileSelect,
  selectedFile,
  parentPath = '',
  onCreateFile,
  onCreateFolder,
  onRenameFile,
  onDeleteFile,
  onDeleteFolder
}: {
  node: FileNode;
  level?: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  parentPath?: string;
  onCreateFile?: (parentPath: string, fileName: string) => void;
  onCreateFolder?: (parentPath: string, folderName: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  onDeleteFolder?: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

  const handleRename = () => {
    if (newName && newName !== node.name && node.path && onRenameFile) {
      const pathParts = node.path.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      onRenameFile(node.path, newPath);
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    if (node.type === 'file' && node.path && onDeleteFile) {
      if (confirm(`Delete ${node.name}?`)) {
        onDeleteFile(node.path);
      }
    } else if (node.type === 'folder' && onDeleteFolder) {
      if (confirm(`Delete folder ${node.name} and all its contents?`)) {
        onDeleteFolder(currentPath);
      }
    }
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name (e.g., myfile.json):');
    if (fileName && onCreateFile) {
      onCreateFile(currentPath, fileName);
    }
    setShowContextMenu(false);
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && onCreateFolder) {
      onCreateFolder(currentPath, folderName);
    }
    setShowContextMenu(false);
  };

  if (node.type === 'file') {
    const isSelected = node.path === selectedFile;
    return (
      <div className="relative group">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700 ${
            isSelected ? 'bg-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => !isRenaming && node.path && onFileSelect(node.path)}
        >
          <File size={16} className="text-gray-400" />
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setNewName(node.name);
                  setIsRenaming(false);
                }
              }}
              className="flex-1 bg-gray-800 text-sm px-1 py-0.5 rounded border border-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm flex-1">{node.name}</span>
          )}
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
              className="text-gray-400 hover:text-blue-400 p-1"
              title="Rename"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-gray-400 hover:text-red-400 p-1"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative group">
        <div
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} className="text-yellow-500" />
          <span className="text-sm font-medium flex-1">{node.name}</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFile();
              }}
              className="text-gray-400 hover:text-green-400 p-1"
              title="New File"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFolder();
              }}
              className="text-gray-400 hover:text-green-400 p-1"
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
            {level > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-gray-400 hover:text-red-400 p-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
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
              parentPath={currentPath}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree, onFileSelect, selectedFile, onCreateFile, onCreateFolder, onRenameFile, onDeleteFile, onDeleteFolder }: FileTreeProps) {
  return (
    <div className="py-2">
      {tree.children?.map((node, i) => (
        <FileTreeNode
          key={`${node.name}-${i}`}
          node={node}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          onDeleteFolder={onDeleteFolder}
        />
      ))}
    </div>
  );
}
