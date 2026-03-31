import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars, 
  Environment, 
  MeshReflectorMaterial, 
  RoundedBox, 
  Edges, 
  Float, 
  Text,
  Line,
  Torus,
  Sphere,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- STABLE SVGS (Production Grade) ---
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconSettings = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconDatabase = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
const IconNavigation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const IconActivity = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconTerminal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;

// --- PROTOCOL ENGINE ---
const FTP_STAGES = {
  IDLE: 'IDLE',
  HOST_SELECTED: 'HOST_SELECTED',
  CONNECTED: 'CONNECTED',
  AUTH_PENDING: 'AUTH_PENDING',
  AUTHENTICATED: 'AUTHENTICATED',
  NEGOTIATING: 'NEGOTIATING',
  TRANSFERRING: 'TRANSFERRING',
  COMPLETE: 'COMPLETE'
};

const INITIAL_FILES = [
  { name: 'matrix_core.sys', size: '4.2 MB', color: '#6fd7ff', type: 'CORE' },
  { name: 'neural_bridge.bin', size: '18.7 MB', color: '#c58cff', type: 'DATA' },
  { name: 'nexus_logs.tar', size: '7.9 MB', color: '#ff9b7a', type: 'LOG' },
  { name: 'protocol.pdf', size: '2.1 MB', color: '#ffd86c', type: 'DOC' },
];

// --- HIGH-FIDELITY 3D COMPONENTS ---
const HoloLabel = ({ position, title, subtitle, width = 1.8, rotate = 0, color = "#65e9ff" }) => (
  <group position={position} rotation={[0, rotate, 0]}>
    <mesh><planeGeometry args={[width, subtitle ? 0.52 : 0.3]} /><meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, 0.001]}><planeGeometry args={[width, subtitle ? 0.52 : 0.3]} /><meshBasicMaterial color={color} wireframe transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
    <Text position={[-width / 2 + 0.1, 0.08, 0.03]} anchorX="left" fontSize={0.12} color="#ffffff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{title}</Text>
    {subtitle && <Text position={[-width / 2 + 0.1, -0.09, 0.03]} anchorX="left" fontSize={0.08} color={color} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{subtitle}</Text>}
  </group>
);

const HoloPanel3D = ({ position, rotation = [0, 0, 0], width = 3.6, height = 1.8, title, rows, color = "#10b981" }) => (
  <group position={position} rotation={rotation}>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} /></mesh>
    <Line points={[[-width/2, height/2, 0], [width/2, height/2, 0], [width/2, -height/2, 0], [-width/2, -height/2, 0], [-width/2, height/2, 0]]} color={color} lineWidth={2} transparent opacity={0.6} />
    <Text position={[-width/2 + 0.15, height/2 - 0.25, 0.05]} anchorX="left" fontSize={0.18} color="#ffffff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{title}</Text>
    {rows.map((row, i) => (
      <Text key={i} position={[-width/2 + 0.15, height/2 - 0.6 - i * 0.22, 0.05]} anchorX="left" fontSize={0.11} color={i === 0 ? color : "#ffffff"} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{row}</Text>
    ))}
  </group>
);

const ArcingPipe = ({ p1, p2, color, radius, offset = 0, opacity = 1 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3((v1.x + v2.x)/2, 8 + offset, (v1.z + v2.z)/2 + 5);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 100, radius, 12, false), [curve, radius]);
  return (
    <group>
       <mesh geometry={geometry}><meshPhysicalMaterial color={color} transmission={1} thickness={0.5} roughness={0} metalness={0.8} transparent opacity={0.1} /></mesh>
       <mesh geometry={geometry}><meshBasicMaterial color={color} transparent opacity={0.25} wireframe={true} /></mesh>
    </group>
  );
};

const MovingBit = ({ progress, direction, color, offset }) => {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      const p = direction === "upload" ? (progress / 100) : 1 - (progress / 100);
      const lerpP = (p + offset) % 1;
      const x = THREE.MathUtils.lerp(-2.8, 3.4, lerpP);
      const y = THREE.MathUtils.lerp(0.8, 1.2, Math.sin(lerpP * Math.PI));
      const z = THREE.MathUtils.lerp(1.2, -0.4, lerpP);
      mesh.current.position.set(x, y, z);
      mesh.current.rotation.x = clock.elapsedTime * 4;
      mesh.current.rotation.y = clock.elapsedTime * 2;
    }
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial emissive={color} emissiveIntensity={10} color={color} />
      <pointLight color={color} intensity={2} distance={3} />
    </mesh>
  );
};

