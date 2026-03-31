import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  MeshTransmissionMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from '../logic/ftpProtocol';
import { 
  ShieldCheck, 
  Activity, 
  Terminal as TerminalIcon, 
  Settings, 
  Database, 
  Navigation,
  Globe,
  Lock,
  Cpu,
  Monitor
} from 'lucide-react';

// -------------------------------------------------------------
// STABILITY: VANILLA CSS COMPONENT
// -------------------------------------------------------------
const CyberPanel = ({ title, icon: Icon, children, style = {} }) => (
  <div style={{ 
    backgroundColor: 'rgba(0,4,8,0.7)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    backdropFilter: 'blur(30px)', 
    borderRadius: '12px', 
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...style 
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={12} color="#0ea5e9" />}
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}>{title}</span>
       </div>
       <div style={{ display: 'flex', gap: '3px' }}>
          {[1,2,3].map(i => <div key={i} style={{ width: '1px', height: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }} />)}
       </div>
    </div>
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }} className="custom-scrollbar">
       {children}
    </div>
  </div>
);

const GlassHUD = ({ title, subtitle, items = [], color = "#0ea5e9", width = "320px", children }) => (
  <div style={{ 
     padding: '24px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(40px)', 
     borderLeft: `3px solid ${color}`, borderTop: '1px solid rgba(255,255,255,0.1)', 
     borderRadius: '0 30px 0 0', boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
     width: width, position: 'relative'
  }}>
     <div style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block' }}>{subtitle}</span>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: color, textTransform: 'uppercase', letterSpacing: '0.05em', fontStyle: 'italic', margin: 0 }}>{title}</h3>
     </div>
     {children ? children : (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((it, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{it.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 900, color: color }}>{it.val}</span>
             </div>
          ))}
       </div>
     )}
  </div>
);

// -------------------------------------------------------------
// 3D ACTORS
// -------------------------------------------------------------
const RoboticDrone = ({ position }) => (
  <group position={position}>
     <Float speed={5} rotationIntensity={2} floatIntensity={1}>
        <Box args={[0.4, 0.4, 0.4]}>
           <meshPhysicalMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
           <Edges color="#ffffff" opacity={0.5} />
        </Box>
        <Torus args={[0.6, 0.05, 8, 32]} rotation={[Math.PI/2, 0, 0]}>
           <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </Torus>
     </Float>
  </group>
);

