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
  const { loadData, isLoading, resetData, data } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    resetData();
  }, [resetData]);

  const handleProcess = () => {
    const source = file || url;
    if (!source) {
      toast({
        variant: 'destructive',
        title: 'No Data Source',
        description: 'Please upload a file or provide a URL to proceed.',
      });
      return;
    }
    
    // Clear the other source to avoid confusion
    if (file) setUrl('');
    if (url) setFile(null);

    setIsProcessing(true);
    loadData(source);
  };

  useEffect(() => {
    if (isProcessing && !isLoading && data.length > 0) {
      router.push('/clean');
    } else if (!isLoading) {
      setIsProcessing(false);
    }
  }, [isLoading, isProcessing, data, router]);

  const handleFileSelected = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
        setUrl(''); // Clear URL if a file is selected
    }
  }

  const handleUrlChanged = (newUrl: string) => {
      setUrl(newUrl);
      if (newUrl) {
          setFile(null); // Clear file if a URL is entered
      }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Clean Your Data Effortlessly
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The intelligent tool to clean, preprocess, and analyze your datasets.
                Get started by uploading a file or providing a URL.
            </p>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-top-16 duration-700 w-full">
            <FileUploader
                onFileSelect={handleFileSelected}
                onUrlChange={handleUrlChanged}
                disabled={isLoading || isProcessing}
                urlValue={url}
            />
             {file && (
                <p className="text-sm mt-4 text-muted-foreground animate-in fade-in-0 duration-500">Selected file: {file.name}</p>
             )}
        </div>

        <div className="mt-8 animate-in fade-in-0 slide-in-from-top-20 duration-900">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={isLoading || isProcessing || (!file && !url)}
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
