export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-2">SpillTheChat</h1>
          <p className="text-gray-600 text-center mb-8">Discover the hidden stories in your WhatsApp chats</p>
        </div>
      </main>
    )
  }

import { ChatUpload } from '@/components/ChatUpload';

export default function Home() {
  const handleUpload = (content: string) => {
    // We'll handle chat processing here
    console.log('Chat content received:', content.slice(0, 100));
  };

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8">SpillTheChat</h1>
        <ChatUpload onUpload={handleUpload} />
      </div>
    </main>
  );
}