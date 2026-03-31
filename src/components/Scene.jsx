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
// ONE-TO-ONE Glass HUD Component
// -------------------------------------------------------------
const GlassPanel = ({ title, subtitle, items = [], color = "#0ea5e9", width = "w-[300px]", header = true, children }) => (
  <div className={`p-5 bg-black/40 backdrop-blur-3xl border-l-[3px] border-t border-white/10 shadow-2xl relative ${width} rounded-tr-3xl overflow-hidden`}
       style={{ borderLeftColor: color }}>
     
     <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `linear-gradient(rgba(255,255,255,0.05) 50%, transparent 50%)`, backgroundSize: '100% 4px' }} />
     
     {header && (
        <div className="mb-4 border-b border-white/5 pb-2">
           <div className="flex justify-between items-center">
              <span className="text-[9px] font-black italic text-white/30 tracking-[0.4em] uppercase">{subtitle}</span>
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-white/10" />)}
              </div>
           </div>
           <h3 className="text-[18px] font-black italic text-white uppercase tracking-tight" style={{ color }}>{title}</h3>
        </div>
     )}

     {children ? children : (
       <div className="flex flex-col gap-3">
          {items.map((it, i) => (
             <div key={i} className="flex justify-between items-center border-b border-black/5 pb-1">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                   <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{it.label}</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-black">{it.val}</span>
             </div>
          ))}
       </div>
     )}
  </div>
);

// -------------------------------------------------------------
// ACTORS: ONE-TO-ONE REPRODUCTION
// -------------------------------------------------------------
const MonolithBase = ({ position, label, color, files = [] }) => (
  <group position={position}>
    <Box args={[14, 1.5, 12]} position={[0, 0, 0]}>
       <meshPhysicalMaterial color="#020617" roughness={0.05} metalness={1} reflectivity={1} />
       <Edges color={color} opacity={0.4} />
    </Box>
    <Box args={[12, 0.4, 10]} position={[0, 0.8, 0]}>
       <meshPhysicalMaterial color="#01040a" metalness={1} roughness={0.1} />
       <Edges color={color} opacity={0.8} />
    </Box>
    
    {files.slice(0, 4).map((f, i) => (
       <Float key={i} speed={2} position={[(i % 2 - 0.5) * 4, 3, (Math.floor(i/2) - 0.5) * 4]}>
          <Box args={[1.5, 1.5, 1.5]}>
             <MeshTransmissionMaterial thickness={1} anisotropy={0.3} ior={1.2} transmission={1} samples={10} color={color} />
             <Edges color="#ffffff" opacity={0.5} />
          </Box>
       </Float>
    ))}

    <Html position={[0, -0.6, 12]} transform rotation={[-Math.PI / 2, 0, 0]} center>
       <span className="text-[32px] font-black italic text-white/10 uppercase tracking-[0.5em] whitespace-nowrap">{label}</span>
    </Html>
  </group>
);

const BackupServer = ({ position }) => (
  <group position={position}>
     <Box args={[10, 15, 10]}>
        <meshPhysicalMaterial color="#020617" roughness={0.1} metalness={1} />
        <Edges color="#ef4444" opacity={0.4} />
     </Box>
     <Sphere args={[2.5, 32, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
        {/* Glowing Red Core */}
        <pointLight color="#ef4444" intensity={8} distance={20} />
     </Sphere>
     <Html position={[0, 11, 0]} center transform distanceFactor={10}>
        <div className="flex flex-col items-center">
           <span className="text-[12px] font-black text-red-500 tracking-[0.4em] uppercase">BACKUP SERVER</span>
           <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.6em]">192.168.1.110</span>
        </div>
     </Html>
  </group>
);

const RemoteServer = ({ position, active }) => (
  <group position={position}>
    <Box args={[12, 40, 12]} position={[0, 20, 0]}>
       <meshPhysicalMaterial color="#01040a" roughness={0.05} metalness={1} reflectivity={1} />
       <Edges color="#10b981" opacity={0.3} />
    </Box>

    {[10, 20, 30].map(y => (
       <Box key={y} args={[12.5, 0.5, 12.5]} position={[0, y, 0]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
          <Edges color="#10b981" opacity={0.6} />
       </Box>
    ))}

    {/* Focal Energy Portal on Server Face */}
    <Torus args={[4.5, 0.1, 16, 100]} position={[0, 18, 6.2]} rotation={[0, 0, 0]}>
       <meshBasicMaterial color="#10b981" />
       {active && <pointLight color="#10b981" intensity={10} distance={25} />}
    </Torus>

    <Html position={[0, -0.6, 12]} transform rotation={[-Math.PI / 2, 0, 0]} center>
       <span className="text-[32px] font-black italic color-white/10 text-white uppercase tracking-[0.50em] whitespace-nowrap opacity-10">REMOTE SERVER</span>
    </Html>
    
    <Html position={[0, 45, 0]} center transform distanceFactor={10}>
       <div className="flex flex-col items-center">
          <span className="text-[16px] font-black text-emerald-500 tracking-[0.4em] uppercase">REMOTE SERVER</span>
          <span className="text-[10px] font-black text-white/20 tracking-[0.6em] uppercase">104.22.7.201</span>
       </div>
    </Html>
  </group>
);

const LinkTube = ({ p1, p2, color, label, offset = 0, opacity = 0.2 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 25 + offset, 15);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 1.2, 16, false]} />
        <meshPhysicalMaterial color={color} transmission={1} transparent opacity={opacity} roughness={0} metalness={1} reflectivity={1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 18 + offset, 16]} transform center distanceFactor={12}>
         <div className="bg-black/90 p-2 border border-white/20 rounded shadow-2xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white" style={{ textShadow: `0 0 15px ${color}` }}>{label}</span>
         </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// THE CORE SCENE
