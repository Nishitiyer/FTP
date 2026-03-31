import React from 'react';
import { RoundedBox, Edges, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const FtpClient = ({ position, files, selectedFile }) => (
  <group position={position}>
    {/* Industrial Platform Chassis */}
    <RoundedBox args={[2.8, 0.4, 2.2]} radius={0.08} smoothness={4}>
      <meshStandardMaterial color="#8cb5ca" metalness={0.9} roughness={0.1} emissive="#0ea5e9" emissiveIntensity={0.1} />
      <Edges color="#0ea5e9" opacity={0.6} />
    </RoundedBox>
    
    <RoundedBox args={[2.4, 0.15, 1.8]} position={[0, 0.25, 0]} radius={0.04}>
      <meshStandardMaterial color="#000" metalness={1} roughness={0} />
      <Edges color="#0ea5e9" opacity={1} />
    </RoundedBox>

    {/* Floating Data Cubes */}
    <group position={[0, 0.6, 0]}>
      {files.map((file, i) => {
        const x = (i % 2 - 0.5) * 0.8;
        const z = (Math.floor(i/2) - 0.5) * 0.8;
        const isActive = selectedFile?.name === file.name;
        
        return (
          <Float key={file.name} speed={2} rotationIntensity={1} floatIntensity={0.5} position={[x, 0, z]}>
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <MeshTransmissionMaterial 
                thickness={2} 
                anisotropy={0.5} 
                ior={1.3} 
                transmission={1} 
                color={file.color} 
                emissive={file.color}
                emissiveIntensity={isActive ? 3 : 0.8}
              />
              <Edges color="#fff" opacity={0.5} />
            </mesh>
          </Float>
        );
      })}
    </group>

    {/* Labels */}
    <Float speed={1} rotationIntensity={0.1}>
      <mesh position={[0, -0.4, 1.3]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} />
      </mesh>
    </Float>
  </group>
);
