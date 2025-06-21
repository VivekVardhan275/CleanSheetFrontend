import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data to simulate a loaded dataset
const MOCK_DATA = [
  { id: 1, name: 'John Doe', age: '28', city: 'New York', occupation: 'Engineer' },
  { id: 2, name: 'Jane Smith', age: '34', city: 'London', occupation: 'Designer' },
  { id: 3, name: 'Sam Wilson', age: null, city: 'Tokyo', occupation: 'Developer' },
  { id: 4, name: 'Alice Johnson', age: '45', city: 'Sydney', occupation: 'Manager' },
  { id: 5, name: 'Bob Brown', age: '23', city: 'Paris', occupation: null },
  { id: 6, name: 'Charlie Black', age: '34', city: 'New York', occupation: 'Engineer' },
  { id: 7, name: 'Diana Prince', age: '29', city: 'London', occupation: 'Artist' },
];

const MOCK_HEADERS = ['ID', 'Name', 'Age', 'City', 'Occupation'];

export function DataPreviewTable() {
  return (
    <ScrollArea className="h-72 w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {MOCK_HEADERS.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_DATA.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.age ?? 'N/A'}</TableCell>
              <TableCell>{row.city}</TableCell>
              <TableCell>{row.occupation ?? 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
