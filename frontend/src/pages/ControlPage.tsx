import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ControlChart } from '../charts/ControlChart';
import { ActuatorVisualizer } from '../components/ActuatorVisualizer';
import {
  Sliders,
  Activity,
  Gauge,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const ControlPage: React.FC = () => {
  const { currentPoint, simulation, config, setConfig, runSimulation, isLoading } = useSimulation();

  const [kp, setKp] = useState(config.kp);
  const [ki, setKi] = useState(config.ki);
  const [kd, setKd] = useState(config.kd);
  const [resp, setResp] = useState(config.controller_response);

  const applyGains = () => {
    const updated = {
      ...config,
      kp,
      ki,
      kd,
      controller_response: resp,
    };
    setConfig(updated);
    runSimulation(updated);
  };

  const resetGains = () => {
    setKp(1.5);
    setKi(0.05);
    setKd(0.8);
    setResp(1.0);
    const updated = {
      ...config,
      kp: 1.5,
      ki: 0.05,
      kd: 0.8,
      controller_response: 1.0,
    };
    setConfig(updated);
    runSimulation(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            Generic Feedback Controller & Actuator Dynamics
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Dual-Axis PID Steering • Mechanical Actuator Lag & Rate Limiting • Saturation Bounds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetGains}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            Reset Default Gains
          </button>
        </div>
      </div>

      {/* Controller Parameters & Live Actuator Visualizer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PID Interactive Tuner (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-400" />
              PID Controller Tuning
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              DUAL-AXIS
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Proportional Gain Kp */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Proportional Gain (Kp)</span>
                <span className="text-sky-400 font-bold">{kp}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={kp}
                onChange={(e) => setKp(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Dictates immediate corrective steering authority</span>
            </div>

            {/* Integral Gain Ki */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Integral Gain (Ki)</span>
                <span className="text-emerald-400 font-bold">{ki}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.01"
                value={ki}
                onChange={(e) => setKi(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Eliminates steady-state wind offset errors</span>
            </div>

            {/* Derivative Gain Kd */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Derivative Gain (Kd)</span>
                <span className="text-amber-400 font-bold">{kd}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={kd}
                onChange={(e) => setKd(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Damps oscillations and prevents steering overshoot</span>
            </div>

            {/* Response Gain Scaler */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Response Bandwidth Scaler</span>
                <span className="text-purple-400 font-bold">{resp}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={resp}
                onChange={(e) => setResp(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Scales overall actuator speed response</span>
            </div>

            <button
              onClick={applyGains}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-mono font-bold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'UPDATING...' : 'APPLY GAINS & SIMULATE'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Actuator Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <ActuatorVisualizer currentPoint={currentPoint} />

          {/* Actuator Technical Specifications Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono shadow-xl">
            <h3 className="text-xs font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Actuator Dynamics Model Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">TIME CONSTANT τ</span>
                <span className="text-sky-300 font-bold">0.08 s (12.5 Hz)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RATE LIMIT</span>
                <span className="text-emerald-400 font-bold">4.0 units/s</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SATURATION</span>
                <span className="text-amber-400 font-bold">±1.0 normalized</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CHANNELS</span>
                <span className="text-purple-300 font-bold">Pitch / Yaw</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Commands vs Time Chart */}
      {simulation && <ControlChart telemetry={simulation.telemetry} />}
    </div>
  );
};