// -------------------------------------------------------------
export const Scene = ({ ftpState, clientFiles, serverFiles, activeTransfer, onCommand, onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[55, 60, 95]} fov={35} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 10} />
        
        <color attach="background" args={['#000306']} />
        
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.1} />
        <spotLight position={[120, 120, 120]} angle={0.2} penumbra={1} intensity={6} color="#0ea5e9" castShadow />
        <spotLight position={[-120, 120, -120]} angle={0.2} penumbra={1} intensity={4} color="#10b981" />
        <rectAreaLight width={100} height={100} position={[0, 80, 0]} intensity={2} color="#ffffff" />

        <Stars radius={250} depth={50} count={20000} factor={6} fade speed={1.5} />
        <gridHelper args={[600, 120, '#ffffff08', '#ffffff05']} position={[0, -0.1, 0]} />

        {/* PRIMARY ACTORS: ONE-TO-ONE */}
        <MonolithBase position={[-40, 0, 30]} label="FTP CLIENT" color="#0ea5e9" files={clientFiles} />
        <BackupServer position={[-15, 0, -45]} />
        <RemoteServer position={[45, 0, -25]} active={ftpState === FTP_STATES.LOGGED_IN} />

        <group position={[0, 0, 0]}>
           <LinkTube p1={[-30, 2, 30]} p2={[35, 12, -25]} color="#0ea5e9" label="CONTROL CHANNEL (Port 21)" />
           <LinkTube p1={[-30, 1.5, 30]} p2={[35, 2, -25]} color="#11c28b" label="DATA CHANNEL (Port 20)" offset={-15} opacity={0.15} />
           <LinkTube p1={[-30, 1.1, 30]} p2={[35, -5, -25]} color="#94a3b8" label="SECURE CHANNEL (Port 2222)" offset={-28} opacity={0.1} />
        </group>

        {/* TOP STATUS PANEL (CENTER) */}
        <Html position={[0, 48, 10]} transform center distanceFactor={12}>
           <GlassPanel title="STATUS" subtitle="NEXUS_LINK_MONITOR" color="#0ea5e9" width="w-[480px]">
              <div className="flex justify-between items-start">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Active Connection</span>
                    <span className="text-[16px] font-black italic text-white uppercase tracking-tighter">{ftpState}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black text-white/20 uppercase block mb-1">Transfer Rate</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[18px] font-black italic text-emerald-400">25.4 MB/S</span>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
                 </div>
              </div>
           </GlassPanel>
        </Html>

        {/* SERVER SELECTION PANEL (LEFT MID) */}
        <Html position={[-38, 12, 10]} transform rotation={[0, Math.PI / 8, 0]} distanceFactor={8}>
           <GlassPanel title="SERVER SELECTION" subtitle="SOURCE_ENDPOINT_MAP" color="#0ea5e9">
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-sky-500/10 p-2 border-l-2 border-sky-500">
                   <div className="flex items-center gap-2">
                      <Globe size={10} className="text-sky-400" />
                      <span className="text-[10px] font-black text-sky-400 uppercase">REMOTE SERVER</span>
                   </div>
                   <span className="text-[8px] font-black text-emerald-400">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 opacity-50">
                   <div className="flex items-center gap-2">
                      <Database size={10} />
                      <span className="text-[10px] font-black uppercase">BACKUP SERVER</span>
                   </div>
                   <span className="text-[8px] font-black opacity-40">STANDBY</span>
                </div>
                <div className="flex justify-between items-center p-2 opacity-20">
                   <div className="flex items-center gap-2">
                      <Lock size={10} />
                      <span className="text-[10px] font-black uppercase">SECURE SERVER</span>
                   </div>
                   <span className="text-[8px] font-black opacity-40">OFFLINE</span>
                </div>
             </div>
           </GlassPanel>
        </Html>

        {/* REMOTE FILES PANEL (RIGHT MID EMBEDDED) */}
        <Html position={[42, 28, -5]} transform rotation={[0, -Math.PI / 8, 0]} distanceFactor={10}>
           <GlassPanel title="REMOTE FILES" subtitle="TARGET_FS_UNIT_01" color="#10b981">
              <div className="flex flex-col gap-2">
                 {["sys/core", "bin/", "lib/x64", "config/sim_v4"].map((f, i) => (
                    <div key={i} className="flex gap-2 items-center text-[10px] text-emerald-400 font-bold tracking-widest hover:bg-emerald-500/10 p-1 cursor-pointer">
                       <Monitor size={10} />
                       {f}
                    </div>
                 ))}
                 <div className="h-[1px] bg-white/5 my-1" />
                 <div className="h-10 w-full flex items-end gap-1 px-1">
                    {[3,6,2,9,4,1,8,2,5].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/20" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
              </div>
           </GlassPanel>
        </Html>

        {/* BLACK MONOLITH (BOTTOM RIGHT) */}
        <group position={[60, -5, 65]} scale={2.5}>
           <Box args={[8, 16, 8]}>
              <meshPhysicalMaterial color="#000" metalness={1} roughness={0} reflectivity={1} />
              <Edges color="#ffffff" opacity={0.1} />
           </Box>
        </group>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
