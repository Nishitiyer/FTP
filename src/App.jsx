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
  Float, 
  MeshTransmissionMaterial,
  Text,
  Line,
  Torus,
  Sphere
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- SVGS FOR ICONS (Absolute Reliability) ---
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
  { name: 'image_108.jpg', size: '4.2 MB', color: '#6fd7ff', type: 'IMAGE' },
  { name: 'backup.zip', size: '18.7 MB', color: '#c58cff', type: 'ARCHIVE' },
  { name: 'logs.tar', size: '7.9 MB', color: '#ff9b7a', type: 'LOG' },
  { name: 'report.pdf', size: '2.1 MB', color: '#ffd86c', type: 'DOC' },
];

// --- 3D COMPONENTS ---
const HoloLabel = ({ position, title, subtitle, width = 1.8, rotate = 0, color = "#65e9ff" }) => (
  <group position={position} rotation={[0, rotate, 0]}>
    <mesh><planeGeometry args={[width, subtitle ? 0.52 : 0.32]} /><meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, 0.001]}><planeGeometry args={[width, subtitle ? 0.52 : 0.32]} /><meshBasicMaterial color={color} wireframe transparent opacity={0.35} side={THREE.DoubleSide} /></mesh>
    <Text position={[-width / 2 + 0.08, 0.08, 0.02]} anchorX="left" fontSize={0.1} color="#ddfbff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{title}</Text>
    {subtitle && <Text position={[-width / 2 + 0.08, -0.08, 0.02]} anchorX="left" fontSize={0.07} color={color} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{subtitle}</Text>}
  </group>
);

const HoloPanel3D = ({ position, rotation = [0, 0, 0], width = 2.4, height = 1.1, title, rows, color = "#73f1ff" }) => (
  <group position={position} rotation={rotation}>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>
    <Line points={[[-width/2, height/2, 0], [width/2, height/2, 0], [width/2, -height/2, 0], [-width/2, -height/2, 0], [-width/2, height/2, 0]]} color={color} lineWidth={1} transparent opacity={0.8} />
    <Text position={[-width/2 + 0.12, height/2 - 0.16, 0.02]} anchorX="left" fontSize={0.14} color="#dcfdff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{title}</Text>
    {rows.map((row, i) => (
      <Text key={i} position={[-width/2 + 0.12, height/2 - 0.38 - i * 0.18, 0.02]} anchorX="left" fontSize={0.09} color={i === 0 ? color : "#bff8ff"} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">{row}</Text>
    ))}
  </group>
);

const CurveTube = ({ p1, p2, color, radius, opacity = 0.8, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 15 + offset, 15);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 100, radius, 12, false), [curve, radius]);
  return (
    <group>
      <mesh geometry={geometry}><meshPhysicalMaterial color={color} transmission={1} transparent opacity={0.15} roughness={0} metalness={1} /></mesh>
      <mesh geometry={geometry}><meshBasicMaterial color={color} transparent opacity={opacity} /></mesh>
    </group>
  );
};

const MovingPackets = ({ progress, direction }) => {
  const group = useRef();
  useFrame(() => {
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const t = ((progress / 100) + i * 0.11) % 1;
        const p = direction === "upload" ? t : 1 - t;
        const x = THREE.MathUtils.lerp(-2.8, 3.3, p);
        const y = THREE.MathUtils.lerp(0.5, 0.8, Math.sin(p * Math.PI));
        const z = THREE.MathUtils.lerp(1.0, 0, p);
        child.position.set(x, y, z);
        child.rotation.y += 0.05;
      });
    }
  });
  return (
    <group ref={group}>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial emissive={i % 2 ? "#6cf4ff" : "#ffd577"} emissiveIntensity={5} color={i % 2 ? "#0ea5e9" : "#ffbe5c"} />
          <pointLight color={i % 2 ? "#6cf4ff" : "#ffd577"} intensity={1} distance={2} />
        </mesh>
      ))}
    </group>
  );
};

const FtpClientModel = ({ position, files, selectedFile }) => (
  <group position={position}>
    <RoundedBox args={[2.8, 0.4, 2.2]} radius={0.08}><meshStandardMaterial color="#8cb5ca" metalness={0.9} roughness={0.1} emissive="#0ea5e9" emissiveIntensity={0.1} /><Edges color="#0ea5e9" opacity={0.6} /></RoundedBox>
    <RoundedBox args={[2.4, 0.15, 1.8]} position={[0, 0.25, 0]} radius={0.04}><meshStandardMaterial color="#000" metalness={1} roughness={0} /><Edges color="#0ea5e9" opacity={1} /></RoundedBox>
    <group position={[0, 0.6, 0]}>
      {files.map((file, i) => {
        const x = (i % 2 - 0.5) * 0.8;
        const z = (Math.floor(i/2) - 0.5) * 0.8;
        const isActive = selectedFile?.name === file.name;
        return (
          <Float key={file.name} speed={2} position={[x, 0, z]}>
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <MeshTransmissionMaterial thickness={2} anisotropy={0.5} ior={1.3} transmission={1} color={file.color} emissive={file.color} emissiveIntensity={isActive ? 3 : 0.8} />
              <Edges color="#fff" opacity={0.5} />
            </mesh>
          </Float>
        );
      })}
    </group>
    <Text position={[0, -0.4, 1.3]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.1} color="#0ea5e9">FTP CLIENT</Text>
  </group>
);

