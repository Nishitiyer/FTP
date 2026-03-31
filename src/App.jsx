import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Scene } from './components/Scene';
import { motion, AnimatePresence } from 'framer-motion';
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

const CyberPanel = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`cyber-panel flex flex-col h-full bg-black/60 border border-white/5 backdrop-blur-xl rounded-lg overflow-hidden ${className}`}>
    <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-b border-white/5">
       <div className="flex items-center gap-2">
          {Icon && <Icon size={12} className="text-sky-400" />}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{title}</span>
       </div>
       <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-white/10" />)}
       </div>
    </div>
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
       {children}
    </div>
  </div>
);

const App = () => {
  const [ftpState, setFtpState] = useState(FTP_STATES.DISCONNECTED);
  const [logs, setLogs] = useState([]);
  const [activeTransfer, setActiveTransfer] = useState(null);
  const [clientFiles, setClientFiles] = useState(INITIAL_FILES);
  const [serverFiles, setServerFiles] = useState([]);
  
  const [ip, setIp] = useState("104.22.7.201");
  const [port, setPort] = useState("21");
  const [user, setUser] = useState("nexus_admin");
  const [pass, setPass] = useState("*********");
  const [mode, setMode] = useState("PASSIVE");
  const [secure, setSecure] = useState(true);

  const server = useRef(new FTPServer());

  const addLog = useCallback((type, text) => {
    setLogs(prev => [{ type, text, ts: Date.now() }, ...prev]);
  }, []);

  const handleCommand = async (cmd, argArr = []) => {
    const arg = argArr.join(' ');
    addLog('CMD', `${cmd} ${arg}`);
    
    const result = server.current.processCommand(cmd, arg, ftpState);
    if (result.nextState) setFtpState(result.nextState);
    
    addLog('RES', `${result.code} ${RESPONSE_CODES[result.code] || result.message}`);

    if (result.code === 150) {
      if (cmd === 'LIST') {
        await new Promise(r => setTimeout(r, 1000));
        setServerFiles(result.data);
        addLog('RES', '226 Transfer complete');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        for (let i = 0; i <= 100; i += 20) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 200));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        setActiveTransfer(null);
        addLog('RES', `226 Finished downloading ${file.name}`);
      }
    }
  };

  const connect = async () => {
    addLog('SYS', 'Establishing TCP handshake...');
    setFtpState(FTP_STATES.CONNECTING);
    await new Promise(r => setTimeout(r, 1000));
    addLog('RES', '220 Connection established.');
  };

  const login = async () => {
    if (ftpState === FTP_STATES.CONNECTING) {
      await handleCommand('USER', [user]);
    } else if (ftpState === FTP_STATES.USER_ACK) {
      await handleCommand('PASS', [pass]);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000408] text-white font-mono select-none overflow-hidden flex">
      
      {/* 1. LEFT SIDEBAR / CONTROL CONSOLE */}
      <div className="w-[380px] h-full flex flex-col p-4 gap-4 z-20 bg-black/40 border-r border-white/5 backdrop-blur-md">
         
         <div className="mb-4">
            <h1 className="text-[22px] font-black italic uppercase tracking-tighter text-white">NEXUS_FTP_V4</h1>
            <div className="flex items-center gap-2 opacity-50">
               <ShieldCheck size={12} className="text-sky-400" />
               <span className="text-[9px] font-black uppercase tracking-widest">SHIELD_SSL_ENCRYPTED</span>
            </div>
         </div>

         <CyberPanel title="HANDSHAKE_CONTROL" icon={Settings} className="h-auto">
            <div className="flex flex-col gap-3">
               <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Target_Endpoint</span>
                  <input value={ip} onChange={e => setIp(e.target.value)} className="bg-black/40 border border-white/10 p-2 text-[11px] text-sky-400 outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Control_Port</span>
                     <input value={port} onChange={e => setPort(e.target.value)} className="bg-black/40 border border-white/10 p-2 text-[11px] text-sky-400 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Auth_Mode</span>
                     <div className="bg-black/40 border border-white/10 p-2 text-[11px] text-emerald-400 font-black">SECURE_SSL</div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={connect} className="p-3 bg-sky-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-sky-400 transition-all shadow-[0_0_15px_#0ea5e955]">CONNECT</button>
                  <button onClick={login} className="p-3 bg-black border border-sky-500 text-sky-500 font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-black transition-all">LOGIN</button>
               </div>
            </div>
         </CyberPanel>

         <CyberPanel title="PROTOCOL_SETTINGS" icon={Cpu} className="h-auto">
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-2 bg-white/5 border border-white/5">
                   <span className="text-[9px] font-black opacity-60">ACTIVE_MODE</span>
                   <div onClick={() => setMode('ACTIVE')} className={`w-8 h-4 rounded-full border border-white/20 relative cursor-pointer ${mode === 'ACTIVE' ? 'bg-sky-500' : ''}`} />
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 border border-white/5">
                   <span className="text-[9px] font-black opacity-60">PASSIVE_MODE</span>
                   <div onClick={() => setMode('PASSIVE')} className={`w-8 h-4 rounded-full border border-white/20 relative cursor-pointer ${mode === 'PASSIVE' ? 'bg-sky-500' : ''}`} />
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 border border-white/5">
                   <span className="text-[9px] font-black opacity-60">SECURE_FTP_TLS</span>
                   <div onClick={() => setSecure(!secure)} className={`w-8 h-4 rounded-full border border-white/20 relative cursor-pointer ${secure ? 'bg-emerald-500' : ''}`} />
                </div>
             </div>
         </CyberPanel>

         <CyberPanel title="CLIENT_FS_ARCHIVE" icon={Database} className="flex-1">
             <div className="flex flex-col gap-2">
                {clientFiles.map(f => (
                   <div key={f.name} className="flex justify-between items-center p-2 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                      <span className="text-[10px] text-white/80">{f.name}</span>
                      <span className="text-[9px] text-white/30 font-mono italic">{f.size}</span>
                   </div>
                ))}
             </div>
         </CyberPanel>
      </div>

      {/* 2. MAIN 3D SIMULATOR REGION */}
      <div className="flex-1 relative">
         {/* ABSOLUTE 3D ENGINE */}
         <div className="absolute inset-0 z-0">
            <Scene 
               ftpState={ftpState} 
               activeTransfer={activeTransfer} 
               clientFiles={clientFiles} 
               serverFiles={serverFiles} 
               onCommand={handleCommand}
               onStart={connect}
            />
         </div>

         {/* ABSOLUTE INTERFACE TEXT OVERLAY */}
         <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-10">
            <div className="flex justify-between items-start">
               {/* Fixed Info */}
               <div className="opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] block">NEXUS_SIM_ENGINE_V4.0</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.8em] block">SYD_NODE_SECURE</span>
               </div>
            </div>
            
            {/* Simulation Status Strip at the bottom */}
            <div className="flex justify-between items-end">
               <div className="flex gap-8">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">DATA_PIPELINE</span>
                      <span className="text-[14px] font-black italic color-sky-400 text-sky-400">STABLE_SSL</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">TRANSMISSION_ACK</span>
                      <span className="text-[14px] font-black italic color-emerald-400 text-emerald-400 uppercase">{ftpState}</span>
                   </div>
               </div>
               <div className="text-right">
                   <div className="px-4 py-2 bg-sky-500 text-black font-black text-[12px] uppercase italic tracking-tighter shadow-[0_0_30px_#0ea5e9]">TX_ALIVE_25.4 MB/S</div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. RIGHT STATUS / EXPLANATION PANEL */}
      <div className="w-[420px] h-full flex flex-col p-4 gap-4 z-20 bg-black/40 border-l border-white/5 backdrop-blur-md">
         
         <CyberPanel title="PROTOCOL_TELEMETRY" icon={Activity} className="h-[220px]">
             <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col">
                      <span className="text-[8px] text-white/30 uppercase">Status</span>
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">{ftpState}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[8px] text-white/30 uppercase">Encryption</span>
                      <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest">TLS_1.3_ACTIVE</span>
                   </div>
                </div>
                
                {activeTransfer && (
                   <div className="flex flex-col gap-2 mt-2">
                      <div className="flex justify-between items-center text-[9px] font-black">
                         <span>SENDING: {activeTransfer.name}</span>
                         <span className="text-emerald-400">{activeTransfer.progress}%</span>
                      </div>
                      <div className="h-[4px] bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${activeTransfer.progress}%` }} />
                      </div>
                   </div>
                )}
                
                <div className="mt-2 h-[60px] bg-sky-500/5 border border-sky-500/10 flex items-end justify-between px-2 py-1 gap-1">
                   {[1,4,2,8,3,9,1,4,7,2,5,9,3,1].map((v, i) => (
                      <div key={i} className="flex-1 bg-sky-500/30" style={{ height: `${v*10}%` }} />
                   ))}
                </div>
             </div>
         </CyberPanel>

         <CyberPanel title="HANDSHAKE_SEQUENCE" icon={Navigation} className="h-auto">
             <div className="flex flex-col gap-3">
                {[
                  "1. SELECT REMOTE HOST",
                  "2. AUTHENTICATE USER",
                  "3. OPEN CONTROL CHANNEL",
                  "4. NEGOTIATE DATA PORT",
                  "5. FILE TRANSMISSION",
                  "6. SESSION TERMINATE"
                ].map((step, i) => {
                  const isActive = (i === 0 && ftpState === FTP_STATES.CONNECTING) || 
                                   (i === 1 && ftpState === FTP_STATES.USER_ACK) ||
                                   (i === 2 && ftpState === FTP_STATES.LOGGED_IN) ||
                                   (i === 4 && activeTransfer);
                  return (
                    <div key={i} className={`flex items-center gap-3 transition-all ${isActive ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/20'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{step}</span>
                    </div>
                  );
                })}
             </div>
         </CyberPanel>

         <CyberPanel title="TRANSMISSION_LOG" icon={TerminalIcon} className="flex-1">
             <div className="flex flex-col gap-1 font-mono text-[9px]">
                {logs.map((log, i) => (
                   <div key={i} className="flex gap-2 border-b border-white/5 py-1">
                      <span className={`font-black ${log.type === 'CMD' ? 'text-sky-400' : log.type === 'RES' ? 'text-emerald-400' : 'text-white/30'}`}>[{log.type}]</span>
                      <span className="text-white/80">{log.text}</span>
                   </div>
                ))}
             </div>
         </CyberPanel>
      </div>

    </div>
  );
};

export default App;
