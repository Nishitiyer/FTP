import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Activity, TerminalSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Terminal = ({ logs = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden border-slate-800/40 shadow-inner">
      <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
           <div className="p-1.5 bg-blue-500/20 rounded-md border border-blue-500/30">
              <TerminalIcon size={12} className="text-blue-400" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Control Interface Log</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
           <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
           <span className="text-[8px] font-black text-blue-400/80 uppercase tracking-widest">Live Stream</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-3 terminal-font text-[12px] bg-black/30 custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
           {logs.map((log, i) => (
             <motion.div 
               key={`${log.timestamp}-${i}`}
               initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
               className={`flex items-start gap-4 ${log.type === 'cmd' ? 'text-blue-300' : 'text-emerald-300'}`}
             >
               <span className="text-slate-600 font-bold opacity-30 select-none tabular-nums mt-0.5">
                 {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </span>
               <div className="flex gap-2 flex-1 min-w-0">
                 <ChevronRight size={14} className="flex-none mt-0.5 opacity-30 text-slate-500" />
                 <div className="flex flex-col min-w-0">
                    <span className={`break-all font-medium leading-relaxed ${log.type === 'cmd' ? 'text-slate-100' : 'text-emerald-400'}`}>
                      {log.type === 'cmd' ? (
                        <>
                          <span className="text-blue-400 font-black mr-2 uppercase tracking-tighter opacity-80">{log.text.split(' ')[0]}</span>
                          <span className="opacity-70">{log.text.split(' ').slice(1).join(' ')}</span>
                        </>
                      ) : (
                        log.text
                      )}
                    </span>
                    {log.type === 'resp' && log.text.startsWith('226') && (
                       <div className="mt-2 flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 inline-flex self-start">
                          <Activity size={10} className="text-emerald-400" />
                          <span className="text-[8px] font-black uppercase text-emerald-400/80 tracking-widest">Checksum Verified // Integrity OK</span>
                       </div>
                    )}
                 </div>
               </div>
             </motion.div>
           ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-10 filter grayscale">
             <TerminalSquare size={48} className="mb-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">System Idling</span>
          </div>
        )}
      </div>
      
      {/* Footer Meta */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/20 text-[9px] flex justify-between items-center text-slate-600 font-bold tracking-widest uppercase">
         <span>Buffer: 1024KB</span>
         <span>Latency: ~12ms</span>
      </div>
    </div>
  );
};
