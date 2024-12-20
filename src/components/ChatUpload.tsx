import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ChatUpload({ onUpload }: { onUpload: (content: string) => void }) {
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file: File) => {
    if (file.type !== 'text/plain') {
      setError('Please upload a WhatsApp chat export file (.txt)');
      return;
    }

    try {
      setIsUploading(true);
      const content = await file.text();
      onUpload(content);
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

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />
          </label>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isUploading && (
            <div className="text-sm text-gray-500">
              Processing your chat...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}