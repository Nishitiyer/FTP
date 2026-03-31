import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Terminal } from './components/Terminal';
import { FileExplorer } from './components/FileExplorer';
import { Scene } from './components/Scene';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  LogIn, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Layers
} from 'lucide-react';

const App = () => {
  const [ftpState, setFtpState] = useState(FTP_STATES.DISCONNECTED);
  const [logs, setLogs] = useState([]);
  const [packets, setPackets] = useState([]);
  const [clientFiles, setClientFiles] = useState(INITIAL_FILES);
  const [serverFiles, setServerFiles] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(null);
  
  const server = useRef(new FTPServer());
  const packetId = useRef(0);

  const addLog = useCallback((type, text) => {
    setLogs(prev => [...prev, { type, text, timestamp: Date.now() }]);
  }, []);

  const sendPacket = useCallback((type, label, dir) => {
    const id = ++packetId.current;
    const newPacket = { id, type, label, dir };
    setPackets(prev => [...prev, newPacket]);
    setTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== id));
    }, 2000);
  }, []);

  const handleCommand = async (cmd, argArr = []) => {
    const arg = argArr.join(' ');
    addLog('cmd', `EXECUTING_CMD: ${cmd} ${arg}`);
    sendPacket('control', cmd, 'c2s');

    await new Promise(r => setTimeout(r, 1000));

    const result = server.current.processCommand(cmd, arg, ftpState);
    const respText = `${result.code} // STATUS_OK // ${RESPONSE_CODES[result.code] || result.message || ''}`;
    
    addLog('resp', respText);
    sendPacket('control', result.code.toString(), 's2c');

    if (result.nextState) setFtpState(result.nextState);

    // Handle special actions
    if (result.code === 150) {
      if (cmd === 'LIST') {
        sendPacket('data', 'NET_STREAM_LIST', 's2c');
        await new Promise(r => setTimeout(r, 1200));
        setServerFiles(result.data);
        addLog('resp', '226 // TRANSFER_COMPLETE // ALL_FILES_SYNCED');
        sendPacket('control', '226', 's2c');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `RETR_STREAM_${file.name}`, 's2c');
        
        for (let i = 0; i <= 100; i += 10) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 300));
        }

        setClientFiles(prev => [...prev, { ...file, name: `${file.name}` }]);
        addLog('resp', '226 // DATA_TRANSFER_VERIFIED // PAYLOAD_DELIVERED');
        sendPacket('control', '226', 's2c');
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    addLog('resp', '220 NEXUS_GATEWAY_V4 READY // ENCRYPTION_ACTIVE');
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div className="flex w-full h-screen bg-[#020617] text-sky-100 font-sans overflow-hidden">
      
      {/* Left: 2D Dashboard Interface */}
      <div className="w-[45%] h-full flex flex-col p-8 gap-6 overflow-y-auto border-r border-[#0ea5e9]/20 bg-gradient-to-br from-[#020a12] to-[#020617]">
         
         {/* Simple Header */}
         <header className="flex items-center gap-4 mb-2">
            <Layers className="text-[#0ea5e9]" size={36} />
            <div>
               <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-[#0ea5e9] drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">NexusFTP // V4</h1>
               <div className="flex items-center gap-2 mt-1 text-[8px] font-black tracking-[0.5em] text-[#0ea5e9]/60">
                  <ShieldCheck size={10} /> 
                  <span>Secure Protocol // Active</span>
               </div>
            </div>
         </header>

         {/* Transmission Controls */}
         <section className="flex flex-col gap-4 relative">
            <div className="hologram-panel p-6 flex flex-col gap-4">
               <div className="flex justify-between items-center border-b border-[#0ea5e9]/20 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">Connection Link</h3>
                  <Activity size={16} className={ftpState !== FTP_STATES.DISCONNECTED ? "text-emerald-500 animate-pulse" : "text-slate-600"} />
               </div>
               {ftpState === FTP_STATES.DISCONNECTED ? (
                  <button onClick={startSession} className="tech-button py-3">Initialize Connection_</button>
               ) : (
                  <AnimatePresence mode="popLayout">
                    {ftpState === FTP_STATES.CONNECTING ? (
                        <motion.button 
                          key="btn-user" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleCommand('USER', ['admin'])} className="tech-button tech-button-blue py-3"
                        >IDENT_PROTOCOL: USER admin</motion.button>
                    ) : ftpState === FTP_STATES.USER_ACK ? (
                        <motion.button 
                          key="btn-pass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleCommand('PASS', ['password123'])} className="tech-button py-3"
                        >AUTH_ACCESS: PASS *****</motion.button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => handleCommand('LIST')} className="tech-button tech-button-blue py-3">Query Remote Directory</button>
                          <button onClick={() => handleCommand('QUIT')} className="tech-button tech-button-red py-3">Eject Session</button>
                        </div>
                    )}
                  </AnimatePresence>
               )}
            </div>
         </section>

         {/* File Explorers (Side by Side) */}
         <section className="flex gap-6 min-h-[300px]">
            <div className="flex-1 flex flex-col">
               <FileExplorer files={clientFiles} title="Local Vault" active={true} />
            </div>
            <div className="flex-1 flex flex-col">
               <FileExplorer 
                  files={serverFiles} title="Remote Core" active={ftpState === FTP_STATES.LOGGED_IN}
                  onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
               />
            </div>
         </section>

         {/* Terminal Log */}
         <section className="flex-1 min-h-[200px] mt-2">
            <Terminal logs={logs} />
         </section>

      </div>

      {/* Right: 3D Hologram Window */}
      <div className="w-[55%] h-full p-8 flex flex-col relative bg-[#020617]">
         {/* Decorative Border Wrapper */}
         <div className="w-full h-full relative tech-panel p-1 border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.05)] overflow-hidden">
            <Scene ftpState={ftpState} packets={packets} activeTransfer={activeTransfer} />
         </div>

         {/* Decorative Scanlines */}
         <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50" />
      </div>

    </div>
  );
};

export default App;
