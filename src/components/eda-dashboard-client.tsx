'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { generateEda, type EdaResult } from '@/ai/flows/generate-eda-flow';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function EdaDashboardClient() {
  const { data } = useData();
  const [edaResult, setEdaResult] = useState<EdaResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data.length > 0) {
      setIsLoading(true);
      setError(null);

      const runEda = async () => {
        try {
          const result = await generateEda({ jsonData: JSON.stringify(data) });
          setEdaResult(result);
        } catch (e) {
          console.error('Failed to generate EDA:', e);
          setError('An error occurred while generating the analysis.');
        } finally {
          setIsLoading(false);
        }
      };

      runEda();
    } else {
        setIsLoading(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Generating your data analysis...</p>
        <p className="text-sm text-muted-foreground">(This may take a moment for larger datasets)</p>
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

  const { dataTypeDistribution, nullValueAnalysis, valueDistributions, correlationHeatmapDataUri } = edaResult;
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
        <Card className="rounded-2xl shadow-lg lg:col-span-2">
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

      {/* Correlation Heatmap */}
       <Card className="rounded-2xl shadow-lg lg:col-span-1">
        <CardHeader>
          <CardTitle>Correlation Heatmap</CardTitle>
          <CardDescription>Visualizing numeric relationships.</CardDescription>
        </CardHeader>
        <CardContent>
          {correlationHeatmapDataUri ? (
             <div className="relative aspect-square w-full">
                <Image 
                    src={correlationHeatmapDataUri} 
                    alt="Correlation Heatmap" 
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    data-ai-hint="data visualization"
                />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2" />
              <p>Heatmap could not be generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
