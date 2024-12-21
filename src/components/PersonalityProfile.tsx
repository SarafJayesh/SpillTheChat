// components/PersonalityProfile.tsx

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from '@/components/ui/card';
import { 
  User, 
  Clock, 
  MessageCircle, 
  Award, 
  Zap 
} from 'lucide-react';
import { PersonalityProfile as ProfileData } from '../types/chat';

interface PersonalityProfileProps {
  userId: string;
  profile: ProfileData;
  metrics: ProfileData['metrics']; // Using the metrics type from ProfileData
}

export function PersonalityProfile({ 
  userId, 
  profile, 
  metrics 
}: PersonalityProfileProps) {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Primary Archetype Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{userId}</CardTitle>
              <p className="text-sm text-gray-500">
                {profile.archetype.primary}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Traits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Activity Pattern</p>
                  <p className="font-medium">{profile.traits.activityPattern}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Communication Style</p>
                  <p className="font-medium">{profile.traits.communicationStyle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Group Role</p>
                  <p className="font-medium">{profile.traits.groupRole}</p>
                </div>
              </div>
            </div>

            {/* Special Abilities Section */}
            {profile.specialAbilities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Special Abilities
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {profile.specialAbilities.map((ability) => (
                    <div 
                      key={ability}
                      className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg"
                    >
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{ability}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Archetypes */}
            {profile.archetype.secondary.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Secondary Traits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.archetype.secondary.map((archetype) => (
                    <span 
                      key={archetype}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {archetype}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Section */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(metrics.responseTime)}s
                </p>
                <p className="text-sm text-gray-500">Avg Response Time</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(metrics.activityConsistency)}%
                </p>
                <p className="text-sm text-gray-500">Activity Consistency</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(metrics.messageLength)}
                </p>
                <p className="text-sm text-gray-500">Avg Message Length</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(metrics.socialConnection)}%
                </p>
                <p className="text-sm text-gray-500">Social Connection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}