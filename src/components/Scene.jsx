import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Html,
  Environment,
  Stars,
  PerspectiveCamera,
  OrbitControls,
  Edges,
  Box,
  Cylinder,
  Torus,
  Sphere,
  MeshTransmissionMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

// -------------------------------------------------------------
// Interactive Holographic Glass (Common Interface)
// -------------------------------------------------------------
const GlassHUD = ({ title, children, color = "#0ea5e9", width = "w-[300px]" }) => (
  <div className={`p-5 bg-black/40 backdrop-blur-3xl border-l-2 border-t border-white/10 shadow-2xl relative ${width} rounded-tr-2xl overflow-hidden`}
       style={{ borderLeftColor: color }}>
     <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-20" />
     <div className="mb-4 border-b border-white/5 pb-2">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block mb-1">SIM_MODULE_X</span>
        <h3 className="text-[18px] font-black uppercase italic tracking-wider text-white bg-clip-text" style={{ color }}>{title}</h3>
     </div>
     {children}
  </div>
);

// -------------------------------------------------------------
// The "FTP CLIENT" Platform
// -------------------------------------------------------------
const FTPClientNode = ({ position, active, files, onStart }) => (
  <group position={position}>
    {/* Base Platform */}
    <Box args={[14, 1.5, 12]} position={[0, 0, 0]}>
       <meshPhysicalMaterial color="#020617" roughness={0.05} metalness={1} metalnessIntensity={2} />
       <Edges color="#0ea5e9" opacity={0.6} />
    </Box>
    <Box args={[12, 0.4, 10]} position={[0, 0.8, 0]}>
       <meshPhysicalMaterial color="#01040a" metalness={1} roughness={0.1} />
       <gridHelper args={[10, 10, '#0ea5e9', '#0ea5e911']} position={[0, 0.21, 0]} />
    </Box>

    {/* Holographic Glowing Cubes (Files) */}
    {files.slice(0, 4).map((f, i) => (
       <Float key={f.name} speed={2} position={[(i % 2 - 0.5) * 4, 3, (Math.floor(i/2) - 0.5) * 4]}>
          <Box args={[1.5, 1.5, 1.5]}>
             <MeshTransmissionMaterial thickness={1} anisotropy={0.3} ior={1.2} transmission={1} samples={10} color={i % 2 === 0 ? "#0ea5e9" : "#818cf8"} />
             <Edges color="#ffffff" opacity={0.5} />
          </Box>
       </Float>
    ))}

    {/* Interaction Tooltip (Annotated) */}
    <Html position={[-8, 4, 4]} transform distanceFactor={10} rotation={[0, Math.PI/4, 0]}>
       <div className="flex items-center gap-2">
          <div className="w-10 h-[1px] bg-sky-400" />
          <span className="text-[8px] font-black text-white px-2 py-1 bg-sky-500 rounded whitespace-nowrap">LOCAL_MACHINE_VAULT</span>
       </div>
    </Html>

    {/* Control Station Panel */}
    <Html position={[0, 10, 10]} center transform distanceFactor={8}>
       <GlassHUD title="CLIENT_COMMAND_HUD" color="#0ea5e9">
          <div className="flex flex-col gap-4">
             <button onClick={onStart} className="w-full py-4 bg-sky-500 text-black font-black uppercase tracking-[0.3em] rounded shadow-[0_0_30px_#0ea5e955] hover:scale-105 transition-all">
                START_SIMULATION
             </button>
             <div className="grid grid-cols-2 gap-2">
                {["CONNECT", "LOGIN", "UPLOAD", "DOWNLOAD"].map(btn => (
                  <button key={btn} className="py-2 bg-white/5 border border-white/20 text-[8px] font-black text-white hover:bg-white/10 uppercase tracking-widest">{btn}</button>
                ))}
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[7px] text-white/40 uppercase tracking-widest">Progress: 25.4%</span>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-sky-500 w-[25%]" />
                </div>
             </div>
          </div>
       </GlassHUD>
    </Html>
  </group>
);

