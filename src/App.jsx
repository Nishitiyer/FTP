import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, RoundedBox, Text, Stars, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

const FILES = [
  { name: "image_108.jpg", size: "4.2 MB", color: "#6fd7ff" },
  { name: "backup.zip", size: "18.7 MB", color: "#c58cff" },
  { name: "logs.tar", size: "7.9 MB", color: "#ff9b7a" },
  { name: "report.pdf", size: "2.1 MB", color: "#ffd86c" },
];

function Panel({ title, children, className = "" }) {
  return (
    <div className={`hud rounded-2xl p-4 flex flex-col ${className}`} style={{ 
      background: 'linear-gradient(180deg, rgba(8,18,28,.92), rgba(6,14,23,.78))',
      border: '1px solid rgba(112, 243, 255, 0.16)',
      boxShadow: 'inset 0 0 28px rgba(109, 243, 255, 0.05), 0 0 30px rgba(0, 0, 0, .32)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="panel-title mb-3" style={{ fontSize: '11px', color: '#8bedff', letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700 }}>{title}</div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

function HoloLabel({ position, title, subtitle, width = 1.8, rotate = 0 }) {
  return (
    <group position={position} rotation={[0, rotate, 0]}>
      <mesh>
        <planeGeometry args={[width, subtitle ? 0.52 : 0.32]} />
        <meshBasicMaterial color="#65e9ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, subtitle ? 0.52 : 0.32]} />
        <meshBasicMaterial color="#7beeff" wireframe transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[-width / 2 + 0.08, 0.08, 0.02]} anchorX="left" fontSize={0.1} color="#ddfbff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
        {title}
      </Text>
      {subtitle ? (
        <Text position={[-width / 2 + 0.08, -0.08, 0.02]} anchorX="left" fontSize={0.07} color="#85efff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
          {subtitle}
        </Text>
      ) : null}
    </group>
  );
}

function MovingPackets({ progress, active, direction }) {
  const count = 9;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const t = ((progress / 100) + i * 0.11) % 1;
        const p = direction === "upload" ? t : 1 - t;
        const x = THREE.MathUtils.lerp(-2.8, 3.55, p);
        const y = THREE.MathUtils.lerp(0.2, 0.5, Math.sin(p * Math.PI) * 0.2 + 0.5);
        const z = THREE.MathUtils.lerp(1.0, 0.5, p);
        return (
          <mesh key={i} position={[x, y, z]} visible={active}>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshStandardMaterial emissive={i % 2 ? "#6cf4ff" : "#ffd577"} emissiveIntensity={3} color={i % 2 ? "#52c9ff" : "#ffbe5c"} />
          </mesh>
        );
      })}
    </group>
  );
}

function Robot({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]}>
        <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
        <meshStandardMaterial color="#9ec5d6" emissive="#6cefff" emissiveIntensity={0.25} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#b7d9e7" emissive="#8ff3ff" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CableBundle({ color, radius, points }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 80, radius, 16, false), [curve, radius]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.78} metalness={0.15} roughness={0.25} />
    </mesh>
  );
}

function HoloPanel3D({ position, rotation = [0, 0, 0], width = 2.4, height = 1.1, title, rows }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#73f1ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <Line points={[[-width / 2, height / 2, 0.01], [width / 2, height / 2, 0.01], [width / 2, -height / 2, 0.01], [-width / 2, -height / 2, 0.01], [-width / 2, height / 2, 0.01]]} color="#87f6ff" lineWidth={1} transparent opacity={0.9} />
      <Text position={[-width / 2 + 0.12, height / 2 - 0.16, 0.02]} anchorX="left" fontSize={0.14} color="#dcfdff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
        {title}
      </Text>
      {rows.map((row, i) => (
        <Text key={row} position={[-width / 2 + 0.12, height / 2 - 0.34 - i * 0.18, 0.02]} anchorX="left" fontSize={0.09} color={i === 0 ? "#8ef4ff" : "#bff8ff"} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
          {row}
        </Text>
      ))}
    </group>
  );
}

