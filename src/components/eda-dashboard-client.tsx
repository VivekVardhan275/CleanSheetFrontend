'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useData } from '@/context/data-context';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertTriangle,
  Download,
  ArrowLeft,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedReport {
  title: string;
  description: string;
  overview: {
    title: string | null;
    content: string | null;
  };
  visualizations: {
    title: string;
    description: string;
    imageUrl: string;
    alt: string;
  }[];
}

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [parsedReport, setParsedReport] = useState<ParsedReport | null>(null);
  const [isParsing, setIsParsing] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (edaHtml) {
      setIsParsing(true);
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(edaHtml, 'text/html');

        const mainTitle = doc.querySelector('h1')?.textContent ?? 'EDA Report';
        const mainDescription =
          doc.querySelector('h1')?.nextElementSibling?.tagName === 'P'
            ? doc.querySelector('h1')?.nextElementSibling?.textContent ??
              'Key insights from your cleaned dataset.'
            : 'Key insights from your cleaned dataset.';

        const overviewEl = Array.from(doc.querySelectorAll('h2')).find((h) =>
          h.textContent?.toLowerCase().includes('overview')
        );
        const overviewTitle = overviewEl?.textContent ?? null;
        const overviewContent = overviewEl?.nextElementSibling?.textContent ?? null;

        const visualizations: ParsedReport['visualizations'] = [];
        doc.querySelectorAll('h3').forEach((h3) => {
          const p = h3.nextElementSibling;
          const img = p?.nextElementSibling;

          if (p?.tagName === 'P' && img?.tagName === 'IMG') {
            visualizations.push({
              title: h3.textContent || 'Untitled Visualization',
              description: p.textContent || '',
              imageUrl: (img as HTMLImageElement).src,
              alt: (img as HTMLImageElement).alt,
            });
          }
        });

        setParsedReport({
          title: mainTitle,
          description: mainDescription,
          overview: { title: overviewTitle, content: overviewContent },
          visualizations,
        });
      } catch (error) {
        console.error('Failed to parse EDA report HTML:', error);
        toast({
          variant: 'destructive',
          title: 'Parsing Error',
          description: 'Could not parse the EDA report.',
        });
      } finally {
        setIsParsing(false);
      }
    } else {
      setIsParsing(false);
    }
  }, [edaHtml, toast]);

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
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (document) => {
          document.documentElement.classList.remove('dark');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const margin = 80;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [imgWidth + margin * 2, imgHeight + margin * 2],
      });

      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
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
        <h2 className="text-xl font-semibold">Parsing Report...</h2>
        <p className="text-muted-foreground">
          Please wait while we prepare the analysis.
        </p>
      </div>
    );
  }

  if (!edaHtml || !parsedReport) {
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
          <h1 className="text-3xl font-bold tracking-tight">{parsedReport.title}</h1>
          <p className="text-muted-foreground">{parsedReport.description}</p>
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

      <div ref={dashboardRef} className="space-y-8 bg-background p-4 sm:p-0">
        {parsedReport.overview.title && parsedReport.overview.content && (
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FileText className="h-6 w-6" />
                {parsedReport.overview.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {parsedReport.overview.content}
              </p>
            </CardContent>
          </Card>
        )}

        {parsedReport.visualizations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              Visualizations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parsedReport.visualizations.map((viz, index) => (
                <Card
                  key={index}
                  className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <CardHeader>
                    <CardTitle>{viz.title}</CardTitle>
                    <CardDescription>{viz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={viz.imageUrl}
                        alt={viz.alt}
                        width={600}
                        height={400}
                        className="object-cover"
                        data-ai-hint="chart visualization"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
