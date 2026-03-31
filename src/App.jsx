import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Terminal } from './components/Terminal';
import { FileExplorer } from './components/FileExplorer';
import { NetworkPipeline } from './components/NetworkPipeline';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  LogIn, 
  Activity, 
  Settings, 
  DownloadCloud, 
  Info,
  Server as ServerIcon,
  Monitor as ClientIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';

const GlassOrbNode = ({ type, active, label, subtitle }) => {
  const Icon = type === 'server' ? ServerIcon : ClientIcon;
  const color = type === 'server' ? 'emerald' : 'blue';
  
  return (
    <div className="relative group flex flex-col items-center">
      {/* Neural Pulse (Background) */}
      <AnimatePresence>
        {active && (
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1.5, opacity: 0 }}
             transition={{ duration: 1, repeat: Infinity }}
             className={`absolute inset-0 rounded-full border-2 border-${color}-400/30 z-0`}
           />
        )}
      </AnimatePresence>
      
      {/* The Orb */}
      <div className={`w-28 h-28 refractive-orb flex items-center justify-center relative z-10 transition-all duration-500 ${active ? `shadow-glow-${color} scale-110` : 'opacity-60 scale-95'}`}>
         <div className={`p-4 rounded-3xl bg-${color}-500/10 border border-${color}-400/20 shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform`}>
            <Icon size={32} className={`text-${color}-400 group-hover:animate-pulse`} />
         </div>
         {/* Inner Glow */}
         <div className={`absolute inset-4 rounded-full blur-2xl opacity-10 bg-${color}-500`} />
      </div>

      {/* Label & Meta */}
      <div className="mt-4 text-center">
         <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 opacity-60`}>{subtitle}</span>
         <h3 className={`text-lg font-extrabold tracking-tight ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h3>
         {active && (
           <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-400/20 inline-flex`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-${color}-400 animate-pulse`} />
              <span className={`text-[9px] font-bold uppercase tracking-widest text-${color}-400`}>Online</span>
           </div>
         )}
      </div>
    </div>
  );
};

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
    }, 1500);
  }, []);

  const handleCommand = async (cmd, argArr = []) => {
    const arg = argArr.join(' ');
    addLog('cmd', `${cmd} ${arg}`);
    sendPacket('control', cmd, 'c2s');

    await new Promise(r => setTimeout(r, 600));

    const result = server.current.processCommand(cmd, arg, ftpState);
    const respText = `${result.code} ${RESPONSE_CODES[result.code] || result.message || ''}`;
    
    addLog('resp', respText);
    sendPacket('control', result.code.toString(), 's2c');

    if (result.nextState) setFtpState(result.nextState);

    // Handle special actions
    if (result.code === 150) {
      if (cmd === 'LIST') {
        sendPacket('data', 'LIST_STREAM', 's2c');
        await new Promise(r => setTimeout(r, 800));
        setServerFiles(result.data);
        addLog('resp', '226 Transfer complete');
        sendPacket('control', '226', 's2c');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `DATASTREAM_${file.name}`, 's2c');
        
        for (let i = 0; i <= 100; i += 10) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 250));
        }

        setClientFiles(prev => [...prev, { ...file, name: `${file.name}` }]);
        addLog('resp', '226 Transfer complete');
        sendPacket('control', '226', 's2c');
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    addLog('resp', '220 Welcome to V3-ALCHEMIST FTP Engine');
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div id="root" className="flex flex-col h-screen font-sans selection:bg-primary/30">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-primary/5 blur-[120px] rounded-full" />
      
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-500/20 border border-blue-500/40 rounded-xl shadow-glow-blue rotate-3">
                <Network className="text-blue-400" size={20} />
             </div>
             <div className="flex flex-col">
                <h1 className="text-xl font-extrabold tracking-tighter text-white">GITFTP <span className="text-blue-500">EXCHANGE</span></h1>
                <span className="text-[9px] font-black uppercase text-blue-500/60 tracking-[0.4em]">Protocol Visualization v3.0</span>
             </div>
          </div>
          
          <div className="h-8 w-px bg-white/5 mx-2" />
          
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                <ShieldCheck size={14} className="text-emerald-500/60 group-hover:text-emerald-500" />
                <span>Encrypted Session</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                <Zap size={14} className="text-blue-400/60 group-hover:text-blue-400" />
                <span>Zero Latency Sync</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
             <Settings size={16} className="text-slate-400 group-rotate-90 transition-transform" />
             <span className="text-xs font-bold text-slate-300">Settings</span>
           </button>
           <div className="h-10 w-10 glass-panel flex items-center justify-center p-0.5 border-primary/20">
              <div className="w-full h-full bg-primary/20 rounded-lg animate-pulse" />
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-10 min-h-0 relative z-10">
         
         {/* Left Side: Client Environment */}
         <section className="col-span-3 flex flex-col gap-6">
            <GlassOrbNode 
               type="client" 
               label="Anthropic-OS" 
               subtitle="Control Interface"
               active={ftpState !== FTP_STATES.DISCONNECTED} 
            />
            <div className="flex-1 min-h-0">
               <FileExplorer files={clientFiles} title="Local Filesystem" active={true} />
            </div>
            <div className="glass-panel p-6 shadow-glow-blue border-blue-500/20">
               <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-4">Command Terminal</h4>
               <div className="space-y-3">
                  {ftpState === FTP_STATES.DISCONNECTED ? (
                     <button 
                       onClick={startSession}
                       className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                     >
                       <LogIn size={16} /> Establish Handshake
                     </button>
                  ) : (
                     <div className="grid grid-cols-1 gap-2.5">
                        <AnimatePresence mode="popLayout">
                           {ftpState === FTP_STATES.CONNECTING ? (
                              <motion.button 
                                key="btn-user"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleCommand('USER', ['admin'])}
                                className="w-full py-4 glass-panel border-blue-500/30 text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase hover:bg-blue-500/10 transition-all border-dashed"
                              >
                                Identify (USER admin)
                              </motion.button>
                           ) : ftpState === FTP_STATES.USER_ACK ? (
                              <motion.button 
                                key="btn-pass"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleCommand('PASS', ['password123'])}
                                className="w-full py-4 glass-panel border-emerald-500/30 text-emerald-400 font-black text-[10px] tracking-[0.3em] uppercase hover:bg-emerald-500/10 transition-all border-dashed"
                              >
                                Authenticate (PASS *****)
                              </motion.button>
                           ) : (
                              <div className="grid grid-cols-2 gap-2">
                                 <button 
                                   onClick={() => handleCommand('LIST')}
                                   className="py-3 glass-panel border-white/5 text-white/80 font-black text-[9px] tracking-widest uppercase hover:bg-white/5 transition-all"
                                 >
                                   List Files
                                 </button>
                                 <button 
                                   onClick={() => handleCommand('QUIT')}
                                   className="py-3 glass-panel border-red-500/20 text-red-500/80 font-black text-[9px] tracking-widest uppercase hover:bg-red-500/10 transition-all"
                                 >
                                   Terminate
                                 </button>
                              </div>
                           )}
                        </AnimatePresence>
                     </div>
                  )}
               </div>
            </div>
         </section>

         {/* Center: Neural Pipeline & Monitoring */}
         <section className="col-span-5 flex flex-col pt-10">
            <div className="relative flex-1 mb-8 overflow-visible">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 transform -translate-y-4">
                  {activeTransfer && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-panel px-6 py-3 border-emerald-500/40 shadow-glow-emerald flex items-center gap-4 min-w-[280px]"
                     >
                        <div className="p-2 bg-emerald-500/20 rounded-full">
                           <DownloadCloud className="text-emerald-400 animate-bounce" size={16} />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] font-black uppercase text-slate-100 tracking-wider">Syncing {activeTransfer.name}</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{activeTransfer.progress}%</span>
                           </div>
                           <div className="h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px]">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${activeTransfer.progress}%` }}
                                 className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
                              />
                           </div>
                        </div>
                     </motion.div>
                  )}
               </div>
               <NetworkPipeline packets={packets} />
            </div>
            
            <div className="h-[220px] relative">
               <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-bg-deep to-transparent z-20 pointer-events-none" />
               <Terminal logs={logs} />
               <div className="absolute bottom-4 right-4 text-white/5 pointer-events-none uppercase font-black text-6xl tracking-tighter select-none rotate-2">FTP_V3</div>
            </div>
         </section>

         {/* Right Side: Remote Nexus */}
         <section className="col-span-4 flex flex-col gap-6">
            <GlassOrbNode 
               type="server" 
               label="Stark-Cloud-V5" 
               subtitle="Remote Nexus"
               active={ftpState === FTP_STATES.LOGGED_IN} 
            />
            <div className="flex-1 min-h-0">
               <FileExplorer 
                  files={serverFiles} 
                  title="Remote Explorer" 
                  active={ftpState === FTP_STATES.LOGGED_IN}
                  onFileClick={(file) => {
                    if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]);
                  }}
               />
            </div>
            <div className="glass-panel p-6 border-slate-700/30 bg-slate-800/10 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">System Insight</span>
               </div>
               <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {ftpState === FTP_STATES.DISCONNECTED ? 
                    "Awaiting initial TCP handshake. Connect to begin command/response sequences." :
                    ftpState === FTP_STATES.LOGGED_IN ? 
                    "Control connection active. Select a high-priority data packet from the Remote Explorer to initiate stream." :
                    "Observing protocol state transitions. Real-time logging active on transmission gateway."}
               </p>
            </div>
         </section>

      </main>

      <footer className="h-10 border-t border-white/5 flex items-center justify-center px-10 relative overflow-hidden">
         <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
         <span className="text-[9px] font-black uppercase text-slate-600 tracking-[0.5em] relative z-10">
             Advanced Protocol Orchestrator & Neural Visualizer // Stark Workspace Industries
         </span>
      </footer>
    </div>
  );
};

export default App;
