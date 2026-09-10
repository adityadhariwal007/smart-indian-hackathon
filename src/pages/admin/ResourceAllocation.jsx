import { useState } from 'react';
import { SlidersHorizontal, ArrowRight, CheckCircle2, TrendingDown, Users, Building2, Zap } from 'lucide-react';

export default function ResourceAllocation() {
  const [orthoCounters, setOrthoCounters] = useState(2);
  const [medicineCounters, setMedicineCounters] = useState(4);
  const [pediatricCounters, setPediatricCounters] = useState(2);

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Ortho dynamic calculations based on counter count
  const orthoWait = Math.round(130 / orthoCounters);
  const orthoCrowd = Math.min(100, Math.round(190 / orthoCounters));

  const handleApply = () => {
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal size={26} style={{ color: 'var(--primary)' }} />
            Dynamic Resource & Counter Allocation Engine
          </h2>
          <p className="text-secondary text-sm">
            Simulate and deploy additional OPD consultation desks to rapidly eliminate bottlenecks
          </p>
        </div>

        <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={handleApply}>
          <Zap size={16} /> Deploy Active Allocations
        </button>
      </div>

      {appliedSuccess && (
        <div className="p-3 bg-success-light text-success rounded-lg flex items-center gap-2 text-sm border border-success">
          <CheckCircle2 size={18} />
          Resource configuration broadcasted to hospital counter terminals and digital token displays.
        </div>
      )}

      {/* Featured Simulation: Orthopedic Counter Optimization */}
      <div className="card p-6 border-2 border-primary/40 space-y-5 bg-gradient-to-br from-card to-primary-bg/20">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <span className="badge badge-danger text-xs mb-1">High Congestion Department</span>
            <h3 className="text-xl font-bold">Orthopedics OPD — Counter Scaling Simulation</h3>
            <p className="text-secondary text-xs">
              Current registered queue: 48 patients • Doctor availability: 5 doctors present
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-secondary block font-medium">Active Counters</span>
            <span className="text-3xl font-extrabold text-primary">{orthoCounters} Desk{orthoCounters > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2 bg-card p-4 rounded-xl border">
          <div className="flex justify-between text-sm font-semibold">
            <span>Adjust Counter Allocation:</span>
            <span className="text-primary font-mono">{orthoCounters} Consultation Counters</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={orthoCounters}
            onChange={(e) => setOrthoCounters(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-bg-secondary rounded-lg"
          />
          <div className="flex justify-between text-xs text-secondary font-mono">
            <span>1 Counter (Overwhelmed)</span>
            <span>2 Counters (Default)</span>
            <span>3 Counters (+1 Relief)</span>
            <span>4 Counters (+2 Relief)</span>
            <span>5 Counters (Max Roster)</span>
          </div>
        </div>

        {/* Before vs After Impact Visualization */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-danger mb-2">
              Baseline State (1 Counter)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Expected Wait:</span>
                <span className="font-bold text-danger">130 mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Crowd Index:</span>
                <span className="font-bold text-danger">98% (Severe Backlog)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Patient Throughput:</span>
                <span className="font-bold">4.5 patients / hour</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-success mb-2">
              Simulated State ({orthoCounters} Counters)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Expected Wait:</span>
                <span className="font-bold text-success flex items-center gap-1">
                  <TrendingDown size={14} /> {orthoWait} mins
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Crowd Index:</span>
                <span className={`font-bold ${orthoCrowd > 75 ? 'text-danger' : orthoCrowd > 50 ? 'text-warning' : 'text-success'}`}>
                  {orthoCrowd}% ({orthoCrowd > 75 ? 'High' : orthoCrowd > 50 ? 'Moderate' : 'Optimal'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Patient Throughput:</span>
                <span className="font-bold text-primary">
                  {(orthoCounters * 4.5).toFixed(1)} patients / hour
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Departments Counter Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">General Medicine OPD</h4>
              <p className="text-xs text-secondary">Queue: 62 patients</p>
            </div>
            <span className="font-bold text-lg text-primary">{medicineCounters} Counters</span>
          </div>

          <input
            type="range"
            min="2"
            max="8"
            value={medicineCounters}
            onChange={(e) => setMedicineCounters(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-bg-secondary rounded-lg"
          />

          <div className="flex justify-between text-xs text-secondary">
            <span>Wait: {Math.round(180 / medicineCounters)}m</span>
            <span>Capacity: {medicineCounters * 10} / hr</span>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Pediatrics OPD</h4>
              <p className="text-xs text-secondary">Queue: 24 patients</p>
            </div>
            <span className="font-bold text-lg text-primary">{pediatricCounters} Counters</span>
          </div>

          <input
            type="range"
            min="1"
            max="4"
            value={pediatricCounters}
            onChange={(e) => setPediatricCounters(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-bg-secondary rounded-lg"
          />

          <div className="flex justify-between text-xs text-secondary">
            <span>Wait: {Math.round(90 / pediatricCounters)}m</span>
            <span>Capacity: {pediatricCounters * 8} / hr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
