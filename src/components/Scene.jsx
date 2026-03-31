import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  ContactShadows, 
  Html,
  Environment,
  Stars,
  PerspectiveCamera,
  Line,
  BakeShadows,
  OrbitControls,
  Edges,
  Box,
  Cylinder
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

const ClientDevice = ({ position, active }) => {
  return (
    <group position={position}>
      {/* Base Pedestal */}
      <Box args={[4, 1, 4]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#041524" roughness={0.2} metalness={0.8} />
        <Edges color="#0ea5e9" opacity={0.5} transparent />
      </Box>
      <Box args={[3.5, 0.5, 3.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#020a12" roughness={0.4} metalness={0.8} />
        <Edges color="#0ea5e9" opacity={0.8} transparent />
      </Box>
      
      {/* File Cubes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={[-0.5, 1.5, 0]}>
         <Box args={[0.8, 0.8, 0.8]}>
           <meshStandardMaterial color="#0ea5e9" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
           <Edges color="#38bdf8" />
           <Html position={[0, 0.6, 0]} center transform distanceFactor={3}>
             <div className="text-[6px] font-mono font-bold text-cyan-200 uppercase">Documents</div>
           </Html>
         </Box>
      </Float>
      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={0.6} position={[0.8, 2, -0.5]}>
         <Box args={[0.6, 0.6, 0.6]}>
           <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} />
           <Edges color="#7dd3fc" />
         </Box>
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8} position={[-0.8, 2.5, -1]}>
         <Box args={[0.7, 0.7, 0.7]}>
           <meshStandardMaterial color="#0ea5e9" transparent opacity={0.3} />
           <Edges color="#38bdf8" />
         </Box>
      </Float>

      {/* Holographic Client Panel */}
      <Html position={[-3, 3, 0]} transform distanceFactor={7} rotation={[0, Math.PI/6, 0]}>
        <div className="tech-panel tech-panel-blue w-72 p-4 -skew-x-6">
          <div className="border-b border-cyan-500/30 pb-2 mb-2">
            <h3 className="text-2xl font-black uppercase tracking-widest tech-text-cyan m-0">FTP CLIENT</h3>
          </div>
          <div className="text-xs font-mono text-cyan-100/90 mb-2">LOCAL FILES</div>
          <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-widest">
            <div className="flex items-center gap-1"><span className="text-cyan-400">📁</span> Documents</div>
            <div className="flex items-center gap-1"><span className="text-cyan-400">📁</span> Photos</div>
            <div className="flex items-center gap-1"><span className="text-cyan-400">📁</span> Uploads</div>
            <div className="flex items-center gap-1"><span className="text-cyan-400">📁</span> Projects</div>
          </div>
        </div>
      </Html>
    </group>
  );
};

const ServerDevice = ({ position, active }) => {
  return (
    <group position={position}>
      {/* Server Tower Base */}
      <Box args={[3.2, 7, 3.2]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#020a12" roughness={0.3} metalness={0.9} />
        <Edges color="#10b981" opacity={0.4} transparent />
      </Box>
      
      {/* Front Face Panel */}
      <Box args={[2.8, 6.8, 0.2]} position={[0, 3, 1.6]}>
         <meshStandardMaterial color="#041524" />
      </Box>

      {/* Glowing Port */}
      <Cylinder args={[0.8, 0.8, 0.4, 32]} position={[0, 3, 1.7]} rotation={[Math.PI/2, 0, 0]}>
         <meshBasicMaterial color={active ? "#10b981" : "#1e293b"} />
         {active && <pointLight color="#10b981" intensity={3} distance={10} />}
      </Cylinder>

      {/* Decorative Drive Bays / Status Lights */}
      {[1, 1.5, 2, 4.5, 5, 5.5].map((y, i) => (
        <mesh key={i} position={[0.8, y, 1.7]}>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshBasicMaterial color={Math.random() > 0.5 && active ? "#10b981" : "#042f2e"} />
        </mesh>
      ))}

      {/* Holographic Server Panel */}
      <Html position={[3.5, 5, 0]} transform distanceFactor={7} rotation={[0, -Math.PI/6, 0]}>
        <div className="tech-panel w-72 p-4 skew-x-6">
          <div className="border-b border-emerald-500/30 pb-2 mb-2">
            <h3 className="text-2xl font-black uppercase tracking-widest tech-text-green m-0">REMOTE SERVER</h3>
          </div>
          <div className="text-xs font-mono text-emerald-100/60 mb-3 border-b border-emerald-500/20 pb-2">FTP SERVER: 192.168.1.100</div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-2">REMOTE FILES</div>
          <div className="flex flex-col gap-1.5 text-xs font-mono text-emerald-50">
             <div className="flex items-center gap-2"><span className="text-emerald-500">📁</span> wwwroot</div>
             <div className="flex items-center gap-2"><span className="text-emerald-500">📁</span> images</div>
             <div className="flex items-center gap-2"><span className="text-emerald-500">📁</span> logs</div>
          </div>
        </div>
      </Html>
    </group>
  );
};

const BackupServer = ({ position }) => (
  <group position={position}>
    <Box args={[2, 4, 2]} position={[0, 2, 0]}>
      <meshStandardMaterial color="#2a0a10" roughness={0.3} metalness={0.9} />
      <Edges color="#ef4444" opacity={0.6} transparent />
    </Box>
    <Cylinder args={[0.5, 0.5, 0.2, 16]} position={[0, 2.5, 1.1]} rotation={[Math.PI/2, 0, 0]}>
       <meshBasicMaterial color="#ef4444" />
       <pointLight color="#ef4444" intensity={1.5} distance={5} />
    </Cylinder>
    <Html position={[0, 5, 0]} transform distanceFactor={6}>
      <div className="text-[6px] font-black uppercase tracking-[0.2em] text-red-500 text-glow whitespace-nowrap text-center">
        BACKUP SERVER<br/><span className="text-red-300/60 text-[5px]">SERVER: 192.168.1.110</span>
      </div>
    </Html>
  </group>
);

const SecureServer = ({ position }) => (
  <group position={position}>
    {/* Obelisk Shape */}
    <Cylinder args={[0.2, 1.5, 5, 6]} position={[0, 2.5, 0]}>
      <meshPhysicalMaterial color="#0a0a0a" metalness={1} roughness={0.05} clearcoat={1} clearcoatRoughness={0.1} />
      <Edges color="#eab308" opacity={0.5} transparent />
    </Cylinder>
    {/* Glowing Base */}
    <Box args={[2, 0.2, 2]} position={[0, 0, 0]}>
      <meshBasicMaterial color="#06b6d4" />
    </Box>
    <Html position={[0, -0.5, 0]} transform distanceFactor={6} center>
      <div className="text-[6px] font-black uppercase tracking-[0.2em] text-cyan-400 text-glow whitespace-nowrap text-center">
        SECURE SERVER
      </div>
    </Html>
  </group>
);

const BackgroundPacket = ({ pathPoints, baseColor, speedMultiplier = 1 }) => {
  const mesh = useRef();
  const progress = useRef(Math.random());

  useFrame((state, delta) => {
    progress.current = (progress.current + (0.2 * delta * speedMultiplier)) % 1;
    const index = Math.floor(progress.current * (pathPoints.length - 1));
    if (mesh.current && pathPoints[index]) {
      mesh.current.position.copy(pathPoints[index]);
      mesh.current.rotation.x += 0.05;
      mesh.current.rotation.y += 0.05;
    }
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color={baseColor} transparent opacity={0.6} />
      <Edges color={baseColor} />
    </mesh>
  );
};

const NetworkChannels = ({ p1, p2, pBackup, pSecure, packets }) => {
  // 1. Control Channel: Arc to Remote Server (Port 21) - Yellow
  const controlPoints = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...p1).add(new THREE.Vector3(0, 1.5, 0)),
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(...p2).add(new THREE.Vector3(-1, 3, 0))
    );
    return curve.getPoints(50);
  }, [p1, p2]);

  // 2. Data Channel: Direct tube to Remote Server (Port 20) - Green
  const dataPoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1).add(new THREE.Vector3(1.5, 1, 0)),
      new THREE.Vector3(-2, 1.2, 1),
      new THREE.Vector3(2, 2.5, 1),
      new THREE.Vector3(...p2).add(new THREE.Vector3(-1, 3, 1.7))
    ]);
    return curve.getPoints(50);
  }, [p1, p2]);

  // 3. Backup Channel (Port 2022) - Orange/Red
  const backupPoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1).add(new THREE.Vector3(-1.5, 0.5, -1)),
      new THREE.Vector3(-5, 1, -4),
      new THREE.Vector3(...pBackup).add(new THREE.Vector3(0, 2.5, 1.1))
    ]);
    return curve.getPoints(50);
  }, [p1, pBackup]);

  // 4. Secure Channel (Port 2222) - Cyan
  const securePoints = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1).add(new THREE.Vector3(1.5, 0.5, 2)),
      new THREE.Vector3(2, 0.5, 4),
      new THREE.Vector3(...pSecure).add(new THREE.Vector3(-1.5, 0.5, 0))
    ]);
    return curve.getPoints(50);
  }, [p1, pSecure]);

  return (
    <group>
      {/* 1. Control Channel */}
      <Line points={controlPoints} color="#eab308" lineWidth={3} transparent opacity={0.6} />
      <Line points={controlPoints} color="#fef08a" lineWidth={1} transparent opacity={0.9} />
      <Html position={[-1, 4, 0]} transform distanceFactor={5}>
         <div className="text-[7px] font-black uppercase tracking-[0.2em] text-yellow-400 text-glow whitespace-nowrap text-right">
           <span className="text-yellow-200 font-bold">FTP LINK</span><br/>CONTROL CHANNEL (Port 21)
         </div>
      </Html>

      {/* 2. Data Channel */}
      <Line points={dataPoints} color="#10b981" lineWidth={8} transparent opacity={0.2} />
      <Line points={dataPoints} color="#34d399" lineWidth={2} transparent opacity={0.8} />
      <Html position={[1, 1.8, 1]} transform distanceFactor={5}>
         <div className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-400 text-glow whitespace-nowrap">
           DATA CHANNEL (Port 20)
         </div>
      </Html>

      {/* 3. Backup Channel */}
      <Line points={backupPoints} color="#ef4444" lineWidth={4} transparent opacity={0.3} />
      <Line points={backupPoints} color="#fca5a5" lineWidth={1} transparent opacity={0.7} />
      <Html position={[-4, 2, -4]} transform distanceFactor={5} rotation={[0, Math.PI/4, 0]}>
         <div className="text-[6px] font-black uppercase tracking-[0.2em] text-red-400 text-glow whitespace-nowrap text-center">
           BACKUP CHANNEL (Port 2022)
         </div>
      </Html>

      {/* 4. Secure Channel */}
      <Line points={securePoints} color="#06b6d4" lineWidth={5} transparent opacity={0.4} />
      <Line points={securePoints} color="#67e8f9" lineWidth={2} transparent opacity={0.8} />
      <Html position={[2, 0.5, 3]} transform distanceFactor={5} rotation={[0, -Math.PI/4, 0]}>
         <div className="text-[6px] font-black uppercase tracking-[0.2em] text-cyan-400 text-glow whitespace-nowrap text-center">
           SECURE CHANNEL <br/>(Port 2222)
         </div>
      </Html>

      {/* Background Ambient Packets */}
      <BackgroundPacket pathPoints={backupPoints} baseColor="#ef4444" speedMultiplier={0.5} />
      <BackgroundPacket pathPoints={backupPoints} baseColor="#ef4444" speedMultiplier={0.8} />
      <BackgroundPacket pathPoints={securePoints} baseColor="#06b6d4" speedMultiplier={1.5} />

      {/* Foreground Network Packets Traversing Channels Live Based on Input */}
      {packets.map((p) => {
         if (p.type === 'data') {
           return <DataPacket key={p.id} pathPoints={dataPoints} dir={p.dir} label={p.label} baseColor="#10b981" />
         } else if (p.type === 'control') {
           return <DataPacket key={p.id} pathPoints={controlPoints} dir={p.dir} label={p.label} baseColor="#eab308" />
         }
         return null;
      })}
    </group>
  );
};

