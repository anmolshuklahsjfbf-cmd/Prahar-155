import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { SimulationPage } from './pages/SimulationPage';
import { SensorsPage } from './pages/SensorsPage';
import { GuidancePage } from './pages/GuidancePage';
import { ControlPage } from './pages/ControlPage';
import { MonteCarloPage } from './pages/MonteCarloPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 tech-grid">
          {/* Top Sticky Navigation */}
          <Navbar />

          {/* Sub-header System Telemetry Banner */}
          <Header />

          {/* Page Body Router */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/sensors" element={<SensorsPage />} />
              <Route path="/guidance" element={<GuidancePage />} />
              <Route path="/control" element={<ControlPage />} />
              <Route path="/monte-carlo" element={<MonteCarloPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 mt-auto print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Precision Guidance & Smart Fuze Simulation Platform • SIH 2026</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Academic Demonstration Model • Non-Deployable • Normalized Parameters
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </SimulationProvider>
  );
};

export default App;
