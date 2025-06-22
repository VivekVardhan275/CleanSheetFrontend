'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Info,
  Variable,
  TableIcon,
  BarChart,
  Grid,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// --- Data Structures for Parsed Report ---
interface VariableStats {
  [key: string]: string;
}

interface VariableData {
  name: string;
  type: string;
  stats: VariableStats;
  chartSrc: string | null;
}

interface ParsedReportData {
  title: string;
  overview: Record<string, string>;
  variables: VariableData[];
  correlations: { [key: string]: string };
  missingValues: { [key: string]: string };
  alerts: string[];
}

export function EdaDashboardClient() {
  const { edaHtml } = useData();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isParsing, setIsParsing] = useState(true);
  const [reportData, setReportData] = useState<ParsedReportData | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (edaHtml) {
      setIsParsing(true);
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(edaHtml, 'text/html');

        // --- Data Extraction Logic ---
        const title = doc.querySelector('h1')?.textContent ?? 'EDA Report';

        const overview: Record<string, string> = {};
        doc
          .querySelectorAll('#overview-dataset-statistics table tbody tr')
          .forEach((row) => {
            const key = row.querySelector('th')?.textContent?.trim();
            const value = row.querySelector('td')?.textContent?.trim();
            if (key && value) {
              overview[key] = value;
            }
          });
        
        const alerts = Array.from(doc.querySelectorAll('#overview-alerts .alert > a'))
          .map(a => a.textContent?.trim() || '')
          .filter(Boolean);

        const variables: VariableData[] = [];
        doc.querySelectorAll('.variable').forEach((el) => {
          const name = el.querySelector('h4')?.textContent?.trim();
          if (!name) return;

          const stats: VariableStats = {};
          el.querySelectorAll('table tbody tr').forEach((row) => {
            const key = row.querySelector('th')?.textContent?.trim();
            const value = row.querySelector('td')?.textContent?.trim();
            if (key && value) {
              stats[key] = value;
            }
          });

          const type = stats['Variable type'] || 'Unknown';
          const chartSrc = el.querySelector('img')?.getAttribute('src') || null;

          variables.push({ name, type, stats, chartSrc });
        });

        const correlations: { [key: string]: string } = {};
        doc.querySelectorAll('#correlations .col-sm-6').forEach(el => {
            const title = el.querySelector('h3')?.textContent?.trim();
            const imgSrc = el.querySelector('img')?.getAttribute('src');
            if(title && imgSrc) {
                correlations[title] = imgSrc;
            }
        });
        
        const missingValues: { [key: string]: string } = {};
        doc.querySelectorAll('#missing-values .col-sm-6').forEach(el => {
            const title = el.querySelector('h3')?.textContent?.trim();
            const imgSrc = el.querySelector('img')?.getAttribute('src');
            if(title && imgSrc) {
                missingValues[title] = imgSrc;
            }
        });
        
        setReportData({
          title,
          overview,
          variables,
          correlations,
          missingValues,
          alerts,
        });

      } catch (error) {
        console.error('Failed to parse EDA report:', error);
        toast({
          variant: 'destructive',
          title: 'Parsing Error',
          description: 'Could not read the EDA report structure.',
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
        backgroundColor: '#ffffff',
        onclone: (document) => {
          document.documentElement.classList.remove('dark');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
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

  const overviewStats = useMemo(() => {
    return reportData?.overview
      ? Object.entries(reportData.overview).filter(
          ([key]) => key !== 'Dataset statistics'
        )
      : [];
  }, [reportData]);
  
  const variableTypes = useMemo(() => {
    if (!reportData) return {};
    return reportData.variables.reduce((acc, v) => {
        if (!acc[v.type]) acc[v.type] = 0;
        acc[v.type]++;
        return acc;
    }, {} as Record<string, number>);
  }, [reportData]);

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <h2 className="text-xl font-semibold">Preparing Report...</h2>
        <p className="text-muted-foreground">
          Parsing the analysis and building dashboard...
        </p>
      </div>
    );
  }

  if (!reportData) {
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
    <div className="animate-in fade-in-0 duration-500 container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{reportData.title}</h1>
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

      <div ref={reportContentRef} className="space-y-8">
        {/* --- Overview Section --- */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="w-6 h-6" /> Overview</CardTitle>
            <CardDescription>High-level summary of the dataset.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader><CardTitle className="text-lg">Dataset Statistics</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                        {overviewStats.map(([key, value]) => (
                            <TableRow key={key}>
                            <TableCell className="font-medium">{key}</TableCell>
                            <TableCell className="text-right">{value}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg">Variable Types</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                        {Object.entries(variableTypes).map(([type, count]) => (
                            <TableRow key={type}>
                                <TableCell className="font-medium">{type}</TableCell>
                                <TableCell className="text-right">{count}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {reportData.alerts.length > 0 && (
                <Card className="md:col-span-2 lg:col-span-1 border-destructive/50">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-destructive"><AlertTriangle /> Alerts</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {reportData.alerts.map((alert, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5" />
                                    <span>{alert}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>

        {/* --- Variables Section --- */}
        <Card className="rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Variable className="w-6 h-6" /> Variable Details</CardTitle>
                <CardDescription>In-depth analysis of each column in the dataset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {reportData.variables.map(variable => (
                <Card key={variable.name} className="overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-xl">{variable.name}</CardTitle>
                                <CardDescription>
                                    <Badge variant="secondary">{variable.type}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                    {Object.entries(variable.stats).map(([key, value]) => (
                                        <TableRow key={key}>
                                        <TableCell className="font-medium text-muted-foreground w-1/3">{key}</TableCell>
                                        <TableCell>{value}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </div>
                        {variable.chartSrc && (
                            <div className="bg-muted/50 flex items-center justify-center p-4 min-h-[200px]">
                                <Image
                                    src={variable.chartSrc}
                                    alt={`Distribution for ${variable.name}`}
                                    width={300}
                                    height={200}
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </div>
                </Card>
                ))}
            </CardContent>
        </Card>

        {/* --- Correlations Section --- */}
        {Object.keys(reportData.correlations).length > 0 && (
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Grid className="w-6 h-6" /> Correlations</CardTitle>
              <CardDescription>Heatmaps showing the relationships between variables.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(reportData.correlations).map(([title, src]) => (
                <Card key={title}>
                    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
                    <CardContent className="flex justify-center">
                        <Image src={src} alt={title} width={500} height={400} className="object-contain rounded-md" />
                    </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* --- Missing Values Section --- */}
        {Object.keys(reportData.missingValues).length > 0 && (
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="w-6 h-6" /> Missing Values</CardTitle>
              <CardDescription>Visualizations of missing data patterns.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(reportData.missingValues).map(([title, src]) => (
                 <Card key={title}>
                    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
                    <CardContent className="flex justify-center">
                        <Image src={src} alt={title} width={500} height={400} className="object-contain rounded-md" />
                    </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
