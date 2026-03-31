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
    <div className="flex flex-col h-screen w-full relative overflow-hidden text-sky-100 font-sans">
      {/* 3D Cinematic Layer (The Core) */}
      <Scene ftpState={ftpState} packets={packets} activeTransfer={activeTransfer} />

      {/* Holographic Header UI */}
      <header className="p-8 flex justify-between items-start z-50 pointer-events-none relative">
        <div className="pointer-events-auto">
           <div className="flex items-center gap-4 group">
             <div className="p-3 hologram-panel border-[#0ea5e9]/40 rounded-xl relative overflow-hidden group-hover:scale-110 transition-transform cursor-pointer">
                <Layers className="text-[#0ea5e9]" size={28} />
                <div className="absolute inset-0 bg-[#0ea5e9]/5 animate-pulse" />
             </div>
             <div>
                <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-[#0ea5e9] drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">NexusFTP // V4</h1>
                <div className="flex items-center gap-2 mt-1 text-[8px] font-black tracking-[0.5em] text-[#0ea5e9]/40">
                   <ShieldCheck size={10} /> 
                   <span>Secure Protocol // Alchemist Alpha</span>
                </div>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-10 opacity-60 pointer-events-auto">
           <div className="flex items-center gap-2 px-6 py-3 hologram-panel">
              <Activity size={16} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sync: ON</span>
           </div>
           <button className="hologram-panel p-3 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/80 transition-all group">
              <Settings size={20} className="text-[#0ea5e9] group-rotate-90" />
           </button>
        </div>
      </header>

      {/* Side HUD Panels - Structured Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-[400px] pointer-events-none flex flex-col p-8 pt-32 z-10 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent border-r border-[#0ea5e9]/20 overflow-y-auto">
         
         {/* System Controls */}
         <section className="pointer-events-auto flex flex-col gap-4 mb-6 relative">
            <div className="absolute -inset-1 bg-emerald-500/10 blur-xl rounded-full" />
            <div className="hologram-panel p-4 flex flex-col gap-3 relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/80 border-b border-[#0ea5e9]/20 pb-2">Transmission Link</h3>
               {ftpState === FTP_STATES.DISCONNECTED ? (
                  <button onClick={startSession} className="tech-button">Initialize Connection_</button>
               ) : (
                  <AnimatePresence mode="popLayout">
                    {ftpState === FTP_STATES.CONNECTING ? (
                        <motion.button 
                          key="btn-user" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleCommand('USER', ['admin'])} className="tech-button tech-button-blue"
                        >IDENT_PROTOCOL: USER admin</motion.button>
                    ) : ftpState === FTP_STATES.USER_ACK ? (
                        <motion.button 
                          key="btn-pass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleCommand('PASS', ['password123'])} className="tech-button"
                        >AUTH_ACCESS: PASS *****</motion.button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleCommand('LIST')} className="tech-button tech-button-blue">Query Server</button>
                          <button onClick={() => handleCommand('QUIT')} className="tech-button tech-button-red">Eject</button>
                        </div>
                    )}
                  </AnimatePresence>
               )}
            </div>
         </section>

         {/* File System HUD */}
         <section className="flex-1 flex flex-col gap-4 min-h-[400px] pointer-events-auto mt-4">
            <div className="flex-1 flex flex-col overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
               <FileExplorer files={clientFiles} title="Local Vault" active={true} />
            </div>
            {ftpState === FTP_STATES.LOGGED_IN && (
              <div className="flex-1 flex flex-col overflow-hidden opacity-90 hover:opacity-100 transition-opacity mt-4">
                 <FileExplorer 
                    files={serverFiles} title="Remote Core" active={ftpState === FTP_STATES.LOGGED_IN}
                    onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
                 />
              </div>
            )}
         </section>

         {/* System Console (Mini) */}
         <section className="h-48 mt-8 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity hologram-panel flex flex-col">
            <Terminal logs={logs} />
         </section>
      </div>

      {/* Transfer Progress handled in 3D Scene */}

      {/* Corner Metadata Decorators */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-20 pointer-events-none">
         <div className="flex items-center gap-2 text-[8px] font-black text-sky-400 uppercase tracking-[0.4em]"><Cpu size={12} /> Neural Core I9</div>
         <div className="h-[2px] w-32 bg-sky-500/20" />
      </div>
      
      {/* Decorative Scanlines Mask */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-[1001]" />
    </div>
  );
};

export default App;
