import React from 'react';
import { 
  Navigation,
  Activity,
  Terminal,
  Cpu,
  Monitor,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FTP_STAGES } from '../logic/ftpState';

const ProtocolStep = ({ label, active, done, index }) => (
  <div className={`flex items-center gap-3 transition-all ${active || done ? 'opacity-100' : 'opacity-20'}`}>
    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : active ? 'bg-sky-500 shadow-[0_0_10px_#0ea5e9]' : 'bg-white/20'}`} />
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{index + 1}. {label}</span>
  </div>
);

export const RightStatusPanel = ({ stage, logs, progress, speed, activeTransfer }) => {
  const steps = [
    { label: "SELECT REMOTE HOST", done: stage !== FTP_STAGES.IDLE, active: stage === FTP_STAGES.HOST_SELECTED },
    { label: "AUTHENTICATE USER", done: [FTP_STAGES.AUTHENTICATED, FTP_STAGES.NEGOTIATING, FTP_STAGES.TRANSFERRING, FTP_STAGES.COMPLETE].includes(stage), active: stage === FTP_STAGES.AUTH_PENDING },
    { label: "OPEN CONTROL CHANNEL", done: [FTP_STAGES.AUTHENTICATED, FTP_STAGES.NEGOTIATING, FTP_STAGES.TRANSFERRING, FTP_STAGES.COMPLETE].includes(stage), active: stage === FTP_STAGES.CONNECTED },
    { label: "NEGOTIATE DATA PORT", done: [FTP_STAGES.TRANSFERRING, FTP_STAGES.COMPLETE].includes(stage), active: stage === FTP_STAGES.NEGOTIATING },
    { label: "FILE TRANSMISSION", done: stage === FTP_STAGES.COMPLETE, active: stage === FTP_STAGES.TRANSFERRING },
    { label: "SESSION TERMINATE", done: false, active: stage === FTP_STAGES.COMPLETE }
  ];

  return (
    <aside className="w-[360px] h-full flex flex-col p-6 gap-6 z-20 backdrop-blur-3xl bg-black/40 border-l border-white/5 overflow-y-auto custom-scrollbar">
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
           <Navigation size={14} className="text-sky-400" />
           <span className="text-[11px] font-black text-white/50 uppercase tracking-wider">PROTOCOL_STAGES</span>
        </div>
        <div className="flex flex-col gap-4 py-2 border-y border-white/5 bg-white/5 px-4 py-4 rounded-xl">
          {steps.map((step, i) => <ProtocolStep key={i} index={i} {...step} />)}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
           <Activity size={14} className="text-sky-400" />
           <span className="text-[11px] font-black text-white/50 uppercase tracking-wider">TELEMETRY_DATAFEED</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-white/30 uppercase mb-1">State</span>
             <span className="text-[12px] font-black text-emerald-400 uppercase italic">{stage}</span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-[8px] font-black text-white/30 uppercase mb-1">TX_Speed</span>
             <span className="text-[12px] font-black text-sky-400 uppercase italic">{speed} MB/s</span>
          </div>
        </div>
        
        {activeTransfer && (
           <div className="mt-2 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/70">
                 <span>TX: {activeTransfer.name}</span>
                 <span className="text-emerald-400">{progress}%</span>
              </div>
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${progress}%` }} />
              </div>
           </div>
        )}

        <div className="h-[60px] bg-sky-500/5 border border-sky-400/10 flex items-end justify-between px-2 py-1 gap-1">
           {[...Array(14)].map((_, i) => (
              <div key={i} className="flex-1 bg-sky-500/30" style={{ height: `${Math.random()*100}%` }} />
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
         <div className="flex items-center gap-2">
            <Terminal size={14} className="text-sky-400" />
            <span className="text-[11px] font-black text-white/50 uppercase tracking-wider">TRANSMISSION_LOG</span>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
           {logs.map((log, i) => (
             <div key={i} className="text-[10px] font-mono border-b border-white/5 pb-2">
                <span className="text-white/30 mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={log.type === 'CMD' ? 'text-sky-400' : 'text-emerald-400'}>{log.text}</span>
             </div>
           ))}
         </div>
      </div>
    </aside>
  );
};
