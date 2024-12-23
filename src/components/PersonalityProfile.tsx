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
  Zap,
  Heart 
} from 'lucide-react';
import { PersonalityProfile as ProfileData } from '../types/personality';

interface PersonalityProfileProps {
  userId: string;
  profile: ProfileData;
}

export function PersonalityProfile({ userId, profile }: PersonalityProfileProps) {
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
              <CardTitle className="text-xl flex items-center gap-2">
                {userId}
                <span className="text-2xl">{profile.characterClass.icon}</span>
              </CardTitle>
              <p className="text-sm text-gray-500">
                {profile.characterClass.name} - {profile.characterClass.description}
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

            {/* Achievements Section */}
            {profile.achievements.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Achievements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                        <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Metrics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(profile.metrics.responseTime)}s
                </p>
                <p className="text-sm text-gray-500">Avg Response Time</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(profile.metrics.activityConsistency)}%
                </p>
                <p className="text-sm text-gray-500">Activity Consistency</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(profile.metrics.messageLength)}
                </p>
                <p className="text-sm text-gray-500">Avg Message Length</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.round(profile.metrics.socialConnection)}%
                </p>
                <p className="text-sm text-gray-500">Social Connection</p>
              </div>
            </div>

            {/* Highlights Section */}
            {profile.highlights.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Memorable Moments
                </h4>
                <div className="space-y-3">
                  {profile.highlights.map((highlight, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white rounded-lg shadow-sm border"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-medium">{highlight.type}</p>
                      </div>
                      <p className="text-sm text-gray-600">{highlight.description}</p>
                      {highlight.context && (
                        <p className="text-xs text-gray-500 mt-1">{highlight.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalityProfile;