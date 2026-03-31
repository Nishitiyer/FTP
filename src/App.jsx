import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Scene } from './components/Scene';
import { motion, AnimatePresence } from 'framer-motion';

const HUDOverlay = ({ children, style = {} }) => (
  <div style={{ position: 'absolute', zIndex: 10, pointerEvents: 'none', ...style }}>
    {children}
  </div>
);

const App = () => {
  const [ftpState, setFtpState] = useState(FTP_STATES.DISCONNECTED);
  const [logs, setLogs] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(null);
  const [clientFiles, setClientFiles] = useState(INITIAL_FILES);
  const [serverFiles, setServerFiles] = useState([]);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const server = useRef(new FTPServer());

  // SIMULATION SEQUENCER
  const runSimulation = async () => {
    setIsSimRunning(true);
    
    // Step 1: Connect
    setCurrentStep(1);
    await new Promise(r => setTimeout(r, 1500));
    setFtpState(FTP_STATES.CONNECTING);
    
    // Step 2: Auth
    setCurrentStep(2);
    await new Promise(r => setTimeout(r, 1500));
    setFtpState(FTP_STATES.USER_ACK);
    
    // Step 3: Login
    setCurrentStep(3);
    await new Promise(r => setTimeout(r, 1500));
    setFtpState(FTP_STATES.LOGGED_IN);
    
    // Step 4: List
    setCurrentStep(4);
    await handleCommand('LIST');
    
    // Step 5: Transfer (Demo)
    setCurrentStep(5);
    await handleCommand('RETR', ['nexus_core.sys']);
    
    setCurrentStep(6); // Finish
  };

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
        for (let i = 0; i <= 100; i += 10) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 150));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        setActiveTransfer(null);
      }
    }
  };

  const restart = () => {
    setFtpState(FTP_STATES.DISCONNECTED);
    setServerFiles([]);
    setIsSimRunning(false);
    setCurrentStep(0);
    setActiveTransfer(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* 3D SCENE CORE (The strict visual recreation) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
         <Scene 
            ftpState={ftpState} 
            clientFiles={clientFiles} 
            serverFiles={serverFiles} 
            activeTransfer={activeTransfer}
            isSimRunning={isSimRunning}
            onCommand={handleCommand}
            onStart={runSimulation}
         />
      </div>

      {/* TOP LEFT: BRANDING */}
      <HUDOverlay style={{ top: 40, left: 40 }}>
         <h1 style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0 }}>
            NEXUS_FTP_SIMULATOR <span style={{ opacity: 0.3 }}>v4.2</span>
         </h1>
      </HUDOverlay>

      {/* CENTER BOTTOM: INTERACTIVE CONTROLS (Holographic Styled) */}
      <div style={{ 
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
        zIndex: 50, pointerEvents: 'auto', display: 'flex', gap: '15px'
      }}>
         <button 
           onClick={runSimulation} 
           style={{ 
             padding: '15px 30px', 
             background: isSimRunning ? '#10b981' : '#0ea5e9', 
             color: 'black', fontWeight: 900, fontSize: '12px', border: 'none', 
             borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
             boxShadow: `0 0 30px ${isSimRunning ? '#10b98166' : '#0ea5e966'}`,
             transition: 'all 0.3s'
           }}
         >
            {isSimRunning ? 'SIMULATION_ACTIVE' : 'START_SIMULATION'}
         </button>
         
         <button onClick={restart} style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid white', fontSize: '10px', fontWeight: 900, cursor: 'pointer', borderRadius: '4px' }}>RESET</button>
      </div>

      {/* RIGHT SIDE: MODE TOGGLES */}
      <HUDOverlay style={{ top: 120, right: 40, pointerEvents: 'auto' }}>
         <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['ACTIVE_MODE', 'PASSIVE_MODE', 'SECURE_FTP'].map(mode => (
              <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '12px', height: '12px', border: '1px solid #10b981', borderRadius: '2px' }} />
                 <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>{mode}</span>
              </div>
            ))}
         </div>
      </HUDOverlay>

      {/* STEP INDICATOR (Left Edge) */}
      <HUDOverlay style={{ top: '30%', left: 40, pointerEvents: 'none' }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              "1. SELECT REMOTE HOST",
              "2. AUTHENTICATE USER",
              "3. OPEN CONTROL CHANNEL",
              "4. NEGOTIATE DATA PORT",
              "5. FILE TRANSMISSION",
              "6. SESSION TERMINATE"
            ].map((step, i) => (
               <div key={i} style={{ display: 'flex', items: 'center', gap: '15px', opacity: currentStep >= i + 1 ? 1 : 0.2 }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#0ea5e9' }}>{i+1}.</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{step}</span>
               </div>
            ))}
         </div>
      </HUDOverlay>

      {/* SCANLINE / ATMOSPHERE OVERLAYS */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)', zIndex: 5 }} />

    </div>
  );
};

export default App;
