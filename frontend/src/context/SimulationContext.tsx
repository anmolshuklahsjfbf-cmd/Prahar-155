import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SimulationConfig,
  SimulationResponse,
  MonteCarloResponse,
  TelemetryPoint,
} from '../types/simulation';
import {
  checkBackendHealth,
  runSimulationApi,
  runMonteCarloApi,
} from '../services/api';

export const DEFAULT_CONFIG: SimulationConfig = {
  initial_position: [0.0, 0.0, 1000.0],
  initial_velocity: [120.0, 15.0, -10.0],
  target_position: [3000.0, 400.0, 0.0],
  wind_disturbance: [3.0, -2.0, 0.5],
  sensor_noise: 0.05,
  navigation_error: 0.02,
  guidance_enabled: true,
  controller_response: 1.0,
  kp: 1.5,
  ki: 0.05,
  kd: 0.8,
  simulation_duration: 28.0,
  timestep: 0.05,
  event_mode: 'TIMER',
  event_timer_threshold: 22.0,
  event_proximity_threshold: 25.0,
};

interface SavedSimulationItem {
  id: string;
  name: string;
  timestamp: string;
  config: SimulationConfig;
  summary: any;
}

interface SimulationContextType {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  simulation: SimulationResponse | null;
  monteCarlo: MonteCarloResponse | null;
  currentIndex: number;
  currentPoint: TelemetryPoint | null;
  isPlaying: boolean;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  backendOnline: boolean;
  isLoading: boolean;
  isMonteCarloLoading: boolean;
  errorMessage: string | null;
  savedSimulations: SavedSimulationItem[];
  runSimulation: (overrideConfig?: SimulationConfig) => Promise<SimulationResponse | null>;
  runMonteCarlo: (runs?: number) => Promise<MonteCarloResponse | null>;
  togglePlayPause: () => void;
  resetPlayback: () => void;
  setCurrentIndex: (index: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  loadDemoScenario: () => Promise<void>;
  saveCurrentSimulation: (name?: string) => void;
  loadSavedSimulation: (id: string) => void;
  deleteSavedSimulation: (id: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [monteCarlo, setMonteCarlo] = useState<MonteCarloResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMonteCarloLoading, setIsMonteCarloLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulationItem[]>([]);

  const playTimerRef = useRef<number | null>(null);

  // Load saved simulations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('precision_sim_saved');
      if (stored) {
        setSavedSimulations(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Health check polling on mount
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await checkBackendHealth();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initial simulation run on mount
  useEffect(() => {
    runSimulation(DEFAULT_CONFIG);
  }, []);

  // Playback timer loop
  useEffect(() => {
    if (isPlaying && simulation && simulation.telemetry.length > 0) {
      const intervalMs = Math.max(10, Math.floor(50 / playbackSpeed));
      playTimerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= simulation.telemetry.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, simulation, playbackSpeed]);

  const currentPoint: TelemetryPoint | null =
    simulation && simulation.telemetry.length > 0
      ? simulation.telemetry[Math.min(currentIndex, simulation.telemetry.length - 1)]
      : null;

  const runSimulation = async (overrideConfig?: SimulationConfig): Promise<SimulationResponse | null> => {
    const activeConfig = overrideConfig || config;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await runSimulationApi(activeConfig);
      setSimulation(res);
      setCurrentIndex(0);
      setIsPlaying(true);
      setBackendOnline(true);
      return res;
    } catch (err: any) {
      console.error('Simulation error:', err);
      setErrorMessage(err.message || 'Simulation execution failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const runMonteCarlo = async (runs: number = 100): Promise<MonteCarloResponse | null> => {
    setIsMonteCarloLoading(true);
    setErrorMessage(null);
    try {
      const res = await runMonteCarloApi({
        runs,
        base_config: config,
        pos_noise_std: 15.0,
        vel_noise_std: 2.5,
        wind_noise_std: 3.0,
        sensor_noise_factor: config.sensor_noise,
        controller_variation_factor: 0.15,
      });
      setMonteCarlo(res);
      setBackendOnline(true);
      return res;
    } catch (err: any) {
      console.error('Monte Carlo error:', err);
      setErrorMessage(err.message || 'Monte Carlo execution failed');
      return null;
    } finally {
      setIsMonteCarloLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!simulation || simulation.telemetry.length === 0) return;
    if (currentIndex >= simulation.telemetry.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const stepForward = () => {
    if (!simulation) return;
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(simulation.telemetry.length - 1, prev + 1));
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const loadDemoScenario = async () => {
    const demoConfig: SimulationConfig = {
      initial_position: [0.0, 0.0, 1200.0],
      initial_velocity: [130.0, 10.0, -12.0],
      target_position: [3200.0, 350.0, 0.0],
      wind_disturbance: [4.5, -2.5, 0.8],
      sensor_noise: 0.04,
      navigation_error: 0.015,
      guidance_enabled: true,
      controller_response: 1.2,
      kp: 1.8,
      ki: 0.08,
      kd: 0.95,
      simulation_duration: 30.0,
      timestep: 0.05,
      event_mode: 'PROXIMITY',
      event_timer_threshold: 25.0,
      event_proximity_threshold: 20.0,
    };
    setConfig(demoConfig);
    const simRes = await runSimulation(demoConfig);
    if (simRes) {
      await runMonteCarlo(500);
    }
  };

  const saveCurrentSimulation = (name?: string) => {
    if (!simulation) return;
    const item: SavedSimulationItem = {
      id: simulation.id,
      name: name || `Sim-${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      config: simulation.config,
      summary: simulation.summary,
    };
    const updated = [item, ...savedSimulations.filter((s) => s.id !== simulation.id)].slice(0, 15);
    setSavedSimulations(updated);
    try {
      localStorage.setItem('precision_sim_saved', JSON.stringify(updated));
    } catch {}
  };

  const loadSavedSimulation = (id: string) => {
    const item = savedSimulations.find((s) => s.id === id);
    if (item) {
      setConfig(item.config);
      runSimulation(item.config);
    }
  };

  const deleteSavedSimulation = (id: string) => {
    const updated = savedSimulations.filter((s) => s.id !== id);
    setSavedSimulations(updated);
    try {
      localStorage.setItem('precision_sim_saved', JSON.stringify(updated));
    } catch {}
  };

  return (
    <SimulationContext.Provider
      value={{
        config,
        setConfig,
        simulation,
        monteCarlo,
        currentIndex,
        currentPoint,
        isPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        backendOnline,
        isLoading,
        isMonteCarloLoading,
        errorMessage,
        savedSimulations,
        runSimulation,
        runMonteCarlo,
        togglePlayPause,
        resetPlayback,
        setCurrentIndex,
        stepForward,
        stepBackward,
        loadDemoScenario,
        saveCurrentSimulation,
        loadSavedSimulation,
        deleteSavedSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
