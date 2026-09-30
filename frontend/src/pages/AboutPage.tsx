import React from 'react';
import {
  Info,
  ShieldAlert,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
          <span>SMART INDIA HACKATHON (SIH) • ENGINEERING SIMULATION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Precision Guidance & Smart Fuze
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Interactive full-stack simulation, state estimation, trajectory correction, and Monte Carlo dispersion platform for academic engineering demonstration.
        </p>
      </div>

      {/* Mandatory Safety & Scope Card */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h2 className="text-base font-bold uppercase tracking-wider font-mono">
            Safety, Ethical & Academic Scope Declaration
          </h2>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          This software is strictly an academic / competition simulation platform developed for the Smart India Hackathon (SIH) to showcase software architecture, sensor simulation, Kalman filter state estimation, generic trajectory tracking, and Monte Carlo dispersion analysis.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 text-slate-400">
          <p className="font-semibold text-rose-400 uppercase">Non-Deployable Guarantee:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>NO real-world artillery firing tables or firing solutions.</li>
            <li>NO real 155 mm or weapon projectile aerodynamic coefficients.</li>
            <li>NO classified or real-world military weapon guidance laws.</li>
            <li>NO explosive, pyrotechnic, ignition, or physical fuze detonation electronics.</li>
            <li>NO deployable physical hardware instructions or weapon optimization.</li>
          </ul>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
          <Code2 className="w-5 h-5 text-sky-400" />
          Full-Stack Technology Stack
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Frontend Stack */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-sky-400 font-bold block text-sm border-b border-slate-800 pb-2">
              Frontend Client (Port 5173)
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>React 19 & TypeScript:</strong> Type-safe interactive user interface</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>Vite 8:</strong> High-performance development and bundling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>Tailwind CSS v4:</strong> Dark aerospace engineering UI system</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>Three.js / WebGL:</strong> 3D trajectory and flight attitude scene</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>Recharts:</strong> Dynamic error charts, histograms & dispersion plots</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span><strong>Lucide React:</strong> Engineering icon telemetry set</span>
              </li>
            </ul>
          </div>

          {/* Backend Stack */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-emerald-400 font-bold block text-sm border-b border-slate-800 pb-2">
              Backend Simulation Engine (Port 8000)
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>FastAPI:</strong> High-performance async REST API endpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>Python 3.13:</strong> Computational simulation runtime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>NumPy 2.5:</strong> High-speed vectorized numerical algebra & 5000-run Monte Carlo in &lt;1s</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>SciPy:</strong> Numerical integration and statistical distributions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>Pydantic v2:</strong> Strict JSON validation schemas & models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong>Uvicorn:</strong> ASGI server with auto-reload</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Implemented Capabilities */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Key Platform Capabilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-300">
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0" />
            <span><strong>4th-Order Runge-Kutta:</strong> High-precision numerical flight dynamics integration with drag and wind.</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
            <span><strong>Kalman Filter State Estimator:</strong> Discrete 6-state fusion of IMU acceleration, GNSS and altimetry.</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <span><strong>Cubic Trajectory Guidance:</strong> Reference curve tracking with cross-track error minimization.</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0" />
            <span><strong>Vectorized Monte Carlo:</strong> 100 to 5000 runs executed in &lt;1 second with CEP percentiles.</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
            <span><strong>Actuator Modeling:</strong> Dual-axis PID with lag, rate limiting, and mechanical saturation.</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
            <span><strong>Interactive Architecture:</strong> Subsystem blocks with math models, inputs, and live states.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
