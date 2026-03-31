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
  Trello,
  HelpCircle,
  Terminal as TerminalIcon,
  ChevronRight
} from 'lucide-react';

const HUDPanel = ({ title, subtitle, children, icon: Icon, color = "#0ea5e9", glass = true }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`cyber-panel p-3 flex flex-col gap-2 ${glass ? 'bg-black/60' : 'bg-black'} border-${color}/20 backdrop-blur-md`}
    style={{ borderColor: `${color}33` }}
  >
    <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1">
       <div className="flex items-center gap-2">
          {Icon && <Icon size={10} style={{ color }} />}
          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color }}>{title}</span>
       </div>
       {subtitle && <span className="text-[7px] font-mono text-white/20 uppercase">{subtitle}</span>}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
       {children}
    </div>
  </motion.div>
);

const ProtocolInsight = ({ state }) => {
  const [insight, setInsight] = useState("");
  
  useEffect(() => {
    const insights = {
      [FTP_STATES.DISCONNECTED]: "Establishing initial socket connection. Port 21 (Control) is used for the TCP handshake. No data path exists yet.",
      [FTP_STATES.CONNECTING]: "TCP Handshake Complete. Synchronizing protocol headers. Server is standardizing session state for USER command.",
      [FTP_STATES.USER_ACK]: "State: 331. The server identifies the user but requires a valid password to bind the session handle.",
      [FTP_STATES.LOGGED_IN]: "Session Authenticated (230). Ready to negotiate Data Channels. Port 20 or dynamic high ports will be used for file streams."
    };
    setInsight(insights[state] || "System Idling...");
  }, [state]);

  return (
    <div className="p-2.5 bg-sky-900/10 border border-sky-400/20 rounded-md">
      <div className="flex items-center gap-2 mb-2">
         <div className="w-1 h-3 bg-sky-400 animate-pulse" />
         <span className="text-[8px] font-black tracking-widest text-sky-400">PROTOCOL_LOGIC_INSIGHT</span>
      </div>
      <p className="text-[8px] leading-relaxed text-sky-100/70 font-medium italic">
        {insight}
      </p>
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
    }, 2000);
  }, []);

  const handleCommand = async (cmd, argArr = []) => {
    const arg = argArr.join(' ');
    addLog('cmd', `SENDING: ${cmd} ${arg}`);
    sendPacket('control', cmd, 'c2s');
    await new Promise(r => setTimeout(r, 1000));
    const result = server.current.processCommand(cmd, arg, ftpState);
    addLog('resp', `RECV: ${result.code} // ${RESPONSE_CODES[result.code] || result.message}`);
    sendPacket('control', result.code.toString(), 's2c');
    if (result.nextState) setFtpState(result.nextState);
    if (result.code === 150) {
      if (cmd === 'LIST') {
        sendPacket('data', 'DIR_LIST_TX', 's2c');
        await new Promise(r => setTimeout(r, 1200));
        setServerFiles(result.data);
        addLog('resp', '226 TRANSFER_COMPLETE_ALL_OBJECTS_SYNCED');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `RETR_PKT_DL_${file.name}`, 's2c');
        for (let i = 0; i <= 100; i += 25) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 200));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        addLog('resp', `226 DATA_DELIVERED // FILENAME: ${file.name}`);
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    addLog('resp', "220 GATEWAY_V4 READY_STATE_SYNC_PENDING");
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div className="relative w-full h-screen bg-[#010309] text-sky-100 font-mono overflow-hidden">
      
      {/* 1. LAYER 0: THE 3D HOLOGRAPHIC DECK (Full Screen Background) */}
      <div className="absolute inset-0 z-0">
         <Scene 
            ftpState={ftpState} 
            packets={packets} 
            activeTransfer={activeTransfer} 
            clientFiles={clientFiles} 
            serverFiles={serverFiles} 
            onCommand={handleCommand}
            onStart={startSession}
         />
      </div>

      {/* 2. LAYER 1: CINEMATIC FX OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none z-10">
         <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />
         <div className="absolute inset-0 hologram-glow opacity-20" />
         <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-40">
            <div className="flex flex-col items-center">
               <span className="text-[6px] tracking-[1em] mb-1">X_LATENCY_TX</span>
               <span className="text-white text-[12px] font-black">2.14ms</span>
            </div>
            <div className="w-[1px] h-10 bg-sky-500/30" />
            <div className="flex flex-col items-center">
               <span className="text-[6px] tracking-[1em] mb-1">BIT_BANDWIDTH</span>
               <span className="text-white text-[12px] font-black">21.8 Gbps</span>
            </div>
         </div>
      </div>

      {/* 3. LAYER 2: FLOATING HUD PANELS (The "Side" UI) */}
      
      {/* LEFT SIDE HUD */}
      <div className="absolute left-6 top-6 bottom-6 w-[320px] flex flex-col gap-4 z-20 pointer-events-none">
         <div className="pointer-events-auto">
           <HUDPanel title="NEXUS_GATEWAY_V4" subtitle="PROTOCOL_LINK_ACTIVE" icon={Layers}>
              <div className="flex items-center justify-between py-1">
                 <div className="flex items-center gap-2">
                    <Activity size={10} className="text-sky-400" />
                    <span className="text-[8px] font-black tracking-widest text-sky-400/80">LINK_STATUS_STABLE</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
              </div>
           </HUDPanel>
         </div>

         <div className="pointer-events-auto flex flex-col gap-4 flex-1 min-h-0">
            <HUDPanel title="COMMAND_LIFECYCLE" subtitle="CONTROL_CHANNEL" icon={Cpu}>
               <div className="flex flex-col gap-3">
                  <ProtocolInsight state={ftpState} />
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                     {ftpState === FTP_STATES.DISCONNECTED ? (
                        <button onClick={startSession} className="cyber-button">ESTABLISH_SOCKET</button>
                     ) : (
                        <AnimatePresence mode="popLayout">
                          {ftpState === FTP_STATES.CONNECTING ? (
                              <button onClick={() => handleCommand('USER', ['staff_ops'])} className="cyber-button cyber-button-emerald flex items-center justify-center gap-2">
                                <ChevronRight size={10} /> HANDSHAKE_USER_STAFF
                              </button>
                          ) : ftpState === FTP_STATES.USER_ACK ? (
                              <button onClick={() => handleCommand('PASS', ['A6_OPS'])} className="cyber-button cyber-button-emerald flex items-center justify-center gap-2">
                                <ChevronRight size={10} /> AUTH_VERIFY_CRED
                              </button>
                          ) : (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button onClick={() => handleCommand('LIST')} className="cyber-button">RECV_LIST</button>
                                <button onClick={() => handleCommand('QUIT')} className="cyber-button cyber-button-red">TERM_LINK</button>
                              </div>
                          )}
                        </AnimatePresence>
                     )}
                  </div>
               </div>
            </HUDPanel>

            <HUDPanel title="LOCAL_CORE_VAULT" subtitle="CLIENT_FILESYSTEM" icon={Trello}>
               <FileExplorer files={clientFiles} title="" active={true} />
            </HUDPanel>
         </div>
      </div>

      {/* RIGHT SIDE HUD */}
      <div className="absolute right-6 top-6 bottom-6 w-[320px] flex flex-col gap-4 z-20 pointer-events-none">
         <div className="pointer-events-auto flex-1 min-h-0 flex flex-col gap-4">
            <div className="h-[40%] min-h-0">
               <HUDPanel title="REMOTE_CORE_DECK" icon={Cpu} color="#106ba5">
                  <FileExplorer 
                     files={serverFiles} title="" active={ftpState === FTP_STATES.LOGGED_IN}
                     onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
                  />
               </HUDPanel>
            </div>
            
            <div className="flex-1 min-h-0">
               <HUDPanel title="DATA_PIPELINE_HUD" icon={TerminalIcon} color="#0ea5e9">
                  <Terminal logs={logs} />
               </HUDPanel>
            </div>
         </div>

         {/* ACTIVE DATA STREAM MONITOR */}
         <div className="pointer-events-auto h-[100px] shrink-0">
            <HUDPanel title="TX_RX_BURST_X" icon={Activity} color={activeTransfer ? "#34d399" : "#334155"}>
               {activeTransfer ? (
                  <div className="flex flex-col gap-2.5 py-1">
                     <div className="flex justify-between items-center text-[7px] font-black uppercase text-sky-200">
                        <span className="animate-pulse">STREAMING_PAYLOAD_{activeTransfer.name}</span>
                        <span className="font-mono text-white tracking-widest">{activeTransfer.progress}%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                        <motion.div 
                           className="h-full bg-emerald-500 shadow-[0_0_12px_#10b981]" 
                           initial={{ width: 0 }} 
                           animate={{ width: `${activeTransfer.progress}%` }} 
                        />
                     </div>
                     <div className="text-[6px] text-emerald-400/50 uppercase tracking-[0.3em] text-right">SEC_ENCRYPTED_PACKETS_SENDING</div>
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
                     <Zap size={14} className="mb-2" />
                     <span className="text-[8px] font-black uppercase tracking-[0.5em] italic">Link_In_Standby</span>
                  </div>
               )}
            </HUDPanel>
         </div>
      </div>

    </div>
  );
};

export default App;
