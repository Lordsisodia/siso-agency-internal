
import { useInstagramLeads } from '@/hooks/useInstagramLeads';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const InstagramLeadList = () => {
  const { leads, isLoading } = useInstagramLeads();

  if (isLoading) {
    return <div>Loading leads...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.username}</TableCell>
              <TableCell>{lead.followers_count || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="outline">{lead.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(lead.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
