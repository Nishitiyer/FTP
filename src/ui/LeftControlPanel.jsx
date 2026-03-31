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
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
    <span className="tech-label">{label}</span>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="tech-value"
      style={{ 
        background: 'rgba(0,0,0,0.6)', 
        border: '1px solid rgba(14,165,233,0.1)', 
        padding: 8, 
        outline: 'none', 
        borderRadius: 8 
      }}
    />
  </div>
);

const CyberButton = ({ label, onClick, active, variant = "primary" }) => (
  <button 
    onClick={onClick}
    className={`cyber-button ${variant === 'primary' ? '' : 'cyber-button-disabled'} ${active ? 'active' : ''}`}
    style={active ? { boxShadow: '0 0 15px #10b981', borderColor: '#10b981' } : {}}
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
  <aside className="sidebar cyber-panel">
    
    <div style={{ marginBottom: 20 }}>
      <h1 className="tech-title" style={{ fontSize: 24, margin: 0 }}>NEXUS_FTP_V4</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, opacity: 0.6 }}>
        <ShieldCheck size={14} color="#0ea5e9" />
        <span className="tech-label" style={{ fontSize: 8 }}>SHIELD_PROTOCOL_ACTIVE</span>
      </div>
    </div>

    {/* Stage 1: Handshake Controls */}
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Settings size={14} color="#0ea5e9" />
        <span className="tech-label">COMMAND_CONSOLE</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <CyberButton label="CONNECT" onClick={() => setStage(FTP_STAGES.CONNECTED)} active={stage !== FTP_STAGES.IDLE} />
        <CyberButton label="LOGIN" onClick={() => setStage(FTP_STAGES.AUTHENTICATED)} active={stage === FTP_STAGES.AUTHENTICATED} variant="secondary" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <CyberButton label="UPLOAD" variant="secondary" onClick={() => onTransfer('upload')} />
        <CyberButton label="DOWNLOAD" variant="secondary" onClick={() => onTransfer('download')} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
         <button onClick={() => setMode('ACTIVE')} className="cyber-button" style={mode === 'ACTIVE' ? { background: '#0ea5e9', color: '#000' } : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>ACTIVE</button>
         <button onClick={() => setMode('PASSIVE')} className="cyber-button" style={mode === 'PASSIVE' ? { background: '#0ea5e9', color: '#000' } : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>PASSIVE</button>
         <button onClick={() => setSecure(!secure)} className="cyber-button" style={secure ? { background: '#10b981', color: '#000', borderColor: '#10b981' } : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>SECURE</button>
      </div>
    </section>

    {/* Stage 2: Endpoint Details */}
    <section style={{ marginTop: 20 }}>
       <CyberInput label="REMOTE_HOST_IP" value={ip} onChange={e => setIp(e.target.value)} />
       <CyberInput label="REMOTE_PORT" value={port} onChange={e => setPort(e.target.value)} />
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <CyberInput label="AUTH_USER" value={user} onChange={e => setUser(e.target.value)} />
          <CyberInput label="AUTH_PASS" value={pass} onChange={e => setPass(e.target.value)} type="password" />
       </div>
    </section>

    {/* Stage 3: Local Archive */}
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Database size={14} color="#0ea5e9" />
        <span className="tech-label">LOCAL_FS_ARCHIVE</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {files.map(file => (
          <div 
            key={file.name} 
            onClick={() => setSelectedFile(file)}
            style={{ 
              padding: 12, 
              borderRadius: 12, 
              border: `1px solid ${selectedFile?.name === file.name ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.05)'}`,
              background: selectedFile?.name === file.name ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 900 }}>{file.name}</span>
              <span style={{ fontSize: 9, opacity: 0.5 }}>{file.size}</span>
            </div>
            <div style={{ marginTop: 4, height: 2, background: 'rgba(14,165,233,0.1)', borderRadius: 2 }}>
               <div style={{ height: '100%', width: '100%', background: file.color, opacity: 0.4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  </aside>
);
