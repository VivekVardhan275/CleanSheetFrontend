import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2 } from 'lucide-react';

const mockColumns = ['ID', 'Name', 'Age', 'City', 'Occupation'];

export function ManualCleanSidebar() {
  return (
    <Card className="rounded-2xl shadow-lg animate-in fade-in-0 delay-300 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          <span>Manual Clean Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Step 1: Select Columns</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose columns to keep in your dataset.
              </p>
              {mockColumns.map((col) => (
                <div key={col} className="flex items-center space-x-2">
                  <Checkbox id={col} defaultChecked />
                  <Label htmlFor={col}>{col}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Step 2: Handle Missing Values</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Select defaultValue="mean">
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remove">Remove Row</SelectItem>
                    <SelectItem value="mean">Fill with Mean</SelectItem>
                    <SelectItem value="median">Fill with Median</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Select defaultValue="mode">
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remove">Remove Row</SelectItem>
                    <SelectItem value="mode">Fill with Mode</SelectItem>
                    <SelectItem value="constant">Fill with Constant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Step 3: Encode Categorical</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Convert text categories to numbers.
              </p>
              <div className="space-y-2">
                <Label>City</Label>
                <Select defaultValue="onehot">
                  <SelectTrigger>
                    <SelectValue placeholder="Select encoding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onehot">One-Hot Encoding</SelectItem>
                    <SelectItem value="label">Label Encoding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Step 4: Feature Scaling</AccordionTrigger>
            <AccordionContent>
               <p className="text-sm text-muted-foreground mb-2">
                Scale numerical features to a similar range.
              </p>
              <div className="space-y-2">
                <Label>Age</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select scaling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Scaler</SelectItem>
                    <SelectItem value="minmax">Min-Max Scaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Step 5: Outlier Detection</AccordionTrigger>
            <AccordionContent>
               <p className="text-sm text-muted-foreground mb-2">
                Identify and handle extreme values.
              </p>
              <Select defaultValue="iqr">
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iqr">Remove using IQR</SelectItem>
                    <SelectItem value="zscore">Remove using Z-score</SelectItem>
                  </SelectContent>
                </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
