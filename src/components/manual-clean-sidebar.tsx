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

interface ManualCleanSidebarProps {
    allColumns: string[];
    numericColumns: string[];
    categoricalColumns: string[];
    columnsWithMissingValues: { name: string; type: 'numeric' | 'categorical' }[];
}

export function ManualCleanSidebar({
    allColumns = [],
    numericColumns = [],
    categoricalColumns = [],
    columnsWithMissingValues = [],
}: ManualCleanSidebarProps) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          <span>Preprocessing Pipeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={['item-1', 'item-2']}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Step 1: Column Selection</AccordionTrigger>
            <AccordionContent className="space-y-3 max-h-60 overflow-y-auto p-1">
              <p className="text-sm text-muted-foreground">
                Deselect columns to exclude them from the dataset.
              </p>
              {allColumns.map((col) => (
                <div key={col} className="flex items-center space-x-2">
                  <Checkbox id={`col-${col}`} defaultChecked />
                  <Label htmlFor={`col-${col}`}>{col}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Step 2: Missing Value Imputation</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {columnsWithMissingValues.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose a strategy to handle empty or null values.
                  </p>
                  {columnsWithMissingValues.map((col) => (
                    <div key={`missing-${col.name}`} className="space-y-2">
                      <Label>{col.name}</Label>
                      <Select
                        defaultValue={
                          col.type === 'numeric' ? 'mean' : 'mode'
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select imputation strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remove">Remove Rows</SelectItem>
                          {col.type === 'numeric' ? (
                            <>
                              <SelectItem value="mean">
                                Impute with Mean
                              </SelectItem>
                              <SelectItem value="median">
                                Impute with Median
                              </SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="mode">
                                Impute with Mode
                              </SelectItem>
                              <SelectItem value="constant">
                                Impute with Constant
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No missing values were detected in your dataset.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Step 3: Outlier Handling</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Select a method to manage extreme values.
              </p>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="iqr">Remove using IQR</SelectItem>
                  <SelectItem value="zscore">Remove using Z-score</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {categoricalColumns.length > 0 && (
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Step 4: Categorical Data Encoding
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Convert text categories to numerical representations.
                </p>
                {categoricalColumns.map((col) => (
                  <div key={`cat-${col}`} className="space-y-2">
                    <Label>{col}</Label>
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
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
          
          {numericColumns.length > 0 && (
            <AccordionItem value="item-5">
                <AccordionTrigger>Step 5: Numerical Feature Scaling</AccordionTrigger>
                <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                    Normalize the range of numerical features.
                </p>
                {numericColumns.map((col) => (
                    <div key={`scale-${col}`} className="space-y-2">
                        <Label>{col}</Label>
                        <Select defaultValue="none">
                        <SelectTrigger>
                            <SelectValue placeholder="Select scaling" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="standard">Standard Scaler</SelectItem>
                            <SelectItem value="minmax">Min-Max Scaler</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                ))}
                </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
