import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataPreviewTableProps {
    data: Record<string, any>[];
    headers: string[];
}

export function DataPreviewTable({ data = [], headers = [] }: DataPreviewTableProps) {
  if (data.length === 0 || headers.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
              No data to display. Please upload a file to get started.
          </div>
      )
  }

  const dataKeys = headers.map(h => h.toLowerCase());

  return (
    <ScrollArea className="h-full w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id ?? rowIndex}>
              {dataKeys.map((key) => (
                <TableCell key={`${key}-${row.id ?? rowIndex}`}>
                  {row[key] ?? 'N/A'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
