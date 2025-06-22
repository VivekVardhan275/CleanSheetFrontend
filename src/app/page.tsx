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
  
  const fullText = 'Clean Your Data Effortlessly';
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    resetData();
  }, [resetData]);

  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [displayedText, fullText]);

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

    if (url) {
      try {
        // Check for valid URL structure
        new URL(url);
      } catch (_) {
        toast({
          variant: 'destructive',
          title: 'Invalid URL',
          description: 'Please enter a valid URL.',
        });
        return;
      }

      // Check for valid file extension
      const lowercasedUrl = url.toLowerCase();
      if (!lowercasedUrl.endsWith('.csv') && !lowercasedUrl.endsWith('.xlsx')) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'The URL must point to a .csv or .xlsx file.',
        });
        return;
      }
      setFile(null);
    }
    
    if (file) {
        setUrl('');
    }

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
        setUrl('');
    }
  }

  const handleUrlChanged = (newUrl: string) => {
      setUrl(newUrl);
      if (newUrl) {
          setFile(null);
      }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight min-h-[144px] md:min-h-[96px] lg:min-h-[72px]">
                {displayedText}
                <span className="inline-block w-1.5 h-[50px] md:h-[60px] ml-2 bg-foreground align-middle animate-blink"></span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The intelligent tool to clean, preprocess, and analyze your datasets. Get started by uploading a file (.csv or .xlsx) or providing a URL.
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
