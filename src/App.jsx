import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Terminal } from './components/Terminal';
import { FileExplorer } from './components/FileExplorer';
import { Scene } from './components/Scene';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  Layers,
  Cpu,
  Trello
} from 'lucide-react';

const CyberHUDPanel = ({ title, subtitle, children, icon: Icon, color = "#0ea5e9" }) => (
  <div className="cyber-panel p-4 flex flex-col gap-3 group">
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
       <div className="flex items-center gap-2">
          {Icon && <Icon size={12} style={{ color }} className="animate-pulse" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>{title}</span>
       </div>
       {subtitle && <span className="text-[8px] font-mono text-white/30 uppercase">{subtitle}</span>}
    </div>
    <div className="flex-1 min-h-0">
       {children}
    </div>
  </div>
);

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
    addLog('cmd', `${cmd} ${arg}`);
    sendPacket('control', cmd, 'c2s');
    await new Promise(r => setTimeout(r, 1000));
    const result = server.current.processCommand(cmd, arg, ftpState);
    addLog('resp', `${result.code} // ${RESPONSE_CODES[result.code] || result.message}`);
    sendPacket('control', result.code.toString(), 's2c');
    if (result.nextState) setFtpState(result.nextState);
    if (result.code === 150) {
      if (cmd === 'LIST') {
        sendPacket('data', 'LIST_TX', 's2c');
        await new Promise(r => setTimeout(r, 1200));
        setServerFiles(result.data);
        addLog('resp', '226 // DIRECTORY_SYNCED');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `PKT_DL_${file.name}`, 's2c');
        for (let i = 0; i <= 100; i += 20) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 200));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        addLog('resp', '226 // PAYLOAD_DELIVERED');
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    addLog('resp', '220 NEXUS_READY // SSL_ACTIVE');
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div className="flex w-full h-screen bg-[#01040a] text-sky-100 font-mono overflow-hidden">
      
      {/* 1. Left HUD: Controls & Local Core */}
      <aside className="w-[320px] h-full flex flex-col p-4 gap-4 bg-black/40 backdrop-blur-md border-r border-[#0ea5e9]/10 z-20 overflow-hidden shadow-[40px_0_100px_rgba(0,0,0,0.8)]">
         <header className="px-1 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
               <div className="p-2 cyber-panel bg-sky-500/10">
                  <Layers className="text-[#0ea5e9]" size={16} />
               </div>
               <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">NexusFTP_Core</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 px-1 text-[7px] text-[#0ea5e9]/50 font-black tracking-[0.4em]">
               <ShieldCheck size={8} /> <span>ENCRYPTION_ACTIVE</span>
            </div>
         </header>

         {/* Protocol Lifecycle Controls */}
         <div className="h-[200px] shrink-0">
           <CyberHUDPanel title="LIFECYCLE_X" subtitle="COMMAND_CENTER" icon={Cpu}>
              <div className="flex flex-col gap-3">
                 <div className="p-2.5 bg-sky-500/5 rounded border border-sky-500/10 text-[9px] text-[#0ea5e9]/80 leading-relaxed italic">
                   {ftpState === FTP_STATES.DISCONNECTED && "// WAITING_FOR_TCP_HANDSHAKE"}
                   {ftpState === FTP_STATES.CONNECTING && "// SERVER_READY // NEED_USER"}
                   {ftpState === FTP_STATES.USER_ACK && "// USER_OK // NEED_CREDENTIAL"}
                   {ftpState === FTP_STATES.LOGGED_IN && "// AUTH_SUCCESS // SYSTEM_IDLE"}
                 </div>
                 
                 {ftpState === FTP_STATES.DISCONNECTED ? (
                    <button onClick={startSession} className="cyber-button">INIT_CONNECTION</button>
                 ) : (
                    <div className="flex flex-col gap-2">
                      {ftpState === FTP_STATES.CONNECTING ? (
                          <button onClick={() => handleCommand('USER', ['root'])} className="cyber-button cyber-button-emerald">SEND_USER_ROOT</button>
                      ) : ftpState === FTP_STATES.USER_ACK ? (
                          <button onClick={() => handleCommand('PASS', ['nexus'])} className="cyber-button cyber-button-emerald">SEND_PASS_****</button>
                      ) : (
                          <>
                            <button onClick={() => handleCommand('LIST')} className="cyber-button">FETCH_LISTING</button>
                            <button onClick={() => handleCommand('QUIT')} className="cyber-button cyber-button-red">EJECT_CORE</button>
                          </>
                      )}
                    </div>
                 )}
              </div>
           </CyberHUDPanel>
         </div>

         {/* Local Vault Explorer */}
         <div className="flex-1 min-h-0">
            <CyberHUDPanel title="VAULT_LOCAL" subtitle="FILE_STORAGE" icon={Trello}>
               <FileExplorer files={clientFiles} title="" active={true} />
            </CyberHUDPanel>
         </div>
      </aside>

      {/* 2. Main Center: 3D HOLOGRAM DECK */}
      <main className="flex-1 h-full relative bg-[#000] overflow-hidden">
         <Scene 
            ftpState={ftpState} 
            packets={packets} 
            activeTransfer={activeTransfer} 
            clientFiles={clientFiles} 
            serverFiles={serverFiles} 
         />
         
         {/* Top HUD Area overlaying scene */}
         <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 opacity-60">
            <div className="flex flex-col items-center">
               <span className="text-[7px] text-[#0ea5e9] tracking-[0.6em] mb-1">LATENCY</span>
               <span className="text-white text-[10px] font-black">2ms</span>
            </div>
            <div className="w-[1px] h-8 bg-sky-500/20" />
            <div className="flex flex-col items-center">
               <span className="text-[7px] text-emerald-500 tracking-[0.6em] mb-1">BANDWIDTH</span>
               <span className="text-white text-[10px] font-black">2.1 GBPS</span>
            </div>
         </div>

         {/* Global Cinematic FX */}
         <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
         <div className="absolute inset-0 pointer-events-none hologram-glow opacity-30" />
      </main>

      {/* 3. Right HUD: Remote Node & Protocol Logs */}
      <aside className="w-[320px] h-full flex flex-col p-4 gap-4 bg-black/40 backdrop-blur-md border-l border-[#0ea5e9]/10 z-20 overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.8)]">
         
         <div className="flex-1 min-h-0 flex flex-col gap-4">
            <div className="h-[45%] min-h-0">
               <CyberHUDPanel title="CORE_REMOTE" icon={Cpu} color="#10b981">
                  <FileExplorer 
                     files={serverFiles} title="" active={ftpState === FTP_STATES.LOGGED_IN}
                     onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
                  />
               </CyberHUDPanel>
            </div>
            <div className="flex-1 min-h-0">
               <CyberHUDPanel title="DATA_STREAM_X" icon={Zap} color="#0ea5e9">
                  <Terminal logs={logs} />
               </CyberHUDPanel>
            </div>
         </div>

         {/* Global Active Transfer Monitor */}
         <div className="h-[80px] shrink-0">
            <CyberHUDPanel title="REALTIME_BURST" icon={Activity} color={activeTransfer ? "#10b981" : "#475569"}>
               {activeTransfer ? (
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-white/60">
                        <span className="animate-pulse">STREAMING_{activeTransfer.name}</span>
                        <span>{activeTransfer.progress}%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                           initial={{ width: 0 }} 
                           animate={{ width: `${activeTransfer.progress}%` }} 
                        />
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center justify-center h-full text-[8px] text-white/20 uppercase tracking-[0.4em] italic">
                     System_Idle_Listen
                  </div>
               )}
            </CyberHUDPanel>
         </div>
      </aside>

    </div>
  );
};

export default App;
