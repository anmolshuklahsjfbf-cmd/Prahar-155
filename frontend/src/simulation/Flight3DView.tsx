import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulation } from '../context/SimulationContext';
import { Compass, Eye, RotateCcw, Crosshair, Navigation, Maximize2 } from 'lucide-react';

export const Flight3DView: React.FC<{ height?: string }> = ({ height = '520px' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { simulation, currentPoint, isPlaying } = useSimulation();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh refs for animated updates
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const actualLineRef = useRef<THREE.Line | null>(null);
  const desiredLineRef = useRef<THREE.Line | null>(null);
  const estLineRef = useRef<THREE.Line | null>(null);
  const targetBeaconRef = useRef<THREE.Group | null>(null);

  const [cameraMode, setCameraMode] = useState<'ORBIT' | 'FOLLOW' | 'TOP'>('ORBIT');

  // Scale factor: real sim spans ~3500m x 1500m, scale down by 1/50 for Three.js scene (1 unit = 50m)
  const SCALE = 0.02;

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.005);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 2000);
    camera.position.set(30, 45, 80);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go too far under ground
    controls.target.set(30, 5, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x10b981, 2.5, 300);
    accentLight.position.set(0, 40, 0);
    scene.add(accentLight);

    // Ground Plane with Grid
    const gridHelper = new THREE.GridHelper(250, 50, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Subtle Ground Disc
    const groundGeo = new THREE.PlaneGeometry(250, 250);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x070c18,
      depthWrite: false,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    // Start Point Pad
    const startGeo = new THREE.CylinderGeometry(1.5, 2.0, 0.2, 16);
    const startMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    const startPad = new THREE.Mesh(startGeo, startMat);
    startPad.position.set(0, 0.1, 0);
    scene.add(startPad);

    // Target Beacon Group
    const targetGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.1;
    targetGroup.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(2.8, 3.2, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, opacity: 0.6, transparent: true });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.x = -Math.PI / 2;
    outerRingMesh.position.y = 0.1;
    targetGroup.add(outerRingMesh);

    const targetPoleGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
    const targetPoleMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.8 });
    const targetPole = new THREE.Mesh(targetPoleGeo, targetPoleMat);
    targetPole.position.y = 3;
    targetGroup.add(targetPole);

    scene.add(targetGroup);
    targetBeaconRef.current = targetGroup;

    // Vehicle 3D Model (Abstract Streamlined Generic Vehicle)
    const vehicleGroup = new THREE.Group();

    // Body (cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.6, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2; // orient along X
    vehicleGroup.add(body);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.35, 1.1, 16);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 1.85;
    vehicleGroup.add(nose);

    // 4 Abstract Control Fins
    const finMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    for (let i = 0; i < 4; i++) {
      const finGeo = new THREE.BoxGeometry(0.8, 0.05, 0.45);
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.x = -0.7;
      fin.rotation.x = (i * Math.PI) / 2;
      fin.position.y = Math.cos((i * Math.PI) / 2) * 0.45;
      fin.position.z = Math.sin((i * Math.PI) / 2) * 0.45;
      vehicleGroup.add(fin);
    }

    // Vehicle Glow Beacon
    const vBeaconGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const vBeaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const vBeacon = new THREE.Mesh(vBeaconGeo, vBeaconMat);
    vBeacon.position.x = -1.3;
    vehicleGroup.add(vBeacon);

    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Gentle beacon pulse
      if (targetBeaconRef.current) {
        const time = Date.now() * 0.003;
        targetBeaconRef.current.scale.set(
          1 + 0.05 * Math.sin(time),
          1,
          1 + 0.05 * Math.sin(time)
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Trajectory lines when simulation changes
  useEffect(() => {
    if (!sceneRef.current || !simulation) return;
    const scene = sceneRef.current;

    // Remove previous trajectory lines
    if (actualLineRef.current) scene.remove(actualLineRef.current);
    if (desiredLineRef.current) scene.remove(desiredLineRef.current);
    if (estLineRef.current) scene.remove(estLineRef.current);

    const actualPoints: THREE.Vector3[] = [];
    const desiredPoints: THREE.Vector3[] = [];
    const estPoints: THREE.Vector3[] = [];

    simulation.telemetry.forEach((pt) => {
      // Map sim coordinates [x, y, z] to Three.js:
      // X -> X * SCALE
      // Y -> Z * SCALE (horizontal cross)
      // Z -> Y * SCALE (altitude)
      actualPoints.push(new THREE.Vector3(pt.true_position[0] * SCALE, pt.true_position[2] * SCALE, pt.true_position[1] * SCALE));
      desiredPoints.push(new THREE.Vector3(pt.desired_position[0] * SCALE, pt.desired_position[2] * SCALE, pt.desired_position[1] * SCALE));
      estPoints.push(new THREE.Vector3(pt.estimated_position[0] * SCALE, pt.estimated_position[2] * SCALE, pt.estimated_position[1] * SCALE));
    });

    // 1. True Trajectory Line (Neon Cyan / Emerald)
    const actualGeo = new THREE.BufferGeometry().setFromPoints(actualPoints);
    const actualMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const actualLine = new THREE.Line(actualGeo, actualMat);
    scene.add(actualLine);
    actualLineRef.current = actualLine;

    // 2. Desired Reference Line (Amber dashed style)
    const desGeo = new THREE.BufferGeometry().setFromPoints(desiredPoints);
    const desMat = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 1, gapSize: 0.5 });
    const desLine = new THREE.Line(desGeo, desMat);
    desLine.computeLineDistances();
    scene.add(desLine);
    desiredLineRef.current = desLine;

    // 3. Estimated Trajectory Line (Purple)
    const estGeo = new THREE.BufferGeometry().setFromPoints(estPoints);
    const estMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
    const estLine = new THREE.Line(estGeo, estMat);
    scene.add(estLine);
    estLineRef.current = estLine;

    // Update target beacon position
    if (targetBeaconRef.current && simulation.config.target_position) {
      const tp = simulation.config.target_position;
      targetBeaconRef.current.position.set(tp[0] * SCALE, tp[2] * SCALE, tp[1] * SCALE);
    }
  }, [simulation]);

  // Update vehicle position and attitude according to currentPoint
  useEffect(() => {
    if (!currentPoint || !vehicleGroupRef.current) return;
    const v = vehicleGroupRef.current;

    const posX = currentPoint.true_position[0] * SCALE;
    const posY = currentPoint.true_position[2] * SCALE;
    const posZ = currentPoint.true_position[1] * SCALE;

    v.position.set(posX, posY, posZ);

    // Compute vehicle heading/pitch orientation from velocity vector
    const vx = currentPoint.true_velocity[0];
    const vy = currentPoint.true_velocity[1];
    const vz = currentPoint.true_velocity[2];

    const speedH = Math.hypot(vx, vy);
    const yaw = Math.atan2(vy, vx);
    const pitch = Math.atan2(vz, Math.max(0.1, speedH));

    v.rotation.order = 'YXZ';
    v.rotation.y = -yaw;
    v.rotation.z = pitch;

    // Camera follow mode
    if (cameraMode === 'FOLLOW' && cameraRef.current && controlsRef.current) {
      controlsRef.current.target.set(posX, posY, posZ);
      cameraRef.current.position.set(posX - 15, posY + 10, posZ + 15);
    }
  }, [currentPoint, cameraMode]);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('ORBIT');
    cameraRef.current.position.set(30, 45, 80);
    controlsRef.current.target.set(30, 5, 0);
  };

  const setTopView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraMode('TOP');
    cameraRef.current.position.set(30, 110, 5);
    controlsRef.current.target.set(30, 0, 5);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />

      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-sky-400">
            <Crosshair className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            3D TACTICAL VIEW
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ACTIVE TELEMETRY
          </span>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 text-xs font-mono">
          <button
            onClick={() => setCameraMode('ORBIT')}
            className={`px-2.5 py-1 rounded transition-colors ${
              cameraMode === 'ORBIT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orbit
          </button>
          <button
            onClick={() => setCameraMode('FOLLOW')}
            className={`px-2.5 py-1 rounded transition-colors ${
              cameraMode === 'FOLLOW' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Follow
          </button>
          <button
            onClick={setTopView}
            className={`px-2.5 py-1 rounded transition-colors ${
              cameraMode === 'TOP' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top-Down
          </button>
          <button
            onClick={resetCamera}
            title="Reset Camera"
            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trajectory Legend Overlay */}
      <div className="absolute top-14 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800/80 text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 bg-sky-400 rounded-full" />
          <span>True Trajectory</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 bg-amber-400 border-b border-dashed border-amber-400" />
          <span>Desired Reference</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 bg-purple-400 opacity-70" />
          <span>Estimated State</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-500/40" />
          <span>Target Beacon</span>
        </div>
      </div>

      {/* Live Telemetry Floating HUD Bottom-Left */}
      {currentPoint && (
        <div className="absolute bottom-3 left-3 pointer-events-none bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-lg p-3 text-xs font-mono shadow-2xl min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-slate-400">
            <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Navigation className="w-3 h-3 text-sky-400" />
              FLIGHT TELEMETRY
            </span>
            <span>T+{currentPoint.time.toFixed(2)}s</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] block">POS (X, Y)</span>
              <span>
                {currentPoint.true_position[0].toFixed(0)}m, {currentPoint.true_position[1].toFixed(0)}m
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">ALTITUDE (Z)</span>
              <span className="text-emerald-400 font-medium">{currentPoint.altitude.toFixed(1)} m</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SPEED (MAG)</span>
              <span className="text-sky-300">
                {Math.hypot(
                  currentPoint.true_velocity[0],
                  currentPoint.true_velocity[1],
                  currentPoint.true_velocity[2]
                ).toFixed(1)}{' '}
                m/s
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">POS ERROR</span>
              <span className={currentPoint.position_error < 15 ? 'text-emerald-400' : 'text-amber-400'}>
                {currentPoint.position_error.toFixed(2)} m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actuator Status Floating HUD Bottom-Right */}
      {currentPoint && (
        <div className="absolute bottom-3 right-3 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-lg px-3 py-2 text-xs font-mono shadow-2xl">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500">ACTUATOR STATUS</span>
            <span
              className={`font-semibold ${
                currentPoint.actuator_status === 'NOMINAL'
                  ? 'text-emerald-400'
                  : currentPoint.actuator_status === 'RATE_LIMITED'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentPoint.actuator_status}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800 mx-1" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">DEFLECTION</span>
            <span className="text-slate-300">
              P: {currentPoint.actuator_deflection[0].toFixed(2)} | Y: {currentPoint.actuator_deflection[1].toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
