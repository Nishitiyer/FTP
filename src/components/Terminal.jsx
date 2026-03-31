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
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md rounded-lg overflow-hidden border border-[#0ea5e9]/10">
      <div className="flex items-center justify-between p-4 border-b border-[#0ea5e9]/10 bg-[#0ea5e9]/5">
        <div className="flex items-center gap-3">
           <TerminalIcon size={14} className="text-[#0ea5e9]" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0ea5e9]/80">Transmission_Protocol_Log</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest px-2 py-0.5 rounded bg-emerald-500/10">Active_Link</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-3 terminal-font text-[12px] custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
           {logs.map((log, i) => (
             <motion.div 
               key={`${log.timestamp}-${i}`}
               initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
               className={`flex items-start gap-4 ${log.type === 'cmd' ? 'text-blue-300' : 'text-emerald-300'}`}
             >
               <span className="text-sky-500/30 font-bold select-none tabular-nums mt-1 text-[9px] uppercase tracking-tighter">
                 {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </span>
               <div className="flex gap-2 flex-1 min-w-0">
                 <div className="flex flex-col min-w-0">
                    <span className={`break-all font-medium leading-relaxed ${log.type === 'cmd' ? 'text-[#0ea5e9]' : 'text-emerald-400'}`}>
                      {log.type === 'cmd' ? (
                        <>
                          <span className="font-black mr-2 uppercase tracking-tighter text-sky-400/50">OUTGOING_{">"}</span>
                          <span className="opacity-90">{log.text}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-black mr-2 uppercase tracking-tighter text-emerald-400/50">INCOMING_{"<"}</span>
                          <span className="opacity-90">{log.text}</span>
                        </>
                      )}
                    </span>
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
      
      {/* Footer HUD meta */}
      <div className="px-4 py-2 border-t border-[#0ea5e9]/5 bg-[#0ea5e9]/5 text-[8px] flex justify-between items-center text-[#0ea5e9]/40 font-bold tracking-widest uppercase">
         <div className="flex gap-4">
            <span>Buffer: 1024KB</span>
            <span>Bitrate: 2.4GBPS</span>
         </div>
         <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-0.5 bg-[#0ea5e9]/20" />)}
         </div>
      </div>
    </div>
  );
};
