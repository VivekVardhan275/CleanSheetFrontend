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

const MOCK_CLEANED_CSV_CONTENT = `id,name,age,city,occupation
1,John Doe,28,New York,Engineer
2,Jane Smith,34,London,Designer
3,Sam Wilson,34,Tokyo,Developer
4,Alice Johnson,45,Sydney,Manager
5,Bob Brown,23,Paris,Student
6,Charlie Black,34,New York,Engineer
7,Diana Prince,29,London,Artist
8,Peter Parker,22,New York,Photographer
9,Bruce Wayne,40,Gotham,CEO
10,Clark Kent,35,Metropolis,Journalist
`;

const MOCK_EDA_HTML_CONTENT = `
  <h1>EDA Report: Cleaned Customer Dataset</h1>
  <p>This report provides an exploratory data analysis of the processed customer dataset. It covers key aspects such as data quality, distributions, and relationships between variables.</p>
  
  <h2>Dataset Overview</h2>
  <blockquote>This dataset contains 10 rows and 5 columns, detailing customer information including their age, city, and occupation. All missing values have been handled.</blockquote>
  
  <h2>Visualizations</h2>
  <h3>Age Distribution (Cleaned)</h3>
  <p>A histogram of the 'Age' column reveals the age distribution of customers. Most customers are in their late 20s to mid-30s. Missing ages were imputed with the mean.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="bar chart" alt="Age Distribution Histogram" />
  
  <h3>Occupation by City (Cleaned)</h3>
  <p>This chart illustrates the distribution of various occupations across different cities. Missing occupations were imputed with the mode.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="data visualization" alt="Occupation by City" />
`;

export default function CleanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, headers, schema, isLoading: isDataLoading, setProcessedOutput } = useData();
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

  const createMockZip = async (): Promise<Blob> => {
    const zip = new JSZip();
    zip.file('cleaned_dataset.csv', MOCK_CLEANED_CSV_CONTENT);
    zip.file('eda_report.html', MOCK_EDA_HTML_CONTENT);
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  };

  const handleCleanProcess = async () => {
    setIsProcessing(true);
    toast({
      title: '🤖 Cleaning Started',
      description: 'Your data is being processed...',
    });

    try {
      // Simulate backend call returning a zip
      const zipBlob = await createMockZip();

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
    )
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
              <DataPreviewTable data={data} headers={headers}/>
            </CardContent>
          </Card>

          {!showManualOptions && (
            <Card className="rounded-2xl shadow-lg animate-in fade-in-0 delay-150 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Proceed with Cleaning</CardTitle>
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
              columnsWithMissingValues={
                schema.columnsWithMissingValues
              }
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
