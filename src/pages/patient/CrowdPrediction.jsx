import React, { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { generatePredictedCrowd, getDepartmentCrowdData } from '../../data/crowdHistory';
import { getCrowdColor } from '../../data/hospitals';
import { ScrollReveal } from '../../components/animations/Animations';

function CustomSVGChart({ data }) {
  const chartRef = useRef(null);
  const isInView = useInView(chartRef, { once: true, margin: "-100px" });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = 40;

  // Scales
  const maxCrowd = 100;
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.crowd / maxCrowd) * (height - padding * 2);
    return { x, y, ...d };
  });

  // Generate SVG path string
  const pathD = `M ${points[0].x} ${points[0].y} ` + points.map((p, i) => {
    if (i === 0) return '';
    // Bezier curve approximation
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = p.x - (p.x - prev.x) / 3;
    const cp2y = p.y;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }).join(' ');

  // Gradient area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full overflow-x-auto" ref={chartRef}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-md">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0891B2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - padding - (val / 100) * (height - padding * 2);
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} fill="#94A3B8" fontSize="12" textAnchor="end">{val}%</text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 10} fill="#64748B" fontSize="12" textAnchor="middle">
            {p.label}
          </text>
        ))}

        {/* Filled Area */}
        <motion.path
          d={areaD}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Animated Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data Points */}
        {points.map((p, i) => {
          const pointColor = p.crowd > 80 ? '#EF4444' : p.crowd > 50 ? '#F59E0B' : '#10B981';
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="6"
              fill={pointColor}
              stroke="#fff"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 1.5 + (i * 0.1), type: "spring" }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer transition-transform hover:scale-150"
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm z-10 pointer-events-none"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-bold text-gray-800">{hoveredPoint.label}</div>
          <div className="text-gray-600">Crowd: <span className="font-semibold text-primary">{hoveredPoint.crowd}%</span></div>
        </motion.div>
      )}
    </div>
  );
}

export default function CrowdPrediction() {
  const deptCrowd = getDepartmentCrowdData();
  const predictions = useMemo(() => generatePredictedCrowd(9), []);

  const peakHour = predictions.reduce((a, b) => a.crowd > b.crowd ? a : b);
  const lowHour = predictions.reduce((a, b) => a.crowd < b.crowd ? a : b);

  return (
    <div className="animate-fade-in pb-12">
      <ScrollReveal className="page-header mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Crowd Prediction</h1>
        <p className="text-gray-500">Real-time and predicted hospital crowd levels by department.</p>
      </ScrollReveal>

      {/* Current Crowd */}
      <ScrollReveal delay={0.1}>
        <h3 className="mb-4 text-xl font-semibold">Current Department Crowd</h3>
        <div className="card mb-8 shadow-sm">
          {deptCrowd.sort((a, b) => b.crowd - a.crowd).slice(0, 5).map((dept, idx) => (
            <div key={dept.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <span className="w-32 font-medium text-sm text-gray-700 truncate">{dept.name}</span>
              <div className="progress-bar flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-${getCrowdColor(dept.crowd)}-500 rounded-full`}
                  style={{ backgroundColor: dept.crowd > 70 ? '#EF4444' : dept.crowd > 40 ? '#F59E0B' : '#10B981' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${dept.crowd}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                />
              </div>
              <span 
                className="font-bold text-sm w-12 text-right"
                style={{ color: dept.crowd > 70 ? '#EF4444' : dept.crowd > 40 ? '#F59E0B' : '#10B981' }}
              >
                {dept.crowd}%
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Prediction Chart */}
      <ScrollReveal delay={0.2} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl -z-10 blur-xl"></div>
        <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
          Predicted Crowd 
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wider font-bold">AI Powered</span>
        </h3>
        <div className="card mb-8 p-6 shadow-md border-emerald-100/50">
          <CustomSVGChart data={predictions} />
        </div>
      </ScrollReveal>

      {/* AI Insights */}
      <ScrollReveal delay={0.4}>
        <h3 className="mb-4 text-xl font-semibold">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            className="card bg-white border-l-4 border-warning shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-warning" />
              <h5 className="font-bold text-gray-800">Peak Congestion</h5>
            </div>
            <p className="text-sm text-gray-600">
              High congestion is predicted between <strong className="text-gray-800">10:00 AM and 12:00 PM</strong>.<br/>
              Expected peak crowd: <strong className="text-danger">{peakHour.crowd}%</strong> at <strong className="text-gray-800">{peakHour.label}</strong>.
            </p>
          </motion.div>
          <motion.div 
            className="card bg-white border-l-4 border-success shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-success" />
              <h5 className="font-bold text-gray-800">Recommended Time</h5>
            </div>
            <p className="text-sm text-gray-600">
              Recommended arrival time: <strong className="text-gray-800">after 1:00 PM</strong>.<br/>
              Lowest predicted crowd: <strong className="text-success">{lowHour.crowd}%</strong> at <strong className="text-gray-800">{lowHour.label}</strong>.
            </p>
          </motion.div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.6} className="disclaimer flex items-start gap-2 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100 text-sm">
        <span className="font-bold">ⓘ</span>
        Predictions are based on simulated historical data patterns and may not reflect actual conditions.
      </ScrollReveal>
    </div>
  );
}
