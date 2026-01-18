
import React from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, FileCode, FilePlus, FileImage, Link2, Download, ExternalLink, Upload
} from 'lucide-react';

interface ClientRelatedDocumentsProps {
  client: ClientData;
}

export function ClientRelatedDocuments({ client }: ClientRelatedDocumentsProps) {
  // In a real implementation, these would be fetched from the database
  const documents = [
    {
      id: 1,
      name: 'Project Proposal',
      type: 'document',
      lastUpdated: '2023-05-01T10:00:00Z',
      size: '1.2 MB',
      author: 'Alex Johnson'
    },
    {
      id: 2,
      name: 'Requirements Specification',
      type: 'document',
      lastUpdated: '2023-05-10T14:30:00Z',
      size: '3.5 MB',
      author: 'Sarah Williams'
    },
    {
      id: 3,
      name: 'Design Mockups',
      type: 'image',
      lastUpdated: '2023-05-15T09:45:00Z',
      size: '8.7 MB',
      author: 'Michael Chen'
    },
    {
      id: 4,
      name: 'API Documentation',
      type: 'code',
      lastUpdated: '2023-06-05T16:20:00Z',
      size: '0.8 MB',
      author: 'David Kim'
    }
  ];

  const links = [
    {
      id: 1,
      name: 'Project Plan',
      url: client.notion_plan_url || 'https://notion.so/project-plan',
      type: 'Notion',
      lastVisited: '2023-06-12T10:30:00Z'
    },
    {
      id: 2,
      name: 'Development Repository',
      url: 'https://github.com/organization/project',
      type: 'GitHub',
      lastVisited: '2023-06-14T15:45:00Z'
    },
    {
      id: 3,
      name: 'Development Site',
      url: client.development_url || 'https://dev.example.com',
      type: 'Website',
      lastVisited: '2023-06-14T09:15:00Z'
    },
    {
      id: 4,
      name: 'Client Website',
      url: client.website_url || 'https://client-website.com',
      type: 'Website',
      lastVisited: '2023-05-20T11:30:00Z'
    }
  ];

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'code':
        return <FileCode className="h-6 w-6 text-violet-500" />;
      case 'image':
        return <FileImage className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const getLinkIcon = (type: string) => {
    switch(type) {
      case 'Notion':
        return <svg className="h-6 w-6" viewBox="0 0 120 126" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.6927 21.9927C24.5927 25.4927 25.7927 24.9927 35.4927 23.9927L96.1927 17.3927C97.3927 17.3927 96.4927 16.2927 95.9927 16.0927L85.4927 8.59271C83.3927 6.89271 80.5927 4.79271 74.7927 5.49271L17.6927 12.8927C15.9927 13.1927 15.4927 14.2927 16.1927 14.9927L20.6927 21.9927Z" fill="black"/>
          <path d="M22.1927 37.1927V105.793C22.1927 109.793 24.1927 111.093 28.9927 110.793L96.6927 103.593C101.493 103.293 102.993 100.793 102.993 97.1927V29.2927C102.993 25.6927 101.193 23.7927 97.1927 24.0927L27.9927 31.4927C23.8927 31.9927 22.1927 33.5927 22.1927 37.1927Z" fill="white"/>
          <path d="M60.1927 40.4928C60.1927 41.9928 58.8927 43.4928 56.7927 43.5928L32.5927 45.8928V81.3928C32.5927 83.7928 31.1927 85.1928 28.9927 85.3928C26.7927 85.5928 25.0927 84.4928 25.0927 81.9928V33.8928C25.0927 31.3928 26.3927 29.7928 28.9927 29.3928L56.9927 26.2928C58.8927 25.9928 60.1927 27.7928 60.1927 29.6928V40.4928Z" fill="black"/>
          <path d="M63.1927 56.9928V97.1928C63.1927 99.9928 64.9928 100.893 67.3928 98.6928L99.7928 69.6928C101.393 68.1928 101.093 66.7928 99.0928 66.4928L67.9928 62.0928C64.9928 61.4928 63.1927 62.9928 63.1927 65.7928V80.9928L63.1927 56.9928Z" fill="#F2F2F2"/>
        </svg>;
      case 'GitHub':
        return <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>;
      case 'Website':
        return <ExternalLink className="h-6 w-6 text-purple-500" />;
      default:
        return <Link2 className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Related Documents</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Files</CardTitle>
          <CardDescription>
            Documents related to {client.project_name || "this project"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 flex items-start gap-4 hover:bg-muted/20">
                {getFileIcon(doc.type)}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {doc.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {doc.size}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated {new Date(doc.lastUpdated).toLocaleDateString()} by {doc.author}
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>External Links</CardTitle>
          <CardDescription>
            Important links related to {client.project_name || "this project"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4 flex items-start gap-4 hover:bg-muted/20">
                {getLinkIcon(link.type)}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{link.name}</h4>
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {link.url}
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {link.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Visited {new Date(link.lastVisited).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
