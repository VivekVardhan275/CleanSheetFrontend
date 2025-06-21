import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

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

  return (
    <div className="relative h-full w-full overflow-auto rounded-md border">
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
            <TableRow key={`row-${rowIndex}`}>
              {headers.map((header) => (
                <TableCell key={`${header}-${rowIndex}`}>
                  {String(row[header] ?? 'N/A')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
