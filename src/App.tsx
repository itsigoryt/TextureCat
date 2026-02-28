import { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import FileTree from './components/FileTree';
import PixelArtEditor from './components/PixelArtEditor';
import TextEditor from './components/TextEditor';
import JsonEditor from './components/JsonEditor';
import AudioPlayer from './components/AudioPlayer';
import MetadataEditor from './components/MetadataEditor';
import PackPreview from './components/PackPreview';
import Toolbar from './components/Toolbar';
import ProjectBrowser from './components/ProjectBrowser';
import CreateProjectModal from './components/CreateProjectModal';
import { AdminPanel } from './components/AdminPanel';
import Homepage from './components/Homepage';
import { FileNode, PackMetadata } from './types';
import { createDefaultPack } from './utils/defaultPack';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [showHomepage, setShowHomepage] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Map<string, string | Uint8Array>>(new Map());
  const [metadata, setMetadata] = useState<PackMetadata>({
    pack: {
      pack_format: 15,
      description: 'My Resource Pack'
    }
  });
  const [packName, setPackName] = useState<string>('My Resource Pack');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateUserSession(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateUserSession(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserSession = async (userId: string) => {
    await supabase
      .from('user_sessions')
      .upsert(
        { user_id: userId, last_active: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleGetStarted = () => {
    setShowHomepage(false);
  };

  const handleCreateProject = useCallback(async (name: string, description: string, packFormat: number) => {
    const defaultPack = await createDefaultPack();

    const meta = {
      pack: {
        pack_format: packFormat,
        description: description || name
      }
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        pack_format: packFormat,
        metadata: meta,
        file_tree: defaultPack.tree,
        user_id: user?.id || null,
        user_name: user?.user_metadata?.full_name || user?.email || null,
        user_avatar_url: user?.user_metadata?.avatar_url || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
      return;
    }

    const fileInserts = Array.from(defaultPack.contents.entries()).map(([path, content]) => {
      const fileType = path.split('.').pop() || '';
      const isBinary = typeof content !== 'string';

      return {
        project_id: project.id,
        file_path: path,
        content: isBinary ? null : content,
        content_binary: isBinary ? content : null,
        file_type: fileType
      };
    });

    const { error: filesError } = await supabase
      .from('project_files')
      .insert(fileInserts);

    if (filesError) {
      console.error('Error creating project files:', filesError);
    }

    setCurrentProjectId(project.id);
    setPackName(name);
    setMetadata(meta);
    setFileTree(defaultPack.tree);
    setFileContents(defaultPack.contents);
    setShowCreateModal(false);
  }, [user]);

  const handleImportTemplate = useCallback(async (templateUrl: string, name: string) => {
    try {
      const response = await fetch(templateUrl);
      const blob = await response.blob();
      const file = new File([blob], name + '.zip');

      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const newContents = new Map<string, string | Uint8Array>();
      const tree: FileNode = { name: 'root', type: 'folder', children: [] };
      let packMeta: PackMetadata = {
        pack: {
          pack_format: 15,
          description: 'Resource Pack'
        }
      };

      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue;

        const content = path.match(/\.(png|jpg|jpeg|ogg|mp3|wav)$/i)
          ? await zipEntry.async('uint8array')
          : await zipEntry.async('text');

        newContents.set(path, content);

        const parts = path.split('/');
        let currentNode = tree;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!part) continue;

          if (i === parts.length - 1) {
            currentNode.children!.push({
              name: part,
              type: 'file',
              path
            });
          } else {
            let folder = currentNode.children!.find(n => n.name === part && n.type === 'folder');
            if (!folder) {
              folder = { name: part, type: 'folder', children: [] };
              currentNode.children!.push(folder);
            }
            currentNode = folder;
          }
        }

        if (path === 'pack.mcmeta') {
          try {
            const meta = JSON.parse(content as string);
            packMeta = meta;
          } catch (e) {
            console.error('Failed to parse pack.mcmeta', e);
          }
        }
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name,
          description: typeof packMeta.pack.description === 'string'
            ? packMeta.pack.description
            : JSON.stringify(packMeta.pack.description),
          pack_format: packMeta.pack.pack_format,
          metadata: packMeta,
          file_tree: tree,
          user_id: user?.id || null,
          user_name: user?.user_metadata?.full_name || user?.email || null,
          user_avatar_url: user?.user_metadata?.avatar_url || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project');
        return;
      }

      const fileInserts = Array.from(newContents.entries()).map(([path, content]) => {
        const fileType = path.split('.').pop() || '';
        const isBinary = typeof content !== 'string';

        return {
          project_id: project.id,
          file_path: path,
          content: isBinary ? null : content,
          content_binary: isBinary ? content : null,
          file_type: fileType
        };
      });

      const { error: filesError } = await supabase
        .from('project_files')
        .insert(fileInserts);

      if (filesError) {
        console.error('Error creating project files:', filesError);
      }

      setCurrentProjectId(project.id);
      setPackName(name);
      setMetadata(packMeta);
      setFileTree(tree);
      setFileContents(newContents);
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Error importing template:', err);
      alert('Failed to import template: ' + err.message);
    }
  }, [user]);

  const handleLoadProject = useCallback(async (projectId: string) => {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error loading project:', projectError);
      alert('Failed to load project');
      return;
    }

    const { data: files, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);

    if (filesError) {
      console.error('Error loading files:', filesError);
      alert('Failed to load project files');
      return;
    }

    const contents = new Map<string, string | Uint8Array>();
    files?.forEach(file => {
      if (file.content_binary) {
        contents.set(file.file_path, new Uint8Array(file.content_binary));
      } else if (file.content) {
        contents.set(file.file_path, file.content);
      }
    });

    setCurrentProjectId(project.id);
    setPackName(project.name);
    setMetadata(project.metadata);
    setFileTree(project.file_tree);
    setFileContents(contents);
    setShowBrowserModal(false);
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!currentProjectId) {
      alert('No project loaded. Please create or open a project first.');
      return;
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name: packName,
        metadata,
        file_tree: fileTree,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentProjectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      alert('Failed to save project');
      return;
    }

    await supabase
      .from('project_files')
      .delete()
      .eq('project_id', currentProjectId);

    const fileInserts = Array.from(fileContents.entries()).map(([path, content]) => {
      const fileType = path.split('.').pop() || '';
      const isBinary = typeof content !== 'string';

      return {
        project_id: currentProjectId,
        file_path: path,
        content: isBinary ? null : content,
        content_binary: isBinary ? content : null,
        file_type: fileType
      };
    });

    const { error: filesError } = await supabase
      .from('project_files')
      .insert(fileInserts);

    if (filesError) {
      console.error('Error saving files:', filesError);
      alert('Failed to save project files');
      return;
    }

    alert('Project saved successfully!');
  }, [currentProjectId, packName, metadata, fileTree, fileContents]);

  const handleImportZip = useCallback(async (file: File) => {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const newContents = new Map<string, string | Uint8Array>();
    const tree: FileNode = { name: 'root', type: 'folder', children: [] };
    let packMeta: PackMetadata = {
      pack: {
        pack_format: 15,
        description: 'Imported Resource Pack'
      }
    };

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir) continue;

      const content = path.match(/\.(png|jpg|jpeg|ogg|mp3|wav)$/i)
        ? await zipEntry.async('uint8array')
        : await zipEntry.async('text');

      newContents.set(path, content);

      const parts = path.split('/');
      let currentNode = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        if (i === parts.length - 1) {
          currentNode.children!.push({
            name: part,
            type: 'file',
            path
          });
        } else {
          let folder = currentNode.children!.find(n => n.name === part && n.type === 'folder');
          if (!folder) {
            folder = { name: part, type: 'folder', children: [] };
            currentNode.children!.push(folder);
          }
          currentNode = folder;
        }
      }

      if (path === 'pack.mcmeta') {
        try {
          const meta = JSON.parse(content as string);
          packMeta = meta;
          setMetadata(meta);
        } catch (e) {
          console.error('Failed to parse pack.mcmeta', e);
        }
      }
    }

    setFileTree(tree);
    setFileContents(newContents);
    const importedPackName = file.name.replace('.zip', '');
    setPackName(importedPackName);

    const shouldUpload = confirm('Would you like to upload this resource pack to the cloud database?');
    if (shouldUpload) {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: importedPackName,
          description: typeof packMeta.pack.description === 'string'
            ? packMeta.pack.description
            : JSON.stringify(packMeta.pack.description),
          pack_format: packMeta.pack.pack_format,
          metadata: packMeta,
          file_tree: tree,
          user_id: user?.id || null,
          user_name: user?.user_metadata?.full_name || user?.email || null,
          user_avatar_url: user?.user_metadata?.avatar_url || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error uploading project:', error);
        alert('Failed to upload to cloud');
        return;
      }

      const fileInserts = Array.from(newContents.entries()).map(([path, content]) => {
        const fileType = path.split('.').pop() || '';
        const isBinary = typeof content !== 'string';

        return {
          project_id: project.id,
          file_path: path,
          content: isBinary ? null : content,
          content_binary: isBinary ? content : null,
          file_type: fileType
        };
      });

      const { error: filesError } = await supabase
        .from('project_files')
        .insert(fileInserts);

      if (filesError) {
        console.error('Error uploading project files:', filesError);
        alert('Failed to upload files to cloud');
        return;
      }

      setCurrentProjectId(project.id);
      alert('Successfully uploaded to cloud!');
    }
  }, []);

  const handleExportZip = useCallback(async () => {
    const zip = new JSZip();

    fileContents.forEach((content, path) => {
      if (typeof content === 'string') {
        zip.file(path, content);
      } else {
        zip.file(path, content);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packName}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    if (currentProjectId) {
      await supabase
        .from('pack_downloads')
        .insert({
          project_id: currentProjectId,
          user_id: user?.id || null
        });
    }
  }, [fileContents, packName, currentProjectId, user]);

  const handleFileSelect = useCallback((path: string) => {
    setCurrentFile(path);
  }, []);

  const handleFileUpdate = useCallback((path: string, content: string | Uint8Array) => {
    setFileContents(prev => {
      const newContents = new Map(prev);
      newContents.set(path, content);
      return newContents;
    });

    if (path === 'pack.mcmeta' && typeof content === 'string') {
      try {
        const meta = JSON.parse(content);
        setMetadata(meta);
      } catch (e) {
        console.error('Failed to parse pack.mcmeta', e);
      }
    }
  }, []);

  const addNodeToTree = (tree: FileNode, parentPath: string, name: string, type: 'file' | 'folder'): FileNode => {
    if (!tree.children) return tree;

    const parts = parentPath.split('/').filter(p => p);

    if (parts.length === 0 || (parts.length === 1 && parts[0] === 'root')) {
      const newNode: FileNode = type === 'file'
        ? { name, type: 'file', path: name }
        : { name, type: 'folder', children: [] };

      return {
        ...tree,
        children: [...tree.children, newNode]
      };
    }

    return {
      ...tree,
      children: tree.children.map(child => {
        if (child.name === parts[0] && child.type === 'folder') {
          return addNodeToTree(child, parts.slice(1).join('/'), name, type);
        }
        return child;
      })
    };
  };

  const removeNodeFromTree = (tree: FileNode, targetPath: string): FileNode => {
    if (!tree.children) return tree;

    const parts = targetPath.split('/').filter(p => p);

    if (parts.length === 1) {
      return {
        ...tree,
        children: tree.children.filter(child => child.name !== parts[0])
      };
    }

    return {
      ...tree,
      children: tree.children.map(child => {
        if (child.name === parts[0] && child.type === 'folder') {
          return removeNodeFromTree(child, parts.slice(1).join('/'));
        }
        return child;
      })
    };
  };

  const renameNodeInTree = (tree: FileNode, oldPath: string, newPath: string): FileNode => {
    if (!tree.children) return tree;

    const oldParts = oldPath.split('/').filter(p => p);
    const newName = newPath.split('/').pop() || '';

    if (oldParts.length === 1) {
      return {
        ...tree,
        children: tree.children.map(child => {
          if (child.name === oldParts[0]) {
            return { ...child, name: newName, path: child.type === 'file' ? newPath : undefined };
          }
          return child;
        })
      };
    }

    return {
      ...tree,
      children: tree.children.map(child => {
        if (child.name === oldParts[0] && child.type === 'folder') {
          return renameNodeInTree(child, oldParts.slice(1).join('/'), newPath);
        }
        return child;
      })
    };
  };

  const handleCreateFile = useCallback((parentPath: string, fileName: string) => {
    if (!fileTree) return;

    const filePath = parentPath === 'root' ? fileName : `${parentPath}/${fileName}`;

    if (fileContents.has(filePath)) {
      alert('File already exists!');
      return;
    }

    const newTree = addNodeToTree(fileTree, parentPath, fileName, 'file');
    setFileTree(newTree);
    setFileContents(prev => {
      const newContents = new Map(prev);
      newContents.set(filePath, '');
      return newContents;
    });
  }, [fileTree, fileContents]);

  const handleCreateFolder = useCallback((parentPath: string, folderName: string) => {
    if (!fileTree) return;

    const newTree = addNodeToTree(fileTree, parentPath, folderName, 'folder');
    setFileTree(newTree);
  }, [fileTree]);

  const handleRenameFile = useCallback((oldPath: string, newPath: string) => {
    if (!fileTree) return;

    const content = fileContents.get(oldPath);
    if (content === undefined) return;

    const newTree = renameNodeInTree(fileTree, oldPath, newPath);
    setFileTree(newTree);

    setFileContents(prev => {
      const newContents = new Map(prev);
      newContents.delete(oldPath);
      newContents.set(newPath, content);
      return newContents;
    });

    if (currentFile === oldPath) {
      setCurrentFile(newPath);
    }
  }, [fileTree, fileContents, currentFile]);

  const handleDeleteFile = useCallback((path: string) => {
    if (!fileTree) return;

    const newTree = removeNodeFromTree(fileTree, path);
    setFileTree(newTree);

    setFileContents(prev => {
      const newContents = new Map(prev);
      newContents.delete(path);
      return newContents;
    });

    if (currentFile === path) {
      setCurrentFile(null);
    }
  }, [fileTree, currentFile]);

  const handleDeleteFolder = useCallback((path: string) => {
    if (!fileTree) return;

    const newTree = removeNodeFromTree(fileTree, path);
    setFileTree(newTree);

    setFileContents(prev => {
      const newContents = new Map(prev);
      const pathPrefix = path + '/';
      for (const key of newContents.keys()) {
        if (key.startsWith(pathPrefix)) {
          newContents.delete(key);
        }
      }
      return newContents;
    });

    if (currentFile?.startsWith(path + '/')) {
      setCurrentFile(null);
    }
  }, [fileTree, currentFile]);

  const currentContent = currentFile ? fileContents.get(currentFile) : null;
  const isPNG = currentFile?.match(/\.png$/i);
  const isAudio = currentFile?.match(/\.(ogg|mp3|wav)$/i);
  const isJSON = currentFile?.match(/\.(json|mcmeta)$/i);
  const isText = currentFile?.match(/\.(txt|md)$/i);

  if (showHomepage) {
    return (
      <Homepage
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
        user={user}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Toolbar
        onImport={handleImportZip}
        onExport={handleExportZip}
        onCreateProject={() => setShowCreateModal(true)}
        onBrowseProjects={() => setShowBrowserModal(true)}
        onSaveProject={handleSaveProject}
        onEditMetadata={() => setShowMetadataEditor(true)}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        hasContent={fileTree !== null}
        currentProjectName={packName}
        showPreview={showPreview}
      />

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
          onImportTemplate={handleImportTemplate}
        />
      )}

      {showBrowserModal && (
        <ProjectBrowser
          onClose={() => setShowBrowserModal(false)}
          onSelectProject={handleLoadProject}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {fileTree && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <FileTree
              tree={fileTree}
              onFileSelect={handleFileSelect}
              selectedFile={currentFile}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onRenameFile={handleRenameFile}
              onDeleteFile={handleDeleteFile}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {!fileTree && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Minecraft Resource Pack Editor</h2>
                  <p className="text-gray-400 mb-8">Get started by creating a new project or browsing your existing projects</p>
                  <div className="flex flex-col gap-4 items-center">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-lg font-semibold"
                    >
                      Create Project
                    </button>
                    <button
                      onClick={() => setShowBrowserModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-lg font-semibold"
                    >
                      Browse Projects
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-lg font-semibold">
                      Import ZIP
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImportZip(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(currentFile === 'pack.mcmeta' || showMetadataEditor) && fileTree && (
              <MetadataEditor
                metadata={metadata}
                packName={packName}
                onMetadataUpdate={setMetadata}
                onPackNameUpdate={setPackName}
                onSave={(meta) => {
                  handleFileUpdate('pack.mcmeta', JSON.stringify(meta, null, 2));
                  setShowMetadataEditor(false);
                }}
              />
            )}

            {currentFile && currentFile !== 'pack.mcmeta' && fileTree && (
              <>
                {!currentContent && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">File content not loaded</p>
                  </div>
                )}

                {currentContent && isPNG && currentContent instanceof Uint8Array && (
                  <PixelArtEditor
                    imageData={currentContent}
                    onSave={(data) => handleFileUpdate(currentFile, data)}
                    fileName={currentFile}
                  />
                )}

                {currentContent && isAudio && currentContent instanceof Uint8Array && (
                  <AudioPlayer
                    audioData={currentContent}
                    fileName={currentFile}
                  />
                )}

                {currentContent && isJSON && typeof currentContent === 'string' && (
                  <JsonEditor
                    content={currentContent}
                    onSave={(content) => handleFileUpdate(currentFile, content)}
                    fileName={currentFile}
                  />
                )}

                {currentContent && isText && typeof currentContent === 'string' && (
                  <TextEditor
                    content={currentContent}
                    onSave={(content) => handleFileUpdate(currentFile, content)}
                    fileName={currentFile}
                  />
                )}

                {currentContent && !isPNG && !isAudio && !isJSON && !isText && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">Unsupported file type</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showPreview && fileTree && (
        <div className="fixed bottom-4 right-4 w-96 z-40">
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-4">
            <PackPreview metadata={metadata} packName={packName} />
          </div>
        </div>
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

export default App;
