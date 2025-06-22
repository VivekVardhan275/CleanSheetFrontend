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
import { Loader2, AlertTriangle, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';

// This is a large block of CSS that will be injected into the iframe
// to make the report match the app's theme.
const getReportCss = (isDark: boolean) => `
  /* Basic resets and theme setup */
  body {
    background-color: ${isDark ? 'hsl(var(--card))' : 'hsl(var(--background))'};
    color: ${isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'};
    font-family: 'Inter', sans-serif;
    padding: 1rem; /* Add some padding inside the iframe */
  }
  h1, h2, h3, h4, h5, h6 {
    color: hsl(var(--foreground)) !important;
    font-weight: 700;
    border-bottom-color: hsl(var(--border)) !important;
  }
  p, div, span, li, td, th {
      color: hsl(var(--muted-foreground)) !important;
  }
  a {
      color: hsl(var(--primary)) !important;
  }

  /* Hide redundant report elements */
  body > .container-fluid > .row:first-of-type, /* Hide main title row */
  .navbar, .footer, .pull-right {
    display: none !important;
  }
  
  /* Layout */
  .container-fluid {
      padding: 0 !important;
  }

  /* Tab navigation styling */
  .nav-tabs {
    border-bottom: 1px solid hsl(var(--border)) !important;
    margin-bottom: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
  }
  .nav-tabs > li > a, .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem 0.5rem 0 0;
    font-size: 0.875rem;
    font-weight: 500;
    transition: colors 0.2s;
    border: 1px solid transparent !important;
    border-bottom: 0 !important;
    color: hsl(var(--muted-foreground)) !important;
    background-color: transparent !important;
  }
  .nav-tabs > li > a:hover, .nav-tabs .nav-link:hover {
      border-color: hsl(var(--border)) !important;
      color: hsl(var(--foreground)) !important;
  }
  .nav-tabs > li.active > a, .nav-tabs .nav-link.active {
    color: hsl(var(--primary)) !important;
    background-color: transparent !important;
    border-bottom: 2px solid hsl(var(--primary)) !important;
    transform: translateY(1px);
  }
  .tab-content {
      border: none;
      padding: 0;
      margin-top: 1rem;
  }

  /* Table styling */
  .table {
    width: 100%;
    margin-bottom: 1rem;
    background-color: transparent !important;
    border-collapse: collapse;
  }
  .table th, .table td {
    padding: 0.75rem;
    vertical-align: top;
    border-top: 1px solid hsl(var(--border)) !important;
  }
  .table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid hsl(var(--border)) !important;
    font-weight: 600;
  }
  .table-striped>tbody>tr:nth-of-type(odd) {
      background-color: hsl(var(--muted) / 0.5) !important;
  }
  
  /* Panel/Card styling for variables */
  .panel {
    margin-bottom: 1.5rem;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 0.75rem;
    box-shadow: none !important;
    background-color: ${isDark ? 'hsl(var(--card) / 0.5)' : 'hsl(var(--card))'} !important;
  }
  .panel-heading {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid hsl(var(--border)) !important;
    background-color: transparent !important;
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
  }
  .panel-title {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1.25rem;
  }
  .panel-body {
    padding: 1.5rem;
  }
  
  /* Alerts and badges */
  .alert {
      border-radius: 0.75rem;
  }
  .alert-warning {
    color: hsl(var(--destructive-foreground)) !important;
    background-color: hsl(var(--destructive)) !important;
    border: 1px solid hsl(var(--destructive)) !important;
  }
  .badge {
      border-radius: 9999px;
      padding: 0.25em 0.6em;
      font-weight: 600;
      background-color: hsl(var(--primary)) !important;
      color: hsl(var(--primary-foreground)) !important;
  }

  /* Progress bars */
  .progress {
      height: 0.75rem;
      border-radius: 9999px;
      background-color: hsl(var(--muted)) !important;
      overflow: hidden;
  }
  .progress-bar {
      background-color: hsl(var(--primary)) !important;
  }
  
  img {
      border-radius: 0.5rem;
      max-width: 100%;
      height: auto;
  }
`;

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportTitle, setReportTitle] = useState('EDA Report');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && edaHtml) {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const doc = iframe.contentDocument;
      if (doc) {
        // Write the HTML content to the iframe
        doc.open();
        doc.write(edaHtml);
        doc.close();

        // Inject our custom stylesheet
        const styleEl = doc.createElement('style');
        styleEl.textContent = getReportCss(isDark);
        doc.head.appendChild(styleEl);

        // Auto-adjust iframe height to content
        const resizeIframe = () => {
          if (iframe && doc.body.scrollHeight > 0) {
              iframe.style.height = doc.body.scrollHeight + 50 + 'px';
          }
        };

        // This is a bit of a hack, but ydata-profiling scripts can take a moment to expand all elements.
        // We observe for changes and resize accordingly.
        const observer = new MutationObserver(resizeIframe);
        observer.observe(doc.body, { childList: true, subtree: true, attributes: true });

        // Run initial resize after a short delay
        const timeoutId = setTimeout(resizeIframe, 300);

        // Add font link to iframe head
        const fontLink = doc.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        fontLink.rel = 'stylesheet';
        doc.head.appendChild(fontLink);
        
        // Cleanup observer on unmount
        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        }
      }
    }
  }, [edaHtml, theme]);

  useEffect(() => {
    if (edaHtml) {
      // Extract title from the original HTML string for the CardHeader
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
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument || isDownloading) return;

    setIsDownloading(true);
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your report.',
    });

    try {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0A0810' : '#F9FAFB', // Match theme bg
        windowWidth: iframe.contentDocument.body.scrollWidth,
        windowHeight: iframe.contentDocument.body.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
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
        position -= pageHeight;
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
            <CardContent className="p-0 sm:p-0 -mt-6">
                <iframe
                  ref={iframeRef}
                  title="EDA Report"
                  className="w-full h-[100vh] border-0"
                  sandbox="allow-scripts"
                  scrolling="no"
                />
            </CardContent>
        </Card>
    </div>
  );
}
