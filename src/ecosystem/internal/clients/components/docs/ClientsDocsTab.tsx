import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { useState } from 'react';
import { Sparkles, Save, FileText, Pin } from 'lucide-react';

interface ClientDocument {
  id: string;
  title: string;
  updated_at: string;
  content: string | null;
  document_type?: string | null;
}

interface ClientsDocsTabProps {
  client: ClientData;
  documents: ClientDocument[];
  onCreateDocument: (payload: Partial<ClientDocument>) => Promise<void>;
  onUpdateDocument: (docId: string, updates: Partial<ClientDocument>) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export function ClientsDocsTab({
  client,
  documents,
  onUpdateDocument,
}: ClientsDocsTabProps) {
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id ?? null);
  const activeDoc = documents.find((doc) => doc.id === activeDocId) ?? documents[0] ?? null;
  const [draftContent, setDraftContent] = useState(activeDoc?.content ?? '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <Card className="bg-white/5 border-white/10 text-white backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.3em] text-white/60">
            Workspace Docs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setActiveDocId(doc.id);
                setDraftContent(doc.content ?? '');
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                doc.id === activeDocId
                  ? 'border-siso-orange/40 bg-siso-orange/10 text-white shadow-[0_12px_42px_rgba(255,99,27,0.45)]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em]">
                <span>{doc.document_type ?? 'note'}</span>
                <Badge className="bg-black/40 text-white/40 border-white/15">
                  {new Date(doc.updated_at).toLocaleDateString()}
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium">{doc.title}</p>
            </button>
          ))}
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-white/40">
          <span>{client.business_name}</span>
          <Sparkles className="h-4 w-4" />
        </CardFooter>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white backdrop-blur-2xl flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">
              {activeDoc?.title ?? 'Choose a document'}
            </CardTitle>
            <p className="text-xs text-white/50 mt-1">
              Draft briefs, onboarding notes, or scope docs. Thought Dump insights feed into this
              canvas next.
            </p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-200 border border-amber-400/40 flex items-center gap-2">
            <Pin className="h-3.5 w-3.5" />
            Pinned
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {activeDoc ? (
            <Textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              className="flex-1 min-h-[320px] bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/30 focus-visible:ring-siso-orange/40"
              placeholder="Start capturing outcomes, decisions, or research highlights…"
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-white/50 text-sm gap-3">
              <FileText className="h-6 w-6" />
              Select or create a document to begin planning.
            </div>
          )}
        </CardContent>
        {activeDoc && (
          <CardFooter className="flex justify-end gap-3">
            <Button
              className="bg-gradient-to-r from-siso-orange to-siso-purple text-white hover:from-siso-orange/90 hover:to-siso-purple/90"
              onClick={() =>
                onUpdateDocument(activeDoc.id, {
                  content: draftContent,
                  updated_at: new Date().toISOString(),
                })
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Save Updates
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
