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
    <div className="app-container">
      
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
      <div className="main-view">
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
        <div style={{ position: 'absolute', top: 40, left: 40, pointerEvents: 'none', zIndex: 10, opacity: 0.4 }}>
           <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', display: 'block' }}>NEXUS_SIM_ENGINE_V4.8</span>
           <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8em', display: 'block' }}>SYD_NODE_SECURE</span>
        </div>
        
        <div style={{ position: 'absolute', bottom: 40, right: 40, pointerEvents: 'none', zIndex: 10 }}>
           <div style={{ padding: '8px 24px', backgroundColor: '#0ea5e9', color: '#000', fontWeight: 900, fontSize: 12, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', boxShadow: '0 0 30px #0ea5e9' }}>
             TX_ALIVE_{speed}_MB/S
           </div>
        </div>
      </div>

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
