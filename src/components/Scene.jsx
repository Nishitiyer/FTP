import React, { useRef, useMemo, useEffect } from 'react';
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
  Sphere,
  Torus,
  Cylinder,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  PerspectiveCamera as PCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

// -------------------------------------------------------------
// Cinematic Glass UI Panel (Floating in 3D)
// -------------------------------------------------------------
const FloatingHologram = ({ title, subtitle, items, color = "#0ea5e9", position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <Html transform distanceFactor={5} rotation={[0, 0, 0]}>
       <div className="relative group">
          {/* Main Glass Panel */}
          <div className="w-[320px] p-6 bg-black/40 backdrop-blur-2xl border-l-4 border-t border-white/10 rounded-tr-3xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
               style={{ borderLeftColor: color }}>
             
             {/* Hologram Scanner Line FX */}
             <div className="absolute top-0 left-0 w-full h-[1px] bg-sky-400 opacity-20 animate-scan pointer-events-none" />
             
             <header className="mb-4 border-b border-white/5 pb-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block mb-1">{subtitle}</span>
                <h3 className="text-[22px] font-black italic uppercase tracking-wider m-0" style={{ color }}>{title}</h3>
             </header>

             <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group/row">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[11px] font-bold text-white/80 tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-[10px] font-mono text-white/20">{item.status || "IDLE"}</span>
                  </div>
                ))}
             </div>

             {/* Tech Grid Background Deco */}
             <div className="absolute bottom-[-20px] right-[-20px] opacity-10 pointer-events-none">
                <div className="w-40 h-40 border border-white/20 rotate-45" />
             </div>
          </div>
          
          {/* Floating Corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: color }} />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: color }} />
       </div>
    </Html>
  </group>
);

// -------------------------------------------------------------
// High-Fidelity Client Base
// -------------------------------------------------------------
const ClientBase = ({ position, active, files }) => {
  return (
    <group position={position}>
      {/* Heavy Industrial Base */}
      <Box args={[12, 1, 10]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#020617" roughness={0.1} metalness={1} />
        <Edges color="#0ea5e9" opacity={0.5} />
      </Box>
      <Box args={[11, 0.5, 9]} position={[0, 0.75, 0]}>
        <meshPhysicalMaterial color="#01040a" roughness={0.3} metalness={0.8} />
      </Box>

      {/* Internal Core Lights */}
      <Box args={[8, 0.2, 6]} position={[0, 1.1, 0]}>
         <meshBasicMaterial color="#0ea5e9" transparent opacity={0.1} />
      </Box>

      {/* Floating File Cubes (Crystalline/High Refraction) */}
      {files.map((f, i) => (
        <Float key={f.name} speed={2} position={[(i % 3 - 1) * 2.5, 3 + Math.floor(i/3)*2, (Math.floor(i/3) % 2 === 0 ? 1 : -1)]}>
           <Box args={[1.2, 1.2, 1.2]}>
              <MeshTransmissionMaterial 
                thickness={1} 
                anisotropy={0.3} 
                ior={1.2} 
                transmission={1} 
                samples={10} 
                color="#7dd3fc"
                emissive="#0ea5e9"
                emissiveIntensity={0.2}
              />
              <Edges color="#bae6fd" />
           </Box>
        </Float>
      ))}

      {/* Client HUD Panel */}
      <FloatingHologram 
        title="FTP_CLIENT_A" 
        subtitle="SOURCE_NODE_AUTH_SECURE" 
        position={[-12, 6, 0]} 
        rotation={[0, Math.PI/6, 0]}
        items={[
          { label: "IP: 192.168.1.50", status: "STABLE" },
          { label: "PROTOCOL: FTP/SSL", status: "ACTIVE" },
          { label: `VAULT: ${files.length} ITEMS`, status: "INDEXED" }
        ]}
      />
    </group>
  );
};

