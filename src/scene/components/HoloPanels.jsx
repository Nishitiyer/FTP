import React from 'react';
import { Html, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

export const HoloLabel = ({ position, title, subtitle, width = 1.8, rotate = 0, color = "#65e9ff" }) => (
  <group position={position} rotation={[0, rotate, 0]}>
    <mesh>
      <planeGeometry args={[width, subtitle ? 0.52 : 0.32]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[width, subtitle ? 0.52 : 0.32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
    <Text position={[-width / 2 + 0.08, 0.08, 0.02]} anchorX="left" fontSize={0.1} color="#ddfbff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
      {title}
    </Text>
    {subtitle && (
      <Text position={[-width / 2 + 0.08, -0.08, 0.02]} anchorX="left" fontSize={0.07} color={color} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
        {subtitle}
      </Text>
    )}
  </group>
);

export const HoloPanel3D = ({ position, rotation = [0, 0, 0], width = 2.4, height = 1.1, title, rows, color = "#73f1ff" }) => (
  <group position={position} rotation={rotation}>
    {/* Refractive Shield Face */}
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
    
    {/* HUD Frame */}
    <Line 
      points={[[-width/2, height/2, 0], [width/2, height/2, 0], [width/2, -height/2, 0], [-width/2, -height/2, 0], [-width/2, height/2, 0]]} 
      color={color} 
      lineWidth={1} 
      transparent 
      opacity={0.8} 
    />
    
    <Text position={[-width/2 + 0.12, height/2 - 0.16, 0.02]} anchorX="left" fontSize={0.14} color="#dcfdff" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
      {title}
    </Text>
    
    {rows.map((row, i) => (
      <Text key={i} position={[-width/2 + 0.12, height/2 - 0.38 - i * 0.18, 0.02]} anchorX="left" fontSize={0.09} color={i === 0 ? color : "#bff8ff"} font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe62o-9ETq98pR8pW7W58Xp.woff">
        {row}
      </Text>
    ))}
  </group>
);
