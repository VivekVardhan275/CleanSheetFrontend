'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { loadData, isLoading, resetData } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    resetData();
  }, [resetData]);

  const handleProcess = () => {
    if (!file && url.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'No Data Source',
        description: 'Please upload a file or provide a URL to proceed.',
      });
      return;
    }

    setIsProcessing(true);
    loadData();
  };

  useEffect(() => {
      if (isProcessing && !isLoading) {
          router.push('/clean');
      }
  }, [isLoading, isProcessing, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-12 duration-500">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Welcome to DataCleanr
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The intelligent tool to clean, preprocess, and analyze your datasets
            effortlessly. Get started by uploading your data.
          </p>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-top-16 duration-700">
          <FileUploader
            onFileSelect={setFile}
            onUrlChange={setUrl}
            disabled={isLoading || isProcessing}
          />
        </div>

        <div className="mt-8 animate-in fade-in-0 slide-in-from-top-20 duration-900">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={isLoading || isProcessing}
            className="w-full sm:w-auto"
          >
            {(isLoading || isProcessing) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Cleaning'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
