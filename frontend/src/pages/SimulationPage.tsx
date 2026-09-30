import React, { useState } from 'react';
import { useSimulation, DEFAULT_CONFIG } from '../context/SimulationContext';
import { SimulationConfig } from '../types/simulation';
import { Flight3DView } from '../simulation/Flight3DView';
import { PlaybackControls } from '../components/PlaybackControls';
import { TrajectoryChart } from '../charts/TrajectoryChart';
import { ErrorChart } from '../charts/ErrorChart';
import {
  Play,
  RotateCcw,
  Sliders,
  Wind,
  Navigation2,
  Clock,
  Radio,
  Save,
  Trash2,
  Download,
  AlertTriangle,
  Bookmark,
  CheckCircle,
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const {
    config,
    setConfig,
    simulation,
    isLoading,
    runSimulation,
    savedSimulations,
    saveCurrentSimulation,
    loadSavedSimulation,
    deleteSavedSimulation,
  } = useSimulation();

  const [saveName, setSaveName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset scenarios
  const applyPreset = (presetName: string) => {
    let newCfg: SimulationConfig = { ...config };
    if (presetName === 'nominal') {
      newCfg = {
        ...DEFAULT_CONFIG,
        initial_position: [0.0, 0.0, 1000.0],
        initial_velocity: [120.0, 15.0, -10.0],
        target_position: [3000.0, 400.0, 0.0],
        wind_disturbance: [2.0, -1.0, 0.2],
        guidance_enabled: true,
        event_mode: 'TIMER',
        event_timer_threshold: 22.0,
      };
    } else if (presetName === 'crosswind') {
      newCfg = {
        ...DEFAULT_CONFIG,
        initial_position: [0.0, 0.0, 1200.0],
        initial_velocity: [130.0, 20.0, -8.0],
        target_position: [3200.0, 500.0, 0.0],
        wind_disturbance: [8.5, -6.0, 1.5], // heavy crosswind
        sensor_noise: 0.08,
        guidance_enabled: true,
        kp: 2.0,
        kd: 1.1,
        event_mode: 'PROXIMITY',
        event_proximity_threshold: 25.0,
      };
    } else if (presetName === 'ballistic') {
      newCfg = {
        ...DEFAULT_CONFIG,
        initial_position: [0.0, 0.0, 1000.0],
        initial_velocity: [120.0, 15.0, -10.0],
        target_position: [3000.0, 400.0, 0.0],
        wind_disturbance: [4.0, -3.0, 0.5],
        guidance_enabled: false, // Unguided drift
        event_mode: 'IMPACT',
      };
    }
    setConfig(newCfg);
    runSimulation(newCfg);
  };

  const handleSave = () => {
    if (!simulation) return;
    saveCurrentSimulation(saveName || undefined);
    setSaveName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            Flight Simulation & Configuration
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Abstract non-deployable guided flight vehicle model • Real-time telemetry integration
          </p>
        </div>

        {/* Preset buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">PRESETS:</span>
          <button
            onClick={() => applyPreset('nominal')}
            className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 transition-colors"
          >
            Nominal Glide
          </button>
          <button
            onClick={() => applyPreset('crosswind')}
            className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-colors"
          >
            Heavy Crosswind
          </button>
          <button
            onClick={() => applyPreset('ballistic')}
            className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 transition-colors"
          >
            Unguided Ballistic
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Form & 3D / Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Configuration Form (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-400" />
              Vehicle & Guidance Inputs
            </h2>
            <button
              onClick={() => {
                setConfig(DEFAULT_CONFIG);
                runSimulation(DEFAULT_CONFIG);
              }}
              title="Reset to defaults"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs font-mono">
            {/* Initial Position [X, Y, Z] */}
            <div>
              <label className="text-slate-400 block mb-1">INITIAL POSITION [X, Y, Z] (m)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={config.initial_position[0]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_position: [Number(e.target.value), config.initial_position[1], config.initial_position[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-sky-400 outline-none"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={config.initial_position[1]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_position: [config.initial_position[0], Number(e.target.value), config.initial_position[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-sky-400 outline-none"
                  placeholder="Y"
                />
                <input
                  type="number"
                  value={config.initial_position[2]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_position: [config.initial_position[0], config.initial_position[1], Number(e.target.value)],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 font-semibold focus:border-sky-400 outline-none"
                  placeholder="Alt Z"
                />
              </div>
            </div>

            {/* Initial Velocity [Vx, Vy, Vz] */}
            <div>
              <label className="text-slate-400 block mb-1">INITIAL VELOCITY [Vx, Vy, Vz] (m/s)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={config.initial_velocity[0]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_velocity: [Number(e.target.value), config.initial_velocity[1], config.initial_velocity[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-sky-400 outline-none"
                  placeholder="Vx"
                />
                <input
                  type="number"
                  value={config.initial_velocity[1]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_velocity: [config.initial_velocity[0], Number(e.target.value), config.initial_velocity[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-sky-400 outline-none"
                  placeholder="Vy"
                />
                <input
                  type="number"
                  value={config.initial_velocity[2]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      initial_velocity: [config.initial_velocity[0], config.initial_velocity[1], Number(e.target.value)],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-sky-400 outline-none"
                  placeholder="Vz"
                />
              </div>
            </div>

            {/* Target Location [X, Y, Z] */}
            <div>
              <label className="text-rose-400 block mb-1">TARGET LOCATION [X, Y, Z] (m)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={config.target_position[0]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      target_position: [Number(e.target.value), config.target_position[1], config.target_position[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-rose-400 outline-none"
                />
                <input
                  type="number"
                  value={config.target_position[1]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      target_position: [config.target_position[0], Number(e.target.value), config.target_position[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-rose-400 outline-none"
                />
                <input
                  type="number"
                  value={config.target_position[2]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      target_position: [config.target_position[0], config.target_position[1], Number(e.target.value)],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-rose-400 outline-none"
                />
              </div>
            </div>

            {/* Wind Disturbance */}
            <div>
              <label className="text-slate-400 block mb-1 flex items-center justify-between">
                <span>WIND DISTURBANCE [Wx, Wy, Wz] (m/s)</span>
                <Wind className="w-3.5 h-3.5 text-sky-400" />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={config.wind_disturbance[0]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      wind_disturbance: [Number(e.target.value), config.wind_disturbance[1], config.wind_disturbance[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Wx"
                />
                <input
                  type="number"
                  step="0.5"
                  value={config.wind_disturbance[1]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      wind_disturbance: [config.wind_disturbance[0], Number(e.target.value), config.wind_disturbance[2]],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Wy"
                />
                <input
                  type="number"
                  step="0.5"
                  value={config.wind_disturbance[2]}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      wind_disturbance: [config.wind_disturbance[0], config.wind_disturbance[1], Number(e.target.value)],
                    })
                  }
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Wz"
                />
              </div>
            </div>

            {/* Guidance Toggle & Noise */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold cursor-pointer" htmlFor="guidanceToggle">
                  ENABLE TRAJECTORY GUIDANCE
                </label>
                <input
                  id="guidanceToggle"
                  type="checkbox"
                  checked={config.guidance_enabled}
                  onChange={(e) => setConfig({ ...config, guidance_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Sensor Noise Factor</span>
                  <span className="text-sky-400 font-bold">{config.sensor_noise}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.01"
                  value={config.sensor_noise}
                  onChange={(e) => setConfig({ ...config, sensor_noise: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Controller Response Gain</span>
                  <span className="text-emerald-400 font-bold">{config.controller_response}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={config.controller_response}
                  onChange={(e) => setConfig({ ...config, controller_response: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* PID Gains (Kp, Ki, Kd) */}
            <div>
              <label className="text-slate-400 block mb-1">PID GAINS [Kp, Ki, Kd]</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={config.kp}
                  onChange={(e) => setConfig({ ...config, kp: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Kp"
                />
                <input
                  type="number"
                  step="0.01"
                  value={config.ki}
                  onChange={(e) => setConfig({ ...config, ki: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Ki"
                />
                <input
                  type="number"
                  step="0.1"
                  value={config.kd}
                  onChange={(e) => setConfig({ ...config, kd: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="Kd"
                />
              </div>
            </div>

            {/* Simulated Event Trigger Mode */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <label className="text-amber-400 font-semibold block">SIMULATED EVENT TRIGGER</label>
              <div className="grid grid-cols-3 gap-1">
                {(['TIMER', 'PROXIMITY', 'IMPACT'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setConfig({ ...config, event_mode: mode })}
                    className={`py-1.5 rounded text-[11px] font-mono transition-all ${
                      config.event_mode === mode
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {config.event_mode === 'TIMER' && (
                <div className="pt-2">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Timer Threshold (s)</span>
                    <span className="text-amber-400">{config.event_timer_threshold}s</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={config.event_timer_threshold}
                    onChange={(e) => setConfig({ ...config, event_timer_threshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              )}

              {config.event_mode === 'PROXIMITY' && (
                <div className="pt-2">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Proximity Distance (m)</span>
                    <span className="text-amber-400">{config.event_proximity_threshold}m</span>
                  </div>
                  <input
                    type="number"
                    step="5"
                    value={config.event_proximity_threshold}
                    onChange={(e) => setConfig({ ...config, event_proximity_threshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Run Simulation Action Button */}
            <button
              onClick={() => runSimulation()}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-mono font-bold text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'CALCULATING RK4 DYNAMICS...' : 'EXECUTE SIMULATION'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Visualization, Controls & Error Charts (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 3D Flight View */}
          <Flight3DView height="460px" />

          {/* Playback Controls */}
          <PlaybackControls />

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulation && <TrajectoryChart telemetry={simulation.telemetry} />}
            {simulation && <ErrorChart telemetry={simulation.telemetry} />}
          </div>

          {/* Local Storage Session Manager */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                Local Simulation State Manager (localStorage)
              </h3>
              {saveSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Scenario label (e.g. Crosswind Trial 1)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-sky-400"
              />
              <button
                onClick={handleSave}
                disabled={!simulation}
                className="px-3 py-1.5 rounded text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Save Run
              </button>
            </div>

            {savedSimulations.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {savedSimulations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80 text-xs font-mono"
                  >
                    <div>
                      <span className="text-slate-200 font-medium">{item.name}</span>
                      <span className="text-slate-500 ml-2 text-[10px]">
                        Miss: {item.summary?.final_miss_distance_m}m
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => loadSavedSimulation(item.id)}
                        className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedSimulation(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-mono text-slate-500 text-center py-2">
                No saved simulations in browser storage yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
