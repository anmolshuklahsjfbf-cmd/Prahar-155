import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TelemetryPoint } from '../types/simulation';

interface TrajectoryChartProps {
  telemetry: TelemetryPoint[];
  currentTime?: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ telemetry, currentTime }) => {
  const [metric, setMetric] = useState<'POSITION' | 'VELOCITY'>('POSITION');

  if (!telemetry || telemetry.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No simulation telemetry loaded.</div>;
  }

  // Downsample for chart responsiveness if > 250 points
  const step = Math.max(1, Math.floor(telemetry.length / 150));
  const data = telemetry.filter((_, idx) => idx % step === 0).map((pt) => ({
    time: pt.time,
    posX: Math.round(pt.true_position[0]),
    posY: Math.round(pt.true_position[1]),
    posZ: Math.round(pt.true_position[2]),
    desX: Math.round(pt.desired_position[0]),
    desY: Math.round(pt.desired_position[1]),
    desZ: Math.round(pt.desired_position[2]),
    velX: Math.round(pt.true_velocity[0]),
    velY: Math.round(pt.true_velocity[1]),
    velZ: Math.round(pt.true_velocity[2]),
    speed: Math.round(Math.hypot(pt.true_velocity[0], pt.true_velocity[1], pt.true_velocity[2])),
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            {metric === 'POSITION' ? 'Position vs Time' : 'Velocity vs Time'}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            {metric === 'POSITION' ? 'Coordinates [X, Y, Altitude Z] vs Flight Time' : 'Velocity components [Vx, Vy, Vz] & Total Speed'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setMetric('POSITION')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metric === 'POSITION' ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Position
          </button>
          <button
            onClick={() => setMetric('VELOCITY')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metric === 'VELOCITY' ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Velocity
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}s`}
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            {metric === 'POSITION' ? (
              <>
                <Line type="monotone" dataKey="posX" name="True X (m)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="posZ" name="Altitude Z (m)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="posY" name="Cross-Range Y (m)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="desZ" name="Desired Alt (m)" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="speed" name="Speed (m/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="velX" name="Vx (m/s)" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="velZ" name="Vz (Vertical)" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
