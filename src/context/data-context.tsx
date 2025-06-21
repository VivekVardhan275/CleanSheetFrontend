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
import * as XLSX from 'xlsx';

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
  
  const processAndSetData = useCallback((parsedData: Record<string, any>[], parsedHeaders: string[]) => {
      const filteredData = parsedData.filter(row => 
          Object.values(row).some(val => val !== null && val !== '' && val !== undefined)
      );

      setData(filteredData);
      setHeaders(parsedHeaders);
      const generatedSchema = generateSchema(filteredData, parsedHeaders);
      setSchema(generatedSchema);
      setIsLoading(false);
  }, []);


  const loadData = useCallback((source: File | string) => {
    setIsLoading(true);

    const handlePapaParseComplete = (results: Papa.ParseResult<Record<string, any>>) => {
        if (results.errors.length) {
            console.error('Parsing errors:', results.errors);
            resetData();
            return;
        }
        const parsedHeaders = results.meta.fields || [];
        processAndSetData(results.data, parsedHeaders);
    };
    
    const handlePapaParseError = (error: any) => {
        console.error('PapaParse error:', error);
        resetData();
    };

    if (typeof source === 'string') {
        Papa.parse(source, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            download: true,
            complete: handlePapaParseComplete,
            error: handlePapaParseError,
        });
        return;
    }
    
    const file = source;
    if (file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: handlePapaParseComplete,
            error: handlePapaParseError,
        });
    } else if (file.name.toLowerCase().endsWith('.xlsx')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
                const jsonHeaders = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                processAndSetData(jsonData, jsonHeaders);
            } catch (error) {
                console.error('Error parsing XLSX file:', error);
                resetData();
            }
        };
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            resetData();
        };
        reader.readAsBinaryString(file);
    } else {
        console.error('Unsupported file type');
        resetData();
    }
  }, [resetData, processAndSetData]);

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
