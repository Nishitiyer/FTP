import React from 'react';
import { RoundedBox, Edges, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const BackupServer = ({ position }) => (
  <group position={position}>
    {/* Monolith Tower Chassis */}
    <RoundedBox args={[1.2, 2.0, 1.2]} radius={0.08} smoothness={4}>
      <meshStandardMaterial color="#5f6670" metalness={0.9} roughness={0.2} emissive="#ff0000" emissiveIntensity={0.05} />
      <Edges color="#ff0000" opacity={0.3} />
    </RoundedBox>
    
    {/* Internal Core Receptor */}
    <mesh position={[0, 0.4, 0.6]}>
      <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} />
      <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={5} />
      <pointLight color="#ff3333" intensity={2} distance={5} />
    </mesh>
    
    {/* Core Glow Sphere */}
    <Sphere args={[0.22, 16, 16]} position={[0, 0.4, 0.58]}>
      <meshBasicMaterial color="#ff5555" transparent opacity={0.3} />
    </Sphere>

    {/* Labels */}
    <Text position={[0, 1.6, 0]} fontSize={0.18} color="#ffd0d8" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">BACKUP SERVER</Text>
    <Text position={[0, 1.35, 0]} fontSize={0.07} color="#ffb8c5" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">SERVER: 192.168.1.110</Text>
    
    {/* Cable Connection Point */}
    <mesh position={[0, -0.8, -0.6]} rotation={[Math.PI/2, 0, 0]}>
       <torusGeometry args={[0.15, 0.05, 12, 16]} />
       <meshBasicMaterial color="#ff3333" />
    </mesh>
  </group>
);
