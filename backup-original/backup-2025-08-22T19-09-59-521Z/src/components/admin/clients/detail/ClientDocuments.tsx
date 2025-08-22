
import React, { useState } from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlanLinks {
  app_plan: string;
  inspiration: string;
  functionalities: string;
}

// This page is now a lot simpler: it just allows you to view (and edit) 3 Notion URLs.
export function ClientDocuments({ client }: { client: ClientData }) {
  // In a real implementation, these URLs would be stored on the client (and persisted)
  // For demo purposes, we store them in local state
  const [links, setLinks] = useState<PlanLinks>({
    app_plan: client.notion_plan_url || '',
    inspiration: client.key_research || '', // just using key_research as an example "inspiration" field
    functionalities: client.next_steps || '', // just using next_steps for "functionalities" as placeholder
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (key: keyof PlanLinks, value: string) => {
    setLinks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notion Project Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <NotionIcon />
              <span className="font-medium text-lg">App Plan</span>
            </div>
            {editing ? (
              <Input
                type="url"
                className="w-full"
                value={links.app_plan}
                onChange={e => handleChange('app_plan', e.target.value)}
                placeholder="Paste the Notion App Plan link"
              />
            ) : links.app_plan ? (
              <a
                href={links.app_plan}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {links.app_plan}
              </a>
            ) : (
              <p className="text-muted-foreground italic">No link provided.</p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <NotionIcon color='#E5DEFF' />
              <span className="font-medium text-lg">Inspiration</span>
            </div>
            {editing ? (
              <Input
                type="url"
                className="w-full"
                value={links.inspiration}
                onChange={e => handleChange('inspiration', e.target.value)}
                placeholder="Paste the Notion Inspiration link"
              />
            ) : links.inspiration ? (
              <a
                href={links.inspiration}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {links.inspiration}
              </a>
            ) : (
              <p className="text-muted-foreground italic">No link provided.</p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <NotionIcon color='#FEC6A1' />
              <span className="font-medium text-lg">Functionalities</span>
            </div>
            {editing ? (
              <Input
                type="url"
                className="w-full"
                value={links.functionalities}
                onChange={e => handleChange('functionalities', e.target.value)}
                placeholder="Paste the Notion Functionalities link"
              />
            ) : links.functionalities ? (
              <a
                href={links.functionalities}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {links.functionalities}
              </a>
            ) : (
              <p className="text-muted-foreground italic">No link provided.</p>
            )}
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              type="button"
              className="mr-2"
              onClick={() => setEditing(e => !e)}
            >
              {editing ? 'Stop Editing' : 'Edit Links'}
            </Button>
            {/* In a real app, you'd persist these to the DB here */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotionIcon(props: { color?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 120 126" {...props}>
      <path d="M20.6927 21.9927C24.5927 25.4927 25.7927 24.9927 35.4927 23.9927L96.1927 17.3927C97.3927 17.3927 96.4927 16.2927 95.9927 16.0927L85.4927 8.59271C83.3927 6.89271 80.5927 4.79271 74.7927 5.49271L17.6927 12.8927C15.9927 13.1927 15.4927 14.2927 16.1927 14.9927L20.6927 21.9927Z" fill="black"/>
      <path d="M22.1927 37.1927V105.793C22.1927 109.793 24.1927 111.093 28.9927 110.793L96.6927 103.593C101.493 103.293 102.993 100.793 102.993 97.1927V29.2927C102.993 25.6927 101.193 23.7927 97.1927 24.0927L27.9927 31.4927C23.8927 31.9927 22.1927 33.5927 22.1927 37.1927Z" fill={props.color ?? "white"}/>
      <path d="M60.1927 40.4928C60.1927 41.9928 58.8927 43.4928 56.7927 43.5928L32.5927 45.8928V81.3928C32.5927 83.7928 31.1927 85.1928 28.9927 85.3928C26.7927 85.5928 25.0927 84.4928 25.0927 81.9928V33.8928C25.0927 31.3928 26.3927 29.7928 28.9927 29.3928L56.9927 26.2928C58.8927 25.9928 60.1927 27.7928 60.1927 29.6928V40.4928Z" fill="black"/>
      <path d="M63.1927 56.9928V97.1928C63.1927 99.9928 64.9928 100.893 67.3928 98.6928L99.7928 69.6928C101.393 68.1928 101.093 66.7928 99.0928 66.4928L67.9928 62.0928C64.9928 61.4928 63.1927 62.9928 63.1927 65.7928V80.9928L63.1927 56.9928Z" fill="#F2F2F2"/>
    </svg>
  );
}
