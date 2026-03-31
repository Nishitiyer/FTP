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

const ClientDevice = ({ position, active, files }) => {
  return (
    <group position={position} scale={1.8}>
      <Box args={[4.5, 0.5, 4.5]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#020a12" roughness={0.1} metalness={0.9} />
        <Edges color="#38bdf8" opacity={0.6} />
      </Box>
      <Box args={[4, 0.4, 4]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#041524" roughness={0.5} metalness={0.8} />
        <Edges color="#0ea5e9" opacity={0.3} />
      </Box>
      <gridHelper args={[4, 10, '#0ea5e9', '#020617']} position={[0, 0.41, 0]} />

      <Html position={[0, 6, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[18px] font-black tracking-[0.5em] text-[#38bdf8] drop-shadow-[0_0_15px_#38bdf8]">CLIENT_ORIGIN</span>
           <span className="text-[8px] text-white/40 uppercase mt-2">TCP Control Link: {active ? "CONNECTED" : "OFFLINE"}</span>
        </div>
      </Html>

      <Html position={[-5, 3, 0]} transform distanceFactor={8}>
         <div className="cyber-panel p-4 bg-black/90 border-sky-400/50 w-[240px] shadow-[0_0_30px_#0ea5e933]">
            <span className="text-[10px] font-black text-sky-400 tracking-[0.2em] block mb-2 border-b border-sky-400/20 pb-1">PROTOCOL: CONTROL_SOURCE</span>
            <p className="text-[8px] text-white/70 leading-relaxed font-mono">Initiates TCP/IP handshake on Port 21. Orchestrates the session through Telnet-compliant command strings (LIST, RETR, STOR).</p>
         </div>
      </Html>
    </group>
  );
};

const ServerDevice = ({ position, active, files }) => {
  return (
    <group position={position} scale={1.8}>
      <Box args={[4, 10, 4]} position={[0, 5, 0]}>
        <meshPhysicalMaterial color="#020a12" roughness={0.2} metalness={0.9} clearcoat={0.5} />
        <Edges color="#10b981" opacity={0.5} />
      </Box>
      
      <Html position={[0, 11, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[18px] font-black tracking-[0.5em] text-[#10b981] drop-shadow-[0_0_15px_#10b981]">REMOTE_HOST_SRV</span>
           <span className="text-[8px] text-white/40 uppercase mt-2">Data Pipe Status: {active ? "STREAMING_READY" : "WAIT_ACK"}</span>
        </div>
      </Html>

      <Html position={[5, 5, 0]} transform distanceFactor={8}>
         <div className="cyber-panel p-4 bg-black/90 border-[#10b981]/50 w-[240px] shadow-[0_0_30px_#10b98133]">
            <span className="text-[10px] font-black text-[#10b981] tracking-[0.2em] block mb-2 border-b border-[#10b981]/20 pb-1">PROTOCOL: DATA_STORE</span>
            <p className="text-[8px] text-white/70 leading-relaxed font-mono">Binds dynamic ephemeral ports for binary data transmission. Interprets protocol state machines to satisfy client I/O requests.</p>
         </div>
      </Html>
    </group>
  );
};

const BackupServer = ({ position }) => (
  <group position={position} scale={1.2}>
    <Box args={[3, 5, 3]} position={[0, 2.5, 0]}>
      <meshPhysicalMaterial color="#020a12" roughness={0.1} metalness={1} />
      <Edges color="#f59e0b" opacity={0.4} />
    </Box>
    <Html position={[0, 6, 0]} transform center>
       <div className="text-[8px] font-black text-amber-500 tracking-[0.3em]">SECURE_BACKUP_NODE</div>
    </Html>
  </group>
);

const SecureServer = ({ position }) => (
  <group position={position} scale={1.2}>
    <Box args={[3, 3, 3]} position={[0, 1.5, 0]}>
      <meshPhysicalMaterial color="#020617" transmission={0.5} roughness={0} thickness={2} />
      <Edges color="#ef4444" opacity={0.6} />
    </Box>
    <Html position={[0, 4, 0]} transform center>
       <div className="text-[8px] font-black text-red-500 tracking-[0.3em]">ENCRYPT_VAULT</div>
    </Html>
  </group>
);

const TubeConnection = ({ curvePoints, innerColor, outerColor }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(curvePoints.map(p => new THREE.Vector3(...p))), [curvePoints]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.1, 16, false]} />
        <meshBasicMaterial color={innerColor} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.2, 16, false]} />
        <meshPhysicalMaterial color={outerColor} transmission={0.9} transparent opacity={0.3} roughness={0.1} />
      </mesh>
    </group>
  );
};

const DataPacket = ({ pathPoints, dir, label, baseColor }) => {
  const mesh = useRef();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(...p))), [pathPoints]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const t = (time * 0.5) % 1;
    const pos = curve.getPoint(dir === 'c2s' ? t : 1 - t);
    mesh.current.position.copy(pos);
  });

  return (
    <group ref={mesh}>
       <Sphere args={[0.2, 16, 16]}>
          <meshBasicMaterial color={baseColor} />
       </Sphere>
       <pointLight color={baseColor} intensity={2} distance={3} />
       <Html center>
          <div className="text-[6px] text-white/80 whitespace-nowrap bg-black/40 px-1 rounded border border-white/10">{label}</div>
       </Html>
    </group>
  );
};

const NetworkTopology = ({ p1, p2, pBackup, pSecure, packets }) => {
  const controlPath = [[p1[0], 0.2, p1[2]], [0, 5, 0], [p2[0], 0.2, p2[2]]];
  const backupPath = [p1, [-5, 5, 0], pBackup];
  const securePath = [p2, [5, 5, 0], pSecure];

  return (
    <group>
      <TubeConnection curvePoints={controlPath} innerColor="#0ea5e9" outerColor="#0ea5e9" />
      <TubeConnection curvePoints={backupPath} innerColor="#f59e0b" outerColor="#f59e0b" />
      <TubeConnection curvePoints={securePath} innerColor="#ef4444" outerColor="#ef4444" />

      {packets.map(p => {
        let path = controlPath;
        if (p.type === 'data') path = controlPath; 
        return <DataPacket key={p.id} pathPoints={path} dir={p.dir} label={p.label} baseColor={p.type === 'control' ? "#38bdf8" : "#10b981"} />
      })}
    </group>
  );
};

export const Scene = ({ ftpState, packets, activeTransfer, clientFiles, serverFiles }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ height: '100vh', width: '100vw' }}>
        <PerspectiveCamera makeDefault position={[10, 20, 35]} fov={45} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 6} />
        
        <color attach="background" args={['#010309']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} intensity={2.5} color="#0ea5e9" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
        <gridHelper args={[100, 40, '#0ea5e911', '#0ea5e905']} position={[0, -0.1, 0]} />

        <ClientDevice position={[-12, 0, 5]} active={ftpState !== FTP_STATES.DISCONNECTED} files={clientFiles} />
        <ServerDevice position={[12, 0, -5]} active={ftpState === FTP_STATES.LOGGED_IN} files={serverFiles} />
        <BackupServer position={[-8, 0, -12]} />
        <SecureServer position={[12, 0, 12]} />

        <NetworkTopology p1={[-12, 0, 5]} p2={[12, 0, -5]} pBackup={[-8, 0, -12]} pSecure={[12, 0, 12]} packets={packets} />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
