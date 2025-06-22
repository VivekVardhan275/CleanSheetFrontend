'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { Loader2, AlertTriangle, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportTitle, setReportTitle] = useState('EDA Report');
  const reportContentRef = useRef<HTMLDivElement>(null);

  // Sanitize HTML by removing style tags and extracting body content
  const sanitizedHtml = useMemo(() => {
    if (!edaHtml) return '';
    
    // Remove style and link tags to prevent them from overriding app styles
    let processedHtml = edaHtml
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<link\b[^>]*>/gi, '');

    // Extract content from body tag if present, otherwise use the whole string
    const bodyMatch = processedHtml.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
        processedHtml = bodyMatch[1];
    }
    
    return processedHtml;
  }, [edaHtml]);


  useEffect(() => {
    if (edaHtml) {
      try {
        const doc = new DOMParser().parseFromString(edaHtml, 'text/html');
        const title = doc.querySelector('h1')?.textContent?.trim();
        if (title) {
          setReportTitle(title);
        }
      } catch (e) {
        console.warn("Could not parse report title, using default.");
      }
    }
  }, [edaHtml]);

  const handleDownloadPdf = async () => {
    const reportElement = reportContentRef.current;
    if (!reportElement || isDownloading) return;

    setIsDownloading(true);
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your report.',
    });

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // Use transparent background for canvas
        onclone: (document) => {
          // Force light mode for PDF capture for better readability on white paper
          document.documentElement.classList.remove('dark');
          // Set explicit background on the body for capture
          const body = document.querySelector('.prose');
          if (body) {
            (body as HTMLElement).style.background = 'white';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });

      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
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


  if (!edaHtml) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">EDA Report Not Available</h2>
        <p className="text-muted-foreground">
          The report could not be loaded. Please try starting a new session.
        </p>
        <Link href="/">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Upload
            </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 duration-500 container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EDA Dashboard</h1>
          <p className="text-muted-foreground">A dynamic overview of your dataset's characteristics.</p>
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
        <Card className="rounded-2xl shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle>{reportTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <div ref={reportContentRef}>
                  <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
