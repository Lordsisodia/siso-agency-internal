import { useMemo } from 'react';
import { AlertCircle, FileText, Link2, ListTodo, Users as UsersIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIndustryFocus, formatIndustryStatus } from '@/domains/admin/industries/utils/formatters';
import { useIndustryDetail } from '@/domains/admin/industries/hooks/useIndustryDetail';

interface IndustryDetailSheetProps {
  industryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IndustryDetailSheet({ industryId, isOpen, onClose }: IndustryDetailSheetProps) {
  const { industry, tasks, documents, clients, isLoading, error, refresh } = useIndustryDetail(industryId);

  const overviewMetrics = useMemo(() => {
    if (!industry) {
      return null;
    }

    return {
      focus: formatIndustryFocus(industry.focus_level),
      status: formatIndustryStatus(industry.status),
      updatedAt: industry.updated_at
        ? new Date(industry.updated_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '—',
    };
  }, [industry]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3 bg-white/10" />
              <Skeleton className="h-4 w-2/3 bg-white/10" />
            </div>
            <Skeleton className="h-16 w-full bg-white/10" />
            <Skeleton className="h-40 w-full bg-white/10" />
          </div>
        ) : industry ? (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-2xl font-semibold text-white">{industry.name}</SheetTitle>
                  <SheetDescription className="text-white/70">
                    {industry.description || 'No description provided yet.'}
                  </SheetDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-white/10 text-white/90">
                    {formatIndustryStatus(industry.status)}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 bg-white/10 text-white/80">
                    {formatIndustryFocus(industry.focus_level)}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
                <Button variant="link" size="sm" className="text-red-100" onClick={() => refresh()}>
                  Retry
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Updated</p>
                <p className="mt-1 text-base font-semibold text-white">{overviewMetrics?.updatedAt}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Focus</p>
                <p className="mt-1 text-base font-semibold text-white">{overviewMetrics?.focus}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Status</p>
                <p className="mt-1 text-base font-semibold text-white">{overviewMetrics?.status}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              {industry.go_to_market_notes && (
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-white/50">Go-To-Market Notes</p>
                  <p className="mt-2 leading-relaxed text-white/80">{industry.go_to_market_notes}</p>
                </div>
              )}
              {industry.market_size_notes && (
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-white/50">Market Insights</p>
                  <p className="mt-2 leading-relaxed text-white/80">{industry.market_size_notes}</p>
                </div>
              )}
              {industry.positioning && (
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-white/50">Positioning</p>
                  <p className="mt-2 leading-relaxed text-white/80">{industry.positioning}</p>
                </div>
              )}
            </div>

            <Separator className="my-5 border-white/10" />

            <Tabs defaultValue="overview" className="pb-8">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 text-white/80">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-4 w-4 text-white/60" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/50">Linked Clients</p>
                      <p className="text-base font-semibold text-white">{clients.length}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white/70" onClick={() => refresh()}>
                    Refresh data
                  </Button>
                </div>

                {clients.length === 0 ? (
                  <p className="text-sm text-white/60">No clients linked yet. Attach client onboarding records to track adoption.</p>
                ) : (
                  <div className="space-y-3">
                    {clients.map((link) => (
                      <div
                        key={link.id}
                        className="rounded-lg border border-white/5 bg-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {link.client?.business_name ?? 'Unnamed Client'}
                            </p>
                            <p className="text-xs text-white/50">Client ID: {link.client_id}</p>
                          </div>
                          <Badge className="bg-white/10 text-white/80">
                            {formatIndustryStatus((link.client?.status ?? 'Unknown').toLowerCase())}
                          </Badge>
                        </div>
                        {link.relationship_notes && (
                          <p className="mt-2 text-xs text-white/60">{link.relationship_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    <span>{tasks.length} total tasks</span>
                  </div>
                  <span>{tasks.filter((task) => OPEN_STATUS.has((task.status ?? '').toLowerCase())).length} open</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="rounded-md border border-white/10 bg-white/5 py-4 text-center text-xs text-white/50">
                    No tasks created yet. Add tasks to track rollout checkpoints.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-md border border-white/10 bg-[#14131D]/60 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white">{task.title}</p>
                            {task.description && (
                              <p className="text-xs leading-relaxed text-white/60">{task.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="border-white/20 bg-transparent px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/70">
                            {formatIndustryStatus((task.status ?? 'todo').toLowerCase())}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/50">
                          {task.due_date && (
                            <span>
                              Due{' '}
                              {new Date(task.due_date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                          {task.priority && <span>Priority: {task.priority}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <FileText className="h-4 w-4" />
                  <span>{documents.length} stored documents</span>
                </div>

                {documents.length === 0 ? (
                  <div className="rounded-md border border-white/10 bg-white/5 py-4 text-center text-xs text-white/50">
                    No documents attached yet. Upload briefs, research, and collateral.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-md border border-white/10 bg-[#14131D]/60 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white">{doc.title}</p>
                            <p className="text-[11px] text-white/50 capitalize">{doc.document_type || 'Uncategorized'}</p>
                          </div>
                          {(doc.source_url || doc.storage_path) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                              asChild
                            >
                              <a href={doc.source_url ?? doc.storage_path ?? '#'} target="_blank" rel="noopener noreferrer">
                                <Link2 className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                        {doc.summary && (
                          <p className="mt-2 text-xs leading-relaxed text-white/60">{doc.summary}</p>
                        )}
                        <p className="mt-2 text-[11px] text-white/40">
                          Added {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="space-y-4 pt-8 text-center text-sm text-white/60">
            <AlertCircle className="mx-auto h-8 w-8 text-white/40" />
            <p>Select an industry to view details.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

const OPEN_STATUS = new Set(['todo', 'in_progress', 'blocked']);
