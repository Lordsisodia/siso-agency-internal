import React, { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Folder, FolderOpen, File, FileText, FileCode, Image, Archive, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../utils/api';

function FilesView({ selectedProject, searchFilter }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    } else {
      setFiles([]);
      setError(null);
    }
  }, [selectedProject]);

  const fetchFiles = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.files(selectedProject.name);
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load files');
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.isDirectory) {
      return expandedDirs.has(file.path) ? FolderOpen : Folder;
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'scss', 'html', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(ext)) {
      return FileCode;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
      return Image;
    }
    
    // Text files
    if (['txt', 'md', 'readme', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'].includes(ext)) {
      return FileText;
    }
    
    // Archives
    if (['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(ext)) {
      return Archive;
    }
    
    return File;
  };

  const getFileColor = (file) => {
    if (file.isDirectory) {
      return "text-blue-600 dark:text-blue-400";
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Code files - various colors
    if (['js', 'jsx'].includes(ext)) return "text-yellow-600 dark:text-yellow-400";
    if (['ts', 'tsx'].includes(ext)) return "text-blue-600 dark:text-blue-400";
    if (ext === 'py') return "text-green-600 dark:text-green-400";
    if (['java', 'kt'].includes(ext)) return "text-orange-600 dark:text-orange-400";
    if (['cpp', 'c', 'h'].includes(ext)) return "text-indigo-600 dark:text-indigo-400";
    if (['css', 'scss'].includes(ext)) return "text-pink-600 dark:text-pink-400";
    if (ext === 'html') return "text-red-600 dark:text-red-400";
    if (['go', 'rs'].includes(ext)) return "text-cyan-600 dark:text-cyan-400";
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return "text-purple-600 dark:text-purple-400";
    }
    
    // Text files
    if (['txt', 'md', 'json', 'xml', 'yaml', 'yml'].includes(ext)) {
      return "text-gray-600 dark:text-gray-400";
    }
    
    return "text-muted-foreground";
  };

  const toggleDirectory = (dirPath) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const filterFiles = (files, searchTerm) => {
    if (!searchTerm.trim()) return files;
    
    const searchLower = searchTerm.toLowerCase();
    
    const filterRecursive = (fileList) => {
      return fileList.filter(file => {
        const nameMatches = file.name.toLowerCase().includes(searchLower);
        const pathMatches = file.path.toLowerCase().includes(searchLower);
        
        if (file.isDirectory && file.children) {
          const filteredChildren = filterRecursive(file.children);
          if (filteredChildren.length > 0) {
            // Auto-expand directories with matching children
            setExpandedDirs(prev => new Set([...prev, file.path]));
            return true;
          }
        }
        
        return nameMatches || pathMatches;
      }).map(file => {
        if (file.isDirectory && file.children) {
          return {
            ...file,
            children: filterRecursive(file.children)
          };
        }
        return file;
      });
    };
    
    return filterRecursive(files);
  };

  const renderFileTree = (files, depth = 0) => {
    const filteredFiles = filterFiles(files, searchFilter);
    
    return filteredFiles.map((file) => {
      const Icon = getFileIcon(file);
      const colorClass = getFileColor(file);
      const isExpanded = expandedDirs.has(file.path);
      
      return (
        <div key={file.path}>
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent/50 transition-colors group",
              depth > 0 && "ml-4"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => {
              if (file.isDirectory) {
                toggleDirectory(file.path);
              } else {
                // Handle file selection - could open in editor
                console.log('File selected:', file.path);
              }
            }}
          >
            {file.isDirectory && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
            {!file.isDirectory && <div className="w-4" />}
            
            <Icon className={cn("w-4 h-4 flex-shrink-0", colorClass)} />
            
            <span className={cn(
              "text-sm truncate flex-1",
              file.isDirectory ? "font-medium text-foreground" : "text-muted-foreground"
            )} title={file.name}>
              {file.name}
            </span>
            
            {!file.isDirectory && file.size && (
              <span className="text-xs text-muted-foreground/70 hidden group-hover:inline">
                {formatFileSize(file.size)}
              </span>
            )}
          </div>
          
          {file.isDirectory && file.children && isExpanded && (
            <div>
              {renderFileTree(file.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-sm font-medium text-foreground mb-2">No Project Selected</h3>
          <p className="text-xs text-muted-foreground">
            Select a project to browse files
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mx-auto mb-4" />
          <h3 className="text-sm font-medium text-foreground mb-2">Loading Files...</h3>
          <p className="text-xs text-muted-foreground">
            Scanning project directory
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <File className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2">Failed to Load Files</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {error}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchFiles}
            className="gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-sm font-medium text-foreground mb-2">Empty Project</h3>
          <p className="text-xs text-muted-foreground">
            No files found in this project
          </p>
        </div>
      </div>
    );
  }

  const filteredFiles = filterFiles(files, searchFilter);

  if (searchFilter && filteredFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2">No Matching Files</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search term
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <div className="space-y-1">
        {renderFileTree(filteredFiles)}
      </div>
    </ScrollArea>
  );
}

export default FilesView;