"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Users, Clock, Image, CalendarDays, Heart, Star, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MessageDate {
    date: string;
    count: number;
  }
  
interface TimeDistribution {
    hour: number;
    count: number;
}  

interface ChatStats {
    totalMessages: number;
    participants: string[];
    messagesByParticipant: Record<string, number>;
    mediaCount: number;
    messagesByDate: MessageDate[];
    timeDistribution: TimeDistribution[];
    emojiCount: Record<string, number>;
    averageMessageLength: number;
    mostActiveDate: MessageDate;
    lateNightPercentage: number;
    messageLengths: number[];
  }

interface ChatAnalysisProps {
  chatContent: string;
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

export function ChatAnalysis({ chatContent }: ChatAnalysisProps) {
  const [stats, setStats] = React.useState<ChatStats | null>(null);
  const [activeTab, setActiveTab] = React.useState('overview');

  React.useEffect(() => {
    analyzeChatContent(chatContent);
  }, [chatContent]);

  const analyzeChatContent = (content: string) => {
    const lines = content.split('\n');
    const stats = {
        totalMessages: 0,
        participants: new Set<string>(),
        messagesByParticipant: {} as Record<string, number>,
        mediaCount: 0,
        messagesByDate: {} as Record<string, number>,
        timeDistribution: Array(24).fill(0),
        emojiCount: {} as Record<string, number>,
        messageLengths: [] as number[],
    };
    

    // Regex for emoji counting (basic version)
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

    lines.forEach(line => {
      const match = line.match(/^(\d{2}\/\d{2}\/\d{2}),\s(\d{2}:\d{2})\s-\s([^:]+):\s(.*)/);
      
      if (match) {
        const [_, date, time, name, message] = match;
        const hour = parseInt(time.split(':')[0]);

        stats.totalMessages++;
        stats.participants.add(name.trim());
        stats.messagesByParticipant[name.trim()] = (stats.messagesByParticipant[name.trim()] || 0) + 1;
        stats.messagesByDate[date] = (stats.messagesByDate[date] || 0) + 1;
        stats.timeDistribution[hour]++;
        stats.messageLengths.push(message.length);

        // Count emojis
        const emojis = message.match(emojiRegex) || [];
        emojis.forEach(emoji => {
          stats.emojiCount[emoji] = (stats.emojiCount[emoji] || 0) + 1;
        });

        if (message.includes('<Media omitted>')) {
          stats.mediaCount++;
        }
      }
    });

    // Process the collected data
    const messagesByDateArray: MessageDate[] = Object.entries(stats.messagesByDate)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mostActiveDate: MessageDate = messagesByDateArray.reduce((max, curr) => 
      (curr.count > max.count ? curr : max), messagesByDateArray[0]);
    

    setStats({
      ...stats,
      participants: Array.from(stats.participants),
      messagesByDate: messagesByDateArray,
      timeDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: stats.timeDistribution[i],
      })),
      averageMessageLength: Math.round(
        stats.messageLengths.reduce((a, b) => a + b, 0) / stats.messageLengths.length
      ),
      mostActiveDate,
      lateNightPercentage: Math.round(
        (stats.timeDistribution.slice(22).concat(stats.timeDistribution.slice(0, 4))
          .reduce((a, b) => a + b, 0) / stats.totalMessages) * 100
      ),
    });
  };

  if (!stats) return null;

  return (
    <div className="w-full space-y-6">
      {/* Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['overview', 'activity', 'participants', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-500">{stats.totalMessages}</p>
                    <p className="text-sm text-gray-500">Total Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">{stats.participants.length}</p>
                    <p className="text-sm text-gray-500">Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-500">{stats.mediaCount}</p>
                    <p className="text-sm text-gray-500">Media Shared</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-500">
                      {stats.averageMessageLength}
                    </p>
                    <p className="text-sm text-gray-500">Avg Message Length</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chat Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Most Active Date</p>
                    <p className="font-medium">{stats.mostActiveDate.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Late Night Messages</p>
                    <p className="font-medium">{stats.lateNightPercentage}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Most Used Emoji</p>
                    <p className="font-medium">
                      {Object.entries(stats.emojiCount)
                        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Activity Section */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Message Activity</CardTitle>
              <CardDescription>Messages sent per day over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.messagesByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Distribution</CardTitle>
              <CardDescription>When are messages most frequently sent?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Participants Section */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Distribution</CardTitle>
              <CardDescription>How much each participant contributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.messagesByParticipant).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {Object.entries(stats.messagesByParticipant).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participant Rankings</CardTitle>
              <CardDescription>Total messages sent by each participant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.messagesByParticipant)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([name, count], index) => (
                    <div key={name} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{name}</span>
                          <span className="text-gray-500">{count} messages</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(count as number / stats.totalMessages) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Section */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Patterns</CardTitle>
              <CardDescription>When is the chat most active?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Moon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Night Owl Index</p>
                    <p className="font-medium">{stats.lateNightPercentage}% messages sent late night</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Peak Activity Time</p>
                    <p className="font-medium">
                      {stats.timeDistribution.reduce((max, curr) => 
                        curr.count > max.count ? curr : max
                      ).hour}:00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>Message patterns and content types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Image className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Media Ratio</p>
                    <p className="font-medium">
                      {Math.round((stats.mediaCount / stats.totalMessages) * 100)}% of messages are media
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Message Length</p>
                    <p className="font-medium">{stats.averageMessageLength} characters</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Emoji Usage</CardTitle>
              <CardDescription>Most frequently used emojis in the chat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.emojiCount)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 8)
                  .map(([emoji, count]) => (
                    <div key={emoji} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <p className="font-medium">{count}</p>
                        <p className="text-xs text-gray-500">times used</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}