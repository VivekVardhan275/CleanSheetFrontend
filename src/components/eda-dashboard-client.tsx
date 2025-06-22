'use client';

import { useState, useRef } from 'react';
import { useData } from '@/context/data-context';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!dashboardRef.current || isDownloading) return;

    setIsDownloading(true);
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your report.',
    });

    try {
      const dashboardElement = dashboardRef.current;
      
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff', // Ensure a solid white background for the canvas
        onclone: (document) => {
          // In the cloned document used for rendering, remove the dark class
          // This ensures all text and elements render in their light-theme style
          document.documentElement.classList.remove('dark');
        },
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Define a margin in pixels (since canvas units are pixels)
      const margin = 80;
      
      // Create a new PDF with dimensions that include margins
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [imgWidth + margin * 2, imgHeight + margin * 2],
      });
      
      // Add the captured image to the PDF, offset by the margin
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      pdf.save('eda-report.pdf');

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
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">EDA Report Not Available</h2>
        <p className="text-muted-foreground">The report could not be loaded. Please try starting a new session.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleDownloadPdf} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Generating PDF...' : 'Download Report'}
        </Button>
      </div>

      <Card className="rounded-2xl shadow-lg animate-in fade-in-0 duration-500">
        <CardContent className="p-4 sm:p-6 md:p-8">
            <div ref={dashboardRef}>
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: edaHtml }}
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
