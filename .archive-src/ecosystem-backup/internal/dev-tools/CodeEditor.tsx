import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, FolderOpen, Save, Download, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  agents: number;
  lastActivity: string;
}

interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  isOpen?: boolean;
  children?: FileItem[];
}

interface CodeEditorProps {
  projects: Project[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [fileTree, setFileTree] = useState<FileItem[]>([]);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');

  // Mock file tree for demonstration
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const mockFileTree: FileItem[] = [
        {
          id: 'src',
          name: 'src',
          path: '/src',
          type: 'folder',
          isOpen: true,
          children: [
            {
              id: 'components',
              name: 'components',
              path: '/src/components',
              type: 'folder',
              children: [
                {
                  id: 'App.tsx',
                  name: 'App.tsx',
                  path: '/src/components/App.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<div>Welcome to SISO Agency</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;`
                },
                {
                  id: 'Header.tsx',
                  name: 'Header.tsx',
                  path: '/src/components/Header.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-gray-800 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-400">
            SISO Agency
          </Link>
          <div className="space-x-6">
            <Link to="/projects" className="hover:text-orange-400">Projects</Link>
            <Link to="/dev-tools" className="hover:text-orange-400">Dev Tools</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};`
                }
              ]
            },
            {
              id: 'pages',
              name: 'pages',
              path: '/src/pages',
              type: 'folder',
              children: [
                {
                  id: 'DevTools.tsx',
                  name: 'DevTools.tsx',
                  path: '/src/pages/DevTools.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `// SISO Agency Dev Tools
// Multi-agent development environment
export default function DevTools() {
  return (
    <div>
      <h1>Dev Tools</h1>
    </div>
  );
}`
                }
              ]
            }
          ]
        },
        {
          id: 'package.json',
          name: 'package.json',
          path: '/package.json',
          type: 'file',
          language: 'json',
          content: `{
  "name": "siso-agency-onboarding-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  }
}`
        }
      ];
      setFileTree(mockFileTree);
    }
  }, [selectedProject, projects]);

  const openFile = (file: FileItem) => {
    if (file.type === 'file') {
      const isAlreadyOpen = openFiles.some(f => f.id === file.id);
      if (!isAlreadyOpen) {
        setOpenFiles(prev => [...prev, file]);
      }
      setActiveFile(file.id);
      setEditorContent(file.content || '');
    }
  };

  const closeFile = (fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFile === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0].id);
        setEditorContent(remainingFiles[0].content || '');
      } else {
        setActiveFile('');
        setEditorContent('');
      }
    }
  };

  const toggleFolder = (folderId: string) => {
    const updateTree = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === folderId && item.type === 'folder') {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) };
        }
        return item;
      });
    };
    setFileTree(updateTree(fileTree));
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ paddingLeft: `${depth * 16}px` }}>
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm"
          onClick={() => item.type === 'folder' ? toggleFolder(item.id) : openFile(item)}
        >
          {item.type === 'folder' ? (
            item.isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />
          ) : (
            <FileText className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-gray-300">{item.name}</span>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getLanguageFromFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar - File Explorer */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2 text-sm"
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {selectedProject ? (
            <div className="p-2">
              {renderFileTree(fileTree)}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Select a project to view files
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {openFiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files open</p>
              <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
            </div>
          </div>
        ) : (
          <>
            {/* File Tabs */}
            <Tabs value={activeFile} onValueChange={setActiveFile} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800">
                <TabsList className="bg-transparent p-0 h-auto">
                  {openFiles.map(file => (
                    <TabsTrigger
                      key={file.id}
                      value={file.id}
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-4 py-2 flex items-center gap-2 group"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeFile(file.id);
                        }}
                        className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5"
                      >
                        ×
                      </button>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex items-center gap-2 px-3">
                  <Button size="sm" variant="outline">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Editor Content */}
              {openFiles.map(file => (
                <TabsContent
                  key={file.id}
                  value={file.id}
                  className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <div className="flex-1 p-4 bg-black">
                    <textarea
                      value={file.id === activeFile ? editorContent : file.content || ''}
                      onChange={(e) => {
                        if (file.id === activeFile) {
                          setEditorContent(e.target.value);
                        }
                      }}
                      className="w-full h-full bg-black text-gray-100 font-mono text-sm resize-none border-none outline-none"
                      style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                      placeholder="Start editing..."
                    />
                  </div>
                  
                  {/* Status Bar */}
                  <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Language: {getLanguageFromFile(file.name)}</span>
                      <span>{file.path}</span>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};