const MonolithActor = ({ position, label, color, files = [] }) => (
  <group position={position}>
    <Box args={[14, 1.5, 12]}>
       <meshPhysicalMaterial color="#01040a" roughness={0.1} metalness={1} />
       <Edges color={color} opacity={0.3} />
    </Box>
    <Box args={[12, 0.4, 10]} position={[0, 0.8, 0]}>
       <meshPhysicalMaterial color="#000" metalness={1} />
       <Edges color={color} opacity={0.7} />
    </Box>
    {files.slice(0, 4).map((f, i) => (
       <Float key={i} speed={2} position={[(i % 2 - 0.5) * 4, 3, (Math.floor(i/2) - 0.5) * 4]}>
          <Box args={[1.5, 1.5, 1.5]}>
             <MeshTransmissionMaterial thickness={1} anisotropy={0.3} ior={1.2} transmission={1} samples={10} color={color} />
             <Edges color="#fff" />
          </Box>
       </Float>
    ))}
    <Html position={[0, -0.6, 12]} transform rotation={[-Math.PI/2, 0, 0]} center>
       <span style={{ fontSize: '32px', fontWeight: 900, fontStyle: 'italic', color: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4em' }}>{label}</span>
    </Html>
    <RoboticDrone position={[-8, 1, 8]} />
  </group>
);

const TowerActor = ({ position, active }) => (
  <group position={position}>
    <Box args={[12, 40, 12]} position={[0, 20, 0]}>
       <meshPhysicalMaterial color="#01040a" roughness={0.05} metalness={1} />
       <Edges color="#10b981" opacity={0.3} />
    </Box>
    {[10, 20, 30].map(y => (
       <Box key={y} args={[12.5, 0.5, 12.5]} position={[0, y, 0]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
          <Edges color="#10b981" opacity={0.6} />
       </Box>
    ))}
    <Torus args={[4.5, 0.1, 16, 100]} position={[0, 18, 6.2]}>
       <meshBasicMaterial color="#10b981" />
       {active && <pointLight color="#10b981" intensity={15} distance={30} />}
    </Torus>
    <RoboticDrone position={[10, 5, 0]} />
  </group>
);

const BeamLink = ({ p1, p2, color, label, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 25 + offset, 15);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);
  return (
    <group>
      <mesh><tubeGeometry args={[curve, 100, 1.2, 12]} /><meshPhysicalMaterial color={color} transparent opacity={0.1} transmission={1} /></mesh>
      <mesh><tubeGeometry args={[curve, 100, 0.4, 8]} /><meshBasicMaterial color={color} transparent opacity={0.8} /></mesh>
      <Html position={[0, 18 + offset, 16]} transform center distanceFactor={12}>
         <div style={{ background: 'rgba(0,0,0,0.9)', padding: '5px 15px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.4em' }}>{label}</div>
      </Html>
    </group>
  );
};

const Scene = ({ ftpState, clientFiles, activeTransfer }) => (
  <Canvas shadows gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: false }}>
    <PerspectiveCamera makeDefault position={[50, 60, 95]} fov={35} />
    <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 10} />
    <color attach="background" args={['#000306']} />
    <ambientLight intensity={0.2} />
    <spotLight position={[100, 100, 100]} angle={0.2} penumbra={1} intensity={6} color="#0ea5e9" />
    <spotLight position={[-100, 100, -100]} angle={0.2} penumbra={1} intensity={4} color="#10b981" />
    <Stars radius={250} depth={50} count={20000} factor={6} />
    <gridHelper args={[600, 120, '#ffffff08', '#ffffff08']} position={[0, -0.1, 0]} />
    
    <MonolithActor position={[-40, 0, 30]} label="FTP CLIENT" color="#0ea5e9" files={clientFiles} />
    <RemoteServer position={[45, 0, -25]} active={ftpState === FTP_STATES.LOGGED_IN} />
    <BackupServer node position={[-15, 0, -45]} />
    
    <BeamLink p1={[-30, 2, 30]} p2={[35, 12, -25]} color="#0ea5e9" label="CONTROL CHANNEL P21" />
    <BeamLink p1={[-30, 1.5, 30]} p2={[35, 1.5, -25]} color="#10b981" label="DATA CHANNEL P20" offset={-15} />
    
    <Html position={[0, 50, 0]} transform center distanceFactor={12}>
       <GlassHUD title="STATUS" subtitle="NEXUS_LINK_MONITOR" width="500px">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#0ea5e9' }}>SESSION_STATE</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', fontStyle: 'italic' }}>{ftpState}</span>
             </div>
             <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>BANDWIDTH</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>25.4 MB/S</span>
             </div>
          </div>
          {activeTransfer && (
             <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                   <span style={{ fontSize: '9px', fontWeight: 900, color: '#0ea5e9' }}>TX: {activeTransfer.name}</span>
                   <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff' }}>{activeTransfer.progress}%</span>
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                   <div style={{ height: '100%', backgroundColor: '#0ea5e9', width: `${activeTransfer.progress}%` }} />
                </div>
             </div>
          )}
       </GlassHUD>
    </Html>
    <Environment preset="night" />
  </Canvas>
);

const BackupServer = ({ position }) => (
  <group position={position}>
     <Box args={[10, 15, 10]}><meshPhysicalMaterial color="#020617" metalness={1} /><Edges color="#ef4444" opacity={0.4} /></Box>
     <Sphere args={[2.5, 32, 16]}><meshBasicMaterial color="#ef4444" transparent opacity={0.4} /><pointLight color="#ef4444" intensity={8} /></Sphere>
     <Html position={[0, 11, 0]} transform center>
        <span style={{ fontSize: '12px', fontWeight: 900, color: '#ef4444', letterSpacing: '0.4em' }}>BACKUP_STORAGE</span>
     </Html>
  </group>
);

const RemoteServer = ({ position, active }) => (
  <group position={position}>
    <Box args={[12, 40, 12]} position={[0, 20, 0]}><meshPhysicalMaterial color="#01040a" metalness={1} /><Edges color="#10b981" opacity={0.3} /></Box>
    <Torus args={[4.5, 0.1, 16, 100]} position={[0, 18, 6.2]}><meshBasicMaterial color="#10b981" />{active && <pointLight color="#10b981" intensity={10} />}</Torus>
    <Html position={[42, 28, -5]} transform rotation={[0, -Math.PI/8, 0]} distanceFactor={10}>
       <GlassHUD title="REMOTE_STORAGE" subtitle="UNIT_X64" color="#10b981" width="280px">
          {["main_core", "bin/", "lib/", "logs/"].map(f => <div key={f} style={{ fontSize: '11px', color: '#10b981', fontWeight: 900, marginBottom: '5px', letterSpacing: '0.1em' }}>> {f}</div>)}
       </GlassHUD>
    </Html>
  </group>
);

