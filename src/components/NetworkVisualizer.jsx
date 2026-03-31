import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideCommand, FileInput, Activity, Zap } from 'lucide-react';

export const NetworkPipeline = ({ packets = [] }) => {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
      
      {/* Dynamic Grid Overlay (Neural Layer) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
           <pattern id="neural-grid" width="10" height="10" patternUnits="userSpaceOnUse">
             <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
           </pattern>
           <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      {/* Connection Curves (SVG Paths) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {/* Control Path Curve */}
        <path 
           id="control-path"
           d="M 50,200 Q 400,150 750,200" 
           stroke="rgba(59, 130, 246, 0.15)"
           strokeWidth="2"
           fill="none"
           className="transition-opacity duration-500"
           style={{ transform: 'translateX(calc(50vw - 400px))' }}
        />
        {/* Data Path Curve */}
        <path 
           id="data-path"
           d="M 50,300 Q 400,350 750,300" 
           stroke="rgba(16, 185, 129, 0.15)"
           strokeWidth="2"
           fill="none"
           className="transition-opacity duration-500"
           style={{ transform: 'translateX(calc(50vw - 400px))' }}
        />
      </svg>

      {/* Animated Packets (Neural Pulse Edition) */}
      <AnimatePresence>
        {packets.map((p) => (
          <motion.div
            key={p.id}
            initial={{ offset: p.dir === 'c2s' ? 0 : 1, opacity: 0, scale: 0.2 }}
            animate={{ 
              offset: p.dir === 'c2s' ? 1 : 0, 
              opacity: [0, 1, 1, 0], 
              scale: [0.2, 1, 1, 0.5] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className={`absolute flex flex-col items-center gap-1 z-30`}
            style={{ 
              // We'll use framer-motion to animate 'offset' then anchor it using SVG path measurement if possible
              // But for simplicity in React, we'll use traditional motion with advanced easing
              left: p.dir === 'c2s' ? '15%' : '85%',
              x: p.dir === 'c2s' ? '70%' : '-70%',
              top: p.type === 'control' ? '30%' : '70%',
            }}
          >
            {/* The "Pulse" itself */}
            <div className={`relative p-2 rounded-full border border-${p.type === 'control' ? 'blue-400/50' : 'emerald-400/50'} shadow-lg glass-panel`}>
              <div className={`absolute inset-0 rounded-full blur-md opacity-30 ${p.type === 'control' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              {p.type === 'control' ? (
                <LucideCommand size={16} className="text-blue-300" />
              ) : (
                <Zap size={16} className="text-emerald-300" />
              )}
            </div>
            
            <div className="px-2 py-0.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
               <span className="text-[10px] font-mono font-bold text-white/80 tabular-nums lowercase tracking-widest">{p.label}</span>
            </div>

            {/* Trailing streak */}
            <div className={`absolute w-32 h-[1px] ${p.dir === 'c2s' ? 'right-full bg-gradient-to-l' : 'left-full bg-gradient-to-r'} from-${p.type === 'control' ? 'blue-500/50' : 'emerald-500/50'} to-transparent opacity-20 blur-sm`} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Central Visual Nexus */}
      <div className="z-10 text-center flex flex-col items-center gap-4 group cursor-help transition-all duration-500">
        <div className="relative">
           <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse-soft rounded-full" />
           <Activity size={40} className="text-slate-600/40 relative animate-pulse" />
        </div>
        <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Transmission Gateway</span>
           <div className="flex gap-1 mt-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: `${i*100}ms` }} />)}
           </div>
        </div>
      </div>
    </div>
  );
};
