'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataPreviewTableProps {
    data: Record<string, any>[];
    headers: string[];
}

const ROWS_PER_PAGE = 100;

export function DataPreviewTable({ data = [], headers = [] }: DataPreviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (data.length === 0 || headers.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
              No data to display. Please upload a file to get started.
          </div>
      )
  }

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex h-full flex-col">
        <div className="flex-grow overflow-auto rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    {headers.map((header) => (
                    <TableHead key={header} className="sticky top-0 z-10 bg-card whitespace-nowrap">
                        {header}
                    </TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((row, rowIndex) => (
                    <TableRow key={`row-${startIndex + rowIndex}`}>
                    {headers.map((header) => (
                        <TableCell key={`${header}-${startIndex + rowIndex}`} className="whitespace-nowrap">
                        {String(row[header] ?? 'N/A')}
                        </TableCell>
                    ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
                Showing {Math.min(startIndex + 1, data.length)} to {Math.min(startIndex + ROWS_PER_PAGE, data.length)} of {data.length} rows.
            </div>
            <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
  );
}
