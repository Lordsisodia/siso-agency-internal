import React, { useState, useCallback, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInstagramLeads } from '@/hooks/useInstagramLeads';
import { Button } from '@/components/ui/button';
import { useOutreachColumnPreferences } from '@/hooks/useOutreachColumnPreferences';
import { useOutreachAccounts } from '@/hooks/useOutreachAccounts';
import { toast } from "sonner";
import { UserPlus, BarChart3, Star, Edit, Plus } from 'lucide-react';
import { INITIAL_COLUMNS } from '@/components/admin/outreach/types';
import { LeadsTable } from '@/components/admin/outreach/leads/LeadsTable';
import { LeadsToolbar } from '@/components/admin/outreach/leads/LeadsToolbar';
import { LeadDetailSheet } from '@/components/admin/outreach/LeadDetailSheet';
import { LeadsFunnelChart } from '@/components/admin/outreach/LeadsFunnelChart';
import { OutreachAnalyticsCards } from '@/components/admin/outreach/OutreachAnalyticsCards';
import { OutreachActivityLog } from '@/components/admin/outreach/OutreachActivityLog';
import { AccountsGrid } from '@/components/admin/outreach/accounts/AccountsGrid';
import { AccountManagementDialog } from '@/components/admin/outreach/accounts/AccountManagementDialog';
import { PlatformFilters } from '@/components/admin/outreach/accounts/PlatformFilters';
import { IndustryFilter } from '@/components/admin/outreach/accounts/IndustryFilter';
import type { OutreachAccount } from '@/types/outreach';
import type { OutreachStats } from '@/components/admin/outreach/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCompactNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';

