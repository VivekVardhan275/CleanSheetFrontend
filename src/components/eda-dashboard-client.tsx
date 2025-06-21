'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { Loader2, AlertTriangle } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

// Define a local type for the EDA results
interface ClientEdaResult {
  dataTypeDistribution: { name: string; value: number }[];
  nullValueAnalysis: { name: string; missing: number }[];
  valueDistributions: {
    column: string;
    distribution: { name: string; count: number }[];
  }[];
}

export function EdaDashboardClient() {
  const { data, schema, isLoading: isDataLoading } = useData();
  const [edaResult, setEdaResult] = useState<ClientEdaResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDataLoading) {
      setIsLoading(true);
      return;
    }

    if (data.length > 0 && schema) {
      try {
        setError(null);
        
        // 1. Data Type Distribution
        const dataTypeDistribution = [
          { name: 'Numeric', value: schema.numericColumns.length },
          { name: 'Categorical', value: schema.categoricalColumns.length },
        ].filter(d => d.value > 0);

        // 2. Null Value Analysis
        const nullValueAnalysis = schema.columnsWithMissingValues.map(col => {
          const missingCount = data.filter(row => {
            const value = row[col.name];
            return value === null || value === undefined || String(value).trim() === '';
          }).length;
          return { name: col.name, missing: missingCount };
        }).filter(item => item.missing > 0);

        // 3. Value Distributions
        const valueDistributions = [];
        if (schema.numericColumns.length > 0) {
            const mainNumericColumn = schema.numericColumns[0];
            const values = data.map(row => Number(row[mainNumericColumn])).filter(v => !isNaN(v) && v !== null);
            
            if (values.length > 0) {
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min;
                const binCount = Math.min(10, Math.floor(Math.sqrt(values.length)));
                
                if (range === 0 && binCount > 0) {
                     valueDistributions.push({
                        column: mainNumericColumn,
                        distribution: [{ name: String(min), count: values.length }],
                    });
                } else if (binCount > 1) {
                    const binSize = range / binCount;
                    const bins = Array.from({ length: binCount }, (_, i) => {
                        const binMin = min + i * binSize;
                        const binMax = min + (i + 1) * binSize;
                        const isLastBin = i === binCount - 1;

                        const count = values.filter(v => 
                            v >= binMin && (isLastBin ? v <= binMax : v < binMax)
                        ).length;

                        return {
                            name: `${binMin.toFixed(1)}-${binMax.toFixed(1)}`,
                            count: count,
                        };
                    });
                     valueDistributions.push({
                        column: mainNumericColumn,
                        distribution: bins,
                    });
                }
            }
        }
        
        setEdaResult({
          dataTypeDistribution,
          nullValueAnalysis,
          valueDistributions,
        });

      } catch (e) {
        console.error('Failed to generate client-side EDA:', e);
        setError('An error occurred while generating the analysis.');
      } finally {
        setIsLoading(false);
      }
    } else {
        // Handle case with no data
        setIsLoading(false);
        setEdaResult(null);
    }
  }, [data, schema, isDataLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Generating your data analysis...</p>
        <p className="text-sm text-muted-foreground">(This may take a moment)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-destructive">
        <AlertTriangle className="h-12 w-12" />
        <p className="text-lg font-semibold">Analysis Failed</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!edaResult || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-muted-foreground">No data to analyze.</p>
      </div>
    );
  }

  const { dataTypeDistribution, nullValueAnalysis, valueDistributions } = edaResult;
  const mainDistribution = valueDistributions[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-500">
      {/* Data Types */}
      <Card className="rounded-2xl shadow-lg lg:col-span-1">
        <CardHeader>
          <CardTitle>Data Types</CardTitle>
          <CardDescription>Distribution of column types.</CardDescription>
        </CardHeader>
        <CardContent>
           {dataTypeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                <Pie
                    data={dataTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                    {dataTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
            ) : (
             <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No column types to display.
            </div>
            )}
        </CardContent>
      </Card>
      
      {/* Null Values */}
      <Card className="rounded-2xl shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle>Null Value Analysis</CardTitle>
          <CardDescription>Count of missing values per column.</CardDescription>
        </CardHeader>
        <CardContent>
           {nullValueAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={nullValueAnalysis} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="missing" fill="hsl(var(--destructive))" name="Missing Values" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No missing values detected.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Value Distribution */}
      {mainDistribution && mainDistribution.distribution.length > 0 && (
        <Card className="rounded-2xl shadow-lg col-span-full">
          <CardHeader>
            <CardTitle>Value Distribution ({mainDistribution.column})</CardTitle>
            <CardDescription>Histogram showing frequency of {mainDistribution.column.toLowerCase()} groups.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mainDistribution.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
