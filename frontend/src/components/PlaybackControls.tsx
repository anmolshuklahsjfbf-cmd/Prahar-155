import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, FastForward, Clock } from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const {
    simulation,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    togglePlayPause,
    resetPlayback,
    stepForward,
    stepBackward,
    playbackSpeed,
    setPlaybackSpeed,
  } = useSimulation();

  if (!simulation || simulation.telemetry.length === 0) {
    return null;
  }

  const totalPoints = simulation.telemetry.length;
  const currentPoint = simulation.telemetry[Math.min(currentIndex, totalPoints - 1)];
  const totalTime = simulation.telemetry[totalPoints - 1].time;
  const progressPercent = ((currentIndex / Math.max(1, totalPoints - 1)) * 100).toFixed(1);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-3">
        {/* Scrubber slider and time display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 min-w-[70px]">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{currentPoint.time.toFixed(2)}s</span>
          </div>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={totalPoints - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all"
            />
            {/* Visual marker at event timestamp if event triggered */}
            {simulation.event.triggered && simulation.event.event_time && (
              <div
                title={simulation.event.message}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-3 bg-rose-500 rounded pointer-events-none transform -translate-x-1"
                style={{
                  left: `${(simulation.event.event_time / Math.max(1, totalTime)) * 100}%`,
                }}
              />
            )}
          </div>

          <div className="text-xs font-mono text-slate-400 min-w-[70px] text-right">
            <span>{totalTime.toFixed(2)}s</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-slate-800/80">
          {/* Main playback buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetPlayback}
              title="Reset to Start"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={stepBackward}
              title="Step Backward"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={stepForward}
              title="Step Forward"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed multiplier selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="px-2 text-slate-500 text-[11px]">SPEED:</span>
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-all ${
                  playbackSpeed === spd
                    ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Status info */}
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>
              STEP: <strong className="text-slate-200">{currentIndex + 1}</strong>/{totalPoints}
            </span>
            <span className="text-slate-600">|</span>
            <span>
              PROGRESS: <strong className="text-sky-400">{progressPercent}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
