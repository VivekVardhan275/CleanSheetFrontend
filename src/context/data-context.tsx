'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import Papa from 'papaparse';

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
  loadData: (source: File | string) => void;
  isLoading: boolean;
  resetData: () => void;
}

const generateSchema = (data: Record<string, any>[], headers: string[]): DataSchema => {
    if (!data.length || !headers.length) {
        return {
            allColumns: [],
            numericColumns: [],
            categoricalColumns: [],
            columnsWithMissingValues: [],
        };
    }
    
    const allColumns = headers;
    const numericColumnSet = new Set<string>();
    const categoricalColumnSet = new Set<string>(headers);
    const columnsWithMissingValuesSet = new Set<string>();
    const sample = data.slice(0, 100);

    for (const header of headers) {
        const isNumeric = sample.every(row => {
            const value = row[header];
            return value === null || value === '' || value === undefined || !isNaN(Number(value));
        });
        
        if (isNumeric && sample.some(r => r[header] !== null && r[header] !== '' && r[header] !== undefined)) {
            numericColumnSet.add(header);
            categoricalColumnSet.delete(header);
        }
    }

    for (const row of data) {
        for (const header of headers) {
            const value = row[header];
            if (value === null || value === undefined || value === '') {
                columnsWithMissingValuesSet.add(header);
            }
        }
    }

    const columnsWithMissingValues = Array.from(columnsWithMissingValuesSet).map(name => ({
        name,
        type: numericColumnSet.has(name) ? 'numeric' as const : 'categorical' as const,
    }));

    return {
        allColumns,
        numericColumns: Array.from(numericColumnSet),
        categoricalColumns: Array.from(categoricalColumnSet),
        columnsWithMissingValues,
    };
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [schema, setSchema] = useState<DataSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetData = useCallback(() => {
    setData([]);
    setHeaders([]);
    setSchema(null);
    setIsLoading(false);
  }, []);

  const loadData = useCallback((source: File | string) => {
    setIsLoading(true);

    Papa.parse(source, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        download: typeof source === 'string',
        complete: (results) => {
            if (results.errors.length) {
                console.error('Parsing errors:', results.errors);
                resetData();
                return;
            }

            const parsedHeaders = results.meta.fields || [];
            const parsedData = (results.data as Record<string, any>[]).filter(row => 
                Object.values(row).some(val => val !== null && val !== '')
            );

            setData(parsedData);
            setHeaders(parsedHeaders);
            const generatedSchema = generateSchema(parsedData, parsedHeaders);
            setSchema(generatedSchema);
            setIsLoading(false);
        },
        error: (error: any) => {
            console.error('PapaParse error:', error);
            resetData();
        }
    });
  }, [resetData]);

  const value = useMemo(() => ({
    data,
    headers,
    schema,
    loadData,
    isLoading,
    resetData,
  }), [data, headers, schema, loadData, isLoading, resetData]);

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