// -------------------------------------------------------------
// The "REMOTE SERVER" Monolith
// -------------------------------------------------------------
const RemoteServerNode = ({ position, active }) => (
  <group position={position}>
    {/* Giant Detailed Tower */}
    <Box args={[12, 35, 12]} position={[0, 17, 0]}>
       <meshPhysicalMaterial color="#01040a" roughness={0.05} metalness={1} metalnessIntensity={2} />
       <Edges color="#10b981" opacity={0.4} />
    </Box>

    {/* Layered Details (Circuitry effect) */}
    {[5, 10, 15, 20, 25, 30].map(y => (
       <Box key={y} args={[12.5, 0.4, 12.5]} position={[0, y, 0]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
          <Edges color="#10b981" opacity={0.6} />
       </Box>
    ))}

    {/* Glow Core */}
    <Cylinder args={[5.5, 5.5, 30, 32]} position={[0, 17, 0]}>
       <meshBasicMaterial color="#10b981" transparent opacity={0.05} />
    </Cylinder>

    {/* Remote HUD Panel */}
    <Html position={[14, 25, 0]} transform distanceFactor={8} rotation={[0, -Math.PI/6, 0]}>
       <GlassHUD title="REMOTE_HOST_STATS" color="#10b981">
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center bg-black/40 p-2 border-l border-[#10b981]">
                <span className="text-[10px] font-black text-white/80">REMOTE_FILES</span>
                <span className="text-[9px] text-[#10b981] font-mono">152 ITEMS</span>
             </div>
             {/* Graph Placeholder */}
             <div className="h-10 w-full flex items-end gap-1 px-1">
                {[4,8,3,9,11,6,10].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#10b981]/40" style={{ height: `${h*8}%` }} />
                ))}
             </div>
             <p className="text-[7px] text-white/40 leading-relaxed uppercase tracking-widest font-black italic">Target Node: 104.22.7.201 // SSL: ACTIVE</p>
          </div>
       </GlassHUD>
    </Html>
    
    <Html position={[0, 18, -8]} center transform distanceFactor={10} rotation={[Math.PI/10, 0, 0]}>
       <div style={{ color: '#10b981', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', border: '1px solid #10b981', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
         REMOTE_STORAGE_HUBS
       </div>
    </Html>
  </group>
);

// -------------------------------------------------------------
// The "FTP LINK" Tube Arcs
// -------------------------------------------------------------
const FTPLinkTube = ({ p1, p2, color, label, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 25 + offset, 0);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 1.5, 16, false]} />
        <meshPhysicalMaterial color={color} transmission={0.9} transparent opacity={0.2} roughness={0.1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html position={[0, 22 + offset, 0]} center transform>
         <div className="px-4 py-1 bg-black/90 border border-white/20 whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white" style={{ textShadow: `0 0 10px ${color}` }}>{label}</span>
         </div>
      </Html>
    </group>
  );
};

export const Scene = ({ ftpState, clientFiles, serverFiles, onCommand, onStart }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        {/* TRUE ISOMETRIC FEEL CAMERA */}
        <PerspectiveCamera makeDefault position={[60, 60, 60]} fov={30} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 10} />
        
        <color attach="background" args={['#000308']} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[50, 50, 50]} intensity={3} color="#0ea5e9" />
        <pointLight position={[-50, 50, -50]} intensity={2} color="#10b981" />
        <spotLight position={[0, 100, 0]} intensity={1.5} angle={0.5} penumbra={1} color="white" />

        <Stars radius={200} depth={50} count={14000} factor={6} fade speed={2} />
        <gridHelper args={[400, 40, '#ffffff08', '#ffffff11']} position={[0, -0.1, 0]} />

        {/* Primary Actors */}
        <FTPClientNode position={[-40, 0, 20]} files={clientFiles} onStart={onStart} />
        <RemoteServerNode position={[40, 0, -20]} active={ftpState === FTP_STATES.LOGGED_IN} />

        {/* Backup Node */}
        <group position={[-20, 0, -30]}>
           <Box args={[6, 12, 6]}>
              <meshPhysicalMaterial color="#020617" roughness={0.1} metalness={1} />
              <Edges color="#ef4444" opacity={0.4} />
           </Box>
           <Html position={[0, 14, 0]} transform center>
              <span className="text-[8px] font-black text-red-500 tracking-widest uppercase">BACKUP_STORAGE</span>
           </Html>
        </group>

        {/* Channels */}
        <FTPLinkTube p1={[-30, 2, 20]} p2={[30, 12, -20]} color="#0ea5e9" label="CONTROL CHANNEL (Port 21)" />
        <FTPLinkTube p1={[-30, 2, 20]} p2={[30, 2, -20]} color="#10b981" label="DATA CHANNEL (Port 20)" offset={-15} />

        {/* Status Center */}
        <Html position={[0, 35, 0]} center transform distanceFactor={10}>
           <div className="w-[420px] p-8 bg-black/60 border border-white/10 tech-panel backdrop-blur-3xl rounded-3xl shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-[28px] font-black italic uppercase tracking-tighter text-white">SIMULATION_STATUS</h2>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em]">Mode: {ftpState}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-mono text-[#38bdf8] block">CONNECTED_STABLE</span>
                    <span className="text-[18px] font-black text-white">2.4 GB/S</span>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[9px] font-black text-white/20 uppercase block mb-1">TRANSMISSION_PROGRESS</span>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 w-[65%]" />
                    </div>
                 </div>
              </div>
           </div>
        </Html>

        {/* Educational Panel */}
        <Html position={[50, 10, 40]} transform rotation={[0, -Math.PI/4, 0]} distanceFactor={8}>
           <div className="w-[280px] p-6 bg-black/80 border-r-4 border-white/20">
              <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">HOW FTP WORKS</h4>
              <ul className="flex flex-col gap-3">
                 {[
                   "1. Establish Socket Handshake",
                   "2. Authenticate Protocol Session",
                   "3. Negotiate Data Stream Channel",
                   "4. Perform Binary/ASCII Transfer"
                 ].map((t, i) => (
                   <li key={i} className="text-[9px] font-bold text-white/50 flex items-start gap-2">
                     <span className="text-sky-400">{i+1}.</span> {t}
                   </li>
                 ))}
              </ul>
              <div className="mt-6 flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                 <span className="text-[8px] font-black text-white/40 uppercase">LIVE_SYNC_READY</span>
              </div>
           </div>
        </Html>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
