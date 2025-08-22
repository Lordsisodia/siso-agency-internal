
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Settings, RefreshCw } from 'lucide-react';

export function MessagingView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Messaging Integration
          </CardTitle>
          <CardDescription>
            Automate your task management with messaging platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-2">Integration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center gap-2">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="text-blue-500"
                  >
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#229ED9" fillOpacity="0.2" stroke="#229ED9" strokeWidth="1.5"/>
                    <path d="M16.5 8.5L12.5 12.5L10.5 15.5L8.5 12" stroke="#229ED9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">Telegram</span>
                </div>
                <span className="text-sm px-2 py-1 rounded bg-amber-100 text-amber-800">Not Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center gap-2">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="text-green-500"
                  >
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#25D366" fillOpacity="0.2" stroke="#25D366" strokeWidth="1.5"/>
                    <path d="M16 11.3C16 14.1397 13.7397 16.4 10.9 16.4C9.90631 16.4 8.98033 16.1101 8.2 15.6L6 16.4L6.8 14.2C6.28994 13.4197 6 12.4937 6 11.5C6 8.66031 8.26031 6.4 11.1 6.4C13.9397 6.4 16 8.46031 16 11.3Z" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">WhatsApp</span>
                </div>
                <span className="text-sm px-2 py-1 rounded bg-amber-100 text-amber-800">Not Connected</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Configure Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Connect your messaging accounts to send and receive task updates automatically
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configure Telegram
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configure WhatsApp
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-2">Messaging Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="gap-2" disabled>
                <Send className="h-4 w-4" />
                Send Today's Tasks
              </Button>
              <Button variant="secondary" className="gap-2" disabled>
                <RefreshCw className="h-4 w-4" />
                Sync Task Updates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            Recent messages sent and received through integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No message history available</p>
            <p className="text-sm mt-2">Connect your messaging accounts to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
