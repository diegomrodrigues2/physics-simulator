import React, { useRef, useEffect } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Sphere } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import useSimulationStore from '../store/useSimulationStore';
import type { InteractiveObject } from '../types';

interface PointParticleProps {
  objectData: InteractiveObject;
  onRefReady: (id: string, ref: RapierRigidBody | null) => void;
}

const PointParticle: React.FC<PointParticleProps> = ({ objectData, onRefReady }) => {
  const { id, mass, position } = objectData;
  const { selectObject, selectedObjectId, interactionMode, setForceState } = useSimulationStore();

  const bodyRef = useRef<RapierRigidBody>(null!);
  const isSelected = selectedObjectId === id;

  useEffect(() => {
    if (bodyRef.current) {
        onRefReady(id, bodyRef.current);
    }
    return () => {
        onRefReady(id, null);
    };
  }, [id, onRefReady]);


  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); 
    selectObject(id);
  };
  
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
     event.stopPropagation();
     if (interactionMode === 'force') {
        // This allows dragging without moving the camera
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        setForceState({
            objectId: id,
            // FIX: Correctly access the 'point' property on the ThreeEvent.
            startPoint: event.point.toArray(),
        });
     }
  };

  return (
    <RigidBody
      ref={bodyRef}
      colliders="ball"
      position={position}
      mass={mass}
      restitution={0.7}
      key={id} 
    >
      <Sphere 
        args={[0.5]} 
        castShadow 
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={(e) => (e.target as HTMLElement).releasePointerCapture(e.pointerId)}
      >
        <meshStandardMaterial 
          color={isSelected ? '#f97316' : '#4338ca'} 
          emissive={isSelected ? '#f97316' : '#000000'} 
          emissiveIntensity={0.5} 
          metalness={0.2}
          roughness={0.3}
        />
      </Sphere>
    </RigidBody>
  );
};

export default PointParticle;