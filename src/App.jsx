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

const HUDPanel = ({ title, subtitle, children, icon: Icon, color = "#000000", glass = true }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-5 flex flex-col gap-3 bg-white/90 border border-black/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl`}
  >
    <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-1">
       <div className="flex items-center gap-2">
          {Icon && <Icon size={12} className="text-black" />}
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">{title}</span>
       </div>
       {subtitle && <span className="text-[8px] font-mono text-black/30 uppercase">{subtitle}</span>}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar-light pr-1">
       {children}
    </div>
  </motion.div>
);

const ProtocolInsight = ({ state }) => {
  const [insight, setInsight] = useState("");
  useEffect(() => {
    const insights = {
      [FTP_STATES.DISCONNECTED]: "// SYNC: PENDING TCP_SOCKET_AWAIT",
      [FTP_STATES.CONNECTING]: "// SYNC: TCP_SOCKET_OPEN // PROTOCOL_READY",
      [FTP_STATES.USER_ACK]: "// AUTH: USER_IDENTIFIED // NEED_CRED",
      [FTP_STATES.LOGGED_IN]: "// AUTH: SUCCESS // ROOT_ACCESS_GRANTED"
    };
    setInsight(insights[state] || "System Idling...");
  }, [state]);
  return (
    <div className="p-3 bg-black/5 border border-black/10 rounded-lg">
      <p className="text-[10px] leading-relaxed text-black/60 font-black italic uppercase tracking-tighter">
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
    addLog('cmd', `CMD: ${cmd} ${arg}`);
    sendPacket('control', cmd, 'c2s');
    await new Promise(r => setTimeout(r, 1000));
    const result = server.current.processCommand(cmd, arg, ftpState);
    addLog('resp', `ACK: ${result.code} // ${RESPONSE_CODES[result.code] || result.message}`);
    sendPacket('control', result.code.toString(), 's2c');
    if (result.nextState) setFtpState(result.nextState);
    if (result.code === 150) {
      if (cmd === 'LIST') {
        sendPacket('data', 'DIR_LIST', 's2c');
        await new Promise(r => setTimeout(r, 1200));
        setServerFiles(result.data);
        addLog('resp', '226 DATA_TRANSFER_COMPLETE');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `RETR_${file.name}`, 's2c');
        for (let i = 0; i <= 100; i += 25) {
          setActiveTransfer(prev => ({ ...prev, progress: i }));
          await new Promise(r => setTimeout(r, 200));
        }
        setClientFiles(prev => [...prev, { ...file }]);
        addLog('resp', `226 DATA_TRANSFER_COMPLETE`);
        setActiveTransfer(null);
      }
    }
  };

  const startSession = () => {
    addLog('resp', "220 HELLO_NEXUS_READY");
    setFtpState(FTP_STATES.CONNECTING);
  };

  return (
    <div className="relative w-full h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
         <Scene 
            ftpState={ftpState} 
            packets={packets} 
            activeTransfer={activeTransfer} 
            clientFiles={clientFiles} 
            serverFiles={serverFiles} 
            onCommand={handleCommand}
            onStart={startSession}
            lightMode={true}
         />
      </div>

      {/* Lab UI HUD OVERLAYS */}
      <div className="absolute left-10 top-10 bottom-10 w-[340px] flex flex-col gap-6 z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <HUDPanel title="NEXUS_FTP_SYSTEM" subtitle="V2.0_EXPERIMENTAL" icon={Cpu}>
               <div className="flex flex-col gap-4">
                  <ProtocolInsight state={ftpState} />
                  <div className="flex flex-col gap-2">
                     {ftpState === FTP_STATES.DISCONNECTED ? (
                        <button onClick={startSession} className="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all">ESTABLISH_CONNECTION</button>
                     ) : (
                        <div className="flex flex-col gap-2">
                           <button onClick={() => handleCommand('USER', ['ops'])} className="px-5 py-2 bg-slate-100 border border-black/10 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200">IDENTIFY_USER</button>
                           <button onClick={() => handleCommand('PASS', ['nexus'])} className="px-5 py-2 bg-slate-100 border border-black/10 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200">VERIFY_PASS</button>
                           <button onClick={() => handleCommand('LIST')} className="px-5 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800">LIST_DIRECTORY</button>
                        </div>
                     )}
                  </div>
               </div>
            </HUDPanel>
         </div>

         <div className="pointer-events-auto flex-1 min-h-0 overflow-hidden">
            <HUDPanel title="CLIENT_ARCHIVE" icon={Trello}>
               <FileExplorer files={clientFiles} title="" active={true} light={true} />
            </HUDPanel>
         </div>
      </div>

      <div className="absolute right-10 top-10 bottom-10 w-[340px] flex flex-col gap-6 z-20 pointer-events-none">
         <div className="pointer-events-auto h-2/3 flex flex-col gap-6">
            <HUDPanel title="REMOTE_MAINFRAME" icon={Layers}>
               <FileExplorer 
                  files={serverFiles} title="" active={ftpState === FTP_STATES.LOGGED_IN} light={true}
                  onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
               />
            </HUDPanel>
            
            <div className="flex-1 min-h-0">
               <HUDPanel title="TRANSMISSION_LOG" icon={TerminalIcon}>
                  <Terminal logs={logs} light={true} />
               </HUDPanel>
            </div>
         </div>

         <div className="pointer-events-auto h-[120px] shrink-0">
            <HUDPanel title="PACKET_STREAM" icon={Activity}>
               {activeTransfer ? (
                  <div className="flex flex-col gap-3 py-1">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase text-black">
                        <span className="animate-pulse">TRANSFERRING: {activeTransfer.name}</span>
                        <span>{activeTransfer.progress}%</span>
                     </div>
                     <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                        <motion.div 
                           className="h-full bg-black shadow-[0_0_15px_rgba(0,0,0,0.2)]" 
                           initial={{ width: 0 }} 
                           animate={{ width: `${activeTransfer.progress}%` }} 
                        />
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full text-black/10 uppercase tracking-[0.4em] italic font-black text-[10px]">
                     Standby_Mode
                  </div>
               )}
            </HUDPanel>
         </div>
      </div>

    </div>
  );
};

export default App;
