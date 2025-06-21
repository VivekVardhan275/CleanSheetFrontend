'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, FileText, Link as LinkIcon, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  disabled?: boolean;
}

export function FileUploader({
  onFileSelect,
  onUrlChange,
  disabled,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Basic validation for CSV/XLSX
    if (
      file.type === 'text/csv' ||
      file.name.endsWith('.csv') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    ) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please upload a .csv or .xlsx file.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    onUrlChange(e.target.value);
  };

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardContent className="p-0">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="p-6">
            {selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileText className="h-12 w-12 text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200',
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                  disabled={disabled}
                />
                <div className="flex flex-col items-center text-center space-y-2">
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">
                    Drag & drop files here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse. Supports .csv and .xlsx files.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="url" className="p-6">
            <div className="space-y-4 text-left">
              <label htmlFor="url-input" className="font-medium">
                Public URL to .csv or .xlsx file
              </label>
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/data.csv"
                  value={url}
                  onChange={handleUrlInputChange}
                  disabled={disabled}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ensure the URL is publicly accessible and points directly to a
                file.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
