"use client";

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ChatUpload({ onUpload }: { onUpload: (content: string) => void }) {
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const processFile = async (file: File) => {
    try {
      setIsUploading(true);
      setError('');
      setSuccess(false);

      // Debug file info
      console.log('File info:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Read file in chunks if it's large
      if (file.size > 1024 * 1024) { // If larger than 1MB
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          processContent(content);
        };
        reader.readAsText(file, 'utf-8'); // Explicitly specify UTF-8
      } else {
        const content = await file.text();
        processContent(content);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error reading file. Please try again.');
    }
  };

  const processContent = (content: string) => {
    try {
      // Debug content
      console.log('Content preview:', {
        length: content.length,
        firstChars: content.slice(0, 100),
        containsSpecialChars: /[^\x00-\x7F]/g.test(content), // Check for non-ASCII chars
        lineEndingType: content.includes('\r\n') ? 'CRLF' : 'LF'
      });

      // Normalize line endings
      const normalizedContent = content.replace(/\r\n/g, '\n');
      
      // Split into lines and filter out empty ones
      const lines = normalizedContent.split('\n').filter(line => line.trim());
      
      // More permissive validation
      const whatsappPattern = /\d{2}\/\d{2}\/\d{2},\s\d{2}:\d{2}\s-\s[^:]+:/;
      const validLines = lines.filter(line => whatsappPattern.test(line.trim()));
      
      console.log('Validation results:', {
        totalLines: lines.length,
        validLines: validLines.length,
        sampleValidLine: validLines[0]
      });

      if (validLines.length === 0) {
        setError('No valid WhatsApp chat messages found in the file.');
        return;
      }

      onUpload(normalizedContent);
      setSuccess(true);
    } catch (err) {
      console.error('Error in content processing:', err);
      setError('Error processing chat content. Please try again.');
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

          {isUploading && (
            <p className="text-sm text-gray-500">
              Processing your chat file... This might take a moment for larger files.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

