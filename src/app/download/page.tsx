'use client';

import { useState } from 'react';
import { useData } from '@/context/data-context';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Download,
  FileText,
  BarChart,
  RefreshCw,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
  const { data } = useData();
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);

  const handleDownloadCsv = () => {
    if (data.length === 0) {
      alert('No data available to download.');
      return;
    }
    setIsDownloadingCsv(true);

    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'cleaned_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV', error);
      alert('An error occurred while preparing the CSV file.');
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-12 duration-500">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Your Assets are Ready
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Download your cleaned data or proceed to view the full analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left animate-in fade-in-0 slide-in-from-top-16 duration-700">
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <FileText className="w-8 h-8 text-primary" />
              <CardTitle>Cleaned Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your dataset, cleaned and preprocessed, ready for analysis.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleDownloadCsv}
                disabled={isDownloadingCsv}
              >
                {isDownloadingCsv ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloadingCsv ? 'Preparing...' : 'Download .csv'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <BarChart className="w-8 h-8 text-destructive" />
              <CardTitle>EDA Report</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and download a comprehensive report of the exploratory
                data analysis.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">
                  View & Download Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-top-20 duration-900">
          <Link href="/">
            <Button size="lg" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
