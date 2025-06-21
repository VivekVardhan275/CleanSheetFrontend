import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Download, FileText, BarChart, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const downloadItems = [
    {
        icon: <FileText className="w-8 h-8 text-primary" />,
        title: 'Cleaned Dataset',
        description: 'Your dataset, cleaned and preprocessed, ready for analysis.',
        buttonText: 'Download .csv',
    },
    {
        icon: <BarChart className="w-8 h-8 text-destructive" />,
        title: 'EDA Report',
        description: 'A comprehensive report of the exploratory data analysis.',
        buttonText: 'Download .pdf',
    },
];

export default function DownloadPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-12 duration-500">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Your Assets are Ready
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Download your cleaned data and generated reports below.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left animate-in fade-in-0 slide-in-from-top-16 duration-700">
          {downloadItems.map((item, index) => (
            <Card key={index} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                {item.icon}
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
              <CardFooter>
                 <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {item.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="animate-in fade-in-0 slide-in-from-top-20 duration-900">
            <Link href="/">
                <Button size="lg" variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start New Session
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
