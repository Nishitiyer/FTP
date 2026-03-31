import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideCommand, FileInput, Activity } from 'lucide-react';

export const NetworkPipeline = ({ packets = [] }) => {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center h-full px-4 overflow-hidden">
      {/* Port Labels */}
      <div className="absolute top-4 left-4 flex flex-col items-center gap-1 opacity-60">
        <span className="text-[10px] uppercase font-bold tracking-tighter text-blue-400">Port 21 (Control)</span>
        <div className="w-px h-8 bg-blue-500/30" />
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 opacity-60">
        <div className="w-px h-8 bg-emerald-500/30" />
        <span className="text-[10px] uppercase font-bold tracking-tighter text-emerald-400">Port 20 (Data)</span>
      </div>

      {/* Main Connection Lines */}
      <div className="absolute w-[80%] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent top-1/2 -translate-y-12 opacity-50" />
      <div className="absolute w-[80%] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent top-1/2 translate-y-12 opacity-50" />

      {/* Connection Glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-48 h-48 bg-primary rounded-full blur-[100px] animate-pulse-soft" />
      </div>

      {/* Animated Packets */}
      <AnimatePresence>
        {packets.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.dir === 'c2s' ? -150 : 150, opacity: 0, scale: 0.5 }}
            animate={{ x: p.dir === 'c2s' ? 150 : -150, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className={`absolute flex items-center gap-2 p-2 rounded-full glass-card border border-${p.type === 'control' ? 'blue-500/50' : 'emerald-500/50'} shadow-lg z-10`}
            style={{ 
              top: p.type === 'control' ? 'calc(50% - 48px)' : 'calc(50% + 48px)',
            }}
          >
            <div className={`p-1.5 rounded-full ${p.type === 'control' ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
              {p.type === 'control' ? (
                <LucideCommand size={14} className="text-blue-400" />
              ) : (
                <FileInput size={14} className="text-emerald-400" />
              )}
            </div>
            <span className="text-[10px] font-mono font-bold pr-2 text-white/90">
              {p.label}
            </span>
            
            {/* Trailing Glow */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={`absolute -left-12 -right-12 h-px bg-gradient-to-r ${p.dir === 'c2s' ? 'from-transparent to-primary' : 'from-primary to-transparent'} opacity-30 blur-sm -z-10`} 
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="z-10 text-center flex flex-col items-center gap-2 opacity-50">
        <Activity size={24} className="text-slate-600 animate-pulse" />
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Network Pipeline Active</span>
      </div>
    </div>
  );
};
