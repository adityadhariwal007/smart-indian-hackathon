import { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, Users, Calendar, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { generatePredictedCrowd } from '../../data/crowdHistory';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AdminPredictions() {
  const [department, setDepartment] = useState('All OPD');
  const [scenario, setScenario] = useState('Standard');

  const hourlyData = useMemo(() => {
    const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
    const baseCurve = [35, 62, 88, 94, 82, 54, 48, 65, 78, 85, 72, 52, 38];
    const multiplier = scenario === 'Rainy / Surge' ? 1.25 : scenario === 'Holiday' ? 0.7 : 1.0;

    return {
      labels: hours,
      values: baseCurve.map(v => Math.min(100, Math.round(v * multiplier)))
    };
  }, [scenario]);

  const chartData = {
    labels: hourlyData.labels,
    datasets: [
      {
        label: 'Predicted Occupancy %',
        data: hourlyData.values,
        borderColor: '#0891B2',
        backgroundColor: 'rgba(8, 145, 178, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: hourlyData.values.map(v => v > 80 ? '#EF4444' : v > 60 ? '#F59E0B' : '#10B981'),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Optimal Capacity Threshold (75%)',
        data: hourlyData.labels.map(() => 75),
        borderColor: '#EF4444',
        borderDash: [6, 6],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#0F172A',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 110,
        ticks: { callback: v => `${v}%` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp size={26} style={{ color: 'var(--primary)' }} />
            AI Predictive Crowd & Patient Surge Modeling
          </h2>
          <p className="text-secondary text-sm">
            Trained on 50,000+ historical OPD records to forecast surges and optimize counter allocations
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-secondary">Weather / Anomaly Sim:</span>
          <select
            className="input text-xs py-1.5"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="Standard">Standard Weekday</option>
            <option value="Rainy / Surge">Heavy Rain / Monsoon Viral Spike (+25%)</option>
            <option value="Holiday">Post-Holiday Morning Surge (-30%)</option>
          </select>
        </div>
      </div>

      {/* Prediction Highlight Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-danger font-bold text-sm mb-1">
            <AlertCircle size={16} /> Peak Influx Window
          </div>
          <div className="text-2xl font-bold">10:00 AM – 11:30 AM</div>
          <div className="text-xs text-secondary mt-1">Expected max crowd: 94% occupancy</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-success font-bold text-sm mb-1">
            <CheckCircle2 size={16} /> Recommended Arrival Window
          </div>
          <div className="text-2xl font-bold text-success">01:30 PM – 03:00 PM</div>
          <div className="text-xs text-secondary mt-1">Expected crowd: &lt; 50% (Wait: 15 min)</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <ShieldAlert size={16} /> AI Counter Recommendation
          </div>
          <div className="text-2xl font-bold text-primary">+2 Flex Counters</div>
          <div className="text-xs text-secondary mt-1">Required for Ortho & Medicine between 10am-12pm</div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="card p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Hourly Predicted Crowd Trajectory vs Capacity Threshold</h3>
          <span className="badge badge-primary text-xs">Simulated Model Confidence: 94.2%</span>
        </div>

        <div style={{ height: '340px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
