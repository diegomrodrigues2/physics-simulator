import React, { Suspense, useRef, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { OrbitControls, Environment, Grid, Line } from '@react-three/drei';
// FIX: Import Vector3 directly from 'three' to resolve issues with namespaced access.
import { Vector3 } from 'three';
import useSimulationStore from '../store/useSimulationStore';
import PointParticle from './FallingSphere';

const FORCE_MULTIPLIER = 5;

const PhysicsScene: React.FC = () => {
  const { gravityY, paused, objects, interactionMode, addObject, selectObject, forceState, setForceState } = useSimulationStore();
  const bodyRefs = useRef<Map<string, RapierRigidBody>>(new Map());
  const [forceVectorVisual, setForceVectorVisual] = useState<{ start: [number, number, number], end: [number, number, number] } | null>(null);
  
  const handleSceneClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactionMode === 'add') {
      // FIX: event.point is now available because the handler is on a mesh inside the Canvas.
      const point = event.point;
      addObject([point.x, 0.5, point.z]);
    } else if (interactionMode === 'select' || interactionMode === 'force') {
        selectObject(null);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (forceState) {
        setForceVectorVisual({
            start: forceState.startPoint,
            // FIX: event.point is now available because the handler is on a mesh inside the Canvas.
            end: event.point.toArray(),
        });
    }
  };

  const handlePointerUp = () => {
    if (forceState && forceVectorVisual) {
        const bodyRef = bodyRefs.current.get(forceState.objectId);
        if (bodyRef) {
            // FIX: Use the directly imported Vector3 class.
            const start = new Vector3().fromArray(forceState.startPoint);
            // FIX: Use the directly imported Vector3 class.
            const end = new Vector3().fromArray(forceVectorVisual.end);
            const impulse = end.sub(start).multiplyScalar(FORCE_MULTIPLIER);
            bodyRef.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
        }
        setForceState(null);
        setForceVectorVisual(null);
    }
  };


  return (
    <Canvas 
      camera={{ position: [0, 5, 15], fov: 50 }} 
      shadows
      // FIX: Removed event handlers from the Canvas component to fix type mismatches.
      // Handlers on the Canvas receive DOM events, not ThreeEvents, which caused errors when accessing 3D-specific properties like `event.point`.
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 10, 7.5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Physics gravity={[0, gravityY, 0]} paused={paused}>
            {/* Ground */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[50, 0.1, 50]} position={[0, -0.1, 0]} />
            </RigidBody>

            {/* Render all objects from the store */}
            {objects.map((obj) => (
                <PointParticle 
                  key={obj.id} 
                  objectData={obj}
                  onRefReady={(id, ref) => {
                    if (ref) bodyRefs.current.set(id, ref);
                    else bodyRefs.current.delete(id);
                  }}
                />
            ))}
        </Physics>
        
        {/* FIX: An invisible plane to catch pointer events for scene interactions. */}
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.11, 0]}
            onClick={handleSceneClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            visible={false}
        >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial opacity={0} transparent />
        </mesh>
        
        {forceVectorVisual && (
          <Line
            points={[forceVectorVisual.start, forceVectorVisual.end]}
            color="yellow"
            lineWidth={3}
          />
        )}
        
        <Grid infiniteGrid args={[10, 10]} sectionSize={5} sectionColor={"#60a5fa"} sectionThickness={1} cellSize={1} cellColor={"#3b82f6"} cellThickness={0.5} fadeDistance={50} fadeStrength={1} />
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
};

export default PhysicsScene;