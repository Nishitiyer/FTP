import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Html,
  Environment,
  Stars,
  PerspectiveCamera,
  OrbitControls,
  Edges,
  Box,
  MeshTransmissionMaterial,
  MeshWobbleMaterial,
  Torus
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

// -------------------------------------------------------------
// High-Fidelity Curved Glass HUD (Exact Mirror of Ref Image)
// -------------------------------------------------------------
const GlassHUD = ({ title, subtitle, items, color, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <Html transform distanceFactor={5} rotation={[0, 0, 0]}>
       <div style={{ 
          width: '360px', padding: '30px', 
          background: 'rgba(0, 0, 0, 0.4)', 
          backdropFilter: 'blur(32px) saturate(180%)', 
          borderLeft: `4px solid ${color}`,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0 40px 0 0',
          boxShadow: '0 30px 100px rgba(0,0,0,1)',
          position: 'relative'
       }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'rgba(14,165,233,0.3)', filter: 'blur(2px)' }} />
          <header style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
             <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5em', display: 'block', marginBottom: '4px' }}>{subtitle}</span>
             <h3 style={{ fontSize: '24px', fontWeight: 900, color: color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontStyle: 'italic' }}>{title}</h3>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {items.map((item, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
                     <span style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>{item.val}</span>
               </div>
             ))}
          </div>
       </div>
    </Html>
  </group>
);

const MonolithTower = ({ position, color, label, subtitle, items, active, onAction }) => (
  <group position={position} scale={4.5}>
     {/* Main Monolith Body */}
     <Box args={[3, 10, 3]}>
        <meshPhysicalMaterial color="#01040a" roughness={0.05} metalness={1} clearcoat={1} reflectivity={1} />
        <Edges color={color} opacity={0.4} />
     </Box>
     
     {/* Side Structural Fins */}
     {[-1.6, 1.6].map(x => (
       <Box key={x} args={[0.2, 8, 2.5]} position={[x, 0, 0]}>
          <meshPhysicalMaterial color="#020617" metalness={1} />
          <Edges color={color} opacity={0.6} />
       </Box>
     ))}

     {/* Floating Glowing Ring */}
     <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Torus args={[2.8, 0.04, 16, 100]} rotation={[Math.PI/2, 0, 0]} position={[0, 4, 0]}>
           <meshBasicMaterial color={color} transparent opacity={0.6} />
        </Torus>
     </Float>

     {/* Interactive Label (Clickable) */}
     <Html position={[0, 7, 0]} center transform distanceFactor={8}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
           <div style={{ padding: '8px 20px', background: 'rgba(0,0,0,0.8)', border: `1px solid ${color}`, borderRadius: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.4em' }}>{label}</span>
           </div>
           {onAction && (
             <button 
               onClick={onAction}
               style={{ 
                 background: color, color: 'black', border: 'none', 
                 padding: '10px 24px', fontSize: '10px', fontWeight: 900, 
                 textTransform: 'uppercase', letterSpacing: '0.3em', cursor: 'pointer',
                 boxShadow: `0 0 40px ${color}`
               }}
             >
                INITIALIZE_HANDSHAKE
             </button>
           )}
        </div>
     </Html>

     <GlassHUD 
        title={label} 
        subtitle={subtitle} 
        color={color} 
        position={[6, 0, 0]} 
        rotation={[0, -Math.PI/6, 0]}
        items={items}
     />
  </group>
);

const DataPipe = ({ p1, p2, color, label, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const mid = new THREE.Vector3(0, 15 + offset, 10);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 1.2, 16, false]} />
        <meshPhysicalMaterial color={color} transmission={0.9} transparent opacity={0.15} roughness={0} reflectivity={1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
        {/* Glow pulsing interior */}
        <pointLight color={color} intensity={10} distance={40} />
      </mesh>
      <Html position={[0, 12 + offset, 11]} center transform>
         <div style={{ background: 'rgba(0,0,0,0.8)', padding: '6px 20px', border: `1px solid ${color}`, borderRadius: '2px' }}>
           <span style={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5em' }}>{label}</span>
         </div>
      </Html>
    </group>
  );
};

export const Scene = ({ ftpState, activeTransfer, clientFiles, serverFiles, onCommand, onStart }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas shadows gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}>
        <PerspectiveCamera makeDefault position={[30, 45, 90]} fov={35} />
        <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 10} makeDefault />
        
        <color attach="background" args={['#000508']} />
        
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[60, 100, 40]} angle={0.4} penumbra={1} intensity={8} color="#0ea5e9" castShadow />
        <spotLight position={[-60, 100, -40]} angle={0.4} penumbra={1} intensity={4} color="#10b981" />
        <pointLight position={[0, 40, 0]} intensity={2} color="#ffffff" />

        <Stars radius={200} depth={50} count={12000} factor={6} fade speed={2} />
        <gridHelper args={[400, 60, '#ffffff08', '#ffffff08']} position={[0, -0.1, 0]} />

        {/* PRIMARY ACTORS: GIGANTIC MONOLITHS */}
        <MonolithTower 
          position={[-35, 0, 15]} 
          color="#0ea5e9" 
          label="NEXUS_CLIENT" 
          subtitle="SRC_NODE_ALPHA"
          items={[
             { label: "IP_V4", val: "192.168.1.100" },
             { label: "SSL_KEY", val: "AES_X256" },
             { label: "STATUS", val: ftpState }
          ]}
          onAction={ftpState === FTP_STATES.DISCONNECTED ? onStart : null}
        />

        <MonolithTower 
          position={[35, 0, -15]} 
          color="#10b981" 
          label="REMOTE_CORE" 
          subtitle="TARGET_NODE_HUB"
          items={[
             { label: "IP_V4", val: "104.22.7.201" },
             { label: "FS_TYPE", val: "VIRTUAL_DATA" },
             { label: "STATUS", val: activeTransfer ? "STREAMING" : "LISTENING" }
          ]}
        />

        {/* FTP LINK: HEAVY CONDUITS */}
        <DataPipe p1={[-30, 1, 15]} p2={[30, 12, -15]} color="#0ea5e9" label="CONTROL_CHANNEL_P21" />
        <DataPipe p1={[-30, 1, 15]} p2={[30, 1, -15]} color="#10b981" label="DATA_CHANNEL_P20" offset={-12} />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
