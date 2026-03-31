import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  ContactShadows, 
  Html,
  Environment,
  Stars,
  PerspectiveCamera,
  Line,
  BakeShadows,
  OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';
import { FTP_STATES } from '../logic/ftpProtocol';

const RefractiveOrb = ({ position, color, active, label, icon: Icon }) => {
  const mesh = useRef();
  
  // Custom glass material settings for that "premium" look
  const config = {
    backside: true,
    backsideThickness: 0.3,
    samples: 16,
    resolution: 1024,
    transmission: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.0,
    thickness: 0.3,
    chromaticAberration: 0.5,
    anisotropy: 0.3,
    roughness: 0,
    distortion: 0.5,
    distortionScale: 0.1,
    temporalDistortion: 0.2,
    ior: 1.5,
    color: color,
    g_color: color,
  };

  useFrame((state) => {
    if (active) {
      mesh.current.rotation.y += 0.01;
      mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={mesh} receiveShadow castShadow>
          <sphereGeometry args={[1.2, 64, 64]} />
          <MeshTransmissionMaterial {...config} />
        </mesh>
        
        {/* Internal Core Glow */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 0.8 : 0.2} />
        </mesh>
      </Float>

      {/* Holographic Label */}
      <Html position={[0, -2, 0]} center transform distanceFactor={5}>
        <div className={`p-4 hologram-panel select-none pointer-events-none transition-all duration-500 ${active ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
           <h3 className="text-xl font-black uppercase tracking-widest text-[#0ea5e9]/80 mb-0.5">{label}</h3>
           <div className={`h-1 w-full bg-gradient-to-r from-transparent via-${active ? 'blue' : 'slate'}-500/50 to-transparent`} />
        </div>
      </Html>
    </group>
  );
};

const NeuralPath = ({ p1, p2, active, type }) => {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p1),
      new THREE.Vector3((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 2, (p1[2] + p2[2]) / 2),
      new THREE.Vector3(...p2)
    ]);
    return curve.getPoints(50);
  }, [p1, p2]);

  const progress = useRef(0);
  const color = type === 'control' ? '#0ea5e9' : '#10b981';

  return (
    <group>
      <Line 
        points={points} 
        color={color} 
        lineWidth={1} 
        transparent 
        opacity={active ? 0.3 : 0.1} 
      />
      {active && (
         <NeuralPulse points={points} color={color} />
      )}
    </group>
  );
};

const NeuralPulse = ({ points, color }) => {
  const sphere = useRef();
  const pointIndex = useRef(0);

  useFrame(() => {
    pointIndex.current = (pointIndex.current + 1) % points.length;
    sphere.current.position.copy(points[pointIndex.current]);
  });

  return (
    <mesh ref={sphere}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
      <pointLight distance={2} intensity={5} color={color} />
    </mesh>
  );
};

export const Scene = ({ ftpState, packets }) => {
  return (
    <div className="canvas-container h-screen w-full">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 2.2} 
          minAzimuthAngle={-Math.PI / 6} 
          maxAzimuthAngle={Math.PI / 6}
        />
        
        <color attach="background" args={['#020617']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -5, -5]} intensity={1} color="#0ea5e9" />
        <spotLight position={[0, 10, 0]} intensity={2} penumbra={1} castShadow />

        {/* Backdrop Visuals */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <gridHelper args={[100, 20, '#1e293b', '#0f172a']} position={[0, -5, 0]} />

        {/* Nodes */}
        <RefractiveOrb 
          position={[-5, 0, 0]} 
          color="#0ea5e9" 
          label="Nexus Client" 
          active={ftpState !== FTP_STATES.DISCONNECTED} 
        />
        <RefractiveOrb 
          position={[5, 0, 0]} 
          color="#10b981" 
          label="Aether Core" 
          active={ftpState === FTP_STATES.LOGGED_IN} 
        />

        {/* Connection Paths */}
        <NeuralPath 
          p1={[-5, 0, 0]} 
          p2={[5, 0, 0]} 
          active={packets.length > 0} 
          type={packets.some(p => p.type === 'control') ? 'control' : 'data'} 
        />

        {/* Reflection Environment */}
        <Environment preset="city" />
        <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
        <BakeShadows />
      </Canvas>
    </div>
  );
};
