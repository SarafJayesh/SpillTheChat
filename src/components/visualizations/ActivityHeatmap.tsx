// src/components/visualizations/ActivityHeatmap.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityData {
  date: string;
  hour: number;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  maxValue?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  data,
  maxValue = Math.max(...data.map(d => d.count))
}) => {
  // Process data into a 24x7 grid
  const gridData = new Array(24).fill(0).map(() => new Array(7).fill(0));
  
  data.forEach(d => {
    const date = new Date(d.date);
    const dayOfWeek = date.getDay();
    gridData[d.hour][dayOfWeek] = d.count;
  });

  // Calculate color intensity based on count
  const getColor = (count: number) => {
    const intensity = Math.min(count / maxValue, 1);
    return `rgba(59, 130, 246, ${intensity})`; // blue-500 with varying opacity
  };

  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0') + ':00'
  );

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day labels */}
            <div className="flex">
              <div className="w-16"></div> {/* Spacer for hour labels */}
              {dayLabels.map(day => (
                <div 
                  key={day}
                  className="flex-1 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="relative">
              {hourLabels.map((hour, i) => (
                <div key={hour} className="flex items-center">
                  <div className="w-16 text-right pr-2 text-sm text-gray-500">
                    {hour}
                  </div>
                  {gridData[i].map((count, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="flex-1 aspect-square m-px relative group"
                    >
                      <div
                        className="w-full h-full rounded-sm transition-colors duration-200"
                        style={{ backgroundColor: getColor(count) }}
                      ></div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {`${count} messages at ${hour} on ${dayLabels[j]}`}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end">
              <div className="text-sm text-gray-500 mr-2">Activity Level:</div>
              <div className="flex items-center space-x-1">
                {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: getColor(intensity * maxValue) }}
                  ></div>
                ))}
              </div>
              <div className="flex text-xs text-gray-500 ml-2">
                <span>Less</span>
                <span className="mx-2">-</span>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