const AdminOutreach = () => {
  const [activeTab, setActiveTab] = useState('leads-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { leads, isLoading: isLeadsLoading, refetch, addLead } = useInstagramLeads(100);
  const { accounts, isLoading: isAccountsLoading, addAccount, updateAccount } = useOutreachAccounts();
  
  const { 
    columns, 
    sortColumn, 
    sortDirection, 
    setColumns, 
    setSortColumn, 
    setSortDirection,
    showAllColumns,
    toggleShowAllColumns,
    moveColumn
  } = useOutreachColumnPreferences(INITIAL_COLUMNS);

  const [activePlatform, setActivePlatform] = useState<'instagram' | 'linkedin' | undefined>();
  const [selectedIndustry, setSelectedIndustry] = useState<string>();
  const [activeAccount, setActiveAccount] = useState<OutreachAccount | undefined>();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const stats: OutreachStats = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(lead => lead.status === 'contacted').length;
    const converted = leads.filter(lead => lead.status === 'converted').length;
    const pending = leads.filter(lead => lead.status === 'new').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    
    return {
      total,
      contacted,
      converted,
      pending,
      conversionRate
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(lead => 
        lead.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.full_name && lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Sort leads
    if (sortColumn) {
      filtered.sort((a, b) => {
        let valA = a[sortColumn as keyof typeof a] || '';
        let valB = b[sortColumn as keyof typeof b] || '';
        
        // Handle numerical values
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        
        // Handle string values
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [leads, searchQuery, statusFilter, sortColumn, sortDirection]);

  const pinnedColumns = useMemo(() => 
    columns.filter(col => col.pinned),
    [columns]
  );

  const visibleColumns = useMemo(() => 
    columns.filter(col => showAllColumns || col.visible),
    [columns, showAllColumns]
  );

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      await addLead.mutateAsync({ username: searchQuery });
      setSearchQuery('');
      toast.success('Lead added successfully');
    } catch (error) {
      toast.error('Failed to add lead');
    }
  };

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection, setSortColumn, setSortDirection]);

  const handleSelectAll = useCallback(() => {
    setSelectedLeads(prev => 
      prev.length === filteredLeads.length ? [] : filteredLeads.map(lead => lead.id)
    );
  }, [filteredLeads]);

  const handleSelectLead = useCallback((leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  }, []);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleRowClick = (leadId: string) => {
    setActiveLead(leadId);
  };

  const handleExportLeads = () => {
    const leadsToExport = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.id)) 
      : filteredLeads;
    
    const csv = [
      // CSV headers
      Object.keys(leadsToExport[0] || {}).join(','),
      // CSV data rows
      ...leadsToExport.map(lead => Object.values(lead).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `instagram_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`Exported ${leadsToExport.length} leads to CSV`);
  };

  const handleEditAccount = (account: OutreachAccount) => {
    setActiveAccount(account);
    setIsAccountDialogOpen(true);
  };

  const handleAddAccount = () => {
    setActiveAccount(undefined);
    setIsAccountDialogOpen(true);
  };

  const handleSaveAccount = async (accountData: Partial<OutreachAccount>) => {
    try {
      if (activeAccount) {
        await updateAccount.mutateAsync({
          id: activeAccount.id,
          ...accountData,
        });
      } else {
        const newAccount = {
          username: accountData.username || '',
          platform: accountData.platform || 'instagram',
          account_type: accountData.account_type || 'business',
          status: accountData.status || 'active',
          daily_dm_limit: accountData.daily_dm_limit || 30,
          daily_follow_limit: accountData.daily_follow_limit || 50,
          daily_comment_limit: accountData.daily_comment_limit || 40,
          assigned_to: accountData.assigned_to || null,
          last_action_at: null,
          credentials: accountData.credentials || {},
          proxy_settings: accountData.proxy_settings || {},
          platform_specific_settings: accountData.platform_specific_settings || {},
          ...accountData
        };
        
        await addAccount.mutateAsync(newAccount);
      }
      setIsAccountDialogOpen(false);
      setActiveAccount(undefined);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'contacted':
        return <Badge className="bg-blue-500/20 text-blue-400">Contacted</Badge>;
      case 'converted':
        return <Badge className="bg-green-500/20 text-green-400">Converted</Badge>;
      case 'new':
      default:
        return <Badge className="bg-amber-500/20 text-amber-400">New</Badge>;
    }
  };

  const renderCellContent = (lead: any, key: string) => {
    switch (key) {
      case 'username':
        return (
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-2">
              {lead.username.charAt(0).toUpperCase()}
            </div>
            <span>@{lead.username}</span>
          </div>
        );
        
      case 'followers_count':
        return lead.followers_count 
          ? formatCompactNumber(lead.followers_count) 
          : 'N/A';
          
      case 'status':
        return getStatusBadge(lead.status);
        
      case 'created_at':
        return new Date(lead.created_at).toLocaleDateString();
        
      case 'source':
        return <Badge variant="outline">Instagram</Badge>;
        
      case 'followed':
        return lead.followed ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'commented':
        return lead.commented ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'messaged':
        return lead.messaged ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'outreach_account':
        return lead.outreach_account || (
          <span className="text-muted-foreground">Not assigned</span>
        );
        
      case 'app_plan_status':
        if (lead.app_plan_status === 'completed') {
          return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
        } else if (lead.app_plan_status === 'in_progress') {
          return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
        } else {
          return <Badge variant="outline">Not Started</Badge>;
        }
        
      case 'app_plan_url':
        return lead.app_plan_url ? (
          <a 
            href={lead.app_plan_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
            onClick={e => e.stopPropagation()}
          >
            <FileText className="h-4 w-4 mr-1" />
            View Plan
          </a>
        ) : '-';
        
      case 'last_interaction':
        return lead.last_interaction_at ? (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            {new Date(lead.last_interaction_at).toLocaleDateString()}
          </div>
        ) : '-';
        
      case 'assigned_to':
        return lead.assigned_to || '-';
        
      case 'notes':
        return lead.notes || '-';
        
      default:
        return lead[key] || '-';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <AdminPageTitle
          icon={Megaphone}
          title="Outreach Management"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="leads-overview">Leads Overview</TabsTrigger>
            <TabsTrigger value="lead-management">Lead Management</TabsTrigger>
            <TabsTrigger value="outreach-accounts">Outreach Accounts</TabsTrigger>
            <TabsTrigger value="outreach-campaigns">Campaigns & Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads-overview">
            <OutreachAnalyticsCards />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Funnel Conversion</CardTitle>
                  <CardDescription>Track your lead conversion process</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadsFunnelChart stats={stats} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Outreach Activity</CardTitle>
                  <CardDescription>Latest lead interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <OutreachActivityLog />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Recently added Instagram leads</CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('lead-management')}
                >
                  View All Leads
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLeadsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Loading leads...
                        </TableCell>
                      </TableRow>
                    ) : leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          No leads found. Add your first lead.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.slice(0, 5).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>@{lead.username}</TableCell>
                          <TableCell>{lead.full_name || '-'}</TableCell>
                          <TableCell>
                            {lead.followers_count 
                              ? formatCompactNumber(lead.followers_count) 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(lead.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lead-management">
            <Card>
              <CardHeader>
                <CardTitle>Lead Database</CardTitle>
                <CardDescription>Manage and track your leads</CardDescription>
              </CardHeader>
              
              <LeadsToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddLead={handleAddLead}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                selectedLeads={selectedLeads}
                onClearSelection={() => setSelectedLeads([])}
                columns={columns}
                onColumnsChange={setColumns}
                showAllColumns={showAllColumns}
                onToggleShowAll={toggleShowAllColumns}
                onExport={handleExportLeads}
                onRefresh={() => refetch()}
                isAddingLead={addLead.isPending}
              />
              
              <LeadsTable
                visibleColumns={visibleColumns}
                pinnedColumns={pinnedColumns}
                filteredLeads={filteredLeads}
                selectedLeads={selectedLeads}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectAll={handleSelectAll}
                onSelectLead={handleSelectLead}
                onRowClick={handleRowClick}
                isLoading={isLeadsLoading}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="outreach-accounts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Social Media Accounts</CardTitle>
                    <CardDescription>Manage your outreach accounts</CardDescription>
                  </div>
                  <Button onClick={handleAddAccount}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>

                <PlatformFilters
                  activePlatform={activePlatform}
                  onPlatformChange={setActivePlatform}
                />

                <IndustryFilter
                  selectedIndustry={selectedIndustry}
                  onIndustryChange={setSelectedIndustry}
                />
              </CardHeader>

              <CardContent>
                <AccountsGrid
                  accounts={accounts}
                  onEditAccount={handleEditAccount}
                  platform={activePlatform}
                  industryFilter={selectedIndustry}
                />
              </CardContent>
            </Card>

            <AccountManagementDialog
              account={activeAccount}
              isOpen={isAccountDialogOpen}
              onClose={() => {
                setIsAccountDialogOpen(false);
                setActiveAccount(undefined);
              }}
              onSave={handleSaveAccount}
            />
          </TabsContent>
          
          <TabsContent value="outreach-campaigns">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Outreach Funnel Performance</CardTitle>
                  <CardDescription>Conversion metrics across funnel stages</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  <p className="ml-4 text-muted-foreground">
                    Campaign analytics coming soon...
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Templates</CardTitle>
                  <CardDescription>Save and reuse outreach campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full mb-4">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                  
                  <div className="space-y-3">
                    {['Fitness App Outreach', 'Agency Owner Outreach', 'E-commerce Owners'].map((template, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-400 mr-2" />
                          <span>{template}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {activeLead && (
        <LeadDetailSheet
          leadId={activeLead}
          isOpen={!!activeLead}
          onClose={() => setActiveLead(null)}
          onUpdate={refetch}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOutreach;
