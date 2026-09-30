import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TelemetryPoint } from '../types/simulation';

interface ControlChartProps {
  telemetry: TelemetryPoint[];
}

export const ControlChart: React.FC<ControlChartProps> = ({ telemetry }) => {
  if (!telemetry || telemetry.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No simulation telemetry loaded.</div>;
  }

  const step = Math.max(1, Math.floor(telemetry.length / 150));
  const data = telemetry.filter((_, idx) => idx % step === 0).map((pt) => ({
    time: pt.time,
    cmdPitch: Number(pt.control_command[0].toFixed(3)),
    cmdYaw: Number(pt.control_command[1].toFixed(3)),
    defPitch: Number(pt.actuator_deflection[0].toFixed(3)),
    defYaw: Number(pt.actuator_deflection[1].toFixed(3)),
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Feedback Controller & Actuator Response
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          Normalized Commands & Deflections in Pitch / Yaw Channels ([-1.0, +1.0] Range)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
            <YAxis stroke="#64748b" fontSize={11} domain={[-1.1, 1.1]} ticks={[-1.0, -0.5, 0.0, 0.5, 1.0]} />
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
            <ReferenceLine y={1.0} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'SAT +1.0', fill: '#f43f5e', fontSize: 10 }} />
            <ReferenceLine y={-1.0} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'SAT -1.0', fill: '#f43f5e', fontSize: 10 }} />

            <Line
              type="monotone"
              dataKey="cmdPitch"
              name="Pitch Cmd"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="defPitch"
              name="Pitch Actuator"
              stroke="#0284c7"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cmdYaw"
              name="Yaw Cmd"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="defYaw"
              name="Yaw Actuator"
              stroke="#d97706"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
