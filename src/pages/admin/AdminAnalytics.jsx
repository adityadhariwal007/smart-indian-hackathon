import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BarChart3, TrendingDown, Users, Award, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('Last 6 Months');

  const monthlyData = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'OPD Patients',
        data: [28400, 31200, 29800, 34500, 38200, 41100],
        backgroundColor: '#059669',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            Hospital Analytics
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Key operational metrics and patient volume
          </p>
        </div>

        <select
          className="input text-xs py-2 bg-white"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="Last 6 Months">Last 6 Months</option>
          <option value="This Year">This Year</option>
        </select>
      </div>

      {/* 3 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-border rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase">
            <Clock size={16} className="text-primary" /> Avg. Wait Time
          </div>
          <div className="text-3xl font-extrabold text-text-primary">28 min</div>
          <div className="text-xs text-primary font-medium">Reduced by 14m this month</div>
        </div>

        <div className="card p-5 bg-white border border-border rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase">
            <Users size={16} className="text-primary" /> Total Patients (Sep)
          </div>
          <div className="text-3xl font-extrabold text-text-primary">41,100</div>
          <div className="text-xs text-secondary">Consistent daily flow</div>
        </div>

        <div className="card p-5 bg-white border border-border rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-secondary text-xs font-semibold uppercase">
            <Award size={16} className="text-primary" /> Patient Rating
          </div>
          <div className="text-3xl font-extrabold text-text-primary">4.8 / 5.0</div>
          <div className="text-xs text-secondary">Based on verified feedback</div>
        </div>
      </div>

      {/* Simple Clean Footfall Chart */}
      <div className="card p-6 bg-white border border-border rounded-2xl shadow-xs space-y-4">
        <h3 className="font-bold text-base text-text-primary">Monthly OPD Patient Inflow</h3>
        <div style={{ height: '300px' }}>
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
