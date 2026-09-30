import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SensorChart } from '../charts/SensorChart';
import {
  Radio,
  Compass,
  Satellite,
  Mountain,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { currentPoint, simulation } = useSimulation();

  if (!currentPoint) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        No active telemetry. Start or load a simulation to view sensor telemetry.
      </div>
    );
  }

  const s = currentPoint.sensor_data;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400" />
            Educational Sensor Simulation Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Simulated Avionics Sensors • Synthetic Measurement Noise • Kalman Filter Fusion Inputs
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            TIMESTAMP: <strong className="text-sky-300">T+{currentPoint.time.toFixed(2)}s</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            ALL SENSORS NOMINAL
          </span>
        </div>
      </div>

      {/* 4 Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. IMU (Inertial Measurement Unit) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">{s.imu.name}</h3>
                <span className="text-[10px] font-mono text-slate-500">6-DOF Accelerometer & Gyroscope</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              {s.imu.status}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Accel X */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">ACCELEROMETER X</span>
                <span className="text-[10px] text-slate-500">True: {s.imu.accel_x.true.toFixed(2)} m/s²</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.imu.accel_x.measured.toFixed(2)} m/s²</span>
                <span className="text-[10px] text-amber-400">Error: {s.imu.accel_x.error.toFixed(3)}</span>
              </div>
            </div>

            {/* Accel Y */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">ACCELEROMETER Y</span>
                <span className="text-[10px] text-slate-500">True: {s.imu.accel_y.true.toFixed(2)} m/s²</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.imu.accel_y.measured.toFixed(2)} m/s²</span>
                <span className="text-[10px] text-amber-400">Error: {s.imu.accel_y.error.toFixed(3)}</span>
              </div>
            </div>

            {/* Accel Z */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">ACCELEROMETER Z (SPECIFIC FORCE)</span>
                <span className="text-[10px] text-slate-500">True: {s.imu.accel_z.true.toFixed(2)} m/s²</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.imu.accel_z.measured.toFixed(2)} m/s²</span>
                <span className="text-[10px] text-amber-400">Error: {s.imu.accel_z.error.toFixed(3)}</span>
              </div>
            </div>

            {/* Gyro rates & Orientation */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">PITCH RATE</span>
                <span className="text-slate-200">{s.imu.gyro_pitch.measured.toFixed(3)} rad/s</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">YAW RATE</span>
                <span className="text-slate-200">{s.imu.gyro_yaw.measured.toFixed(3)} rad/s</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">ATTITUDE (PITCH)</span>
                <span className="text-emerald-400">{s.imu.orientation.pitch.toFixed(1)}°</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">ATTITUDE (YAW)</span>
                <span className="text-emerald-400">{s.imu.orientation.yaw.toFixed(1)}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GNSS Receiver */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Satellite className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">{s.gnss.name}</h3>
                <span className="text-[10px] font-mono text-slate-500">Multi-Constellation Satellite Fix</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-sky-500/10 border border-sky-500/30 text-sky-400">
              {s.gnss.status}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Position X */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">GNSS EAST (X)</span>
                <span className="text-[10px] text-slate-500">True: {s.gnss.x.true.toFixed(1)} m</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.gnss.x.measured.toFixed(1)} m</span>
                <span className="text-[10px] text-amber-400">Error: {s.gnss.x.error.toFixed(2)} m</span>
              </div>
            </div>

            {/* Position Y */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">GNSS NORTH (Y)</span>
                <span className="text-[10px] text-slate-500">True: {s.gnss.y.true.toFixed(1)} m</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.gnss.y.measured.toFixed(1)} m</span>
                <span className="text-[10px] text-amber-400">Error: {s.gnss.y.error.toFixed(2)} m</span>
              </div>
            </div>

            {/* Position Z */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-semibold">GNSS ALTITUDE (Z)</span>
                <span className="text-[10px] text-slate-500">True: {s.gnss.z.true.toFixed(1)} m</span>
              </div>
              <div className="text-right">
                <span className="text-sky-300 font-bold block">{s.gnss.z.measured.toFixed(1)} m</span>
                <span className="text-[10px] text-amber-400">Error: {s.gnss.z.error.toFixed(2)} m</span>
              </div>
            </div>

            {/* Satellite metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">3D ERROR</span>
                <span className="text-amber-400 font-bold">{s.gnss.total_error_3d.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">SATELLITES</span>
                <span className="text-emerald-400 font-bold">{s.gnss.satellites_tracked} SVs</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] block">HDOP / VDOP</span>
                <span className="text-slate-300">{s.gnss.hdop} / {s.gnss.vdop}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Altitude Sensor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">{s.altitude.name}</h3>
                <span className="text-[10px] font-mono text-slate-500">Barometric & Radar Altimetry</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              {s.altitude.status}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">MEASURED ALTITUDE</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {s.altitude.measured_altitude.toFixed(1)} m
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-slate-800/60 pt-2 text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[9px]">TRUE ALT</span>
                  <span>{s.altitude.true_altitude.toFixed(1)} m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">RESIDUAL ERROR</span>
                  <span className="text-amber-400">{s.altitude.error.toFixed(2)} m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">VERT VELOCITY</span>
                  <span>{s.altitude.vertical_rate.toFixed(1)} m/s</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Provides high-frequency altitude updates fused with GNSS vertical channel in the state estimator to counteract atmospheric drift.
            </p>
          </div>
        </div>

        {/* 4. Proximity Sensor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">{s.proximity.name}</h3>
                <span className="text-[10px] font-mono text-slate-500">Laser / RF Range-to-Target Trigger</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${
                s.proximity.triggered
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {s.proximity.detection_status}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">MEASURED DISTANCE TO TARGET</span>
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {s.proximity.measured_distance.toFixed(1)} m
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-slate-800/60 pt-2 text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[9px]">TRUE RANGE</span>
                  <span>{s.proximity.true_distance.toFixed(1)} m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">THRESHOLD</span>
                  <span className="text-rose-400 font-bold">{s.proximity.threshold} m</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">TRIGGER FLAG</span>
                  <span className={s.proximity.triggered ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {s.proximity.triggered ? 'TRIGGERED' : 'ARMED'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Academic sensor trigger simulation. Detects when relative distance to target intersects user threshold without any physical weapon activation logic.
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Error vs Time Chart */}
      {simulation && <SensorChart telemetry={simulation.telemetry} />}
    </div>
  );
};
