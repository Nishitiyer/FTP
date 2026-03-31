import React from 'react';
import { 
  Settings, 
  Database, 
  Navigation,
  Globe,
  Lock,
  Cpu,
  Monitor,
  Activity,
  ShieldCheck,
  Power
} from 'lucide-react';
import { FTP_STAGES } from '../logic/ftpState';

const CyberInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1 mb-2">
    <span className="text-[9px] font-black uppercase tracking-widest text-sky-400/50">{label}</span>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-black/60 border border-sky-400/10 p-2 text-[11px] text-sky-400 outline-none rounded-lg focus:border-sky-400/40 transition-all font-mono"
    />
  </div>
);

const CyberButton = ({ label, onClick, active, variant = "primary" }) => (
  <button 
    onClick={onClick}
    className={`w-full p-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
      variant === "primary" 
        ? "bg-sky-500 text-black hover:bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]" 
        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
    } ${active ? "ring-1 ring-emerald-400/50" : ""}`}
  >
    {label}
  </button>
);

export const LeftControlPanel = ({ 
  stage, 
  setStage, 
  ip, setIp, 
  port, setPort, 
  user, setUser, 
  pass, setPass,
  mode, setMode,
  secure, setSecure,
  files, selectedFile, setSelectedFile,
  onTransfer
}) => (
  <aside className="w-[340px] h-full flex flex-col p-6 gap-6 z-20 backdrop-blur-3xl bg-black/40 border-r border-white/5 overflow-y-auto custom-scrollbar">
    
    <div>
      <h1 className="text-[28px] font-black italic tracking-tighter text-white uppercase italic">NEXUS_FTP_V4</h1>
      <div className="flex items-center gap-2 mt-1 opacity-60">
        <ShieldCheck size={14} className="text-sky-400" />
        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">SHIELD_PROTOCOL_ACTIVE</span>
      </div>
    </div>

    {/* Stage 1: Handshake Controls */}
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Settings size={14} className="text-sky-400" />
        <span className="text-[11px] font-black text-white/50 uppercase tracking-wider">COMMAND_CONSOLE</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <CyberButton label="CONNECT" onClick={() => setStage(FTP_STAGES.CONNECTED)} active={stage !== FTP_STAGES.IDLE} />
        <CyberButton label="LOGIN" onClick={() => setStage(FTP_STAGES.AUTHENTICATED)} active={stage === FTP_STAGES.AUTHENTICATED} variant="secondary" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CyberButton label="UPLOAD" variant="secondary" onClick={() => onTransfer('upload')} />
        <CyberButton label="DOWNLOAD" variant="secondary" onClick={() => onTransfer('download')} />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
         <button onClick={() => setMode('ACTIVE')} className={`p-2 text-[9px] font-black rounded-lg border border-white/10 ${mode === 'ACTIVE' ? 'bg-sky-500 text-black' : 'text-white/40'}`}>ACTIVE</button>
         <button onClick={() => setMode('PASSIVE')} className={`p-2 text-[9px] font-black rounded-lg border border-white/10 ${mode === 'PASSIVE' ? 'bg-sky-500 text-black' : 'text-white/40'}`}>PASSIVE</button>
         <button onClick={() => setSecure(!secure)} className={`p-2 text-[9px] font-black rounded-lg border border-white/10 ${secure ? 'bg-emerald-500 text-black' : 'text-white/40'}`}>SECURE</button>
      </div>
    </section>

    {/* Stage 2: Endpoint Details */}
    <section className="flex flex-col gap-1">
       <CyberInput label="REMOTE_HOST_IP" value={ip} onChange={e => setIp(e.target.value)} />
       <CyberInput label="REMOTE_PORT" value={port} onChange={e => setPort(e.target.value)} />
       <div className="grid grid-cols-2 gap-2">
          <CyberInput label="AUTH_USER" value={user} onChange={e => setUser(e.target.value)} />
          <CyberInput label="AUTH_PASS" value={pass} onChange={e => setPass(e.target.value)} type="password" />
       </div>
    </section>

    {/* Stage 3: Local Archive */}
    <section className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex items-center gap-2">
        <Database size={14} className="text-sky-400" />
        <span className="text-[11px] font-black text-white/50 uppercase tracking-wider">LOCAL_FS_ARCHIVE</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
        {files.map(file => (
          <div 
            key={file.name} 
            onClick={() => setSelectedFile(file)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedFile?.name === file.name 
                ? "bg-sky-500/10 border-sky-400/40" 
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-black text-white/90">{file.name}</span>
              <span className="text-[10px] font-bold text-sky-400/50">{file.size}</span>
            </div>
            <div className="mt-1 h-[2px] bg-sky-500/10 rounded-full overflow-hidden">
               <div className="h-full bg-sky-400/30" style={{ width: '100%', backgroundColor: file.color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  </aside>
);
