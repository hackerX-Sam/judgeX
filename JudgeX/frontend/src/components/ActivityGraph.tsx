import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './ActivityGraph.css';

interface ActivityGraphProps {
  userId: string;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ userId }) => {
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId || userId === 'demo-user') {
        // Deterministic mock activity pattern for demo/guest preview
        const mockData: Record<string, number> = {};
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          // Create realistic activity distribution pattern
          if ((i * 7 + 13) % 5 === 0 || (i * 3 + 7) % 11 === 0) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            mockData[dateStr] = ((i * 3) % 7) + 1;
          }
        }
        setActivity(mockData);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/submissions/activity/${userId}`);
        setActivity(response.data.activity || {});
      } catch (err) {
        console.error('Failed to fetch activity', err);
        setActivity({});
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [userId]);

  const days: (Date | null)[] = [];
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 364);

  // Pad the beginning so the first real date starts on its correct day of the week (Sun=0)
  const startDayOfWeek = pastDate.getDay();
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Fill in the 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const getColor = (count: number) => {
    if (!count || count === 0) return 'level-0';
    if (count >= 1 && count <= 2) return 'level-1';
    if (count >= 3 && count <= 5) return 'level-2';
    if (count >= 6 && count <= 9) return 'level-3';
    return 'level-4';
  };

  if (loading) {
    return <div className="activity-graph-loading">Loading your streak data...</div>;
  }

  return (
    <div className="activity-graph-container">
      <h3 className="activity-title">Daily Progress</h3>
      <div className="activity-grid">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="activity-square" style={{ visibility: 'hidden' }} />;
          }
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          
          const count = activity[dateString] || 0;
          return (
            <div 
              key={index} 
              className={`activity-square ${getColor(count)}`}
              title={`${count} submissions on ${dateString}`}
            />
          );
        })}
      </div>
      <div className="activity-legend">
        <span>Less</span>
        <div className="activity-square level-0"></div>
        <div className="activity-square level-1"></div>
        <div className="activity-square level-2"></div>
        <div className="activity-square level-3"></div>
        <div className="activity-square level-4"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityGraph;
