import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FTP_STATES, RESPONSE_CODES, FTPServer, INITIAL_FILES } from './logic/ftpProtocol';
import { Scene } from './components/Scene';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  Layers,
  Cpu
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
    const result = server.current.processCommand(cmd, arg, ftpState);
    if (result.nextState) setFtpState(result.nextState);
    if (result.code === 150) {
      if (cmd === 'LIST') {
        await new Promise(r => setTimeout(r, 1200));
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
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* BACKGROUND: CINEMATIC 3D ENGINE */}
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

      {/* OVERLAY: GLOBAL STATUS TELEMETRY (Minimalist Fixed UI) */}
      <div className="absolute inset-x-0 top-0 p-10 flex justify-between items-start pointer-events-none z-10">
         <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
               NEXUS_FTP_V4
            </h1>
            <div className="flex items-center gap-3 opacity-40">
               <ShieldCheck size={14} className="text-sky-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-sky-400">ENCRYPTION_ACTIVE</span>
            </div>
         </div>

         <div className="flex gap-12 text-right">
            <div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">DATA_PIPELINE</span>
               <span className="text-[16px] font-black italic text-[#10b981]">OPTIMIZED</span>
            </div>
            <div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block mb-1">TRANSFER_RATE</span>
               <span className="text-[16px] font-black italic text-emerald-400">25.4 MB/S</span>
            </div>
         </div>
      </div>

      {/* CINEMATIC SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none hologram-glow opacity-10" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_250px_rgba(0,0,0,0.9)]" />

    </div>
  );
};

export default App;
