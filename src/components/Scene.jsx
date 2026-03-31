import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  ContactShadows, 
  Html,
  Environment,
  Stars,
  PerspectiveCamera,
  BakeShadows,
  OrbitControls,
  Edges,
  Box,
  Cylinder,
  Sphere,
  Torus
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

// -------------------------------------------------------------
// UI Panels (Hovering HTML)
// -------------------------------------------------------------
const UIPanel = ({ title, subtitle, items, color, glowingColor, width = "w-72" }) => (
  <div className={`tech-panel p-5 ${width} border-t-2 border-b-2 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden`} 
       style={{ borderColor: glowingColor, boxShadow: `0 0 30px ${glowingColor}20` }}>
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
         style={{ background: `linear-gradient(45deg, transparent 40%, ${glowingColor} 50%, transparent 60%)`, backgroundSize: '200% 200%', animation: 'sweep 3s infinite linear' }} />
    <div className="border-b pb-2 mb-3" style={{ borderColor: `${glowingColor}40` }}>
      <h3 className="text-[20px] font-black uppercase tracking-widest m-0 drop-shadow-md" style={{ color: glowingColor }}>{title}</h3>
      {subtitle && <div className="text-[10px] font-mono text-white/50">{subtitle}</div>}
    </div>
    <div className="grid grid-cols-1 gap-2 text-[11px] font-bold tracking-widest text-white/90">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: glowingColor }}>{item.icon || '❖'}</span> {item.label}
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------------------------
// Nodes / Servers
// -------------------------------------------------------------
const ClientDevice = ({ position, active, files }) => {
  const fileItems = useMemo(() => {
    return files.slice(0, 4).map(f => ({ label: f.name, icon: f.type === 'dir' ? '📂' : '📄' }));
  }, [files]);

  return (
    <group position={position} scale={1.4}>
      {/* High-Tech Pad Base */}
      <Box args={[4.5, 0.5, 4.5]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#020a12" roughness={0.1} metalness={0.9} />
        <Edges color="#38bdf8" opacity={0.6} />
      </Box>
      <Box args={[4, 0.4, 4]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#041524" roughness={0.5} metalness={0.8} />
        <Edges color="#0ea5e9" opacity={0.3} />
      </Box>
      <gridHelper args={[4, 10, '#0ea5e9', '#020617']} position={[0, 0.41, 0]} />

      {/* Node Logic Label */}
      <Html position={[0, 6, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[14px] font-black tracking-[0.5em] text-[#38bdf8] drop-shadow-[0_0_10px_#38bdf8]">CLIENT_ORIGIN</span>
           <span className="text-[6px] text-white/40 uppercase mt-1">TCP Control Persistence: {active ? "ACTIVE" : "OFFLINE"}</span>
        </div>
      </Html>

      {/* Protocol Explanation HUD */}
      <Html position={[-5, 3, 0]} transform distanceFactor={8}>
         <div className="cyber-panel p-3 bg-black/80 border-sky-400/30 w-[200px]">
            <span className="text-[8px] font-black text-sky-400 tracking-widest block mb-1">PROTO_ROLE: CONTROL_COMMANDER</span>
            <p className="text-[7px] text-white/60 leading-tight">Initiates the Telnet-based Control Connection on Port 21. It sends textual commands (USER, PASS, LIST) to modulate the remote server state.</p>
         </div>
      </Html>

const ServerDevice = ({ position, active, files }) => {
  const fileItems = useMemo(() => {
    return files.slice(0, 4).map(f => ({ label: f.name, icon: f.type === 'dir' ? '📂' : '📄' }));
  }, [files]);

  return (
    <group position={position} scale={1.4}>
      {/* Massive Server Tower */}
      <Box args={[4, 9, 4]} position={[0, 4.5, 0]}>
        <meshPhysicalMaterial color="#020a12" roughness={0.2} metalness={0.9} clearcoat={0.5} />
        <Edges color="#10b981" opacity={0.3} />
      </Box>
      
      {/* Logic Hub Label */}
      <Html position={[0, 10, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[14px] font-black tracking-[0.5em] text-[#10b981] drop-shadow-[0_0_10px_#10b981]">REMOTE_NODE_A1</span>
           <span className="text-[6px] text-white/40 uppercase mt-1">Status: {active ? "Data_Link_Established" : "Awaiting_Handshake"}</span>
        </div>
      </Html>

      {/* FTP Explanation HUD */}
      <Html position={[5, 5, 0]} transform distanceFactor={8}>
         <div className="cyber-panel p-3 bg-black/80 border-[#10b981]/30 w-[200px]">
            <span className="text-[8px] font-black text-[#10b981] tracking-widest block mb-1">PROTO_ROLE: DATA_SOURCE</span>
            <p className="text-[7px] text-white/60 leading-tight">This node manages the passive/active data ports. It listens for PORT/PASV commands to bind binary streams.</p>
         </div>
      </Html>

const BackupServer = ({ position }) => (
  <group position={position}>
    <Cylinder args={[2, 2.5, 5, 8]} position={[0, 2.5, 0]}>
      <meshStandardMaterial color="#1f0a0a" roughness={0.4} metalness={0.8} />
      <Edges color="#ef4444" opacity={0.4} />
    </Cylinder>
    {/* Glowing Rings */}
    {[1, 2.5, 4].map((y, i) => (
       <Torus key={y} args={[2.1, 0.1, 16, 32]} position={[0, y, 0]} rotation={[Math.PI/2, 0, 0]}>
         <meshBasicMaterial color="#ef4444" />
       </Torus>
    ))}
    <pointLight position={[0, 2.5, 2]} color="#ef4444" intensity={2} distance={10} />
    <Html position={[0, 6, 0]} transform distanceFactor={6}>
      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500 text-glow whitespace-nowrap text-center drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
        BACKUP SERVER<br/><span className="text-red-300/60 text-[6px]">SERVER: 192.168.1.110</span>
      </div>
    </Html>
  </group>
);

const SecureServer = ({ position }) => (
  <group position={position}>
    {/* Obelisk Shape */}
    <Cylinder args={[0.2, 2, 7, 4]} position={[0, 3.5, 0]}>
      <meshPhysicalMaterial color="#020617" metalness={1} roughness={0.1} clearcoat={1} />
      <Edges color="#06b6d4" opacity={0.6} threshold={15} />
    </Cylinder>
    {/* Glowing Base */}
    <Box args={[3, 0.5, 3]} position={[0, 0.25, 0]}>
      <meshStandardMaterial color="#083344" metalness={0.9} />
      <Edges color="#06b6d4" />
    </Box>
    <Box args={[2, 0.2, 2]} position={[0, 0.6, 0]}>
      <meshBasicMaterial color="#06b6d4" />
      <pointLight color="#06b6d4" intensity={3} distance={15} />
    </Box>
    <Html position={[0, 8, 0]} transform distanceFactor={6} center>
      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 text-glow whitespace-nowrap text-center drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
        SECURE GATEWAY API
      </div>
    </Html>
  </group>
);

// -------------------------------------------------------------
// Network Cables (Tubes)
// -------------------------------------------------------------
const TubeConnection = ({ curvePoints, innerColor, outerColor, label, labelPos, labelRot }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(curvePoints), [curvePoints]);
  
  return (
    <group>
      {/* Core Fiber */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.15, 16, false]} />
        <meshPhysicalMaterial 
          color={innerColor} 
          transmission={0.9} 
          roughness={0.1} 
          clearcoat={1} 
          emissive={innerColor} 
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Protective Casing */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.25, 16, false]} />
        <meshPhysicalMaterial 
           color="#1e293b" 
           metalness={0.8} 
           roughness={0.4} 
           transparent 
           opacity={0.4} 
           wireframe 
        />
      </mesh>
      
      {label && (
        <Html position={labelPos} transform distanceFactor={6} rotation={labelRot}>
          <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-[7px] font-black tracking-[0.2em] rounded whitespace-nowrap" 
               style={{ color: innerColor, borderColor: `${innerColor}50`, boxShadow: `0 0 15px ${innerColor}40` }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// Data Packets (Traversing tubes)
// -------------------------------------------------------------
const DataPacket = ({ pathPoints, dir, label, baseColor }) => {
  const mesh = useRef();
  const progress = useRef(dir === 'c2s' ? 0 : 1);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints), [pathPoints]);

  useFrame((state, delta) => {
    const speed = 0.6 * delta; // Packet speed
    if (dir === 'c2s') {
      progress.current = Math.min(1, progress.current + speed);
    } else {
      progress.current = Math.max(0, progress.current - speed);
    }

    if (curve && mesh.current) {
       const pos = curve.getPointAt(progress.current);
       mesh.current.position.copy(pos);
       mesh.current.rotation.x += 0.05;
       mesh.current.rotation.y += 0.1;
    }
  });

  return (
    <group ref={mesh}>
      {/* Inner Glowing Core */}
      <Box args={[0.6, 0.6, 0.6]}>
         <meshPhysicalMaterial color="#ffffff" transmission={0} roughness={0} emissive={baseColor} emissiveIntensity={3} />
      </Box>
      {/* Outer Shell */}
      <Box args={[0.8, 0.8, 0.8]}>
         <meshPhysicalMaterial color={baseColor} transmission={0.9} opacity={1} transparent roughness={0.1} clearcoat={1} />
      </Box>
      <Html className="pointer-events-none" distanceFactor={4}>
         <div className="px-1.5 py-0.5 bg-black/90 backdrop-blur-sm border text-[6px] font-mono font-bold text-white rounded whitespace-nowrap" 
              style={{ borderColor: baseColor, boxShadow: `0 0 10px ${baseColor}` }}>
            {label}
         </div>
      </Html>
      <pointLight color={baseColor} intensity={2} distance={5} />
    </group>
  );
}

// -------------------------------------------------------------
// Background Ambient Traffic
// -------------------------------------------------------------
const BackgroundPacket = ({ pathPoints, baseColor, speedMultiplier = 1, reverse = false }) => {
  const mesh = useRef();
  const progress = useRef(Math.random());
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints), [pathPoints]);

  useFrame((state, delta) => {
    let speed = 0.2 * delta * speedMultiplier;
    if (reverse) speed = -speed;
    
    progress.current = (progress.current + speed);
    if (progress.current > 1) progress.current = 0;
    if (progress.current < 0) progress.current = 1;

    if (curve && mesh.current) {
       const pos = curve.getPointAt(progress.current);
       mesh.current.position.copy(pos);
       mesh.current.rotation.x += 0.05;
       mesh.current.rotation.y += 0.05;
    }
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color={baseColor} transparent opacity={0.8} />
      <pointLight color={baseColor} intensity={0.5} distance={2} />
    </mesh>
  );
};

// -------------------------------------------------------------
// Data Stream Flow (For continuous file transfers)
// -------------------------------------------------------------
const DataStream = ({ pathPoints, baseColor, isUploading }) => {
  const count = 25;
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints), [pathPoints]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef();
  
  const offsets = useMemo(() => new Array(count).fill(0).map((_, i) => i / count), [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const speed = 0.5 * delta;
    
    for (let i = 0; i < count; i++) {
      offsets[i] += isUploading ? speed : -speed;
      if (offsets[i] > 1) offsets[i] -= 1;
      if (offsets[i] < 0) offsets[i] += 1;
      
      const pos = curve.getPointAt(offsets[i]);
      dummy.position.copy(pos);
      dummy.rotation.x += 0.1;
      dummy.rotation.y += 0.1;
      const scale = 0.2 + Math.sin(offsets[i] * Math.PI) * 0.4;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#ffffff" emissive={baseColor} emissiveIntensity={3} transmission={0.9} roughness={0.1} />
      </instancedMesh>
      <pointLight color={baseColor} intensity={2} distance={8} />
    </group>
  );
};

// -------------------------------------------------------------
// Topology Manager
// -------------------------------------------------------------
const NetworkTopology = ({ p1, p2, pBackup, pSecure, packets, activeTransfer }) => {
  // Tube Paths
  const controlCurve = useMemo(() => [
    new THREE.Vector3(...p1).add(new THREE.Vector3(1, 1, 0)),
    new THREE.Vector3(0, 4, 1),
    new THREE.Vector3(...p2).add(new THREE.Vector3(-2, 3, 0))
  ], [p1, p2]);

  const dataCurve = useMemo(() => [
    new THREE.Vector3(...p1).add(new THREE.Vector3(2, 0.5, 0.5)),
    new THREE.Vector3(-1, 0.5, 2),
    new THREE.Vector3(2, 1, 2),
    new THREE.Vector3(...p2).add(new THREE.Vector3(-1.5, 2, 1.5))
  ], [p1, p2]);

  const backupCurve = useMemo(() => [
    new THREE.Vector3(...p1).add(new THREE.Vector3(-1, 0.5, -1)),
    new THREE.Vector3(-3, 1, -4),
    new THREE.Vector3(...pBackup).add(new THREE.Vector3(1, 1, 1))
  ], [p1, pBackup]);

  const secureCurve = useMemo(() => [
    new THREE.Vector3(...p1).add(new THREE.Vector3(1.5, 0.2, 2)),
    new THREE.Vector3(1, 0.5, 5),
    new THREE.Vector3(...pSecure).add(new THREE.Vector3(-1.5, 0.5, 0))
  ], [p1, pSecure]);

  return (
    <group>
      {/* 1. Control Channel */}
      <TubeConnection 
        curvePoints={controlCurve} innerColor="#eab308" outerColor="#0ea5e9"
        label="CONTROL CHANNEL (Port 21)" labelPos={[0, 4.5, 1]} labelRot={[0, 0, 0]}
      />
      {/* 2. Data Channel */}
      <TubeConnection 
        curvePoints={dataCurve} innerColor="#10b981" outerColor="#0ea5e9"
        label="DATA CHANNEL (Port 20)" labelPos={[0, 1, 2.5]} labelRot={[0, 0, 0]}
      />
      {/* 3. Backup Channel */}
      <TubeConnection 
        curvePoints={backupCurve} innerColor="#ef4444" outerColor="#0ea5e9"
        label="BACKUP CHANNEL (Port 2022)" labelPos={[-3, 2, -3]} labelRot={[0, Math.PI/4, 0]}
      />
      {/* 4. Secure Channel */}
      <TubeConnection 
        curvePoints={secureCurve} innerColor="#06b6d4" outerColor="#0ea5e9"
        label="SECURE CHANNEL (Port 2222)" labelPos={[1, 1, 4]} labelRot={[0, -Math.PI/4, 0]}
      />
      {/* Active High-Speed Data Stream */}
      {activeTransfer && (
        <DataStream pathPoints={dataCurve} baseColor="#34d399" isUploading={activeTransfer.dir === 'upload'} />
      )}

      {/* Background Traffic */}
      <BackgroundPacket pathPoints={backupCurve} baseColor="#ef4444" speedMultiplier={0.8} />
      <BackgroundPacket pathPoints={secureCurve} baseColor="#06b6d4" speedMultiplier={1.2} />
      <BackgroundPacket pathPoints={secureCurve} baseColor="#06b6d4" speedMultiplier={1.5} reverse />

      {/* Foreground Interactive Packets */}
      {packets.map((p) => {
         if (p.type === 'data') {
           return <DataPacket key={p.id} pathPoints={dataCurve} dir={p.dir} label={p.label} baseColor="#10b981" />
         } else if (p.type === 'control') {
           return <DataPacket key={p.id} pathPoints={controlCurve} dir={p.dir} label={p.label} baseColor="#eab308" />
         }
         return null;
      })}
    </group>
  );
};

// -------------------------------------------------------------
// Main Scene
// -------------------------------------------------------------
export const Scene = ({ ftpState, packets, activeTransfer, clientFiles, serverFiles }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas 
         shadows 
         gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
         style={{ height: '100vh', width: '100vw' }}
      >
        <PerspectiveCamera makeDefault position={[5, 15, 25]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2 - 0.1} 
          minPolarAngle={Math.PI / 4} 
        />
        
        <color attach="background" args={['#010309']} />
        
        {/* Cinematic Lighting System */}
        <ambientLight intensity={0.5} color="#e2e8f0" />
        <pointLight position={[10, 15, 10]} intensity={2.5} color="#0ea5e9" />
        <pointLight position={[-10, 10, -5]} intensity={1.5} color="#38bdf8" />
        <spotLight position={[0, 20, 0]} intensity={3} angle={0.5} penumbra={1} color="#f8fafc" castShadow />

        {/* Global FX */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
        
        {/* Advanced Grid Base */}
        <group position={[0, -0.2, 0]}>
          <gridHelper args={[100, 100, '#021a30', '#010812']} />
          <gridHelper args={[100, 20, '#0ea5e9', '#0ea5e9']} position={[0, 0.01, 0]} material-opacity={0.1} material-transparent />
        </group>

        {/* Core Node Placements */}
        <ClientDevice 
          position={[-7, 0, 3]} 
          active={ftpState !== FTP_STATES.DISCONNECTED} 
          files={clientFiles || []}
        />
        
        <ServerDevice 
          position={[7, 0, -3]} 
          active={ftpState === FTP_STATES.LOGGED_IN || ftpState === FTP_STATES.TRANSFERRING} 
          files={serverFiles || []}
        />

        <BackupServer position={[-5, 0, -8]} />
        <SecureServer position={[7, 0, 7]} />

        {/* Central Complex Matrix Flow Paths */}
        <NetworkTopology 
          p1={[-7, 0, 3]} 
          p2={[7, 0, -3]} 
          pBackup={[-5, 0, -8]}
          pSecure={[7, 0, 7]}
          packets={packets} 
          activeTransfer={activeTransfer}
        />

        {/* Floating Master Status Display - Relocated to the side for uninterrupted view */}
        <Html position={[10, 14, -5]} center transform distanceFactor={10} rotation={[0, -Math.PI / 4, 0]}>
           <div className="tech-panel p-6 bg-black/80 backdrop-blur-xl border border-emerald-500/50 min-w-[320px] rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.15)] opacity-90 scale-125">
             <div className="flex justify-between items-center border-b border-emerald-500/30 pb-3 mb-3">
                <span className="text-[18px] font-black uppercase tracking-[0.2em] tech-text-green">
                   DAEMON_STATUS
                </span>
                <span className={`w-3 h-3 rounded-full ${ftpState !== FTP_STATES.DISCONNECTED ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-red-500'}`} />
             </div>
             
             <div className="grid grid-cols-2 gap-4 text-[10px] font-mono mb-4">
                <div>
                   <div className="text-slate-500 mb-1 font-bold">LINK_STATE</div>
                   <div className="text-emerald-400 font-bold">{ftpState !== FTP_STATES.DISCONNECTED ? "TUNNEL_ESTABLISHED" : "LINK_TERMINATED"}</div>
                </div>
                <div>
                   <div className="text-slate-500 mb-1 font-bold">DATA_BANDWIDTH</div>
                   <div className="text-cyan-400 font-bold">{activeTransfer ? "Tx/Rx_MAX_STREAM" : (packets.some(p => p.type === 'data') ? "TRANSMITTING..." : "SPECTRAL_IDLE")}</div>
                </div>
             </div>

             {activeTransfer && (
               <div className="mt-4 p-3 bg-[#022c22]/50 rounded border border-emerald-500/30 backdrop-blur-sm">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-300 mb-2">
                   <span>STREAMING: {activeTransfer.name}</span>
                   <span>{activeTransfer.progress}%</span>
                 </div>
                 <div className="h-1.5 bg-[#064e3b] w-full rounded overflow-hidden">
                   <div className="h-full bg-[#34d399] transition-all duration-300 shadow-[0_0_15px_#34d399]" style={{ width: `${activeTransfer.progress}%` }} />
                 </div>
                 <div className="text-[8px] text-emerald-500/70 mt-2 text-right tracking-widest font-bold">BURST: 2.1 Gb/s · LATENCY: 2ms</div>
               </div>
             )}
           </div>
        </Html>

        <Environment preset="night" />
        <BakeShadows />
      </Canvas>
    </div>
  );
};
