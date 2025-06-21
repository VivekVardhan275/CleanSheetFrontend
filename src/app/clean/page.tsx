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
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  generateDefaultCleanSummary,
  GenerateDefaultCleanSummaryInput,
} from '@/ai/flows/generate-default-clean-summary';
import { useData } from '@/context/data-context';

export default function CleanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, headers, schema, isLoading: isDataLoading } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualOptions, setShowManualOptions] = useState(false);
  const [tooltipSummary, setTooltipSummary] = useState('Generating summary...');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

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

  useEffect(() => {
    async function fetchSummary() {
      if (!schema) {
        if (!isDataLoading) {
            setTooltipSummary('Could not load schema to generate summary.');
            setIsSummaryLoading(false);
        }
        return;
      }
      try {
        const input: GenerateDefaultCleanSummaryInput = {
          numericColumns: schema.numericColumns,
          categoricalColumns: schema.categoricalColumns,
          columnsWithMissingValues: schema.columnsWithMissingValues,
        };
        const result = await generateDefaultCleanSummary(input);
        setTooltipSummary(result.summary);
      } catch (error) {
        console.error('Failed to generate summary:', error);
        setTooltipSummary(
          'Could not load summary. Default steps include handling missing values, encoding categorical data, and scaling numeric features.'
        );
      } finally {
        setIsSummaryLoading(false);
      }
    }
    if (schema) {
      fetchSummary();
    }
  }, [schema, isDataLoading]);

  const handleDefaultClean = () => {
    setIsProcessing(true);
    toast({
      title: '🤖 Default Cleaning Started',
      description: 'Your data is being processed. Redirecting to dashboard...',
    });
    // Simulate backend processing
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleManualClean = () => {
    setIsProcessing(true);
    toast({
      title: 'Applying Manual Changes',
      description: 'Your selections are being applied...',
    });
    // Simulate backend processing
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
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
        {/* Main Content */}
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
                <div className="flex items-stretch gap-2">
                  <Button
                    size="lg"
                    className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground"
                    onClick={handleDefaultClean}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    Proceed with Default Clean
                  </Button>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="aspect-square h-auto"
                          disabled={isSummaryLoading}
                        >
                          {isSummaryLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <HelpCircle className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-4">
                        <h4 className="font-semibold mb-2 text-foreground">
                          Default Cleaning Steps
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {tooltipSummary}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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

        {/* Sidebar */}
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
                onClick={handleManualClean}
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
