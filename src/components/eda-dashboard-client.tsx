'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useData } from '@/context/data-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleDownloadReport = () => {
    if (!edaHtml) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'The report content is not available to download.',
        });
        return;
    }
    
    setIsDownloading(true);
    toast({
        title: 'Preparing Report...',
        description: 'Your download will begin shortly.',
    });

    try {
        const blob = new Blob([edaHtml], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'eda-report_CleanSheet.html');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'An error occurred while creating the report file.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!edaHtml) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">EDA Report Not Available</h2>
        <p className="text-muted-foreground">
          The report could not be loaded. Please try starting a new session.
        </p>
        <Link href="/">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Upload
            </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 duration-500 container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EDA Dashboard</h1>
          <p className="text-muted-foreground">A dynamic overview of your dataset's characteristics.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleDownloadReport} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? 'Preparing...' : 'Download Report (.html)'}
          </Button>
           <Link href="/download">
            <Button size="lg" className="w-full sm:w-auto" variant="outline">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </Link>
        </div>
      </div>
        <Card className="rounded-2xl shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle>Exploratory Data Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-0 pt-6">
                <iframe
                  ref={iframeRef}
                  srcDoc={edaHtml}
                  title="EDA Report"
                  className="w-full border-0 rounded-lg"
                  style={{ height: '80vh' }}
                  sandbox="allow-scripts allow-same-origin"
                />
            </CardContent>
        </Card>
    </div>
  );
}
