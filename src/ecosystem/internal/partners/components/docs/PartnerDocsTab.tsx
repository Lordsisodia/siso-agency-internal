import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { ExternalLink, Link2, Trash2, Loader2 } from 'lucide-react';
import type { PartnerDocument, CreatePartnerDocumentInput } from '../../types/partner.types';

interface PartnerDocsTabProps {
  documents: PartnerDocument[];
  onAddDocument?: (input: CreatePartnerDocumentInput) => Promise<void>;
  onDeleteDocument?: (documentId: string, documentTitle?: string) => Promise<void>;
}

const DOCUMENT_TYPES: { value: CreatePartnerDocumentInput['documentType']; label: string }[] = [
  { value: 'notion', label: 'Notion' },
  { value: 'drive', label: 'Drive' },
  { value: 'pdf', label: 'PDF' },
  { value: 'link', label: 'Link' },
  { value: 'other', label: 'Other' },
];

export function PartnerDocsTab({ documents, onAddDocument, onDeleteDocument }: PartnerDocsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [documentType, setDocumentType] = useState<CreatePartnerDocumentInput['documentType']>('link');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!onAddDocument || !title.trim() || !url.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddDocument({ title: title.trim(), url: url.trim(), documentType });
      setTitle('');
      setUrl('');
      setDocumentType('link');
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (document: PartnerDocument) => {
    if (!onDeleteDocument) return;
    await onDeleteDocument(document.id, document.title);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Documents & Resources</h2>
          <p className="text-sm text-white/60">Centralize partner briefs, agreements, and Notion hubs.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white">
              <Link2 className="mr-2 h-4 w-4" /> Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121b] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add Partner Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Partner Enablement Deck"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Link</label>
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Type</label>
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value as CreatePartnerDocumentInput['documentType'])}
                  className="h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
                >
                  {DOCUMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0b0b14] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-white/70" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-siso-orange text-black"
                disabled={isSubmitting || !title.trim() || !url.trim()}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-white/60">
            No documents added yet. Link Notion docs, folders, or assets to keep the team aligned.
          </div>
        )}
        {documents.map((document) => (
          <div key={document.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-white">{document.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">{document.documentType}</p>
                {document.updatedAt && (
                  <p className="mt-2 text-xs text-white/50">
                    Updated {new Date(document.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <a href={document.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-white/10 bg-white/5 text-white hover:bg-rose-500/20"
                  onClick={() => void handleDelete(document)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
