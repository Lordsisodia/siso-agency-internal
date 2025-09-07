import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Loader2, Download, Search, FileText, Youtube } from 'lucide-react';
import { toast } from 'sonner';

export function YouTubeScraperDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalVideos: number;
    transcriptsExtracted: number;
  } | null>(null);

  const handleRunScraper = async () => {
    setIsLoading(true);
    
    try {
      // This would call your scraper API endpoint
      const response = await fetch('/api/youtube/collect', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to run scraper');
      
      const result = await response.json();
      
      setStats({
        totalVideos: result.totalVideos,
        transcriptsExtracted: result.transcriptsExtracted
      });
      setLastRunDate(new Date().toISOString());
      
      toast.success(`Successfully collected ${result.totalVideos} videos!`);
    } catch (error) {
      console.error('Scraper error:', error);
      toast.error('Failed to run YouTube scraper');
    } finally {
      setIsLoading(false);
    }
  };

  const searchQueries = [
    'cursor ai coding tutorial',
    'claude code programming',
    'vibe coding ai',
    'cursor ide 2024',
    'ai pair programming cursor',
    'claude artifacts coding',
    'windsurf ide tutorial',
    'bolt.new tutorial'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">YouTube Content Scraper</h2>
          <p className="text-muted-foreground">
            Automatically collect AI coding tutorials and transcripts
          </p>
        </div>
        <Button 
          onClick={handleRunScraper} 
          disabled={isLoading}
          size="lg"
          className="bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Collecting...
            </>
          ) : (
            <>
              <Youtube className="mr-2 h-4 w-4" />
              Run Scraper
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Queries</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchQueries.length}</div>
            <p className="text-xs text-muted-foreground">
              Active search terms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Found</CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
            <p className="text-xs text-muted-foreground">
              From this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.transcriptsExtracted || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully extracted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastRunDate ? new Date(lastRunDate).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last collection date
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Queries</CardTitle>
          <CardDescription>
            These queries are used to find AI coding content from YouTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {searchQueries.map((query) => (
              <Badge key={query} variant="secondary">
                {query}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            The YouTube scraper automatically collects AI coding content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Searches YouTube for AI coding tutorials from the past month</p>
          <p>2. Extracts video metadata (title, channel, views, etc.)</p>
          <p>3. Downloads available transcripts/captions</p>
          <p>4. Stores everything in organized JSON files</p>
          <p>5. Creates a markdown summary for easy review</p>
        </CardContent>
      </Card>
    </div>
  );
}