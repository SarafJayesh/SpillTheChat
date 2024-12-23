// src/components/visualizations/MoodPatterns.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodData {
  timestamp: string;
  sentiment: number;
  mood: 'positive' | 'negative' | 'neutral';
  intensity: number;
}

interface MoodPatternsProps {
  data: MoodData[];
}

export const MoodPatterns: React.FC<MoodPatternsProps> = ({ data }) => {
  const processedData = data.map(d => ({
    ...d,
    // Normalize sentiment to 0-100 scale
    value: ((d.sentiment + 1) / 2) * 100,
    // Create readable timestamp
    time: new Date(d.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }));

  const getGradientOffset = () => {
    const dataMax = Math.max(...processedData.map(d => d.value));
    const dataMin = Math.min(...processedData.map(d => d.value));
    
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
    
    return dataMax / (dataMax - dataMin);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time"
                interval="preserveStartEnd"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Sentiment', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={getGradientOffset()} stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset={getGradientOffset()} stopColor="#8884d8" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="url(#splitColor)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Distribution Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {['Positive', 'Neutral', 'Negative'].map(mood => {
            const count = data.filter(d => d.mood.toLowerCase() === mood.toLowerCase()).length;
            const percentage = (count / data.length) * 100;
            return (
              <div 
                key={mood}
                className="text-center p-3 rounded-lg"
                style={{
                  backgroundColor: 
                    mood === 'Positive' ? 'rgba(130, 202, 157, 0.1)' :
                    mood === 'Negative' ? 'rgba(136, 132, 216, 0.1)' :
                    'rgba(200, 200, 200, 0.1)'
                }}
              >
                <p className="text-sm text-gray-500">{mood}</p>
                <p className="font-bold">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodPatterns;