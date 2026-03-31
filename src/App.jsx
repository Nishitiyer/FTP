import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Scene } from './components/Scene';

const App = () => {
  const [ftpState, setFtpState] = useState(FTP_STATES.DISCONNECTED);
  const [clientFiles, setClientFiles] = useState(INITIAL_FILES);
  const [serverFiles, setServerFiles] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(null);
  
  const server = useRef(new FTPServer());

  const handleCommand = async (cmd, argArr = []) => {
    const arg = argArr.join(' ');
    const result = server.current.processCommand(cmd, arg, ftpState);
    if (result.nextState) setFtpState(result.nextState);
    if (result.code === 150) {
      if (cmd === 'LIST') {
        await new Promise(r => setTimeout(r, 1000));
        setServerFiles(result.data);
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        for (let i = 0; i <= 100; i += 25) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 200));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, 
      width: '100vw', height: '100vh', 
      backgroundColor: '#000', 
      overflow: 'hidden',
      margin: 0, padding: 0
    }}>
      
      {/* 3D ENGINE LAYER (TRUE FULL SCREEN) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
         <Scene 
            ftpState={ftpState} 
            activeTransfer={activeTransfer} 
            clientFiles={clientFiles} 
            serverFiles={serverFiles} 
            onCommand={handleCommand}
            onStart={startSession}
            packets={[]}
         />
      </div>

      {/* OVERLAY TELEMETRY (FIXED CORNER) */}
      <div style={{ 
        position: 'absolute', top: '40px', left: '40px', 
        zIndex: 10, pointerEvents: 'none', 
        color: 'white', fontFamily: 'Outfit, sans-serif'
      }}>
         <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', fontStyle: 'italic' }}>
           NEXUS_FTP_V4_CONTROL
         </h1>
         <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', color: '#0ea5e9', opacity: 0.6, marginTop: '5px' }}>
           ENCRYPTION: SHIELD_ACTIVE_SSL
         </div>
      </div>

      {/* FX OVERLAYS */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        pointerEvents: 'none', 
        boxShadow: 'inset 0 0 300px rgba(0,0,0,0.9)',
        zIndex: 5
      }} />

    </div>
  );
};

export default App;