function Scene3D({ progress, stage, direction, selectedFile, speed, serverIP }) {
  const groupRef = useRef();
  const glow = stage === "transferring" || stage === "paused" || stage === "complete";

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, -1.05, 0.25]}>
        <planeGeometry args={[12.5, 8.5, 30, 30]} />
        <meshBasicMaterial color="#94e6ff" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, -1.08, 0.25]}>
        <planeGeometry args={[12.5, 8.5]} />
        <meshStandardMaterial color="#0a1420" metalness={0.1} roughness={0.9} />
      </mesh>

      <RoundedBox args={[2.4, 0.32, 1.7]} radius={0.08} smoothness={4} position={[-2.65, -0.66, 1.05]}>
        <meshStandardMaterial color="#8cb5ca" metalness={0.75} roughness={0.25} emissive="#7ce6ff" emissiveIntensity={0.08} />
      </RoundedBox>
      <Text position={[-2.8, -1.15, 1.8]} fontSize={0.32} color="#e5fdff" anchorX="left" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">FTP CLIENT</Text>

      <group position={[-2.9, -0.34, 1.05]}>
        {FILES.map((file, i) => (
          <mesh key={file.name} position={[i % 2 === 0 ? 0 : 0.46, 0.22 + Math.floor(i / 2) * 0.18, i % 2 === 0 ? -0.18 : 0.18]}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color={file.color} emissive={file.color} emissiveIntensity={selectedFile.name === file.name ? 2.2 : 0.9} transparent opacity={0.92} />
          </mesh>
        ))}
      </group>

      <group position={[-3.1, 0.78, 2.45]}>
        <RoundedBox args={[0.9, 1.6, 0.9]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#5f6670" metalness={0.85} roughness={0.28} emissive="#ff4f74" emissiveIntensity={0.12} />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.48]}>
          <cylinderGeometry args={[0.13, 0.13, 0.12, 24]} />
          <meshStandardMaterial color="#ff6c8d" emissive="#ff426f" emissiveIntensity={2.5} />
        </mesh>
        <Text position={[0, 1.1, 0.1]} fontSize={0.18} color="#ffd0d8" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">BACKUP SERVER</Text>
        <Text position={[0, 0.9, 0.1]} fontSize={0.07} color="#ffb8c5" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">SERVER: 192.168.1.110</Text>
      </group>

      <group position={[3.3, 0.12, -0.05]}>
        <RoundedBox args={[1.65, 2.85, 1.3]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#61717c" metalness={0.86} roughness={0.24} emissive="#72dfff" emissiveIntensity={0.08} />
        </RoundedBox>
        <mesh position={[0.48, -0.18, 0.67]}>
          <torusGeometry args={[0.33, 0.08, 18, 42]} />
          <meshStandardMaterial color="#ffbf67" emissive="#ffbc5f" emissiveIntensity={2.2} />
        </mesh>
        <Text position={[-0.38, 1.72, 0.66]} fontSize={0.16} color="#e0fcff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">REMOTE SERVER</Text>
        <Text position={[-0.32, 1.5, 0.66]} fontSize={0.06} color="#b8f6ff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">FTP SERVER: {serverIP}</Text>
        <Text position={[0.18, -1.74, 0.8]} fontSize={0.18} color="#d7fbff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">REMOTE SERVER</Text>
      </group>

      <CableBundle color="#ffd892" radius={0.09} points={[new THREE.Vector3(-1.6, -0.5, 1.15), new THREE.Vector3(-0.25, -0.1, 0.95), new THREE.Vector3(1.15, 0.05, 0.45), new THREE.Vector3(3.05, 0.02, 0.15)]} />
      <CableBundle color="#7fdfff" radius={0.06} points={[new THREE.Vector3(-1.7, -0.5, 1.05), new THREE.Vector3(-0.1, 0.65, 0.85), new THREE.Vector3(1.4, 0.75, 0.4), new THREE.Vector3(3.05, 0.98, 0.18)]} />
      <CableBundle color="#8dffd0" radius={0.12} points={[new THREE.Vector3(-1.7, -0.53, 1.08), new THREE.Vector3(-0.18, -0.15, 0.78), new THREE.Vector3(1.5, -0.08, 0.32), new THREE.Vector3(3.06, -0.12, 0.05)]} />

      <MovingPackets progress={progress} active={glow} direction={direction} />

      <HoloPanel3D position={[-2.55, 0.18, 2.2]} rotation={[0.03, 0.35, -0.08]} width={2.2} height={1.15} title="SERVER SELECTION" rows={["REMOTE SERVER (Connected)", "BACKUP SERVER (Standby)", "SECURE SERVER (Offline)"]} />
      <HoloPanel3D position={[0.25, 1.5, 1.4]} rotation={[-0.1, -0.1, -0.04]} width={2.8} height={1.25} title="STATUS" rows={["ACTIVE CONNECTION", `TRANSFERRING: ${selectedFile.name} (${selectedFile.size})`, `SPEED: ${speed} MB/s`]} />

      <HoloLabel position={[0.42, 0.16, 0.56]} title="FTP LINK" subtitle="LIVE TRANSFER BUS" width={1.6} rotate={-0.15} />
      <HoloLabel position={[0.65, -0.12, 0.44]} title="CONTROL CHANNEL (Port 21)" width={2.1} rotate={-0.14} />
      <HoloLabel position={[0.85, -0.38, 0.34]} title="BACKUP CHANNEL (Port 2022)" width={2.2} rotate={-0.12} />
      <HoloLabel position={[1.45, -0.7, 0.1]} title="DATA CHANNEL (Port 20)" width={1.9} rotate={-0.12} />

      <Robot position={[-4.15, -0.82, 1.6]} />
      <Robot position={[3.55, -0.78, 0.5]} />

      <mesh position={[5.15, -0.52, 1.25]} rotation={[0.05, 0.35, 0.1]}>
        <octahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial color="#2b272f" emissive="#ffcf75" emissiveIntensity={0.12} metalness={0.5} roughness={0.4} />
      </mesh>
      
      <Stars radius={200} depth={50} count={12000} factor={6} />
      <Environment preset="night" />
    </group>
  );
}

