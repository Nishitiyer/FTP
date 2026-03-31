import React from 'react';
import { RoundedBox, Edges, Text, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { HoloPanel3D } from './HoloPanels';

export const RemoteServer = ({ position, ip, active }) => (
  <group position={position}>
    {/* Primary Tower Chassis */}
    <RoundedBox args={[2.0, 3.8, 1.8]} radius={0.08} smoothness={4}>
      <meshStandardMaterial color="#61717c" metalness={0.9} roughness={0.1} emissive="#00ffff" emissiveIntensity={0.05} />
      <Edges color="#00ffff" opacity={0.3} />
    </RoundedBox>
    
    {/* Layered Detail Panels */}
    {[0.8, 1.6, 2.4].map(y => (
      <group key={y} position={[0, y - 1.9, 0]}>
         <RoundedBox args={[2.05, 0.4, 1.85]} radius={0.02}>
            <meshStandardMaterial color="#000" metalness={1} roughness={0.1} />
            <Edges color="#00ffff" opacity={0.5} />
         </RoundedBox>
      </group>
    ))}

    {/* Glowing Front Module - matching reference circle */}
    <Torus args={[0.5, 0.1, 16, 100]} position={[0, 0, 0.9]} rotation={[0, 0, 0]}>
      <meshStandardMaterial color="#ffbf67" emissive="#ffbc5f" emissiveIntensity={3} />
      <pointLight color="#ffbf67" intensity={4} distance={8} />
    </Torus>
    
    {/* Secondary Circle detail */}
    <mesh position={[0, 0, 1.0]} rotation={[Math.PI/2, 0, 0]}>
       <ringGeometry args={[0.3, 0.4, 32]} />
       <meshBasicMaterial color="#ffbc5f" transparent opacity={0.3} />
    </mesh>

    {/* Integrated Floating Panel - Remote Files */}
    <HoloPanel3D 
      position={[-1.2, 0.8, 1.2]} 
      rotation={[0, 0.35, 0]} 
      width={1.6} 
      height={2.2} 
      title="REMOTE FILES" 
      rows={["/", "/wwroot", "images/", "logs/", "bin/"]}
      color="#0ea5e9"
    />

    {/* Labels */}
    <Text position={[0, 2.2, 0]} fontSize={0.18} color="#e0fcff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">REMOTE SERVER</Text>
    <Text position={[0, 2.0, 0]} fontSize={0.07} color="#b8f6ff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">FTP SERVER: {ip}</Text>
    
    <Text position={[0, -2.1, 0.9]} fontSize={0.18} color="#b8f6ff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">REMOTE SERVER</Text>
    
    {/* Floating Robot nearby */}
    <group position={[1.5, -1.8, 1.2]}>
       <mesh><boxGeometry args={[0.2, 0.2, 0.2]} /><meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} /></mesh>
       <Text position={[0, 0.25, 0]} fontSize={0.05} color="#0ea5e9">WORKER_ND</Text>
    </group>
  </group>
);
