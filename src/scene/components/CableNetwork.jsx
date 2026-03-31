import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HoloLabel } from './HoloPanels';

const CurveTube = ({ p1, p2, color, radius, opacity = 0.8, offset = 0 }) => {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    // Arcing control point based on reference
    const mid = new THREE.Vector3(0, 15 + offset, 15);
    return new THREE.CatmullRomCurve3([v1, mid, v2]);
  }, [p1, p2, offset]);
  
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 100, radius, 12, false), [curve, radius]);
  
  return (
    <group>
      {/* Outer Glow Tube */}
      <mesh geometry={geometry}>
        <meshPhysicalMaterial 
          color={color} 
          transmission={1} 
          transparent 
          opacity={0.15} 
          roughness={0} 
          metalness={1} 
        />
      </mesh>
      {/* Core Laser Tube */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

export const CableNetwork = ({ active, progress, direction }) => {
  return (
    <group>
      {/* 1. CONTROL CHANNEL - TOP */}
      <CurveTube 
        p1={[-2.8, 0, 1.0]} 
        p2={[3.3, 1.2, -0.05]} 
        color="#0ea5e9" 
        radius={0.06} 
        offset={5}
      />
      <HoloLabel position={[0.42, 4.4, 6.2]} title="FTP LINK" subtitle="LIVE_TRANSFER_BUS" color="#0ea5e9" width={1.8} rotate={-0.1} />
      
      {/* 2. DATA CHANNEL - CENTER */}
      <CurveTube 
        p1={[-2.8, -0.2, 1.05]} 
        p2={[3.3, 0.4, -0.05]} 
        color="#10b981" 
        radius={0.08} 
        offset={2}
        opacity={active ? 1 : 0.2}
      />
      <HoloLabel position={[1.25, 2.8, 5.8]} title="DATA CHANNEL (Port 20)" color="#10b981" width={2.0} rotate={-0.1} />

      {/* 3. BACKUP CHANNEL - BOTTOM/BURIED */}
      <CurveTube 
        p1={[-2.8, -0.35, 1.1]} 
        p2={[3.3, -0.35, -0.05]} 
        color="#94a3b8" 
        radius={0.04} 
        offset={-5}
        opacity={0.1}
      />
      <HoloLabel position={[0.85, 1.6, 5.4]} title="BACKUP CHANNEL (Port 2022)" color="#94a3b8" width={2.1} rotate={-0.1} />

      {/* 4. SECURE CHANNEL */}
      <CurveTube 
        p1={[-2.8, -0.4, 1.1]} 
        p2={[3.2, -4.5, -0.05]} 
        color="#0ea5e9" 
        radius={0.04} 
        offset={-15}
        opacity={0.05}
      />
      <HoloLabel position={[2.22, -0.8, -1.2]} title="SECURE CHANNEL (Port 2222)" color="#0ea5e9" width={2.2} rotate={-0.1} />

      {/* Floating Packets - only if active */}
      {active && <MovingPackets progress={progress} direction={direction} />}
    </group>
  );
};

const MovingPackets = ({ progress, direction }) => {
  const group = useRef();
  const count = 9;
  
  useFrame((state) => {
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const t = ((progress / 100) + i * 0.11) % 1;
        const p = direction === "upload" ? t : 1 - t;
        
        const x = THREE.MathUtils.lerp(-2.8, 3.3, p);
        const y = THREE.MathUtils.lerp(0.5, 0.8, Math.sin(p * Math.PI));
        const z = THREE.MathUtils.lerp(1.0, 0, p);
        
        child.position.set(x, y, z);
        child.rotation.y += 0.05;
      });
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial emissive={i % 2 ? "#6cf4ff" : "#ffd577"} emissiveIntensity={5} color={i % 2 ? "#0ea5e9" : "#ffbe5c"} />
          <pointLight color={i % 2 ? "#6cf4ff" : "#ffd577"} intensity={1} distance={2} />
        </mesh>
      ))}
    </group>
  );
};
