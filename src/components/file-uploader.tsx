'use client';

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  disabled?: boolean;
  urlValue: string;
}

export function FileUploader({
  onFileSelect,
  onUrlChange,
  disabled,
  urlValue
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFile =
        files[0].type === 'text/csv' ||
        files[0].name.endsWith('.csv') ||
        files[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        files[0].name.endsWith('.xlsx');

      if (validFile) {
        onFileSelect(files[0]);
      } else {
        alert('Please upload a .csv or .xlsx file.');
        onFileSelect(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };
  
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="relative max-w-2xl mx-auto w-full">
      <div className={cn(
          "bg-card rounded-full p-2 flex items-center border",
          disabled && 'opacity-50'
      )}>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full flex-shrink-0"
          onClick={handleFileClick}
          disabled={disabled}
          aria-label="Upload file"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Input
          type="text"
          placeholder="Or paste a public URL to your data file"
          className="bg-transparent flex-1 outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground pl-2"
          onChange={handleUrlInputChange}
          value={urlValue}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
