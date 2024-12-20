"use client";

import { useState } from 'react';
import { ChatUpload } from '@/components/ChatUpload';
import { ChatAnalysis } from '@/components/ChatAnalysis';

export default function Home() {
  const [chatContent, setChatContent] = useState<string | null>(null);

  const handleUpload = async (content: string) => {
    setChatContent(content);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-2">SpillTheChat</h1>
        <p className="text-gray-600 text-center mb-8">
          Discover the hidden stories in your WhatsApp chats
        </p>
        
        {!chatContent ? (
          <ChatUpload onUpload={handleUpload} />
        ) : (
          <div className="space-y-8">
            <button 
              onClick={() => setChatContent(null)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              ← Upload another chat
            </button>
            <ChatAnalysis chatContent={chatContent} />
          </div>
        )}
      </div>
    </main>
  );
}