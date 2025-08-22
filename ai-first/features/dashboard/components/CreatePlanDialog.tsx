import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wand2, 
  Eye, 
  Save, 
  Copy, 
  Sparkles, 
  FileText, 
  Share2,
  AlertCircle,
  Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotionEditor } from '@/components/notion-editor/NotionEditor';
import { NotionRenderer } from '@/components/notion-editor/NotionRenderer';
import { NotionBlock } from '@/types/notion';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Auto-formatting preview patterns (simplified version)
const detectSections = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: any = {};
  
  let currentSection = 'overview';
  let currentContent: string[] = [];
  
  const sectionPatterns = {
    overview: /(?:project\s+overview|overview|summary)/i,
    features: /(?:features|key\s+features|functionality)/i,
    timeline: /(?:timeline|phases|schedule|milestones)/i,
    pricing: /(?:pricing|cost|investment|budget)/i,
    contact: /(?:contact|next\s+steps|get\s+started)/i
  };
  
  const detectSection = (line: string): string | null => {
    const lowerLine = line.toLowerCase();
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(lowerLine)) {
        return sectionKey;
      }
    }
    return null;
  };
  
  lines.forEach((line) => {
    const detectedSection = detectSection(line);
    
    if (detectedSection) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }
      
      // Start new section
      currentSection = detectedSection;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });
  
  // Process final section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }
  
  return sections;
};

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [formattedContent, setFormattedContent] = useState('');
  const [contentBlocks, setContentBlocks] = useState<NotionBlock[]>([]);
  const [formattedSections, setFormattedSections] = useState<Record<string, any>>({});
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editMode, setEditMode] = useState<'raw' | 'notion'>('notion');
  const { toast } = useToast();

  const handleAutoFormat = () => {
    if (!rawContent.trim()) {
      toast({
        variant: "destructive",
        title: "No content to format",
        description: "Please paste some content first.",
      });
      return;
    }

    const sections = detectSections(rawContent);
    setFormattedSections(sections);
    
    toast({
      title: "Content auto-formatted!",
      description: `Detected ${Object.keys(sections).length} sections`,
    });
  };

  // Handle NotionEditor changes
  const handleNotionChange = (markdown: string, blocks: NotionBlock[]) => {
    setFormattedContent(markdown);
    setContentBlocks(blocks);
  };

  const handleCreatePlan = async () => {
    const contentToSave = editMode === 'notion' ? formattedContent : rawContent;
    
    if (!title.trim() || !contentToSave.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content.",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // TODO: Replace with actual API call when database is ready
      // Save both the raw content and the notion blocks if available
      const planData = {
        title,
        raw_content: contentToSave,
        notion_blocks: editMode === 'notion' ? contentBlocks : null,
        status: 'active'
      };
      
      // Mock plan creation for now
      const mockSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      const url = `${window.location.origin}/plan/share/${mockSlug}`;
      setGeneratedUrl(url);
      
      toast({
        title: "Plan created successfully!",
        description: "Your shareable plan is ready.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating plan",
        description: "Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyUrl = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      toast({
        title: "URL copied!",
        description: "Share this link with your client.",
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setRawContent('');
    setFormattedContent('');
    setContentBlocks([]);
    setFormattedSections({});
    setGeneratedUrl('');
    setEditMode('notion');
  };

  const sectionIcons = {
    overview: FileText,
    features: Sparkles,
    timeline: AlertCircle,
    pricing: '$',
    contact: Share2
  };

  const sectionTitles = {
    overview: '📋 Project Overview',
    features: '✨ Key Features',
    timeline: '📅 Timeline & Phases',
    pricing: '💰 Investment',
    contact: '📞 Next Steps'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-siso-bg border-siso-border shadow-2xl">
        <DialogHeader className="border-b border-siso-border pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-siso-orange/20 rounded-xl border border-siso-orange/30">
                <Wand2 className="h-6 w-6 text-siso-orange" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-siso-text-bold">
                  Create Shareable App Plan
                </DialogTitle>
                <p className="text-siso-text-muted text-sm mt-1">
                  Create beautiful, professional project proposals with our Notion-style editor
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCreatePlan}
                disabled={isCreating || !title.trim() || !formattedContent.trim()}
                className="bg-siso-orange hover:bg-siso-orange/90 text-white font-medium px-6 py-2 h-10"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Publish Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {generatedUrl ? (
          // Success state - show generated URL with premium styling
          <div className="p-8 space-y-6">
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center text-xl">
                  <Share2 className="mr-3 h-6 w-6" />
                  Plan Published Successfully! ✨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-siso-bg-alt rounded-xl p-6 border border-siso-border">
                  <Label className="text-siso-text-bold text-sm font-semibold mb-3 block">
                    Shareable URL:
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input 
                      value={generatedUrl} 
                      readOnly 
                      className="bg-siso-bg border-siso-border text-siso-text font-mono text-sm"
                    />
                    <Button onClick={copyUrl} variant="outline" className="border-siso-border hover:bg-siso-bg-alt">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => window.open(generatedUrl, '_blank')}
                    className="bg-siso-orange hover:bg-siso-orange/90 text-white"
                  >
                    <Eye className="mr-2 w-4 h-4" />
                    Preview Plan
                  </Button>
                  <Button 
                    onClick={() => {
                      resetForm();
                      onOpenChange(false);
                    }} 
                    variant="outline" 
                    className="border-siso-border hover:bg-siso-bg-alt"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={resetForm} 
                    variant="ghost"
                    className="hover:bg-siso-bg-alt text-siso-text"
                  >
                    Create Another Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Notion-like editor interface
          <div className="flex-1 overflow-hidden">
            {/* Title Section */}
            <div className="px-8 py-6 border-b border-siso-border bg-siso-bg-alt/50">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="✨ Untitled Plan"
                className="text-3xl font-bold bg-transparent border-none text-siso-text-bold placeholder:text-siso-text-muted/60 focus:ring-0 shadow-none p-0 h-auto"
                style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
              />
              <div className="flex items-center space-x-4 mt-4 text-sm text-siso-text-muted">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Ready to edit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-siso-orange" />
                  <span>Rich text editor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wand2 className="w-4 h-4 text-siso-orange" />
                  <span>Auto-formatting enabled</span>
                </div>
              </div>
            </div>

            {/* Notion Editor */}
            <div className="flex-1 overflow-y-auto" style={{ height: 'calc(95vh - 220px)' }}>
              <div className="px-8 py-6">
                <NotionEditor
                  initialContent={rawContent}
                  onChange={(content, blocks) => {
                    setRawContent(content);
                    setContentBlocks(blocks);
                  }}
                  placeholder="Start writing your app plan... Type '/' for commands"
                  className="notion-editor-enhanced"
                />
              </div>
            </div>

            {/* Enhanced bottom toolbar */}
            <div className="px-8 py-4 border-t border-siso-border bg-siso-bg-alt/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6 text-siso-text-muted">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-siso-orange" />
                    <span>Professional formatting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-siso-orange" />
                    <span>Client-ready presentation</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-siso-text-muted">
                    {title.trim() ? '✓ Title added' : 'Add a title to continue'}
                  </span>
                  <span className="text-siso-text-muted">•</span>
                  <span className="text-siso-text-muted">
                    {formattedContent.trim() ? '✓ Content ready' : 'Start writing content'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 