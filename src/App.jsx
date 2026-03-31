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

const ProtocolExplanation = ({ state }) => {
  const content = {
    [FTP_STATES.DISCONNECTED]: {
      title: "Step 1: Establishment (Port 21)",
      body: "FTP uses a dual-port architecture. Before transferring files, the client must establish an initial TCP Control Connection with the server on Port 21 to send commands."
    },
    [FTP_STATES.CONNECTING]: {
      title: "Step 2: Identification",
      body: "The server accepted the TCP connection (220 Ready_ENCRYPTION_ACTIVE). Standard FTP requires the client to identify itself using the USER command before any file actions."
    },
    [FTP_STATES.USER_ACK]: {
      title: "Step 3: Authentication",
      body: "The server responded with 331 (User name okay, need password). The client must now explicitly send the PASS command securely over the control channel."
    },
    [FTP_STATES.LOGGED_IN]: {
      title: "Step 4: Data Channel (Port 20)",
      body: "Authentication successful (230 Logged in). To list directories or download files, standard FTP dynamically opens a completely separate DATA CHANNEL (Port 20) to stream raw bytes."
    }
  };

  const info = content[state] || content[FTP_STATES.DISCONNECTED];

  return (
    <motion.div 
      key={info.title}
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className="bg-sky-500/5 border border-sky-400/20 rounded p-4 mb-2"
    >
      <h4 className="font-bold text-[#0ea5e9] uppercase tracking-widest mb-1.5 text-[10px] items-center flex gap-2">
        <Zap size={10} className="text-[#0ea5e9]" /> {info.title}
      </h4>
      <p className="text-sky-100/70 leading-relaxed text-[10px] italic">{info.body}</p>
    </motion.div>
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
        sendPacket('data', 'NET_STREAM_LIST (Port 20)', 's2c');
        await new Promise(r => setTimeout(r, 1200));
        setServerFiles(result.data);
        addLog('resp', '226 // TRANSFER_COMPLETE // ALL_FILES_SYNCED');
        sendPacket('control', '226', 's2c');
      } else if (cmd === 'RETR') {
        const file = result.file;
        setActiveTransfer({ name: file.name, progress: 0, dir: 'download' });
        sendPacket('data', `RETR_STREAM_${file.name} (Port 20)`, 's2c');
        
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
      
      {/* 1. Left Sidebar: Network Controls & Vault */}
      <div className="w-[340px] h-full flex flex-col p-6 gap-6 overflow-y-auto border-r border-[#0ea5e9]/10 bg-[#020a12]/80 backdrop-blur-xl z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
         <header className="flex items-center gap-3 mb-2 px-2">
            <Layers className="text-[#0ea5e9]" size={28} />
            <div>
               <h1 className="text-xl font-black uppercase tracking-[0.1em] text-[#0ea5e9] drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">NexusFTP // V4</h1>
               <div className="flex items-center gap-2 mt-0.5 text-[7px] font-black tracking-[0.3em] text-[#0ea5e9]/40">
                  <ShieldCheck size={8} /> 
                  <span>SECURE_LINK // ACTIVE</span>
               </div>
            </div>
         </header>

         <section className="flex flex-col gap-3">
            <div className="hologram-panel p-4 flex flex-col gap-3 border-[#0ea5e9]/10">
               <div className="flex justify-between items-center border-b border-[#0ea5e9]/10 pb-2 mb-1">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-[#0ea5e9]/80">Lifecycle System</h3>
                  <Activity size={12} className={ftpState !== FTP_STATES.DISCONNECTED ? "text-emerald-500 animate-pulse" : "text-slate-700"} />
               </div>
               <AnimatePresence mode="wait">
                 <ProtocolExplanation state={ftpState} />
               </AnimatePresence>
               <div className="flex flex-col gap-2">
                 {ftpState === FTP_STATES.DISCONNECTED ? (
                    <button onClick={startSession} className="tech-button py-2.5 text-[9px]">Connect (Port 21)</button>
                 ) : (
                    <AnimatePresence mode="popLayout">
                      {ftpState === FTP_STATES.CONNECTING ? (
                          <motion.button key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => handleCommand('USER', ['admin'])} className="tech-button tech-button-blue py-2.5 text-[9px]">USER admin</motion.button>
                      ) : ftpState === FTP_STATES.USER_ACK ? (
                          <motion.button key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => handleCommand('PASS', ['password123'])} className="tech-button py-2.5 text-[9px]">PASS ********</motion.button>
                      ) : (
                          <div className="flex flex-col gap-1.5">
                            <button onClick={() => handleCommand('LIST')} className="tech-button tech-button-blue py-2.5 text-[9px]">Query LIST</button>
                            <button onClick={() => handleCommand('QUIT')} className="tech-button tech-button-red py-2.5 text-[9px]">QUIT</button>
                          </div>
                      )}
                    </AnimatePresence>
                 )}
               </div>
            </div>
         </section>

         <section className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
               <FileExplorer files={clientFiles} title="Local Vault" active={true} />
            </div>
            <div className="flex-1 min-h-0">
               <FileExplorer 
                  files={serverFiles} title="Remote Core" active={ftpState === FTP_STATES.LOGGED_IN}
                  onFileClick={(file) => { if (ftpState === FTP_STATES.LOGGED_IN) handleCommand('RETR', [file.name]); }}
               />
            </div>
         </section>
      </div>

      {/* 2. Middle Column: EXPANSIVE 3D HOLOGRAM */}
      <div className="flex-1 h-full relative bg-[#01040a]">
         <div className="w-full h-full relative overflow-hidden">
            <Scene 
              ftpState={ftpState} 
              packets={packets} 
              activeTransfer={activeTransfer} 
              clientFiles={clientFiles} 
              serverFiles={serverFiles} 
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
         </div>
      </div>

      {/* 3. Right Sidebar: DATA FLOW LOG */}
      <div className="w-[420px] h-full flex flex-col p-6 bg-[#020a12]/80 backdrop-blur-xl border-l border-[#0ea5e9]/10 z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
         <div className="mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0ea5e9] flex items-center gap-2">
              <Zap size={12} /> PROTOCOL_LOG_HUD
            </h3>
            <div className="w-full h-[1px] bg-sky-500/10 mt-2" />
         </div>
         <div className="flex-1 min-h-0">
            <Terminal logs={logs} />
         </div>
         
         {/* Live Bandwidth Indicator in Sidebar */}
         {activeTransfer && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg"
            >
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Active_Stream: {activeTransfer.name}</span>
                  <span className="text-[10px] font-mono text-emerald-500">{activeTransfer.progress}%</span>
               </div>
               <div className="h-1 bg-emerald-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${activeTransfer.progress}%` }} />
               </div>
            </motion.div>
         )}
      </div>

    </div>
  );
};

export default App;
