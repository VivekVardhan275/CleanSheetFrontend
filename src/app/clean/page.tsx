'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPreviewTable } from '@/components/data-preview-table';
import { ManualCleanSidebar } from '@/components/manual-clean-sidebar';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CleanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAutoCleaning, setIsAutoCleaning] = useState(false);

  const handleAutoClean = async () => {
    setIsAutoCleaning(true);
    toast({
      title: '🤖 Auto Clean in Progress',
      description: 'Our AI is intelligently cleaning your dataset. Please wait...',
    });

    // Simulate AI processing time
    setTimeout(() => {
      // In a real app, this would be where you handle the response
      // from the autoCleanData Genkit flow.
      toast({
        title: '✅ Auto Clean Successful!',
        description: 'Your data has been cleaned. Redirecting to the dashboard.',
      });
      router.push('/dashboard');
      setIsAutoCleaning(false);
    }, 2500);
  };

  const handleManualClean = () => {
    // Logic to proceed with manual selections
    toast({
      title: 'Manual Clean Ready',
      description: 'Proceed to the dashboard to see your changes.',
    });
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl shadow-lg animate-in fade-in-0 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DataPreviewTable />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg animate-in fade-in-0 delay-150 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Choose Your Cleaning Method</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground"
                onClick={handleAutoClean}
                disabled={isAutoCleaning}
              >
                {isAutoCleaning ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Auto Clean (Recommended)
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleManualClean}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Proceed with Manual Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-20">
          <ManualCleanSidebar />
        </div>
      </div>
    </div>
  );
}
