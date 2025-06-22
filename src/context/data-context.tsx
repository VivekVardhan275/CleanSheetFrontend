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

const MOCK_EDA_HTML = `
  <h1>EDA Report: Customer Dataset</h1>
  <p>This report provides an exploratory data analysis of the processed customer dataset. It covers key aspects such as data quality, distributions, and relationships between variables.</p>
  
  <h2>Dataset Overview</h2>
  <blockquote>This dataset contains 10 rows and 5 columns, detailing customer information including their age, city, and occupation.</blockquote>
  
  <h2>Data Quality: Missing Values</h2>
  <p>The following table shows columns that originally contained missing values. These have been handled during the cleaning process.</p>
  <table>
    <thead>
        <tr><th>Column Name</th><th>Missing Values Found</th><th>Imputation Strategy</th></tr>
    </thead>
    <tbody>
        <tr><td>Age</td><td>1</td><td>Mean Imputation</td></tr>
        <tr><td>Occupation</td><td>1</td><td>Mode Imputation</td></tr>
    </tbody>
  </table>

  <h2>Visualizations</h2>
  <h3>Age Distribution</h3>
  <p>A histogram of the 'Age' column reveals the age distribution of customers. Most customers are in their late 20s to mid-30s.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="bar chart" alt="Age Distribution Histogram" />
  
  <h3>Occupation by City</h3>
  <p>This chart illustrates the distribution of various occupations across different cities, highlighting professional hubs.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="data visualization" alt="Occupation by City" />
`;

// Define the schema type
type DataSchema = {
  allColumns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  columnsWithMissingValues: { name: string; type: 'numeric' | 'categorical' }[];
};

interface DataContextType {
  data: Record<string, any>[];
  headers: string[];
  schema: DataSchema | null; // Add schema to the context type
  edaHtml: string | null;
  loadData: (source: File | string) => void;
  isLoading: boolean;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [schema, setSchema] = useState<DataSchema | null>(null); // Add schema state
  const [edaHtml, setEdaHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetData = useCallback(() => {
    setData([]);
    setHeaders([]);
    setSchema(null); // Reset schema
    setEdaHtml(null);
    setIsLoading(false);
  }, []);

  const processAndSetData = useCallback((parsedData: Record<string, any>[], parsedHeaders: string[]) => {
      const filteredData = parsedData.filter(row =>
          Object.values(row).some(val => val !== null && val !== '' && val !== undefined)
      );

      // Generate schema from the data
      const allColumns = [...parsedHeaders];
      const numericColumns: string[] = [];
      const categoricalColumns: string[] = [];
      const columnsWithMissingValues: { name: string; type: 'numeric' | 'categorical' }[] = [];

      parsedHeaders.forEach(header => {
          let isNumeric = true;
          let hasMissing = false;
          let hasValues = false;

          const sample = filteredData.slice(0, 100);

          for (const row of sample) {
              const value = row[header];
              if (value === null || value === undefined || String(value).trim() === '') {
                  hasMissing = true;
              } else {
                  hasValues = true;
                  if (typeof value !== 'number' || isNaN(Number(value))) {
                      isNumeric = false;
                  }
              }
          }
          
          const columnType = (isNumeric && hasValues) ? 'numeric' : 'categorical';

          if (columnType === 'numeric') {
              numericColumns.push(header);
          } else {
              categoricalColumns.push(header);
          }
          
          if (hasMissing) {
              const hasMissingInFull = filteredData.some(row => row[header] === null || row[header] === undefined || String(row[header]).trim() === '');
              if (hasMissingInFull) {
                  columnsWithMissingValues.push({
                      name: header,
                      type: columnType,
                  });
              }
          }
      });

      const newSchema: DataSchema = {
          allColumns,
          numericColumns,
          categoricalColumns,
          columnsWithMissingValues,
      };

      setData(filteredData);
      setHeaders(parsedHeaders);
      setSchema(newSchema); // Set the generated schema
      // Simulate receiving the EDA HTML from a backend process
      setEdaHtml(MOCK_EDA_HTML);
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
    schema, // Pass schema in the context value
    edaHtml,
    loadData,
    isLoading,
    resetData,
  }), [data, headers, schema, edaHtml, loadData, isLoading, resetData]);

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
