import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars, 
  Environment, 
  ContactShadows, 
  MeshReflectorMaterial 
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { FtpClient } from './components/FtpClient';
import { BackupServer } from './components/BackupServer';
import { RemoteServer } from './components/RemoteServer';
import { CableNetwork } from './components/CableNetwork';
import { HoloPanel3D } from './components/HoloPanels';

export const SimulatorScene = ({ 
  stage, 
  files, 
  selectedFile, 
  ip, 
  progress, 
  direction, 
  speed,
  activeTransfer 
}) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5.5, 6.0, 9.5]} fov={38} />
        <OrbitControls 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2.2} 
          minPolarAngle={Math.PI / 10} 
          minDistance={8} 
          maxDistance={25}
        />
        
        <color attach="background" args={['#000306']} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={6} color="#0ea5e9" castShadow />
        <rectAreaLight width={50} height={50} position={[0, 40, 0]} intensity={1.5} color="#ffffff" />

        <Stars radius={250} depth={50} count={20000} factor={6} fade speed={1.5} />
        
        {/* Floor Reflections - INDUSTRIAL GLASS GRID */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.1, 0]}>
           <planeGeometry args={[100, 100]} />
           <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={10}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#05080c"
              metalness={0.5}
           />
        </mesh>
        <gridHelper args={[100, 50, '#ffffff08', '#ffffff05']} position={[0, -1.05, 0]} />

        {/* PRIMARY ACTORS - Reference position matching */}
        <FtpClient position={[-2.65, -0.66, 1.05]} files={files} selectedFile={selectedFile} />
        <BackupServer position={[-3.1, 0.78, 2.45]} />
        <RemoteServer position={[3.3, 0.12, -0.05]} ip={ip} active={stage !== 'IDLE'} />
        
        {/* Cable Network Connections */}
        <CableNetwork active={stage === 'TRANSFERRING'} progress={progress} direction={direction} />

        {/* HUD Panels that aren't integrated into objects */}
        <HoloPanel3D 
          position={[-2.55, 0.18, 2.2]} 
          rotation={[0.03, 0.35, -0.08]} 
          width={2.2} 
          height={1.15} 
          title="SERVER SELECTION" 
          rows={["REMOTE SERVER (Connected)", "BACKUP SERVER (Standby)", "SECURE SERVER (Offline)"]}
        />

        <HoloPanel3D 
          position={[0.25, 4.5, 3.4]} 
          rotation={[-0.1, -0.1, -0.04]} 
          width={4.8} 
          height={2.25} 
          title="NEXUS_LINK_STATUS" 
          rows={[
            "ACTIVE_SSL_TUNNEL", 
            `TX: ${activeTransfer?.name || 'NULL' } (${activeTransfer?.size || '0 MB'})`, 
            `RATE: ${speed} MB/S`
          ]}
          color="#10b981"
        />

        {/* Postprocessing Stack */}
        <Suspense fallback={null}>
          <EffectComposer disableNormalPass>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.2} 
              luminanceSmoothing={0.9} 
              mipmapBlur 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <ChromaticAberration offset={[0.0005, 0.0005]} />
          </EffectComposer>
        </Suspense>

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};
