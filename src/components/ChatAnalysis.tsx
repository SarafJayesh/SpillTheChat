"use client";

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export function ChatUpload({ onUpload }: { onUpload: (content: string) => void }) {
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const processFile = async (file: File) => {
    if (file.type !== 'text/plain') {
      setError('Please upload a WhatsApp chat export file (.txt)');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess(false);
      
      const content = await file.text();
      
      // Basic validation that it's a WhatsApp chat
      const firstFewLines = content.split('\n').slice(0, 5).join('\n');
      const whatsappPattern = /\d{2}\/\d{2}\/\d{2},\s\d{2}:\d{2}\s-\s[^:]+:/;
      
      if (!whatsappPattern.test(firstFewLines)) {
        setError('This doesn\'t look like a WhatsApp chat export. Please check the file and try again.');
        return;
      }

      onUpload(content);
      setSuccess(true);
    } catch (err) {
      setError('Error reading file. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Upload Chat</h2>
            <p className="text-sm text-gray-500">
              Export your WhatsApp chat and upload the .txt file
            </p>
          </div>

          <label 
            className={`
              flex flex-col items-center justify-center 
              w-full h-32 border-2 border-dashed rounded-lg 
              cursor-pointer transition-colors
              ${isUploading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}
              ${success ? 'border-green-300' : 'border-gray-300'}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {success ? (
                <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
              ) : (
                <Upload className={`w-8 h-8 mb-2 ${isUploading ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
              <p className="text-sm text-gray-500">
                {isUploading ? 'Processing...' : success ? 'Chat uploaded successfully!' : 'Click to upload or drag and drop'}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
              disabled={isUploading}
            />
          </label>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}