import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STAGES, INITIAL_FILES, RESPONSE_CODES } from './logic/ftpState';
import { SimulatorScene } from './scene/SimulatorScene';
import { LeftControlPanel } from './ui/LeftControlPanel';
import { RightStatusPanel } from './ui/RightStatusPanel';

function App() {
  const [stage, setStage] = useState(FTP_STAGES.IDLE);
  const [logs, setLogs] = useState([{ type: 'SYS', text: 'NEXUS_FTP_SIM_V4_READY' }]);
  const [ip, setIp] = useState("104.22.7.201");
  const [port, setPort] = useState("21");
  const [user, setUser] = useState("nexus_admin");
  const [pass, setPass] = useState("*********");
  const [mode, setMode] = useState("PASSIVE");
  const [secure, setSecure] = useState(true);
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
        setSpeed(prev => {
          const delta = (Math.random() - 0.5) * 2;
          return parseFloat((prev + delta).toFixed(1));
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [stage, selectedFile, addLog]);

  const handleTransfer = (dir) => {
    setDirection(dir);
    setStage(FTP_STAGES.TRANSFERRING);
    addLog('CMD', `${dir === 'upload' ? 'STOR' : 'RETR'} ${selectedFile.name}`);
    addLog('RES', `150 Opening data connection for ${selectedFile.name}`);
  };

  return (
    <div className="fixed inset-0 bg-[#000408] text-white font-mono select-none overflow-hidden flex h-screen w-screen">
      
      {/* 1. LEFT CONTROLS */}
      <LeftControlPanel 
        stage={stage} setStage={setStage}
        ip={ip} setIp={setIp}
        port={port} setPort={setPort}
        user={user} setUser={setUser}
        pass={pass} setPass={setPass}
        mode={mode} setMode={setMode}
        secure={secure} setSecure={setSecure}
        files={INITIAL_FILES} selectedFile={selectedFile} setSelectedFile={setSelectedFile}
        onTransfer={handleTransfer}
      />

      {/* 2. CENTER 3D SIMULATOR */}
      <main className="flex-1 relative overflow-hidden">
        <SimulatorScene 
          stage={stage}
          files={INITIAL_FILES}
          selectedFile={selectedFile}
          ip={ip}
          progress={progress}
          direction={direction}
          speed={speed}
          activeTransfer={stage === FTP_STAGES.TRANSFERRING ? selectedFile : null}
        />
        
        {/* ABSOLUTE HUD OVERLAYS - Screen filled aesthetics */}
        <div className="absolute top-10 left-10 pointer-events-none z-10 opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] block">NEXUS_SIM_ENGINE_V4.8</span>
           <span className="text-[8px] font-black uppercase tracking-[0.8em] block">SYD_NODE_SECURE</span>
        </div>
        
        <div className="absolute bottom-10 right-10 pointer-events-none z-10">
           <div className="px-6 py-2 bg-sky-500 text-black font-black text-[12px] uppercase italic tracking-tighter shadow-[0_0_30px_#0ea5e9]">
             TX_ALIVE_{speed}_MB/S
           </div>
        </div>
      </main>

      {/* 3. RIGHT TELEMETRY */}
      <RightStatusPanel 
        stage={stage}
        logs={logs}
        progress={progress}
        speed={speed}
        activeTransfer={stage === FTP_STAGES.TRANSFERRING ? selectedFile : null}
      />
    </div>
  );
}

export default App;
