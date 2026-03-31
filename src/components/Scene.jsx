import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  MeshTransmissionMaterial,
  MeshDistortMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

// -------------------------------------------------------------
// ONE-TO-ONE Glass HUD Component
// Matches the exact style, color and fonts of the reference
// -------------------------------------------------------------
const GlassPanel = ({ title, subtitle, items = [], color = "#0ea5e9", width = "w-[300px]", header = true, children }) => (
  <div className={`p-4 bg-black/40 backdrop-blur-3xl border-l-[3px] border-t border-white/10 shadow-2xl relative ${width} rounded-tr-3xl overflow-hidden`}
       style={{ borderLeftColor: color }}>
     
     {/* Interior scanner lines fx */}
     <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `linear-gradient(rgba(255,255,255,0.05) 50%, transparent 50%)`, backgroundSize: '100% 4px' }} />
     
     {header && (
        <div className="mb-3 border-b border-white/5 pb-2">
           <div className="flex justify-between items-center">
              <span className="text-[9px] font-black italic text-white/30 tracking-[0.4em] uppercase">{subtitle}</span>
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />)}
              </div>
           </div>
           <h3 className="text-[18px] font-black italic text-white uppercase tracking-tight" style={{ color: color }}>{title}</h3>
        </div>
     )}

     {children ? children : (
       <div className="flex flex-col gap-2">
          {items.map((it, i) => (
             <div key={i} className="flex justify-between items-center border-b border-black/5 pb-1">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                   <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{it.label}</span>
                </div>
                <span className="text-[9px] font-mono text-white/30">{it.val}</span>
             </div>
          ))}
       </div>
     )}

     {/* Holographic detail deco */}
     <div className="absolute -bottom-2 -right-2 opacity-10">
        <div className="w-20 h-20 border border-white rotate-45" />
     </div>
  </div>
);

// -------------------------------------------------------------
// FTP CLIENT PLATFORM (Lower Left - Highly Detailed)
// -------------------------------------------------------------
const ClientPlatform = ({ position, files }) => (
  <group position={position}>
    {/* Monolithic Industrial Base */}
    <Box args={[14, 1.5, 12]} position={[0, 0, 0]}>
       <meshPhysicalMaterial color="#020617" roughness={0.1} metalness={1} reflectivity={1} />
       <Edges color="#0ea5e9" opacity={0.4} />
    </Box>
    <Box args={[12, 0.4, 10]} position={[0, 0.8, 0]}>
       <meshPhysicalMaterial color="#01040a" metalness={1} roughness={0.2} />
       <Edges color="#0ea5e9" opacity={0.6} />
    </Box>

    {/* Internal Core Lights */}
    <Box args={[10, 0.1, 8]} position={[0, 1.1, 0]}>
       <meshBasicMaterial color="#0ea5e9" transparent opacity={0.2} />
    </Box>

    {/* Glowing Data Cubes */}
    {files.slice(0, 4).map((f, i) => (
       <Float key={f.name} speed={2} position={[(i % 2 - 0.5) * 4, 3, (Math.floor(i/2) - 0.5) * 4]}>
          <Box args={[1.6, 1.6, 1.6]}>
             <MeshTransmissionMaterial thickness={1} anisotropy={0.3} ior={1.2} transmission={1} samples={10} color={i % 2 === 0 ? "#0ea5e9" : "#ffbb00"} />
             <Edges color="#ffffff" opacity={0.5} />
          </Box>
       </Float>
    ))}

    {/* FTP CLIENT Label (Floor Projection) */}
    <Html position={[0, -0.6, 12]} transform rotation={[-Math.PI / 2, 0, 0]} center>
       <span className="text-[28px] font-black italic color-white/30 text-white uppercase tracking-[0.4em] whitespace-nowrap opacity-20">FTP CLIENT</span>
    </Html>

    {/* SERVER SELECTION PANEL */}
    <Html position={[-14, 8, 4]} transform rotation={[0, Math.PI / 8, 0]} distanceFactor={8}>
       <GlassPanel title="SERVER SELECTION" subtitle="SOURCE_REMOTE_MAP" color="#0ea5e9">
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center bg-sky-500/10 p-2 border-l border-sky-500 rounded-r">
                <span className="text-[10px] font-black text-sky-400">REMOTE SERVER (Connected)</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <div className="flex justify-between items-center p-2 opacity-40">
                <span className="text-[10px] font-black text-white/50">BACKUP SERVER (Standby)</span>
             </div>
             <div className="flex justify-between items-center p-2 opacity-20">
                <span className="text-[10px] font-black text-white/50">SECURE SERVER (Offline)</span>
             </div>
          </div>
       </GlassPanel>
    </Html>

    {/* Upload Folder Prop */}
    <Html position={[8, 2, 8]} center transform>
       <div className="bg-sky-500/20 border border-sky-400 p-2 text-[8px] font-black text-white uppercase tracking-widest rounded-sm whitespace-nowrap">Uploads</div>
    </Html>
  </group>
);