const FtpClientPlatform = ({ position, files, selectedFile }) => (
  <group position={position}>
    {/* Base Chassis */}
    <RoundedBox args={[3.2, 0.5, 2.6]} radius={0.1}><meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} emissive="#0ea5e9" emissiveIntensity={0.05} /><Edges color="#0ea5e9" opacity={0.6} /></RoundedBox>
    <RoundedBox args={[2.8, 0.1, 2.2]} position={[0, 0.28, 0]} radius={0.05}><meshStandardMaterial color="#000" metalness={1} roughness={0} /><Edges color="#0ea5e9" /></RoundedBox>
    
    {/* Data Cubes */}
    <group position={[0, 0.7, 0]}>
      {files.map((file, i) => {
        const x = (i % 2 - 0.5) * 1.0;
        const z = (Math.floor(i/2) - 0.5) * 1.0;
        const active = selectedFile.name === file.name;
        return (
          <Float key={file.name} speed={2.5} rotationIntensity={0.5} floatIntensity={0.5} position={[x, 0, z]}>
             <mesh onClick={() => console.log(file.name)}>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshPhysicalMaterial color={file.color} transmission={1} thickness={2} roughness={0.1} metalness={0.4} emissive={file.color} emissiveIntensity={active ? 3 : 0.2} transparent opacity={0.8} />
                <Edges color="#ffffff" opacity={0.3} />
             </mesh>
          </Float>
        );
      })}
    </group>
    
    <Text position={[0, -0.4, 1.6]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.15} color="#0ea5e9" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">LOCAL_NX_CLIENT</Text>
    <HoloLabel position={[-1.8, 1.2, 0]} rotate={0.3} title="CLIENT_IP" subtitle="192.168.1.104" color="#0ea5e9" />
  </group>
);

const RemoteServerTower = ({ position, ip, stage }) => (
  <group position={position}>
    <RoundedBox args={[2.4, 4.4, 2.0]} radius={0.1}><meshStandardMaterial color="#111827" metalness={1} roughness={0.1} /><Edges color="#00ffff" opacity={0.3} /></RoundedBox>
    
    {/* Glowing Rings */}
    <group position={[0, 0, 1.05]}>
       {[0.4, 0, -0.4].map((y, i) => (
          <Torus key={i} args={[0.6, 0.06, 16, 64]} position={[0, y, 0]} rotation={[0, 0, 0]}>
             <meshStandardMaterial color="#ed8936" emissive="#ed8936" emissiveIntensity={stage === 'TRANSFERRING' ? 8 : 1} />
          </Torus>
       ))}
    </group>

    {/* Remote Info */}
    <HoloPanel3D position={[1.8, 1.2, 0.8]} rotation={[0, -0.3, 0]} width={2.2} height={2.8} title="REMOTE_FS" rows={["/usr/bin", "/root/secrets", "/var/www/matrix", "/home/nexus"]} color="#00ffff" />
    <Text position={[0, 2.5, 0]} fontSize={0.24} color="#ffffff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">CORE_SERVER_9000</Text>
    <Text position={[0, 2.2, 0]} fontSize={0.1} color="#00ffff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{ip}</Text>
  </group>
);

const BackupMonolith = ({ position }) => (
  <group position={position}>
    <RoundedBox args={[1.4, 2.8, 1.4]} radius={0.1}><meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} /><Edges color="#ef4444" opacity={0.4} /></RoundedBox>
    <mesh position={[0, 0.5, 0.75]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial emissive="#ef4444" emissiveIntensity={5} color="#ef4444" />
      <pointLight color="#ef4444" intensity={4} distance={8} />
    </mesh>
    <Text position={[0, 1.8, 0]} fontSize={0.16} color="#ffffff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">BACKUP_STORAGE</Text>
  </group>
);

