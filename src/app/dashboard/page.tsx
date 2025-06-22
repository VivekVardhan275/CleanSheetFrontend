import { EdaDashboardClient } from '@/components/eda-dashboard-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Exploratory Data Analysis
          </h1>
          <p className="text-muted-foreground">
            Key insights from your cleaned dataset.
          </p>
        </div>
        <Link href="/download">
          <Button size="lg" className="w-full sm:w-auto" variant="outline">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Downloads
          </Button>
        </Link>
      </div>
      <EdaDashboardClient />
    </div>
  );
}