// -------------------------------------------------------------
// BACKUP SERVER (Upper Left - Bulky Red Core)
// -------------------------------------------------------------
const BackupServer = ({ position }) => (
  <group position={position} scale={0.7}>
     <Box args={[10, 14, 10]}>
        <meshPhysicalMaterial color="#020617" roughness={0.1} metalness={1} />
        <Edges color="#ef4444" opacity={0.3} />
     </Box>
     <Sphere args={[2.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
        <pointLight color="#ef4444" intensity={5} distance={15} />
     </Sphere>
     <Html position={[0, 10, 0]} center transform distanceFactor={10}>
        <div className="flex flex-col items-center">
           <span className="text-[12px] font-black text-red-500 tracking-[0.4em] uppercase whitespace-nowrap mb-1">BACKUP SERVER</span>
           <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.6em]">192.168.1.110</span>
        </div>
     </Html>
  </group>
);

// -------------------------------------------------------------
// REMOTE SERVER MONOLITH (Upper Right - Segmented Architecture)
// -------------------------------------------------------------
const RemoteServer = ({ position, active }) => (
  <group position={position}>
    {/* Giant Multi-Segment Monolith */}
    <Box args={[12, 35, 12]} position={[0, 17, 0]}>
       <meshPhysicalMaterial color="#01040a" roughness={0.05} metalness={1} reflectivity={1} />
       <Edges color="#10b981" opacity={0.3} />
    </Box>

    {/* Horizontal Segments & Thermal Vents */}
    {[8, 16, 24, 32].map(y => (
       <Box key={y} args={[12.5, 0.4, 12.5]} position={[0, y, 0]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
          <Edges color="#10b981" opacity={0.8} />
       </Box>
    ))}

    {/* Integrated Remote Files Panel */}
    <Html position={[-14, 25, 0]} transform rotation={[0, Math.PI / 8, 0]} distanceFactor={8}>
       <GlassPanel title="REMOTE FILES" subtitle="TARGET_STORAGE_UNIT" color="#10b981">
          <div className="flex flex-col gap-2">
             {["main/root", "scripts/", "images/", "logs/"].map((f, i) => (
                <div key={i} className="flex gap-2 items-center text-[10px] items-center text-white/60 font-black tracking-widest hover:text-emerald-400 cursor-pointer">
                   <div className="w-2 h-2 rounded-sm bg-yellow-400/20 border border-yellow-500/40" />
                   {f}
                </div>
             ))}
             <div className="h-[1px] bg-white/5 my-2" />
             <div className="h-12 w-full bg-emerald-500/10 flex items-end gap-1 p-1 overflow-hidden">
                {[1,5,3,8,4,2,9,1,4].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/30" style={{ height: `${h * 10}%` }} />
                ))}
             </div>
          </div>
       </GlassPanel>
    </Html>

    <Html position={[0, -0.6, 12]} transform rotation={[-Math.PI / 2, 0, 0]} center>
       <span className="text-[28px] font-black italic color-white/30 text-white uppercase tracking-[0.4em] whitespace-nowrap opacity-20">REMOTE SERVER</span>
    </Html>
    
    {/* Floating Identifier */}
    <Html position={[0, 40, 0]} center transform distanceFactor={10}>
       <div className="flex flex-col items-center">
          <span className="text-[14px] font-black text-emerald-500 tracking-[0.4em] uppercase">REMOTE SERVER</span>
          <span className="text-[10px] font-black text-white/20 tracking-[0.6em] uppercase">104.22.7.201</span>
       </div>
    </Html>

    {/* Focal Energy Portal on Server Face */}
    <Torus args={[4.5, 0.1, 16, 100]} position={[0, 18, 6.2]} rotation={[0, 0, 0]}>
       <meshBasicMaterial color="#10b981" />
       {active && <pointLight color="#10b981" intensity={5} distance={20} />}
    </Torus>
  </group>
);