const BackupServerModel = ({ position }) => (
  <group position={position}>
    <RoundedBox args={[1.2, 2.0, 1.2]} radius={0.08}><meshStandardMaterial color="#5f6670" metalness={0.9} roughness={0.2} emissive="#ff0000" emissiveIntensity={0.05} /><Edges color="#ff0000" opacity={0.3} /></RoundedBox>
    <mesh position={[0, 0.4, 0.6]}><cylinderGeometry args={[0.2, 0.2, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={5} /><pointLight color="#ff3333" intensity={2} distance={5} /></mesh>
    <Text position={[0, 1.6, 0]} fontSize={0.18} color="#ffd0d8">BACKUP SERVER</Text>
  </group>
);

const RemoteServerModel = ({ position, ip, activeTransfer }) => (
  <group position={position}>
    <RoundedBox args={[2.0, 3.8, 1.8]} radius={0.08}><meshStandardMaterial color="#61717c" metalness={0.9} roughness={0.1}  /><Edges color="#00ffff" opacity={0.3} /></RoundedBox>
    <Torus args={[0.5, 0.1, 16, 100]} position={[0, 0, 0.9]}><meshStandardMaterial color="#ffbf67" emissive="#ffbc5f" emissiveIntensity={3} /><pointLight color="#ffbf67" intensity={4} distance={8} /></Torus>
    <HoloPanel3D position={[-1.2, 0.8, 1.2]} rotation={[0, 0.35, 0]} width={1.6} height={2.2} title="REMOTE FILES" rows={["/", "/root", "images/", "logs/", "bin/"]} color="#0ea5e9" />
    <Text position={[0, 2.2, 0]} fontSize={0.18} color="#e0fcff">REMOTE SERVER</Text>
    <Text position={[0, 2.0, 0]} fontSize={0.07} color="#b8f6ff">{ip}</Text>
  </group>
);

// --- MAIN UI ---
const CyberButton = ({ label, onClick, active, variant = "primary" }) => (
  <button 
    onClick={onClick}
    className={`cyber-button ${variant === 'primary' ? '' : 'cyber-button-disabled'} ${active ? 'active' : ''}`}
    style={{ 
      width: '100%', padding: '8px 12px', background: variant === 'primary' ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? '#10b981' : '#0ea5e9'}`, color: active ? '#10b981' : '#0ea5e9',
      boxShadow: active ? '0 0 15px #10b981' : 'none', cursor: 'pointer', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em'
    }}
  >
    {label}
  </button>
);

function App() {
  const [stage, setStage] = useState(FTP_STAGES.IDLE);
  const [logs, setLogs] = useState([{ type: 'SYS', text: 'NEXUS_FTP_SIM_V4_READY' }]);
  const [ip, setIp] = useState("104.22.7.201");
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[0]);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(25.4);
  const [direction, setDirection] = useState('upload');

  const addLog = useCallback((type, text) => {
    setLogs(prev => [{ type, text }, ...prev].slice(0, 30));
  }, []);

  useEffect(() => {
    if (stage === FTP_STAGES.TRANSFERRING) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage(FTP_STAGES.COMPLETE);
            addLog('RES', `226 Transfer complete: ${selectedFile.name}`);
            return 0;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage, selectedFile, addLog]);

  const onTransfer = (dir) => {
    setDirection(dir);
    setStage(FTP_STAGES.TRANSFERRING);
    addLog('CMD', `${dir === 'upload' ? 'STOR' : 'RETR'} ${selectedFile.name}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', height: '100vh', width: '100vw', background: '#020617', fontFamily: 'monospace', overflow: 'hidden', color: '#fff' }}>
      
      {/* LEFT SIDEBAR */}
      <aside className="sidebar cyber-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, gap: 20, borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, margin: 0, fontWeight: 900, fontStyle: 'italic' }}>NEXUS_FTP_V4</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, opacity: 0.6 }}>
            <IconShield /><span style={{ fontSize: 8, fontWeight: 900 }}>SHIELD_PROTOCOL_ACTIVE</span>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconSettings /><span style={{ fontSize: 9, fontWeight: 900 }}>CONSOLE</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <CyberButton label="CONNECT" onClick={() => setStage(FTP_STAGES.CONNECTED)} active={stage !== FTP_STAGES.IDLE} />
            <CyberButton label="LOGIN" onClick={() => setStage(FTP_STAGES.AUTHENTICATED)} active={stage === FTP_STAGES.AUTHENTICATED} variant="secondary" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <CyberButton label="UPLOAD" onClick={() => onTransfer('upload')} variant="secondary" />
            <CyberButton label="DOWNLOAD" onClick={() => onTransfer('download')} variant="secondary" />
          </div>
        </section>

        <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconDatabase /><span style={{ fontSize: 9, fontWeight: 900 }}>LOCAL_FS</span></div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {INITIAL_FILES.map(file => (
              <div key={file.name} onClick={() => setSelectedFile(file)} style={{ padding: 12, borderRadius: 8, marginBottom: 8, border: `1px solid ${selectedFile.name === file.name ? '#0ea5e9' : 'rgba(255,255,255,0.05)'}`, background: selectedFile.name === file.name ? 'rgba(14,165,233,0.1)' : 'transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}><span>{file.name}</span><span style={{ opacity: 0.5 }}>{file.size}</span></div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* CENTER 3D VIEWPORT */}
      <main style={{ position: 'relative', background: '#000' }}>
        <Canvas shadows gl={{ antialias: true, alpha: false }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5.5, 6.0, 9.5]} fov={38} />
            <OrbitControls enablePan maxPolarAngle={Math.PI / 2.1} />
            <color attach="background" args={['#000306']} />
            <ambientLight intensity={0.4} /><spotLight position={[10, 10, 10]} intensity={6} color="#0ea5e9" /><Stars radius={250} count={10000} />
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.1, 0]}><planeGeometry args={[100, 100]} /><MeshReflectorMaterial mirror={1} roughness={1} color="#05080c" /></mesh>
            <FtpClientModel position={[-2.65, -0.6, 1.05]} files={INITIAL_FILES} selectedFile={selectedFile} />
            <BackupServerModel position={[-3.1, 0.8, 2.45]} />
            <RemoteServerModel position={[3.3, 0.1, -0.05]} ip={ip} />
            <group>
              <CurveTube p1={[-2.8, 0, 1.0]} p2={[3.3, 1.2, -0.05]} color="#0ea5e9" radius={0.06} offset={5} />
              <CurveTube p1={[-2.8, -0.2, 1.05]} p2={[3.3, 0.4, -0.05]} color="#10b981" radius={0.08} offset={2} opacity={stage === 'TRANSFERRING' ? 1 : 0.2} />
              <HoloLabel position={[0.42, 4.4, 6.2]} title="FTP LINK" subtitle="TRANSFER_ACTIVE" color="#0ea5e9" />
              {stage === 'TRANSFERRING' && <MovingPackets progress={progress} direction={direction} />}
            </group>
            <HoloPanel3D position={[0.25, 4.5, 3.4]} rotation={[-0.1, -0.1, 0]} width={4.2} height={2.0} title="NEXUS_LINK_STATUS" color="#10b981" rows={["SSL_ACTIVE", `TX: ${stage === 'TRANSFERRING' ? selectedFile.name : 'IDLE'}`, `RATE: ${speed} MB/S`]} />
            <EffectComposer><Bloom intensity={1.5} /><Noise opacity={0.02} /><ChromaticAberration offset={[0.0005, 0.0005]} /></EffectComposer>
            <Environment preset="night" />
          </Suspense>
        </Canvas>
        <div style={{ position: 'absolute', top: 40, left: 40, opacity: 0.4 }}><span style={{ fontSize: 10, fontWeight: 900 }}>NEXUS_SIM_ENGINE_V4.8</span></div>
        <div style={{ position: 'absolute', bottom: 40, right: 40, padding: '8px 24px', background: '#0ea5e9', color: '#000', fontWeight: 900, fontSize: 12, fontStyle: 'italic', boxShadow: '0 0 30px #0ea5e9' }}>{speed}_MB/S</div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar cyber-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, gap: 20, borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconNavigation /><span style={{ fontSize: 9, fontWeight: 900 }}>STAGES</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
          {["SELECT HOST", "AUTH USER", "OPEN CHANNEL", "NEGOTIATE", "TRANSMIT"].map((step, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: stage === FTP_STAGES.TRANSFERRING ? 1 : 0.3 }}>
                <div style={{ width: 8, height: 8, borderRadius: 100, background: '#0ea5e9' }} />
                <span style={{ fontSize: 9 }}>{i+1}. {step}</span>
             </div>
          ))}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconTerminal /><span style={{ fontSize: 9, fontWeight: 900 }}>TX_LOG</span></div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: 10, paddingBottom: 8, opacity: 0.6 }}><span>[{new Date().toLocaleTimeString()}]</span> <span style={{ color: log.type === 'CMD' ? '#0ea5e9' : '#10b981' }}>{log.text}</span></div>
            ))}
          </div>
        </div>
      </aside>

    </div>
  );
}

export default App;
