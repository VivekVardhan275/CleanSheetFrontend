"use client";

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export interface ManualConfig {
  columns_to_drop: string[];
  imputation: { [col: string]: string };
  outlier_handling: { method: string };
  encoding: { [col: string]: string };
  scaling: { [col: string]: string };
}

interface ManualCleanSidebarProps {
    allColumns: string[];
    numericColumns: string[];
    categoricalColumns: string[];
    columnsWithMissingValues: { name: string; type: 'numeric' | 'categorical' }[];
    config: ManualConfig;
    setConfig: (config: ManualConfig) => void;
}

const MAX_ITEMS_SHOWN = 50;

export function ManualCleanSidebar({
    allColumns = [],
    numericColumns = [],
    categoricalColumns = [],
    columnsWithMissingValues = [],
    config,
    setConfig,
}: ManualCleanSidebarProps) {
  const [expandedLists, setExpandedLists] = useState({
    columns: false,
    imputation: false,
    encoding: false,
    scaling: false,
  });

  const toggleListExpansion = (listName: keyof typeof expandedLists) => {
    setExpandedLists(prev => ({ ...prev, [listName]: !prev[listName] }));
  };

  const handleColumnDropChange = (column: string, checked: boolean) => {
    const newDroppedColumns = checked
      ? config.columns_to_drop.filter(c => c !== column)
      : [...config.columns_to_drop, column];
    setConfig({ ...config, columns_to_drop: newDroppedColumns });
  };

  const handleImputationChange = (column: string, value: string) => {
    setConfig({ ...config, imputation: { ...config.imputation, [column]: value } });
  };

  const handleOutlierChange = (value: string) => {
    setConfig({ ...config, outlier_handling: { method: value } });
  };

  const handleEncodingChange = (column: string, value: string) => {
    setConfig({ ...config, encoding: { ...config.encoding, [column]: value } });
  };

  const handleScalingChange = (column: string, value: string) => {
    setConfig({ ...config, scaling: { ...config.scaling, [column]: value } });
  };

  const visibleColumns = expandedLists.columns ? allColumns : allColumns.slice(0, MAX_ITEMS_SHOWN);
  const visibleMissingValues = expandedLists.imputation ? columnsWithMissingValues : columnsWithMissingValues.slice(0, MAX_ITEMS_SHOWN);
  const visibleCategorical = expandedLists.encoding ? categoricalColumns : categoricalColumns.slice(0, MAX_ITEMS_SHOWN);
  const visibleNumeric = expandedLists.scaling ? numericColumns : numericColumns.slice(0, MAX_ITEMS_SHOWN);

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
            <AccordionContent className="space-y-3 p-1">
              <p className="text-sm text-muted-foreground">
                Deselect columns to exclude them from the dataset.
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {visibleColumns.map((col) => (
                  <div key={col} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`col-${col}`} 
                      checked={!config.columns_to_drop.includes(col)}
                      onCheckedChange={(checked) => handleColumnDropChange(col, !!checked)}
                    />
                    <Label htmlFor={`col-${col}`}>{col}</Label>
                  </div>
                ))}
              </div>
              {allColumns.length > MAX_ITEMS_SHOWN && (
                <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => toggleListExpansion('columns')}>
                  {expandedLists.columns ? 'Show Fewer' : `Show all ${allColumns.length} columns...`}
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Step 2: Missing Value Imputation</AccordionTrigger>
            <AccordionContent className="space-y-4 p-1">
              {columnsWithMissingValues.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose a strategy to handle empty or null values.
                  </p>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {visibleMissingValues.map((col) => (
                      <div key={`missing-${col.name}`} className="space-y-2">
                        <Label>{col.name}</Label>
                        <Select
                          value={config.imputation[col.name]}
                          onValueChange={(value) => handleImputationChange(col.name, value)}
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
                                <SelectItem value="mode">
                                  Impute with Mode
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
                  </div>
                   {columnsWithMissingValues.length > MAX_ITEMS_SHOWN && (
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => toggleListExpansion('imputation')}>
                        {expandedLists.imputation ? 'Show Fewer' : `Show all ${columnsWithMissingValues.length} columns...`}
                    </Button>
                  )}
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
              <Select 
                value={config.outlier_handling.method}
                onValueChange={handleOutlierChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="iqr">Remove using IQR</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {categoricalColumns.length > 0 && (
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Step 4: Categorical Data Encoding
              </AccordionTrigger>
              <AccordionContent className="space-y-4 p-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Convert text categories to numerical representations.
                </p>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {visibleCategorical.map((col) => (
                    <div key={`cat-${col}`} className="space-y-2">
                      <Label>{col}</Label>
                      <Select 
                        value={config.encoding[col]}
                        onValueChange={(value) => handleEncodingChange(col, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select encoding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="onehot">One-Hot Encoding</SelectItem>
                          <SelectItem value="label">Label Encoding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {categoricalColumns.length > MAX_ITEMS_SHOWN && (
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => toggleListExpansion('encoding')}>
                        {expandedLists.encoding ? 'Show Fewer' : `Show all ${categoricalColumns.length} columns...`}
                    </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
          
          {numericColumns.length > 0 && (
            <AccordionItem value="item-5">
                <AccordionTrigger>Step 5: Numerical Feature Scaling</AccordionTrigger>
                <AccordionContent className="space-y-4 p-1">
                <p className="text-sm text-muted-foreground mb-2">
                    Normalize the range of numerical features.
                </p>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {visibleNumeric.map((col) => (
                        <div key={`scale-${col}`} className="space-y-2">
                            <Label>{col}</Label>
                            <Select 
                              value={config.scaling[col]}
                              onValueChange={(value) => handleScalingChange(col, value)}
                            >
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
                </div>
                {numericColumns.length > MAX_ITEMS_SHOWN && (
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => toggleListExpansion('scaling')}>
                        {expandedLists.scaling ? 'Show Fewer' : `Show all ${numericColumns.length} columns...`}
                    </Button>
                )}
                </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
