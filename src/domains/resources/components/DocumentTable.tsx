
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  project: string;
  url: string;
}

interface DocumentTableProps {
  documents: Document[];
}

export const DocumentTable = ({ documents }: DocumentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Uploaded Date</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.name}</TableCell>
            <TableCell>{doc.type}</TableCell>
            <TableCell>{doc.uploadedDate}</TableCell>
            <TableCell>{doc.project}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(doc.url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