// -------------------------------------------------------------
// High-Fidelity Server Monolith
// -------------------------------------------------------------
const ServerMonolith = ({ position, active, files }) => (
  <group position={position}>
    {/* Massive Detailed Tower */}
    <Box args={[10, 25, 10]} position={[0, 12, 0]}>
      <meshPhysicalMaterial color="#01040a" roughness={0.1} metalness={1} />
      <Edges color="#10b981" opacity={0.3} />
    </Box>

    {/* Side Ribs & Tech Detailing */}
    {[5, 10, 15, 20].map(y => (
      <group key={y} position={[0, y, 0]}>
        <Box args={[10.5, 0.5, 10.5]}>
           <meshPhysicalMaterial color="#020617" metalness={1} />
           <Edges color="#10b981" opacity={0.8} />
        </Box>
        {active && <pointLight color="#10b981" intensity={2} distance={15} />}
      </group>
    ))}

    {/* Main Information Panel (Holographic Projection) */}
    <FloatingHologram 
       title="REMOTE_SERVER" 
       subtitle="TARGET_STORAGE_UNIT" 
       color="#10b981"
       position={[12, 15, 0]} 
       rotation={[0, -Math.PI/6, 0]}
       items={[
          { label: "IP: 104.22.7.201", status: active ? "CONNECTED" : "WAITING" },
          { label: "LINK: DATA_SYNC", status: active ? "READY" : "OFFLINE" },
          { label: "CAPACITY: 4.2TB", status: "PROVISIONED" }
       ]}
    />
  </group>
);

// -------------------------------------------------------------
// The "FTP LINK" Pipe System
// -------------------------------------------------------------
const FTPLinkPipe = ({ p1, p2, color, label, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 15 + offset, 0);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);

  return (
    <group>
      {/* Heavy Exterior Tube */}
      <mesh>
        <tubeGeometry args={[curve, 100, 1.2, 16, false]} />
        <meshPhysicalMaterial color={color} transmission={0.9} transparent opacity={0.2} roughness={0.1} />
      </mesh>
      {/* Inner Fiber Core */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Path Label */}
      <Html position={[0, 12 + offset, 0]} center transform>
         <div className="bg-black/80 px-4 py-1 border border-white/20 whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color }}>{label}</span>
         </div>
      </Html>
    </group>
  );
};

export const Scene = ({ ftpState, packets, activeTransfer, clientFiles, serverFiles, onCommand, onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto bg-[#000408]">
      <Canvas shadows gl={{ antialias: true, alpha: false, stencil: false, depth: true }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[40, 50, 80]} fov={35} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 10} />
        
        <color attach="background" args={['#00050a']} />
        
        {/* Dynamic Studio Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[50, 100, 50]} angle={0.3} penumbra={1} intensity={5} color="#0ea5e9" castShadow />
        <spotLight position={[-50, 100, -50]} angle={0.3} penumbra={1} intensity={3} color="#10b981" />
        <rectAreaLight width={50} height={50} position={[0, 50, 0]} intensity={2} color="#ffffff" />

        {/* Space Elements */}
        <Stars radius={200} depth={50} count={10000} factor={4} fade speed={1} />
        <gridHelper args={[300, 50, '#ffffff05', '#ffffff05']} position={[0, -0.1, 0]} />

        {/* Global Blueprint Grid Floor */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
           <planeGeometry args={[500, 500]} />
           <meshPhongMaterial color="#000000" transparent opacity={0.2} />
        </mesh>

        {/* Primary Actors */}
        <ClientBase position={[-35, 0, 15]} files={clientFiles} active={ftpState !== FTP_STATES.DISCONNECTED} />
        <ServerMonolith position={[35, 0, -15]} files={serverFiles} active={ftpState === FTP_STATES.LOGGED_IN} />

        {/* The Connection Channels */}
        <FTPLinkPipe p1={[-30, 1, 15]} p2={[30, 12, -15]} color="#0ea5e9" label="CONTROL CHANNEL (Port 21)" />
        <FTPLinkPipe p1={[-30, 1, 15]} p2={[30, 2, -15]} color="#10b981" label="DATA CHANNEL (Port 20)" offset={-8} />
        
        {/* Interactive Center HUD (Status) */}
        <group position={[0, 25, 0]}>
           <Html center transform distanceFactor={12}>
              <div className="w-[480px] p-8 bg-black/60 border border-white/10 tech-panel backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h2 className="text-[24px] font-black italic uppercase tracking-tighter text-white">SYSTEM_STATE</h2>
                       <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${ftpState === FTP_STATES.LOGGED_IN ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                          <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">{ftpState}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-mono text-white/30 uppercase block">TX_SPEED</span>
                       <span className="text-[18px] font-black italic text-emerald-400">25.4 MB/S</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                    {ftpState === FTP_STATES.DISCONNECTED ? (
                       <button onClick={onStart} className="flex-1 py-4 bg-sky-500 text-black font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:bg-sky-400 transition-all">INITIALIZE_CONNECTION</button>
                    ) : (
                       <button onClick={() => onCommand('LIST')} className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all">SYNC_DIRECTORY_MAP</button>
                    )}
                 </div>
              </div>
           </Html>
        </group>

        {/* Global FX */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
