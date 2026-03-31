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
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

const ClientDevice = ({ position, active, files, onCommand, onStart }) => {
  return (
    <group position={position} scale={2}>
      <Box args={[4.5, 0.5, 4.5]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#020a12" roughness={0.1} metalness={0.9} />
        <Edges color="#38bdf8" opacity={0.6} />
      </Box>
      <Box args={[4, 0.4, 4]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#041524" roughness={0.5} metalness={0.8} />
        <Edges color="#0ea5e9" opacity={0.3} />
      </Box>
      <gridHelper args={[4, 10, '#0ea5e9', '#020617']} position={[0, 0.41, 0]} />

      <Html position={[0, 7, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[18px] font-black tracking-[0.5em] text-[#38bdf8] drop-shadow-[0_0_15px_#38bdf8]">CLIENT_ORIGIN</span>
           <span className="text-[8px] text-white/40 uppercase mt-2 font-black">LINK: {active ? "CONNECTED" : "OFFLINE"}</span>
        </div>
      </Html>

      {/* INTERACTIVE ACTION HUD */}
      <Html position={[-6, 4, 0]} transform distanceFactor={9}>
         <div className="cyber-panel p-5 bg-black/90 border-sky-400/50 w-[260px] shadow-[0_0_50px_#0ea5e955] pointer-events-auto">
            <span className="text-[11px] font-black text-sky-400 tracking-[0.2em] block mb-3 border-b border-sky-400/20 pb-2">COMMAND_STATION_A1</span>
            
            <div className="flex flex-col gap-2.5">
               {!active ? (
                  <button 
                    onClick={onStart} 
                    className="cyber-button text-[11px] py-4 bg-sky-500/20 border-2 hover:bg-sky-500 hover:text-white transition-all transform hover:scale-105"
                  >
                    🚀 INIT_PROTO_HANDSHAKE
                  </button>
               ) : (
                  <div className="flex flex-col gap-2">
                     <button onClick={() => onCommand('USER', ['ops'])} className="cyber-button py-2 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white">USER_ESTABLISH</button>
                     <button onClick={() => onCommand('PASS', ['A6_OPS'])} className="cyber-button py-2 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white">PASS_VERIFY</button>
                     <button onClick={() => onCommand('LIST')} className="cyber-button py-2 bg-sky-500/5 hover:bg-sky-500 hover:text-white">SYNC_REMOTE_MAP</button>
                  </div>
               )}
               <div className="mt-2 p-2 bg-white/5 rounded text-[7px] text-white/30 italic leading-tight">
                  Interact with the holographic HUD to manually drive the protocol sequence.
               </div>
            </div>
         </div>
      </Html>
    </group>
  );
};

const ServerDevice = ({ position, active, files }) => {
  return (
    <group position={position} scale={2}>
      <Box args={[4, 10, 4]} position={[0, 5, 0]}>
        <meshPhysicalMaterial color="#020a12" roughness={0.2} metalness={0.9} clearcoat={0.5} />
        <Edges color="#10b981" opacity={0.5} />
      </Box>
      <Html position={[0, 11, 0]} center transform>
        <div className="flex flex-col items-center">
           <span className="text-[18px] font-black tracking-[0.5em] text-[#10b981] drop-shadow-[0_0_15px_#10b981]">REMOTE_HOST_SRV</span>
           <span className="text-[8px] text-white/40 uppercase mt-2 font-black">DATA_PIPES: {active ? "BURST_READY" : "WAIT_ACK"}</span>
        </div>
      </Html>
    </group>
  );
};

const BackupServer = ({ position }) => (
  <group position={position} scale={1.5}>
    <Box args={[3, 5, 3]} position={[0, 2.5, 0]}>
      <meshPhysicalMaterial color="#020a12" roughness={0.1} metalness={1} />
      <Edges color="#f59e0b" opacity={0.4} />
    </Box>
    <Html position={[0, 6, 0]} transform center>
       <div className="text-[8px] font-black text-amber-500 tracking-[0.3em]">SECURE_BACKUP</div>
    </Html>
  </group>
);

const SecureServer = ({ position }) => (
  <group position={position} scale={1.5}>
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
        <tubeGeometry args={[curve, 64, 0.25, 16, false]} />
        <meshPhysicalMaterial color={outerColor} transmission={0.9} transparent opacity={0.2} roughness={0.1} />
      </mesh>
    </group>
  );
};

const DataPacket = ({ pathPoints, dir, label, baseColor }) => {
  const mesh = useRef();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(...p))), [pathPoints]);
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * 0.5) % 1;
    const pos = curve.getPoint(dir === 'c2s' ? t : 1 - t);
    mesh.current.position.copy(pos);
  });
  return (
    <group ref={mesh}>
       <Sphere args={[0.25, 16, 16]}>
          <meshBasicMaterial color={baseColor} />
       </Sphere>
       <pointLight color={baseColor} intensity={3} distance={5} />
       <Html center>
          <div className="text-[7px] font-black text-white whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-white/20 uppercase tracking-tighter">{label}</div>
       </Html>
    </group>
  );
};

const NetworkTopology = ({ p1, p2, pBackup, pSecure, packets }) => {
  const controlPath = [[p1[0], 0.2, p1[2]], [0, 8, 0], [p2[0], 0.2, p2[2]]];
  const backupPath = [p1, [-10, 10, 0], pBackup];
  const securePath = [p2, [10, 10, 0], pSecure];
  return (
    <group>
      <TubeConnection curvePoints={controlPath} innerColor="#0ea5e9" outerColor="#0ea5e9" />
      <TubeConnection curvePoints={backupPath} innerColor="#f59e0b" outerColor="#f59e0b" />
      <TubeConnection curvePoints={securePath} innerColor="#ef4444" outerColor="#ef4444" />
      {packets.map(p => (
        <DataPacket key={p.id} pathPoints={controlPath} dir={p.dir} label={p.label} baseColor={p.type === 'control' ? "#38bdf8" : "#10b981"} />
      ))}
    </group>
  );
};

export const Scene = ({ ftpState, packets, activeTransfer, clientFiles, serverFiles, onCommand, onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ height: '100vh', width: '100vw' }}>
        <PerspectiveCamera makeDefault position={[12, 25, 50]} fov={40} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 8} makeDefault />
        <color attach="background" args={['#000308']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 30, 20]} intensity={3} color="#0ea5e9" />
        <Stars radius={100} depth={50} count={9000} factor={6} fade speed={2} />
        <gridHelper args={[200, 40, '#0ea5e911', '#0ea5e905']} position={[0, -0.1, 0]} />
        <ClientDevice position={[-18, 0, 10]} active={ftpState !== FTP_STATES.DISCONNECTED} files={clientFiles} onCommand={onCommand} onStart={onStart} />
        <ServerDevice position={[18, 0, -10]} active={ftpState === FTP_STATES.LOGGED_IN} files={serverFiles} />
        <BackupServer position={[-15, 0, -20]} />
        <SecureServer position={[22, 0, 18]} />
        <NetworkTopology p1={[-18, 0, 10]} p2={[18, 0, -10]} pBackup={[-15, 0, -20]} pSecure={[22, 0, 18]} packets={packets} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
