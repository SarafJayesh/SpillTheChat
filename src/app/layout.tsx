import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SpillTheChat - WhatsApp Chat Analyzer',
  description: 'Discover the hidden stories in your WhatsApp chats',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}