export default function App() {
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState("upload");
  const [secure, setSecure] = useState(true);
  const [mode, setMode] = useState("active");
  const [selectedFile, setSelectedFile] = useState(FILES[0]);
  const [logs, setLogs] = useState(["System ready.", "Awaiting operator input."]);
  const [serverIP, setServerIP] = useState("192.168.1.100");
  const [port, setPort] = useState("21");
  const [username, setUsername] = useState("operator");
  const [password, setPassword] = useState("********");
  const [speed, setSpeed] = useState(25);

  function pushLog(line) {
    setLogs((prev) => [line, ...prev].slice(0, 12));
  }

  useEffect(() => {
    if (stage !== "transferring") return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 1.5);
        if (next >= 100) {
          setStage("complete");
          pushLog(`${direction === "upload" ? "Upload" : "Download"} complete: ${selectedFile.name}`);
        }
        return next;
      });
      setSpeed((s) => {
        const n = s + (Math.random() * 4 - 2);
        return Math.max(15, Math.min(34, +n.toFixed(1)));
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [stage, direction, selectedFile.name]);

  const handleStart = () => { setStage("host_selected"); setProgress(0); pushLog("Remote host selected."); };
  const handleConnect = () => { if (stage === "idle") setStage("host_selected"); setStage("connected"); pushLog(`Control channel opened on port ${port}.`); };
  const handleLogin = () => { setStage("authenticated"); pushLog(`User authenticated as ${username}.`); };

  const handleTransfer = (d) => {
    setDirection(d);
    setProgress(0);
    setStage("transferring");
    pushLog(`${d === "upload" ? "Uploading" : "Downloading"} ${selectedFile.name}...`);
  };

  const handlePause = () => {
    if (stage === "transferring") { setStage("paused"); pushLog("Transfer paused."); }
    else if (stage === "paused") { setStage("transferring"); pushLog("Transfer resumed."); }
  };

  const handleReset = () => { setStage("idle"); setProgress(0); setLogs(["System reset."]); };

  const stageList = [
    ["Select remote host", stage !== "idle"],
    ["Authenticate user", ["authenticated", "transferring", "paused", "complete"].includes(stage)],
    ["Open control channel", ["connected", "authenticated", "transferring", "paused", "complete"].includes(stage)],
    ["Negotiate data port", ["transferring", "paused", "complete"].includes(stage)],
    ["File transmission", ["transferring", "paused", "complete"].includes(stage)],
    ["Session terminate", stage === "complete"],
  ];

  return (
    <div className="app-shell min-h-screen bg-[#06111b] text-white flex flex-col" style={{ overflow: 'hidden' }}>
      <header className="px-6 pt-6 pb-2 flex items-start justify-between gap-4 relative z-10">
        <div>
          <div className="text-[42px] font-black italic tracking-tight text-cyan-50 uppercase">NEXUS_FTP_V4_CONTROL</div>
          <div className="mt-1 text-sky-400 text-sm tracking-[0.35em] font-semibold">ENCRYPTION: SHIELD_ACTIVE_SSL</div>
        </div>
        <Panel title="Status" className="min-w-[280px] max-w-[320px]">
          <div className="space-y-2 text-sm text-cyan-50/90">
            <div className="flex justify-between"><span>CONNECTION</span><span className="text-emerald-400 font-bold">{stage.toUpperCase()}</span></div>
            <div className="text-cyan-300">TX: {selectedFile.name}</div>
            <div>SPEED: {speed} MB/s</div>
          </div>
          <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden border border-cyan-300/10">
            <div className="h-full bg-sky-500 shadow-[0_0_15px_#0ea5e9]" style={{ width: `${progress}%` }} />
          </div>
        </Panel>
      </header>

      <div className="flex-1 grid grid-cols-[320px_1fr_320px] gap-4 px-6 pb-6 overflow-hidden">
        <aside className="flex flex-col gap-4 overflow-auto custom-scrollbar pr-2">
          <Panel title="Handshake Controls">
            <div className="space-y-3">
              <button className="w-full py-3 bg-sky-500 text-black font-black uppercase text-[12px] tracking-widest rounded-xl hover:scale-[1.02] transition-transform" onClick={handleConnect}>CONNECT</button>
              <button className="w-full py-3 border border-sky-400 text-sky-400 font-black uppercase text-[12px] tracking-widest rounded-xl hover:bg-sky-400/10" onClick={handleLogin}>AUTHENTICATE</button>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase" onClick={() => handleTransfer("upload")}>UPLOAD</button>
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase" onClick={() => handleTransfer("download")}>DOWNLOAD</button>
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase" onClick={handlePause}>{stage === "paused" ? "RESUME" : "PAUSE"}</button>
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase" onClick={handleReset}>RESET</button>
              </div>
            </div>
          </Panel>

          <Panel title="Session Input">
            <div className="space-y-3">
              <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sky-400 outline-none text-xs" value={serverIP} onChange={(e) => setServerIP(e.target.value)} placeholder="Server IP" />
              <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sky-400 outline-none text-xs" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sky-400 outline-none text-xs" value={password} type="password" placeholder="Password" />
            </div>
          </Panel>

          <Panel title="Local Files" className="flex-1">
            <div className="space-y-2">
              {FILES.map((file) => (
                <button key={file.name} className={`w-full text-left p-3 rounded-xl border border-white/5 bg-black/20 hover:border-sky-500/50 transition-colors ${selectedFile.name === file.name ? "border-sky-500 bg-sky-500/10" : ""}`} onClick={() => setSelectedFile(file)}>
                  <div className="text-[11px] font-black text-white">{file.name}</div>
                  <div className="text-[9px] text-sky-400/50">{file.size}</div>
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        <main className="hud rounded-[28px] overflow-hidden relative" style={{ background: '#000' }}>
          <Canvas camera={{ position: [5, 5, 10], fov: 35 }}>
            <Suspense fallback={<Html center>LOADING_SECURE_ENGINE...</Html>}>
              <Scene3D progress={progress} stage={stage} direction={direction} selectedFile={selectedFile} speed={speed} serverIP={serverIP} />
            </Suspense>
            <OrbitControls enablePan={true} minDistance={8} maxDistance={15} target={[0, 0, 0]} />
          </Canvas>
          <div className="absolute bottom-6 right-6 px-6 py-2 bg-sky-500 text-black font-black italic text-xs tracking-widest shadow-[0_0_30px_#0ea5e9]">TX_ALIVE_25.4 MBPS</div>
        </main>

        <aside className="flex flex-col gap-4 overflow-auto custom-scrollbar pl-2">
          <Panel title="Protocol Trace">
            <div className="space-y-4">
              {stageList.map(([label, done], i) => (
                <div key={label} className={`flex items-center gap-3 transition-all ${done ? "opacity-100" : "opacity-20"}`}>
                  <div className={`w-2 h-2 rounded-full ${done ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-white/40"}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Session Log" className="flex-1">
            <div className="space-y-2 font-mono text-[9px] text-sky-400/70">
              {logs.map((line, i) => (
                <div key={i} className="border-b border-white/5 pb-1">[{new Date().toLocaleTimeString()}] {line}</div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
