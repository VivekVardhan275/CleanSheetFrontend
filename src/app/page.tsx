'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProcess = () => {
    if (!file && url.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'No Data Source',
        description: 'Please upload a file or provide a URL to proceed.',
      });
      return;
    }

    setIsLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      // In a real application, you would pass the file/URL info to the next page,
      // for example, by uploading it and getting an ID, then passing the ID.
      // For this scaffold, we'll just navigate.
      router.push('/clean');
    }, 1500);
  };

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
            disabled={isLoading}
          />
        </div>

        <div className="mt-8 animate-in fade-in-0 slide-in-from-top-20 duration-900">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
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
