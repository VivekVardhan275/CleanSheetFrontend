'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useData } from '@/context/data-context';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertTriangle,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportTitle, setReportTitle] = useState('EDA Report');
  const [isParsing, setIsParsing] = useState(true);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (edaHtml) {
      setIsParsing(true);
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(edaHtml, 'text/html');
        
        // Extract the main title for the card header, but render the rest as HTML
        const title = doc.querySelector('h1')?.textContent ?? 'EDA Report';
        setReportTitle(title);
        
      } catch (error) {
        console.error('Failed to parse EDA report title:', error);
        toast({
          variant: 'destructive',
          title: 'Parsing Error',
          description: 'Could not read the report title.',
        });
      } finally {
        setIsParsing(false);
      }
    } else {
      setIsParsing(false);
    }
  }, [edaHtml, toast]);

  const handleDownloadPdf = async () => {
    if (!reportContentRef.current || isDownloading) return;

    setIsDownloading(true);
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your report.',
    });

    try {
      const reportElement = reportContentRef.current;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff', // Force a white background for the PDF
        onclone: (document) => {
          // Ensure the PDF is generated with a light theme for readability
          document.documentElement.classList.remove('dark');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'px',
        format: [imgWidth, imgHeight],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('eda-report_CleanSheet.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast({
        variant: 'destructive',
        title: 'PDF Generation Failed',
        description: 'An error occurred while creating the PDF. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <h2 className="text-xl font-semibold">Preparing Report...</h2>
        <p className="text-muted-foreground">
          Please wait while we prepare the analysis.
        </p>
      </div>
    );
  }

  if (!edaHtml) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">EDA Report Not Available</h2>
        <p className="text-muted-foreground">
          The report could not be loaded. Please try starting a new session.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exploratory Data Analysis</h1>
          <p className="text-muted-foreground">A complete overview of your dataset's characteristics.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button>
          <Link href="/download">
            <Button size="lg" className="w-full sm:w-auto" variant="outline">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl shadow-lg">
         <CardHeader>
           <CardTitle>{reportTitle}</CardTitle>
         </CardHeader>
         <CardContent>
           <div
             ref={reportContentRef}
             className="prose max-w-none"
             dangerouslySetInnerHTML={{ __html: edaHtml }}
           />
         </CardContent>
      </Card>
    </div>
  );
}