// --- UI PORTALS ---
const CyberButton = ({ label, onClick, active, variant = "primary" }) => (
  <button 
    onClick={onClick}
    className={`cyber-portal-btn ${active ? 'active' : ''}`}
    style={{ 
      width: '100%', padding: '12px', background: variant === 'primary' ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? '#10b981' : '#0ea5e9'}`, color: active ? '#10b981' : '#0ea5e9',
      cursor: 'pointer', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em',
      transition: 'all 0.3s ease', borderRadius: 4, outline: 'none', position: 'relative', overflow: 'hidden'
    }}
  >
    {label}
    {active && <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: '100%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />}
  </button>
);

function App() {
  const [stage, setStage] = useState(FTP_STAGES.IDLE);
  const [logs, setLogs] = useState([{ type: 'SYS', text: 'NEXUS_OS_LOADED_SYSTEM_STABLE' }]);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[0]);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);

  const addLog = useCallback((type, text) => {
    setLogs(prev => [{ type, text, id: Date.now() }, ...prev].slice(0, 30));
  }, []);

  useEffect(() => {
    if (stage === FTP_STAGES.TRANSFERRING) {
      setSpeed(42.8);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { 
            clearInterval(interval); 
            setStage(FTP_STAGES.COMPLETE); 
            setSpeed(0); 
            addLog('SYS', `FILE_TRANSFER_COMPLETE: ${selectedFile.name}`);
            return 100; 
          }
          return p + 1.5;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [stage, selectedFile, addLog]);

  const handleConnect = () => {
    setStage(FTP_STAGES.HOST_SELECTED);
    addLog('CMD', 'SYST_RESOLVE: 104.22.7.201');
    setTimeout(() => {
       setStage(FTP_STAGES.CONNECTED);
       addLog('RES', '220 NEXUS_CORE_READY');
    }, 800);
  };

  const handleTransfer = () => {
    if (stage !== FTP_STAGES.CONNECTED && stage !== FTP_STAGES.AUTHENTICATED && stage !== FTP_STAGES.COMPLETE) return;
    setStage(FTP_STAGES.TRANSFERRING);
    setProgress(0);
    addLog('CMD', `STOR ${selectedFile.name}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', height: '100vh', width: '100vw', background: '#020617', fontFamily: "'JetBrains Mono', monospace", color: '#fff', overflow: 'hidden' }}>
      
      {/* 1. LEFT CONTROL CONSOLE */}
      <aside style={{ display: 'flex', flexDirection: 'column', padding: 32, gap: 24, background: 'rgba(2, 6, 23, 0.95)', borderRight: '1px solid rgba(14, 165, 233, 0.1)', zIndex: 100 }}>
        <div>
           <h1 style={{ fontSize: 32, fontWeight: 900, fontStyle: 'italic', margin: 0, letterSpacing: '-0.05em' }}>NEXUS<span style={{ color: '#0ea5e9' }}>_FTP</span></h1>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, opacity: 0.5 }}>
              <IconShield /><span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em' }}>ENCRYPTED_V4.92_STABLE</span>
           </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconSettings /><span style={{ fontSize: 10, fontWeight: 900, opacity: 0.4 }}>COMMAND_CHANNEL</span></div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <CyberButton label="SYNC_HOST" onClick={handleConnect} active={stage !== FTP_STAGES.IDLE} />
              <CyberButton label="INIT_TX" onClick={handleTransfer} active={stage === FTP_STAGES.TRANSFERRING} variant="secondary" />
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {["PASV", "ACTV", "TLS"].map(m => <button key={m} style={{ padding: 6, fontSize: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: 900 }}>{m}</button>)}
           </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconDatabase /><span style={{ fontSize: 10, fontWeight: 900, opacity: 0.4 }}>LOCAL_NX_ARCHIVE</span></div>
           <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
              {INITIAL_FILES.map(file => (
                 <div key={file.name} onClick={() => setSelectedFile(file)} style={{ padding: 16, borderRadius: 12, marginBottom: 8, background: selectedFile.name === file.name ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedFile.name === file.name ? 'rgba(14,165,233,0.4)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 900 }}>{file.name}</span><span style={{ fontSize: 10, opacity: 0.4 }}>{file.size}</span></div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}><div style={{ height: '100%', width: '100%', background: file.color, opacity: 0.3 }} /></div>
                 </div>
              ))}
           </div>
        </section>
      </aside>

      {/* 2. CENTER 3D VIEWPORT PORTAL */}
      <main style={{ position: 'relative', background: '#000' }}>
         <Canvas shadows dpr={[1, 2]}>
            <Suspense fallback={null}>
               <PerspectiveCamera makeDefault position={[6, 7, 11]} fov={35} />
               <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={18} />
               <color attach="background" args={['#00050a']} />
               <ambientLight intensity={0.5} />
               <spotLight position={[10, 15, 10]} intensity={1.5} color="#0ea5e9" penumbra={1} castShadow />
               <Stars radius={150} count={8000} depth={50} />
               
               {/* Floor Reflector */}
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.2, 0]}>
                  <planeGeometry args={[100, 100]} />
                  <MeshReflectorMaterial mirror={1} roughness={1} color="#050a14" metalness={0.9} mixBlur={10} mixStrength={2} />
               </mesh>
               <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#000000" />

               {/* Scene Actors */}
               <FtpClientPlatform position={[-3.2, -0.65, 1.2]} files={INITIAL_FILES} selectedFile={selectedFile} />
               <RemoteServerTower position={[3.6, 0.2, -0.4]} ip="104.22.7.201" stage={stage} />
               <BackupMonolith position={[-3.8, 1.1, 2.8]} />

               {/* Networking Tubes */}
               <group>
                  <ArcingPipe p1={[-3.2, 0, 1.2]} p2={[3.6, 1.5, -0.4]} color="#0ea5e9" radius={0.05} offset={4} />
                  <ArcingPipe p1={[-3.2, -0.3, 1.2]} p2={[3.6, 0.5, -0.4]} color="#10b981" radius={0.08} offset={1} />
                  <HoloLabel position={[0.2, 4.8, 6.5]} title="NET_LINK" subtitle={stage === "TRANSFERRING" ? "TRANSCEIVING..." : "STABLE"} color="#10b981" />
                  
                  {stage === "TRANSFERRING" && [0, 0.2, 0.4, 0.6, 0.8].map(o => (
                     <MovingBit key={o} progress={progress} direction="upload" color="#0ea5e9" offset={o} />
                  ))}
               </group>

               {/* Central Status Panel */}
               <HoloPanel3D position={[0.5, 4.6, 3.2]} rotation={[-0.1, -0.1, 0]} title="TX_METRIC_PORTAL" rows={["SSL_ENCRYPTED_SHA256", `TARGET_IP: 104.22.7.201`, `TX_LOAD: ${speed} MB/S`, `REMAIN: ${Math.max(0, 100-progress).toFixed(1)}%`]} color="#0ea5e9" />

               <Environment preset="night" />
            </Suspense>
         </Canvas>

         {/* Screen Overlays */}
         <div style={{ position: 'absolute', top: 32, left: 32, pointerEvents: 'none', opacity: 0.3 }}><span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.4em' }}>NX_SIM_ENGINE_V4.9.4</span></div>
         <div style={{ position: 'absolute', bottom: 32, right: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
             <div style={{ padding: '8px 20px', background: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(14, 165, 233, 0.2)', fontSize: 10, fontWeight: 900 }}>UPLINK_STABLE</div>
             <div style={{ padding: '8px 24px', background: '#0ea5e9', color: '#000', fontWeight: 900, fontSize: 12, boxShadow: '0 0 30px #0ea5e9' }}>{speed.toFixed(1)}_MB/S</div>
         </div>
      </main>

      {/* 3. RIGHT TELEMETRY FEED */}
      <aside style={{ display: 'flex', flexDirection: 'column', padding: 32, gap: 24, background: 'rgba(2, 6, 23, 0.95)', borderLeft: '1px solid rgba(14, 165, 233, 0.1)', zIndex: 100 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IconNavigation /><span style={{ fontSize: 10, fontWeight: 900, opacity: 0.4 }}>PROTOCOL_TRACE</span></div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
            {["INIT_HANDSHAKE", "USER_AUTH", "PORT_NEGOTIATE", "DATA_STREAM", "COMPLETION"].map((step, i) => (
               <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: stage === FTP_STAGES.TRANSFERRING || i < 3 ? 1 : 0.2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 10, background: i < 3 ? '#10b981' : '#0ea5e9', boxShadow: i < 3 ? '0 0 10px #10b981' : 'none' }} />
                  <span style={{ fontSize: 10, fontWeight: 900 }}>{i+1}. {step}</span>
               </div>
            ))}
         </div>

         <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconTerminal /><span style={{ fontSize: 10, fontWeight: 900, opacity: 0.4 }}>LIVE_BIT_LOG</span></div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }} className="custom-scrollbar">
               {logs.map((log) => (
                  <div key={log.id} style={{ fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                     <span style={{ opacity: 0.3, marginRight: 8 }}>[{new Date(log.id).toLocaleTimeString()}]</span>
                     <span style={{ color: log.type === 'CMD' ? '#0ea5e9' : '#10b981' }}>{log.text}</span>
                  </div>
               ))}
            </div>
         </div>
      </aside>

      {/* Global CSS Style for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.4); }
      `}</style>
    </div>
  );
}

export default App;
