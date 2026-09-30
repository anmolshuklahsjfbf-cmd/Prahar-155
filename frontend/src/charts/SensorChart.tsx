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

interface SensorChartProps {
  telemetry: TelemetryPoint[];
}

export const SensorChart: React.FC<SensorChartProps> = ({ telemetry }) => {
  const [view, setView] = useState<'ERRORS' | 'PROXIMITY'>('ERRORS');

  if (!telemetry || telemetry.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No simulation telemetry loaded.</div>;
  }

  const step = Math.max(1, Math.floor(telemetry.length / 150));
  const data = telemetry.filter((_, idx) => idx % step === 0).map((pt) => ({
    time: pt.time,
    gnssError: Number(pt.sensor_data.gnss.total_error_3d.toFixed(2)),
    altError: Number(Math.abs(pt.sensor_data.altitude.error).toFixed(2)),
    imuAxError: Number(Math.abs(pt.sensor_data.imu.accel_x.error).toFixed(2)),
    proxDistance: Number(pt.sensor_data.proximity.measured_distance.toFixed(1)),
    proxThreshold: pt.sensor_data.proximity.threshold,
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Sensor Measurement Simulation
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Simulated Sensor Noise & Residual Errors (Educational Models)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setView('ERRORS')}
            className={`px-2.5 py-1 rounded transition-colors ${
              view === 'ERRORS' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sensor Errors
          </button>
          <button
            onClick={() => setView('PROXIMITY')}
            className={`px-2.5 py-1 rounded transition-colors ${
              view === 'PROXIMITY' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Range to Target
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
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

            {view === 'ERRORS' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="gnssError"
                  name="GNSS Pos Error (m)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="altError"
                  name="Altitude Error (m)"
                  stroke="#10b981"
                  strokeWidth={1.8}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="imuAxError"
                  name="|IMU Ax Error| (m/s²)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="proxDistance"
                  name="Distance to Target (m)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="proxThreshold"
                  name="Trigger Threshold (m)"
                  stroke="#f43f5e"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
