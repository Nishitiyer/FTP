import React from 'react';
import { File, FileText, FastForward, Image as ImageIcon, Database, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const FileIcon = ({ type }) => {
  switch (type) {
    case 'img': return <ImageIcon size={18} className="text-emerald-400" />;
    case 'doc': return <FileText size={18} className="text-blue-400" />;
    case 'file': return <Box size={18} className="text-slate-400" />;
    default: return <File size={18} className="text-slate-400" />;
  }
};

export const FileExplorer = ({ files, title, onFileClick, active = false }) => {
  return (
    <div className={`flex flex-col h-full glass-panel p-6 transition-all duration-700 ${active ? 'border-primary/40 shadow-glow-blue' : 'opacity-40 grayscale-[80%] border-white/5'}`}>
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${active ? 'text-primary' : 'text-slate-600'}`}>
              <Database size={16} />
           </div>
           <h3 className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-100">{title}</h3>
        </div>
        <div className="flex gap-1.5">
           {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5" />)}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {files.map((file, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onFileClick?.(file)}
            className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10 transition-transform group-hover:translate-x-1">
              <FileIcon type={file.type} />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-100 group-hover:text-primary transition-colors">{file.name}</span>
                 <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{file.type || 'RAW_DATA'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-[10px] text-slate-600 font-mono font-bold tracking-tighter tabular-nums bg-black/20 px-2 py-0.5 rounded-md">{file.size}</span>
              <FastForward size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            
            {/* Hover Glow */}
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-700">
             <Box size={32} className="opacity-10 mb-4" />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] italic opacity-30">AWAITING_LIST_CMD</span>
          </div>
        )}
      </div>
    </div>
  );
};