// -------------------------------------------------------------
// CENTRAL CABLE BUNDLE (Industrial Arcs)
// -------------------------------------------------------------
const DataLinkTube = ({ p1, p2, color, label, offset = 0, opacity = 0.2 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 20 + offset, 15);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 1.2, 16, false]} />
        <meshPhysicalMaterial color={color} transmission={0.9} transparent opacity={opacity} roughness={0} metalness={1} reflectivity={1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* CHANNEL LABEL OVERLAY */}
      <Html position={[0, 16 + offset, 16]} transform center distanceFactor={12}>
         <div className="bg-black/90 p-2 border border-white/20 rounded shadow-2xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white" style={{ textShadow: `0 0 15px ${color}` }}>{label}</span>
         </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// ONE-TO-ONE SIMULATION SCENE COMPOSITION
// -------------------------------------------------------------
export const Scene = ({ ftpState, clientFiles, serverFiles, activeTransfer, onCommand, onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }} dpr={[1, 2]}>
        {/* RECREATING THE EXACT MEDIUM-WIDE ISOMETRIC CAMERA */}
        <PerspectiveCamera makeDefault position={[50, 60, 90]} fov={35} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 10} />
        
        <color attach="background" args={['#000305']} />
        <Fog attach="fog" args={['#000305', 100, 250]} />
        
        {/* CINEMATIC PRODUCTION LIGHTING */}
        <ambientLight intensity={0.1} />
        <spotLight position={[100, 100, 100]} angle={0.2} penumbra={1} intensity={5} color="#0ea5e9" castShadow />
        <spotLight position={[-100, 100, -100]} angle={0.2} penumbra={1} intensity={3} color="#10b981" />
        <rectAreaLight width={50} height={50} position={[0, 50, 0]} intensity={1.5} color="#ffffff" />

        <Stars radius={200} depth={50} count={16000} factor={4} fade speed={1.5} />
        <gridHelper args={[500, 100, '#ffffff08', '#ffffff05']} position={[0, -0.1, 0]} />

        {/* PRIMARY ACTORS IN POSITION (ONE-TO-ONE RECREATION) */}
        <ClientPlatform position={[-38, 0, 25]} files={clientFiles} />
        <BackupServer position={[-18, 0, -45]} />
        <RemoteServer position={[38, 0, -20]} active={ftpState === FTP_STATES.LOGGED_IN} />

        {/* THE CENTRAL BUNDLE (STRICT RECREATION) */}
        <group position={[0, 0, 0]}>
           <DataLinkTube p1={[-30, 2, 25]} p2={[30, 12, -20]} color="#0ea5e9" label="CONTROL CHANNEL (Port 21)" />
           <DataLinkTube p1={[-30, 1.5, 25]} p2={[30, 1.5, -20]} color="#11c28b" label="DATA CHANNEL (Port 20)" offset={-15} opacity={0.1} />
           <DataLinkTube p1={[-30, 1, 25]} p2={[30, -5, -20]} color="#94a3b8" label="SECURE CHANNEL (Port 2222)" offset={-25} opacity={0.05} />
        </group>

        {/* STATUS PANEL (CENTER TOP - STRICT RECREATION) */}
        <Html position={[0, 45, 0]} transform center distanceFactor={12}>
           <GlassPanel title="STATUS" subtitle="PROTOCOL_MONITOR_X4" color="#0ea5e9" width="w-[450px]">
              <div className="flex justify-between items-start">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Active Connection</span>
                    <span className="text-[14px] font-black italic color-white text-white uppercase tracking-tighter">{ftpState}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black text-white/20 uppercase block">Transfer Rate</span>
                    <span className="text-[16px] font-black italic text-emerald-400">25.4 MB/S</span>
                 </div>
              </div>
              {activeTransfer && (
                 <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-black text-sky-400 uppercase">Transferring: {activeTransfer.name}</span>
                       <span className="text-[9px] font-black text-white">{activeTransfer.progress}%</span>
                    </div>
                    <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 shadow-[0_0_15px_#0ea5e9]" style={{ width: `${activeTransfer.progress}%` }} />
                    </div>
                 </div>
              )}
           </GlassPanel>
        </Html>

        {/* BLACK FACETED CRYSTAL (BOTTOM RIGHT - STRICT RECREATION) */}
        <group position={[50, -5, 60]} scale={2.5}>
           <MeshDistortMaterial color="#01040a" speed={2} distort={0.2} roughness={0.05} metalness={1} reflectivity={1} />
           <Box args={[6, 12, 6]}>
              <meshPhysicalMaterial color="#000" metalness={1} roughness={0} />
              <Edges color="#ffffff" opacity={0.1} />
           </Box>
        </group>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

const Fog = ({ attach, args }) => {
  const { scene } = useThree();
  useMemo(() => {
    scene.fog = new THREE.FogExp2(args[0], 0.002);
  }, [scene, args]);
  return null;
};
