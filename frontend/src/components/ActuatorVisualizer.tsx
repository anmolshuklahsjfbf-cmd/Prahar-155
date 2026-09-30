import React from 'react';
import { TelemetryPoint } from '../types/simulation';
import { Sliders, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ActuatorVisualizerProps {
  currentPoint: TelemetryPoint | null;
}

export const ActuatorVisualizer: React.FC<ActuatorVisualizerProps> = ({ currentPoint }) => {
  if (!currentPoint) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center text-slate-500 font-mono text-xs">
        Actuator offline. Start simulation to view live deflection.
      </div>
    );
  }

  const pitchCmd = currentPoint.control_command[0];
  const yawCmd = currentPoint.control_command[1];
  const pitchDef = currentPoint.actuator_deflection[0];
  const yawDef = currentPoint.actuator_deflection[1];
  const status = currentPoint.actuator_status;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'NOMINAL':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'RATE_LIMITED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'SATURATED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Abstract Control-Surface Actuator</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pitch Fin Channel */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400">PITCH CHANNEL (VERTICAL)</span>
            <span className="text-sky-300 font-bold">{pitchDef.toFixed(3)} def</span>
          </div>

          {/* Graphic Deflection Indicator */}
          <div className="relative h-6 bg-slate-900 rounded-md border border-slate-800 flex items-center overflow-hidden mb-2">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />
            <div
              className={`h-full transition-all duration-75 ${
                Math.abs(pitchDef) > 0.95 ? 'bg-rose-500' : 'bg-sky-500'
              }`}
              style={{
                width: `${Math.abs(pitchDef) * 50}%`,
                marginLeft: pitchDef >= 0 ? '50%' : `${50 - Math.abs(pitchDef) * 50}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>-1.0 (Full Nose-Down)</span>
            <span>0.0 Neutral</span>
            <span>+1.0 (Full Nose-Up)</span>
          </div>

          <div className="mt-2 text-xs font-mono text-slate-400 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>Command: <strong className="text-slate-200">{pitchCmd.toFixed(3)}</strong></span>
            <span>Error: <strong className="text-amber-400">{(pitchCmd - pitchDef).toFixed(3)}</strong></span>
          </div>
        </div>

        {/* Yaw Fin Channel */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400">YAW CHANNEL (LATERAL)</span>
            <span className="text-amber-300 font-bold">{yawDef.toFixed(3)} def</span>
          </div>

          {/* Graphic Deflection Indicator */}
          <div className="relative h-6 bg-slate-900 rounded-md border border-slate-800 flex items-center overflow-hidden mb-2">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />
            <div
              className={`h-full transition-all duration-75 ${
                Math.abs(yawDef) > 0.95 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.abs(yawDef) * 50}%`,
                marginLeft: yawDef >= 0 ? '50%' : `${50 - Math.abs(yawDef) * 50}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>-1.0 (Full Left)</span>
            <span>0.0 Neutral</span>
            <span>+1.0 (Full Right)</span>
          </div>

          <div className="mt-2 text-xs font-mono text-slate-400 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>Command: <strong className="text-slate-200">{yawCmd.toFixed(3)}</strong></span>
            <span>Error: <strong className="text-amber-400">{(yawCmd - yawDef).toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10px] font-mono text-slate-500 text-center uppercase tracking-wider">
        Normalized generic flight control surface • First-order lag model with rate limiter
      </div>
    </div>
  );
};
