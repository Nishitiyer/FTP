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
  Sphere,
  Torus,
  MeshDistortMaterial,
  MeshWobbleMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

const TechTower = ({ position, color, label, active, onAction, actionLabel }) => {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group position={position} scale={2}>
      {/* Structural Core */}
      <Box args={[3, 10, 3]}>
        <meshPhysicalMaterial color="#020a12" roughness={0.1} metalness={1} clearcoat={1} />
        <Edges color={color} opacity={0.6} />
      </Box>

      {/* Floating Energy Rings */}
      <group ref={ringRef} position={[0, 5, 0]}>
         <Torus args={[2.8, 0.05, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
            <meshBasicMaterial color={color} transparent opacity={0.4} />
         </Torus>
         <Torus args={[3.2, 0.03, 16, 100]} rotation={[0, Math.PI/2, 0]}>
            <meshBasicMaterial color={color} transparent opacity={0.2} />
         </Torus>
      </group>

      {/* Internal Glimmer Pulse */}
      <Box args={[2.5, 9, 2.5]} position={[0, 0, 0]}>
         <MeshWobbleMaterial color={color} factor={0.1} speed={2} transparent opacity={0.1} />
      </Box>

      {/* Data Transmission Beam (Active) */}
      {active && (
        <group position={[0, 12, 0]}>
           <Cylinder args={[0.1, 0.1, 15, 8]} position={[0, -7.5, 0]}>
              <meshBasicMaterial color={color} transparent opacity={0.3} />
           </Cylinder>
           <pointLight color={color} intensity={5} distance={20} />
        </group>
      )}

      {/* Main Terminal Overlay */}
      <Html position={[0, 11, 0]} center transform distanceFactor={10}>
         <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-1 bg-black/80 border border-white/10 tech-panel shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               <span className="text-[16px] font-black tracking-[0.6em] text-white/90 uppercase">{label}</span>
            </div>
            
            {onAction && (
              <button 
                onClick={onAction} 
                className="px-6 py-2 bg-white/5 border border-white/20 text-[10px] uppercase font-black tracking-widest text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white transition-all transform hover:scale-110 shadow-lg"
              >
                {actionLabel}
              </button>
            )}
         </div>
      </Html>

      {/* Protocol Explanation Float */}
      <Html position={[4, 2, 0]} transform distanceFactor={12}>
         <div className="p-4 cyber-panel bg-black/90 w-[240px] border-l-4" style={{ borderLeftColor: color }}>
            <span className="text-[11px] font-black uppercase tracking-widest block mb-1" style={{ color }}>Role_Assignment</span>
            <p className="text-[8px] text-white/50 leading-relaxed font-mono italic">
               Executing FTP socket-binding logic. This node manages persistent state and binary stream negotiation on Port 20/21.
            </p>
         </div>
      </Html>
    </group>
  );
};

const DataShard = ({ position, label, color }) => (
  <Float speed={2} rotationIntensity={1} floatIntensity={1} position={position}>
     <Box args={[0.6, 0.6, 0.6]}>
        <MeshDistortMaterial color={color} speed={2} distort={0.3} roughness={0} metalness={1} transmission={0.9} />
        <Edges color={white} opacity={0.5} />
        <Html position={[0, -0.8, 0]} center transform>
           <span className="text-[6px] font-black text-white/40 uppercase whitespace-nowrap">{label}</span>
        </Html>
     </Box>
  </Float>
);

const NetworkTube = ({ p1, p2, color }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(...p1),
    new THREE.Vector3(0, 8, 0),
    new THREE.Vector3(...p2)
  ]), [p1, p2]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.1, 12, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.3, 12, false]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.1} roughness={0} transmission={0.9} />
      </mesh>
    </group>
  );
};

const PacketFlow = ({ p1, p2, packets }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(p1[0], 0.2, p1[2]),
    new THREE.Vector3(0, 8, 0),
    new THREE.Vector3(p2[0], 0.2, p2[2])
  ]), [p1, p2]);

  return (
    <>
      {packets.map(p => (
        <Packet key={p.id} curve={curve} dir={p.dir} label={p.label} color={p.type === 'control' ? "#38bdf8" : "#10b981"} />
      ))}
    </>
  );
};

const Packet = ({ curve, dir, label, color }) => {
  const packetRef = useRef();
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * 0.5) % 1;
    const progress = dir === 'c2s' ? t : 1 - t;
    packetRef.current.position.copy(curve.getPoint(progress));
  });

  return (
    <group ref={packetRef}>
       <Sphere args={[0.3, 16, 16]}>
          <meshBasicMaterial color={color} />
       </Sphere>
       <pointLight color={color} intensity={3} distance={5} />
       <Html center>
          <div className="text-[7px] font-black text-white bg-black/60 px-2 rounded border border-white/10 uppercase">{label}</div>
       </Html>
    </group>
  );
};

export const Scene = ({ ftpState, packets, activeTransfer, clientFiles, serverFiles, onCommand, onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ height: '100vh', width: '100vw' }}>
        <PerspectiveCamera makeDefault position={[15, 30, 45]} fov={40} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 10} makeDefault />
        
        <color attach="background" args={['#000308']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[20, 30, 20]} intensity={3} color="#0ea5e9" />
        
        <Stars radius={100} depth={50} count={10000} factor={6} fade speed={2} />
        
        <gridHelper args={[200, 40, '#0ea5e90a', '#0ea5e905']} position={[0, -0.1, 0]} />

        {/* The "Main" Models */}
        <TechTower 
          position={[-18, 0, 10]} 
          color="#38bdf8" 
          label="CLIENT_GATEWAY_V4" 
          active={ftpState !== FTP_STATES.DISCONNECTED} 
          onAction={ftpState === FTP_STATES.DISCONNECTED ? onStart : null}
          actionLabel="EXE: HANDSHAKE"
        />

        <TechTower 
          position={[18, 0, -10]} 
          color="#10b981" 
          label="REMOTE_MAINFRAME" 
          active={ftpState === FTP_STATES.LOGGED_IN} 
        />

        {/* Data Shards for live files */}
        {clientFiles.slice(0, 10).map((f, i) => (
           <DataShard key={f.name} position={[-25, 2 + i * 1.5, 10]} label={f.name} color="#38bdf8" />
        ))}

        <NetworkTube p1={[-18, 0, 10]} p2={[18, 0, -10]} color="#38bdf8" />
        <PacketFlow p1={[-18, 0, 10]} p2={[18, 0, -10]} packets={packets} />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
