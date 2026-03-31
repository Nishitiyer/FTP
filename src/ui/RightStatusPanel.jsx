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
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s ease', opacity: active || done ? 1 : 0.2 }}>
    <div style={{ 
      width: 12, height: 12, borderRadius: 100, 
      background: done ? '#10b981' : active ? '#0ea5e9' : 'rgba(255,255,255,0.2)',
      boxShadow: done ? '0 0 10px #10b981' : active ? '0 0 10px #0ea5e9' : 'none'
    }} />
    <span className="tech-label" style={{ fontSize: 10 }}>{index + 1}. {label}</span>
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
    <aside className="sidebar cyber-panel">
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Navigation size={14} color="#0ea5e9" />
           <span className="tech-label">PROTOCOL_STAGES</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
          {steps.map((step, i) => <ProtocolStep key={i} index={i} {...step} />)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Activity size={14} color="#0ea5e9" />
           <span className="tech-label">TELEMETRY_DATAFEED</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span className="tech-label" style={{ opacity: 0.3, marginBottom: 4 }}>State</span>
             <span className="tech-value" style={{ color: '#10b981', fontStyle: 'italic', fontSize: 12 }}>{stage}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
             <span className="tech-label" style={{ opacity: 0.3, marginBottom: 4 }}>TX_Speed</span>
             <span className="tech-value" style={{ color: '#0ea5e9', fontStyle: 'italic', fontSize: 12 }}>{speed} MB/s</span>
          </div>
        </div>
        
        {activeTransfer && (
           <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span className="tech-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>TX: {activeTransfer.name}</span>
                 <span className="tech-label" style={{ color: '#10b981' }}>{progress}%</span>
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                 <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', boxShadow: '0 0 15px #10b981' }} />
              </div>
           </div>
        )}

        <div style={{ height: 60, background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 8, gap: 4 }}>
           {[...Array(14)].map((_, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(14,165,233,0.3)', height: `${Math.random()*100}%` }} />
           ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, marginTop: 24 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={14} color="#0ea5e9" />
            <span className="tech-label">TRANSMISSION_LOG</span>
         </div>
         <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
           {logs.map((log, i) => (
             <div key={i} style={{ fontSize: 10, fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                <span style={{ opacity: 0.3, marginRight: 8 }}>[{new Date().toLocaleTimeString()}]</span>
                <span style={{ color: log.type === 'CMD' ? '#0ea5e9' : '#10b981' }}>{log.text}</span>
             </div>
           ))}
         </div>
      </div>
    </aside>
  );
};
