import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars, 
  Environment, 
  MeshReflectorMaterial, 
  RoundedBox, 
  Edges, 
  Text,
  Line,
  Torus
} from '@react-three/drei';
import * as THREE from 'three';

// --- STABILIZED SVGS (Zero External Deps) ---
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconSettings = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconDatabase = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
const IconNavigation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const IconActivity = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconTerminal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;

// --- CONSTANTS ---
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
  { name: 'image_108.jpg', size: '4.2 MB', color: '#6fd7ff' },
  { name: 'backup.zip', size: '18.7 MB', color: '#c58cff' },
  { name: 'logs.tar', size: '7.9 MB', color: '#ff9b7a' },
  { name: 'report.pdf', size: '2.1 MB', color: '#ffd86c' },
];

const HoloPanel3D = ({ position, rotation = [0, 0, 0], width = 2.4, height = 1.1, title, rows, color = "#73f1ff" }) => (
  <group position={position} rotation={rotation}>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} /></mesh>
    <Line points={[[-width/2, height/2, 0], [width/2, height/2, 0], [width/2, -height/2, 0], [-width/2, -height/2, 0], [-width/2, height/2, 0]]} color={color} lineWidth={1.5} />
    <Text position={[-width/2 + 0.12, height/2 - 0.16, 0.02]} anchorX="left" fontSize={0.14} color="#ffffff">{title}</Text>
    {rows.map((row, i) => (
      <Text key={i} position={[-width/2 + 0.12, height/2 - 0.4 - i * 0.2, 0.02]} anchorX="left" fontSize={0.1} color={color}>{row}</Text>
    ))}
  </group>
);

const CurveTube = ({ p1, p2, color, radius, opacity = 0.6 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 10, 10);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 64, radius, 8, false), [curve, radius]);
  return (
    <mesh geometry={geometry}><meshBasicMaterial color={color} transparent opacity={opacity} /></mesh>
  );
};

const FtpClientModel = ({ position, files, selectedFile }) => (
  <group position={position}>
    <RoundedBox args={[2.8, 0.4, 2.2]} radius={0.08}><meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} /><Edges color="#0ea5e9" /></RoundedBox>
    <group position={[0, 0.5, 0]}>
      {files.map((file, i) => {
        const x = (i % 2 - 0.5) * 0.8;
        const z = (Math.floor(i/2) - 0.5) * 0.8;
        const isActive = selectedFile?.name === file.name;
        return (
          <mesh key={file.name} position={[x, 0, z]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={file.color} emissive={file.color} emissiveIntensity={isActive ? 2 : 0.5} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
    <Text position={[0, -0.4, 1.2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.15} color="#0ea5e9">CLIENT_NODE</Text>
  </group>
);

const RemoteServerModel = ({ position, ip }) => (
  <group position={position}>
    <RoundedBox args={[2.0, 4.0, 1.8]} radius={0.08}><meshStandardMaterial color="#1a202c" metalness={1} roughness={0} /><Edges color="#00ffff" opacity={0.5} /></RoundedBox>
    <Torus args={[0.5, 0.1, 16, 50]} position={[0, 0, 0.9]}><meshStandardMaterial color="#ed8936" emissive="#ed8936" emissiveIntensity={3} /></Torus>
    <Text position={[0, 2.2, 0]} fontSize={0.2} color="#ffffff">REMOTE_SERVER</Text>
    <Text position={[0, 1.9, 0]} fontSize={0.08} color="#b8f6ff">{ip}</Text>
  </group>
);

const CyberButton = ({ label, onClick, active, variant = "primary" }) => (
  <button 
    onClick={onClick}
    style={{ 
      width: '100%', padding: '10px', background: variant === 'primary' ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${active ? '#10b981' : '#0ea5e9'}`, color: active ? '#10b981' : '#0ea5e9',
      cursor: 'pointer', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em'
    }}
  >
    {label}
  </button>
);

function App() {
  const [stage, setStage] = useState(FTP_STAGES.IDLE);
  const [logs, setLogs] = useState([{ text: 'SYS: BOOT_NEXUS_SIM_V5' }]);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === FTP_STAGES.TRANSFERRING) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(interval); setStage(FTP_STAGES.COMPLETE); return 0; }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const addLog = (text) => setLogs(p => [{ text }, ...p].slice(0, 20));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', height: '100vh', width: '100vw', background: '#020617', fontFamily: 'monospace', overflow: 'hidden', color: '#fff' }}>
      
      {/* UI: LEFT */}
      <aside style={{ padding: 24, gap: 20, display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.8)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: 24, margin: 0, fontWeight: 900, color: '#0ea5e9' }}>NEXUS_FTP_V5</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}><IconShield /><span style={{ fontSize: 9 }}>STABLE_BUILD_4D</span></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
           <CyberButton label="CONNECT" onClick={() => setStage(FTP_STAGES.CONNECTED)} active={stage !== FTP_STAGES.IDLE} />
           <CyberButton label="TRANSFER" onClick={() => { setStage(FTP_STAGES.TRANSFERRING); addLog(`STOR ${selectedFile.name}`); }} variant="secondary" />
        </div>

        <section style={{ flex: 1, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><IconDatabase /><span style={{ fontSize: 10, fontWeight: 900 }}>LOCAL_STORAGE</span></div>
          {INITIAL_FILES.map(f => (
            <div key={f.name} onClick={() => setSelectedFile(f)} style={{ padding: 12, marginBottom: 8, background: selectedFile.name === f.name ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedFile.name === f.name ? '#0ea5e9' : 'transparent'}`, cursor: 'pointer', fontSize: 11 }}>
               {f.name} ({f.size})
            </div>
          ))}
        </section>
      </aside>

      {/* CENTER: SCENE */}
      <main style={{ position: 'relative', background: '#000' }}>
        <Canvas shadows camera={{ position: [6, 6, 10], fov: 40 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <OrbitControls />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={200} color="#0ea5e9" />
            <Stars radius={100} count={5000} />
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]}>
              <planeGeometry args={[100, 100]} />
              <MeshReflectorMaterial mirror={1} color="#1a202c" metalness={0.9} roughness={0.1} />
            </mesh>
            <FtpClientModel position={[-3, -0.5, 1]} files={INITIAL_FILES} selectedFile={selectedFile} />
            <RemoteServerModel position={[3, 0.5, -1]} ip="104.22.7.201" />
            <CurveTube p1={[-3, 0.2, 1]} p2={[3, 1.2, -1]} color="#0ea5e9" radius={0.06} />
            <HoloPanel3D position={[0, 4, 3]} title="NEXUS_LINK" rows={[`STAGE: ${stage}`, `FILE: ${selectedFile.name}`, `PROGRESS: ${progress}%`]} color="#10b981" />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div style={{ position: 'absolute', bottom: 40, right: 40, padding: 16, background: '#0ea5e9', color: '#000', fontWeight: 900 }}>ENGINE_V5_LIVE</div>
      </main>

      {/* UI: RIGHT */}
      <aside style={{ padding: 24, display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.8)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}><IconTerminal /><span style={{ fontSize: 10, fontWeight: 900 }}>TX_LOG_SYNC</span></div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
           {logs.map((l, i) => <div key={i} style={{ fontSize: 10, paddingBottom: 8, opacity: 0.6 }}>[{new Date().toLocaleTimeString()}] {l.text}</div>)}
        </div>
      </aside>

    </div>
  );
}

export default App;
