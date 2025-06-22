'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPreviewTable } from '@/components/data-preview-table';
import { ManualCleanSidebar } from '@/components/manual-clean-sidebar';
import {
  Loader2,
  Sparkles,
  Wand2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/context/data-context';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { fetchProcessedDataZip } from '@/lib/mock-api';

export default function CleanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data,
    headers,
    schema,
    isLoading: isDataLoading,
    setProcessedOutput,
  } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualOptions, setShowManualOptions] = useState(false);

  useEffect(() => {
    if (!isDataLoading && data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data loaded',
        description: 'Please upload a dataset first.',
      });
      router.push('/');
    }
  }, [isDataLoading, data, router, toast]);

  const handleCleanProcess = async () => {
    setIsProcessing(true);
    toast({
      title: '🤖 Cleaning Started',
      description: 'Your data is being processed...',
    });

    try {
      // In a real app, this would fetch the zip from your backend API.
      // e.g., const response = await fetch('/api/clean-data');
      // const zipBlob = await response.blob();
      const zipBlob = await fetchProcessedDataZip();

      // Unzip and process the file
      const zip = await JSZip.loadAsync(zipBlob);
      const csvFile = zip.file('cleaned_dataset.csv');
      const htmlFile = zip.file('eda_report.html');

      if (!csvFile || !htmlFile) {
        throw new Error('Required files not found in the zip archive.');
      }

      const csvString = await csvFile.async('string');
      const htmlString = await htmlFile.async('string');

      // Parse CSV data
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length) {
            console.error('Parsing errors:', results.errors);
            toast({
              variant: 'destructive',
              title: 'Failed to parse cleaned data',
              description: 'The cleaned CSV file has errors.',
            });
            setIsProcessing(false);
            return;
          }

          setProcessedOutput(results.data, htmlString);

          toast({
            title: '✅ Processing Complete',
            description: 'Redirecting to the download page.',
          });

          router.push('/download');
        },
        error: (err) => {
          console.error('PapaParse error:', err);
          toast({
            variant: 'destructive',
            title: 'CSV Parsing Error',
            description: 'Could not parse the cleaned data file.',
          });
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error('Processing failed', error);
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: 'An unexpected error occurred during zip extraction.',
      });
      setIsProcessing(false);
    }
  };

  if (isDataLoading || !schema) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4 text-lg">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 flex-1">
      <div
        className={cn(
          'grid grid-cols-1 gap-8 items-start h-full',
          showManualOptions && 'lg:grid-cols-3'
        )}
      >
        <div
          className={cn(
            'space-y-8 h-full flex flex-col',
            showManualOptions ? 'lg:col-span-2' : 'col-span-1'
          )}
        >
          <Card className="rounded-2xl shadow-lg flex-1 flex flex-col min-h-0">
            <CardHeader>
              <CardTitle className="text-2xl">Data Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 -mt-4">
              <DataPreviewTable data={data} headers={headers} />
            </CardContent>
          </Card>

          {!showManualOptions && (
            <Card className="rounded-2xl shadow-lg animate-in fade-in-0 delay-150 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Proceed with Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="w-full bg-primary/90 hover:bg-primary text-primary-foreground"
                  onClick={handleCleanProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Proceed with Default Clean
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowManualOptions(true)}
                  disabled={isProcessing}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  Customize Manually
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {showManualOptions && (
          <div className="lg:col-span-1 lg:sticky lg:top-20 animate-in fade-in-0 slide-in-from-right-12 duration-500">
            <ManualCleanSidebar
              allColumns={schema.allColumns}
              numericColumns={schema.numericColumns}
              categoricalColumns={schema.categoricalColumns}
              columnsWithMissingValues={schema.columnsWithMissingValues}
            />
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setShowManualOptions(false)}
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={handleCleanProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-5 w-5" />
                )}
                Apply & Proceed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