const DataPacket = ({ pathPoints, dir, label, baseColor }) => {
  const mesh = useRef();
  const progress = useRef(dir === 'c2s' ? 0 : 1);

  useFrame((state, delta) => {
    const speed = 0.5 * delta;
    if (dir === 'c2s') {
      progress.current = Math.min(1, progress.current + speed);
    } else {
      progress.current = Math.max(0, progress.current - speed);
    }

    const index = Math.floor(progress.current * (pathPoints.length - 1));
    if (mesh.current && pathPoints[index]) {
      mesh.current.position.copy(pathPoints[index]);
      mesh.current.rotation.x += 0.05;
      mesh.current.rotation.y += 0.05;
    }
  });

  return (
    <group ref={mesh}>
      <Box args={[0.5, 0.5, 0.5]}>
         <meshBasicMaterial color={baseColor} transparent opacity={0.8} />
         <Edges color={baseColor} />
      </Box>
      <Html className="pointer-events-none" distanceFactor={4}>
         <div className="px-1.5 py-0.5 bg-black/80 backdrop-blur-sm border border-white/20 text-[6px] font-mono text-white rounded whitespace-nowrap" style={{ borderColor: baseColor }}>
            {label}
         </div>
      </Html>
    </group>
  );
}

export const Scene = ({ ftpState, packets, activeTransfer }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 6, 15]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 3} 
          minAzimuthAngle={-Math.PI / 4} 
          maxAzimuthAngle={Math.PI / 4}
        />
        
        <color attach="background" args={['#020617']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#e0f2fe" />
        <pointLight position={[-10, 5, -5]} intensity={1} color="#0ea5e9" />
        <spotLight position={[0, 10, 0]} intensity={1.5} penumbra={1} castShadow />

        {/* Backdrop Visuals */}
        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
        <gridHelper args={[60, 40, '#0f172a', '#020617']} position={[0, -0.6, 0]} />

        {/* Topology Core Nodes */}
        <ClientDevice 
          position={[-6, 0, 2]} 
          active={ftpState !== FTP_STATES.DISCONNECTED} 
        />
        
        <ServerDevice 
          position={[5, 0, -2]} 
          active={ftpState === FTP_STATES.LOGGED_IN || ftpState === FTP_STATES.TRANSFERRING} 
        />

        <BackupServer position={[-4, 0, -8]} />
        <SecureServer position={[6, 0, 6]} />

        {/* Central Complex Matrix Flow Paths */}
        <NetworkChannels 
          p1={[-6, 0, 2]} 
          p2={[5, 0, -2]} 
          pBackup={[-4, 0, -8]}
          pSecure={[6, 0, 6]}
          packets={packets} 
        />

        {/* Central Status Hologram Repositioned High and Center */}
        <Html position={[0, 9, -5]} center transform distanceFactor={8}>
           <div className="tech-panel w-72 p-4 text-center border-emerald-500/50">
             <div className="text-xl font-black uppercase tracking-[0.2em] tech-text-cyan border-b border-cyan-500/30 pb-2 mb-2">
                STATUS
             </div>
             <div className="text-[10px] font-mono text-emerald-400 mb-2">
                {ftpState !== FTP_STATES.DISCONNECTED ? "ACTIVE CONNECTION" : "DISCONNECTED"}
             </div>
             <div className="text-[10px] font-mono text-slate-300">
                {activeTransfer ? `TRANSFERRING: ${activeTransfer.name}` : (packets.some(p => p.type === 'data') ? "TRANSMITTING DATA..." : "IDLE")}
             </div>
             {activeTransfer && (
               <div className="mt-3">
                 <div className="flex justify-between text-[8px] text-cyan-200 mb-1">
                   <span>SPEED: 25 MB/s</span>
                   <span>{activeTransfer.progress}%</span>
                 </div>
                 <div className="h-1 bg-cyan-900/50 w-full rounded overflow-hidden">
                   <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${activeTransfer.progress}%` }} />
                 </div>
               </div>
             )}
           </div>
        </Html>

        {/* Reflection Environment */}
        <Environment preset="city" />
        <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={25} blur={2.5} far={4} color="#0ea5e9" />
        <BakeShadows />
      </Canvas>
    </div>
  );
};

