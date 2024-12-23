"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Users, Clock, Image as ImageIcon, CalendarDays, Heart, Star, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { PersonalityProfile as PersonalityProfileComponent } from '@/components/PersonalityProfile';
import { PersonalityProfile as PersonalityProfileType } from '@/types/personality';
import { ChatStats } from '@/types/chat';
import { useChatAnalytics } from '@/hooks/useChatAnalytics';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

interface ChatAnalysisProps {
  chatContent: string;
}

interface MessageDate {
  date: string;
  count: number;
}

interface TimeDistribution {
  hour: number;
  count: number;
}

interface SectionProps {
  children: React.ReactNode;
}

interface CardSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

const CardSection: React.FC<CardSectionProps> = ({ children, title, description, className }) => (
  <Card className={className}>
    <CardHeader>
      {title && <CardTitle>{title}</CardTitle>}
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export function ChatAnalysis({ chatContent }: ChatAnalysisProps) {
  const { results, loading, error } = useChatAnalytics(chatContent);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [profiles, setProfiles] = React.useState<Map<string, PersonalityProfileType> | null>(null);

  React.useEffect(() => {
    const personalityResult = results.get('personality');
    if (personalityResult && personalityResult.data) {
      setProfiles(personalityResult.data as Map<string, PersonalityProfileType>);
    }
  }, [results]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing chat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error analyzing chat: {error.message}</p>
      </div>
    );
  }

  const stats = results.get('basic')?.data as ChatStats;
  if (!stats) return null;

  const renderOverviewSection = () => (
    <Section>
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
                <ImageIcon className="w-6 h-6 text-white" />
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
                <p className="text-3xl font-bold text-orange-500">{stats.averageMessageLength}</p>
                <p className="text-sm text-gray-500">Avg Message Length</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CardSection>
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
      </CardSection>
    </Section>
  );

  const renderActivitySection = () => (
    <Section>
      <CardSection
        title="Daily Message Activity"
        description="Messages sent per day over time"
      >
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
      </CardSection>

      <CardSection
        title="Hourly Activity Distribution"
        description="When are messages most frequently sent?"
      >
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
      </CardSection>
    </Section>
  );

  const renderParticipantsSection = () => (
    <Section>
      <CardSection
        title="Message Distribution"
        description="How much each participant contributed"
      >
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
                label={({ name, percent }) => 
                  `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {Object.entries(stats.messagesByParticipant).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardSection>

      <CardSection
        title="Participant Rankings"
        description="Total messages sent by each participant"
      >
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
      </CardSection>
    </Section>
  );

  const renderProfilesSection = () => {
    if (!profiles || profiles.size === 0) return null;

    return (
      <Section>
        {Array.from(profiles.entries()).map(([userId, profile]) => (
          <PersonalityProfileComponent
            key={userId}
            userId={userId}
            profile={profile}
          />
        ))}
      </Section>
    );
  };

  const renderInsightsSection = () => (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSection
          title="Time Patterns"
          description="When is the chat most active?"
        >
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
                  {stats.timeDistribution.reduce((max: TimeDistribution, curr: TimeDistribution) => 
                    curr.count > max.count ? curr : max
                  ).hour}:00
                </p>
              </div>
            </div>
          </div>
        </CardSection>

        <CardSection
          title="Content Analysis"
          description="Message patterns and content types"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-purple-500" />
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
        </CardSection>

        <CardSection
          title="Emoji Usage"
          description="Most frequently used emojis in the chat"
          className="md:col-span-2"
        >
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
        </CardSection>
      </div>
    </Section>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewSection();
      case 'activity':
        return stats.messagesByDate && renderActivitySection();
      case 'participants':
        return renderParticipantsSection();
      case 'profiles':
        return renderProfilesSection();
      case 'insights':
        return renderInsightsSection();
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['overview', 'activity', 'participants', 'insights', 'profiles'].map((tab) => (
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

      {/* Active Tab Content */}
      {renderActiveTabContent()}
    </div>
  );
}

export default ChatAnalysis;