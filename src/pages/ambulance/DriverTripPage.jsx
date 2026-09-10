import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import DriverConsole from '../../components/ambulance/DriverConsole';
import LiveAmbulanceMap from '../../components/ambulance/LiveAmbulanceMap';

export default function DriverTripPage() {
  const { tripId: paramTripId } = useParams();
  const tripId = paramTripId || 'EMS-DEMO-108';

  return (
    <div className="driver-trip-page max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/patient/ambulance" className="btn btn-sm btn-ghost flex items-center gap-1 text-slate-600">
          <ArrowLeft size={16} />
          <span>Back to Ambulance Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="badge badge-sm badge-success flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>Authorized Driver Session</span>
          </span>
          <Link
            to={`/patient/ambulance/track/${tripId}`}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Live Patient View</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Driver Telemetry Cockpit */}
        <div className="lg:col-span-7">
          <DriverConsole tripId={tripId} />
        </div>

        {/* Live Route Map for Driver */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Navigation Map
              </span>
              <span className="text-xs font-semibold text-emerald-600">Live GPS Link</span>
            </div>
            <LiveAmbulanceMap
              tripId={tripId}
              height="440px"
              showTelemetryHud={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
