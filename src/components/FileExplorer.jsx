import React from 'react';
import { File, FileText, FastForward, Image as ImageIcon, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const FileIcon = ({ type }) => {
  switch (type) {
    case 'img': return <ImageIcon size={14} className="text-[#10b981]" />;
    case 'doc': return <FileText size={14} className="text-[#0ea5e9]" />;
    default: return <File size={14} className="text-sky-500/50" />;
  }
};

export const FileExplorer = ({ files, title, onFileClick, active = false }) => {
  return (
    <div className={`flex flex-col h-full hologram-panel p-6 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
      <div className="flex items-center justify-between mb-4 border-b border-[#0ea5e9]/20 pb-4">
        <div className="flex items-center gap-3">
           <Database size={16} className={active ? 'text-[#0ea5e9]' : 'text-slate-600'} />
           <h3 className="font-black text-[10px] tracking-[0.3em] uppercase text-sky-400/80">{title}</h3>
        </div>
        <div className="flex gap-1">
           {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-[#0ea5e9]/10 rounded-full" />)}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {files.map((file, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onFileClick?.(file)}
            className="group flex flex-col p-3 rounded bg-sky-500/5 border border-transparent hover:border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/10 cursor-pointer transition-all relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon type={file.type} />
                <span className="text-[11px] font-bold text-sky-100/90 tracking-tight">{file.name}</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-sky-500/50">{file.size}</span>
            </div>
            
            {/* HUD Status Bar (Animated on hover) */}
            <div className="mt-2 h-0.5 w-full bg-sky-500/10 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }} 
                 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                 className="h-full w-1/3 bg-[#0ea5e9]" 
               />
            </div>
          </motion.div>
        ))}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-20">
             <Cpu size={32} className="animate-pulse mb-2" />
             <span className="text-[8px] font-black uppercase tracking-[0.4em]">Awaiting_Link</span>
          </div>
        )}
      </div>
    </div>
  );
};
