import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Radio,
  Navigation2,
  Sliders,
  Sparkles,
  Cpu,
  FileText,
  Info,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { loadDemoScenario, isLoading, isMonteCarloLoading } = useSimulation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/simulation', label: 'Simulation', icon: PlayCircle },
    { to: '/sensors', label: 'Sensors', icon: Radio },
    { to: '/guidance', label: 'Guidance', icon: Navigation2 },
    { to: '/control', label: 'Control', icon: Sliders },
    { to: '/monte-carlo', label: 'Monte Carlo', icon: Sparkles },
    { to: '/architecture', label: 'Architecture', icon: Cpu },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-400 transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Navigation2 className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-slate-100 uppercase group-hover:text-sky-300 transition-colors">
                  Precision Guidance
                </span>
                <span className="text-[10px] font-mono text-sky-400 tracking-widest uppercase">
                  Simulation Platform
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Action: Demo Mode button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => loadDemoScenario()}
              disabled={isLoading || isMonteCarloLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Demo Scenario</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => loadDemoScenario()}
              className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs"
              title="Demo Mode"
            >
              <Zap className="w-4 h-4 fill-amber-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
};
