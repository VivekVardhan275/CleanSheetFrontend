'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPreviewTable } from '@/components/data-preview-table';
import { ManualCleanSidebar } from '@/components/manual-clean-sidebar';
import { Loader2, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CleanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualOptions, setShowManualOptions] = useState(false);

  // NOTE: In a real app, this data would be derived from the uploaded file.
  const MOCK_DATA_SCHEMA = {
    allColumns: ['ID', 'Name', 'Age', 'City', 'Occupation'],
    numericColumns: ['Age'],
    categoricalColumns: ['City', 'Occupation'],
    columnsWithMissingValues: [
      { name: 'Age', type: 'numeric' as const },
      { name: 'Occupation', type: 'categorical' as const },
    ],
  };

  const handleAutoClean = () => {
    setIsProcessing(true);
    toast({
      title: '🤖 Automatic Cleaning Started',
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
              <DataPreviewTable />
            </CardContent>
          </Card>

          {!showManualOptions && (
            <Card className="rounded-2xl shadow-lg animate-in fade-in-0 delay-150 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Proceed with Cleaning</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="w-full bg-primary/90 hover:bg-primary text-primary-foreground"
                  onClick={handleAutoClean}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Start Automatic Cleaning
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

        {/* Sidebar */}
        {showManualOptions && (
          <div className="lg:col-span-1 lg:sticky lg:top-20 animate-in fade-in-0 slide-in-from-right-12 duration-500">
            <ManualCleanSidebar
              allColumns={MOCK_DATA_SCHEMA.allColumns}
              numericColumns={MOCK_DATA_SCHEMA.numericColumns}
              categoricalColumns={MOCK_DATA_SCHEMA.categoricalColumns}
              columnsWithMissingValues={MOCK_DATA_SCHEMA.columnsWithMissingValues}
            />
             <Button
                size="lg"
                className="w-full mt-4"
                onClick={handleManualClean}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                   <ArrowRight className="mr-2 h-5 w-5" />
                )}
                Apply Changes & Proceed
              </Button>
          </div>
        )}
      </div>
    </div>
  );
}