// -------------------------------------------------------------
// APP: ULTIMATE STABILITY
// -------------------------------------------------------------
const App = () => {
  const [ftpState, setFtpState] = useState(FTP_STATES.DISCONNECTED);
  const [logs, setLogs] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(null);
  const [clientFiles, setClientFiles] = useState(INITIAL_FILES);
  const server = useRef(new FTPServer());
  const addLog = (type, text) => setLogs(prev => [{ type, text, ts: Date.now() }, ...prev]);

  const runCmd = async (cmd, argArr = []) => {
    const res = server.current.processCommand(cmd, argArr.join(' '), ftpState);
    if (res.nextState) setFtpState(res.nextState);
    addLog('CMD', `${cmd} ${argArr.join(' ')}`);
    addLog('RES', `${res.code} ${RESPONSE_CODES[res.code] || res.message}`);
    if (res.code === 150 && cmd === 'RETR') {
       setActiveTransfer({ name: res.file.name, progress: 0 });
       for(let i=0; i<=100; i+=10) { 
         setActiveTransfer(p => ({...p, progress: i}));
         await new Promise(r => setTimeout(r, 100));
       }
       setClientFiles(p => [...p, res.file]);
       setActiveTransfer(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000408', color: '#fff', fontFamily: 'Outfit, sans-serif', display: 'flex', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: '380px', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', borderRight: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)', zIndex: 10, display: 'flex', flexDirection: 'column', p: '20px', boxSizing: 'border-box' }}>
         <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', margin: 0, textTransform: 'uppercase' }}>NEXUS_FTP_SIM</h1>
            <span style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 900 }}>ENCRYPTION: SHIELD_ACTIVE_SSL</span>
         </div>
         <CyberPanel title="CONTROLS" icon={Settings} style={{ margin: '0 20px 20px 20px' }}>
            <button onClick={() => setFtpState(FTP_STATES.CONNECTING)} style={{ width: '100%', padding: '15px', backgroundColor: '#0ea5e9', color: '#000', border: 'none', fontWeight: 900, marginBottom: '10px', cursor: 'pointer' }}>CONNECT_HANDSHAKE</button>
            <button onClick={() => runCmd('USER', ['ops'])} style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid #0ea5e9', color: '#0ea5e9', fontWeight: 900, cursor: 'pointer' }}>LOGIN_PROTOCOL</button>
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
               <button onClick={() => runCmd('RETR', ['nexus.sys'])} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#000', border: 'none', fontWeight: 900, cursor: 'pointer' }}>DEMO_RETR_FILE</button>
            </div>
         </CyberPanel>
         <CyberPanel title="LOCAL_FILES" icon={Database} style={{ flex: 1, margin: '0 20px 20px 20px' }}>
            {clientFiles.map(f => <div key={f.name} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{f.name} ({f.size})</div>)}
         </CyberPanel>
      </div>

      {/* CENTER SCENE */}
      <div style={{ flex: 1, position: 'relative' }}>
         <Scene ftpState={ftpState} clientFiles={clientFiles} activeTransfer={activeTransfer} />
         <div style={{ position: 'absolute', bottom: '30px', right: '30px', padding: '15px 30px', backgroundColor: '#0ea5e9', color: '#000', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', fontSize: '14px' }}>TX_ALIVE_25.4_MBPS</div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ width: '420px', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', borderLeft: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)', zIndex: 10, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
         <CyberPanel title="PROTOCOL_TRACE" icon={Navigation} style={{ height: '300px', margin: '20px' }}>
            {["1. SELECT HOST", "2. AUTHENTICATE", "3. OPEN CONTROL", "4. DATA CHANNEL", "5. TRANSMIT", "6. CLOSE"].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', opacity: (i < 3 ? 1 : 0.2) }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (i < 3 ? '#10b981' : '#fff') }} />
                 <span style={{ fontSize: '11px', fontWeight: 900 }}>{t}</span>
              </div>
            ))}
         </CyberPanel>
         <CyberPanel title="SESSION_LOG" icon={TerminalIcon} style={{ flex: 1, margin: '0 20px 20px 20px' }}>
            {logs.slice(0, 15).map((l, i) => <div key={i} style={{ fontSize: '10px', marginBottom: '5px', color: (l.type === 'CMD' ? '#0ea5e9' : '#10b981') }}>[{l.type}] {l.text}</div>)}
         </CyberPanel>
      </div>

    </div>
  );
};

export default App;
