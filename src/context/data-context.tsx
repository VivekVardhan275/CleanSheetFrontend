'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

// Mock data to simulate a loaded dataset
const MOCK_DATA = [
  { id: 1, name: 'John Doe', age: 28, city: 'New York', occupation: 'Engineer' },
  { id: 2, name: 'Jane Smith', age: 34, city: 'London', occupation: 'Designer' },
  { id: 3, name: 'Sam Wilson', age: null, city: 'Tokyo', occupation: 'Developer' },
  { id: 4, name: 'Alice Johnson', age: 45, city: 'Sydney', occupation: 'Manager' },
  { id: 5, name: 'Bob Brown', age: 23, city: 'Paris', occupation: null },
  { id: 6, name: 'Charlie Black', age: 34, city: 'New York', occupation: 'Engineer' },
  { id: 7, name: 'Diana Prince', age: 29, city: 'London', occupation: 'Artist' },
  { id: 8, name: 'Peter Parker', age: 22, city: 'New York', occupation: 'Photographer' },
  { id: 9, name: 'Bruce Wayne', age: 40, city: 'Gotham', occupation: 'CEO' },
  { id: 10, name: 'Clark Kent', age: 35, city: 'Metropolis', occupation: 'Journalist' },
];

const MOCK_HEADERS = ['ID', 'Name', 'Age', 'City', 'Occupation'];

const MOCK_DATA_SCHEMA = {
  allColumns: ['ID', 'Name', 'Age', 'City', 'Occupation'],
  numericColumns: ['Age'],
  categoricalColumns: ['City', 'Occupation'],
  columnsWithMissingValues: [
    { name: 'Age', type: 'numeric' as const },
    { name: 'Occupation', type: 'categorical' as const },
  ],
};


type DataSchema = {
    allColumns: string[];
    numericColumns: string[];
    categoricalColumns: string[];
    columnsWithMissingValues: { name: string; type: 'numeric' | 'categorical' }[];
};

interface DataContextType {
  data: Record<string, any>[];
  headers: string[];
  schema: DataSchema | null;
  loadData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [schema, setSchema] = useState<DataSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(() => {
    // In a real app, this would involve fetching and parsing the file/URL.
    // For now, we simulate this process with mock data.
    setIsLoading(true);
    setTimeout(() => {
        setData(MOCK_DATA);
        setHeaders(MOCK_HEADERS);
        setSchema(MOCK_DATA_SCHEMA);
        setIsLoading(false);
    }, 1000); // Simulate network/parsing delay
  }, []);

  const value = useMemo(() => ({
    data,
    headers,
    schema,
    loadData,
    isLoading
  }), [data, headers, schema, loadData, isLoading]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
