'use client';

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
import Image from 'next/image';

const dataTypeData = [
  { name: 'Numeric', value: 2 },
  { name: 'Categorical', value: 3 },
];

const nullValueData = [
  { name: 'Age', missing: 1, total: 7 },
  { name: 'Occupation', missing: 1, total: 7 },
];

const distributionData = [
  { name: '20-25', count: 1 },
  { name: '26-30', count: 2 },
  { name: '31-35', count: 2 },
  { name: '36-40', count: 0 },
  { name: '41-45', count: 1 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function EdaDashboardClient() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-500">
      {/* Data Types */}
      <Card className="rounded-2xl shadow-lg lg:col-span-1">
        <CardHeader>
          <CardTitle>Data Types</CardTitle>
          <CardDescription>Distribution of column types.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dataTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Null Values */}
      <Card className="rounded-2xl shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle>Null Value Analysis</CardTitle>
          <CardDescription>Count of missing values per column.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={nullValueData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="missing" fill="hsl(var(--destructive))" name="Missing Values" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value Distribution */}
      <Card className="rounded-2xl shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle>Value Distribution (Age)</CardTitle>
          <CardDescription>Histogram showing frequency of age groups.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Correlation Heatmap */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Correlation Heatmap</CardTitle>
           <CardDescription>Visualizing numerical correlations.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-center h-[300px] bg-muted/50 rounded-lg">
             <Image src="https://placehold.co/300x300.png" alt="Correlation Heatmap Placeholder" width={300} height={300} data-ai-hint="heatmap chart" className="opacity-50" />
           </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
