
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRevoluteJoint } from '@react-three/rapier';
import { Sphere, Cylinder } from '@react-three/drei';
// FIX: Import Vector3 directly from 'three' to resolve issues with namespaced access.
import { Vector3 } from 'three';
import useSimulationStore from '../store/useSimulationStore';
import useDataStore from '../store/useDataStore';

const PENDULUM_LENGTH = 3;

const DoublePendulum: React.FC = () => {
  const mass1 = useSimulationStore((state) => state.mass1);
  const mass2 = useSimulationStore((state) => state.mass2);
  const gravityY = useSimulationStore((state) => state.gravityY);
  
  const addEnergyDataPoint = useDataStore((state) => state.addEnergyDataPoint);
  const clearHistory = useDataStore((state) => state.clearHistory);

  const anchorRef = useRef<any>(null);
  const bob1Ref = useRef<any>(null);
  const bob2Ref = useRef<any>(null);
  const rod1Ref = useRef<any>(null);
  const rod2Ref = useRef<any>(null);

  const energyRef = useRef({ ke: 0, pe: 0 });

  const bob1StartPos: [number, number, number] = [0, -PENDULUM_LENGTH, 0];
  const bob2StartPos: [number, number, number] = [0, -PENDULUM_LENGTH * 2, 0];

  // Joint 1: Anchor to Bob1
  useRevoluteJoint(anchorRef, bob1Ref, [
    [0, 0, 0], // Anchor point on anchor body
    [0, PENDULUM_LENGTH / 2, 0], // Anchor point on bob1 body
    [0, 0, 1], // Axis of rotation
  ]);

  // Joint 2: Bob1 to Bob2
  useRevoluteJoint(bob1Ref, bob2Ref, [
    [0, -PENDULUM_LENGTH / 2, 0], // Anchor point on bob1 body
    [0, PENDULUM_LENGTH / 2, 0], // Anchor point on bob2 body
    [0, 0, 1], // Axis of rotation
  ]);

  useEffect(() => {
    clearHistory();
    const interval = setInterval(() => {
      addEnergyDataPoint({
        kineticEnergy: energyRef.current.ke,
        potentialEnergy: energyRef.current.pe,
        totalEnergy: energyRef.current.ke + energyRef.current.pe,
      });
    }, 100); // Throttled update every 100ms

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (!bob1Ref.current || !bob2Ref.current || !rod1Ref.current || !rod2Ref.current) return;

    // Update Rods
    // FIX: Use the directly imported Vector3 class.
    const anchorPos = new Vector3(0,0,0);
    const bob1Pos = bob1Ref.current.translation();
    const bob2Pos = bob2Ref.current.translation();

    const updateRod = (rod: any, start: Vector3, end: Vector3) => {
        const vec = end.clone().sub(start);
        const length = vec.length();
        rod.scale.y = length;
        rod.position.copy(start.clone().add(vec.clone().multiplyScalar(0.5)));
        // FIX: Use the directly imported Vector3 class.
        rod.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), vec.normalize());
    }
    
    // FIX: Use the directly imported Vector3 class.
    updateRod(rod1Ref.current, anchorPos, new Vector3(bob1Pos.x, bob1Pos.y, bob1Pos.z));
    // FIX: Use the directly imported Vector3 class.
    updateRod(rod2Ref.current, new Vector3(bob1Pos.x, bob1Pos.y, bob1Pos.z), new Vector3(bob2Pos.x, bob2Pos.y, bob2Pos.z));
    

    // High frequency energy calculation
    const v1 = bob1Ref.current.linvel();
    const v2 = bob2Ref.current.linvel();

    const speed1Sq = v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
    const speed2Sq = v2.x * v2.x + v2.y * v2.y + v2.z * v2.z;
    
    const ke = 0.5 * mass1 * speed1Sq + 0.5 * mass2 * speed2Sq;
    const pe = mass1 * -gravityY * bob1Pos.y + mass2 * -gravityY * bob2Pos.y;

    energyRef.current = { ke, pe };
  });

  return (
    <>
      {/* Anchor */}
      <RigidBody ref={anchorRef} type="fixed" colliders={false}>
        <Sphere args={[0.2]}>
          <meshStandardMaterial color="white" />
        </Sphere>
      </RigidBody>
      
      {/* Rod 1 */}
      <group ref={rod1Ref}>
        <Cylinder args={[0.05, 0.05, 1, 8]} castShadow>
          <meshStandardMaterial color="grey" />
        </Cylinder>
      </group>
      
      {/* Bob 1 */}
      <RigidBody ref={bob1Ref} position={bob1StartPos} colliders="ball" mass={mass1} >
        <Sphere args={[0.5]} castShadow>
          <meshStandardMaterial color="#c026d3" />
        </Sphere>
      </RigidBody>

      {/* Rod 2 */}
       <group ref={rod2Ref}>
        <Cylinder args={[0.05, 0.05, 1, 8]} castShadow>
          <meshStandardMaterial color="grey" />
        </Cylinder>
      </group>

      {/* Bob 2 */}
      <RigidBody ref={bob2Ref} position={bob2StartPos} colliders="ball" mass={mass2}>
        <Sphere args={[0.5]} castShadow>
          <meshStandardMaterial color="#4338ca" />
        </Sphere>
      </RigidBody>
    </>
  );
};

export default DoublePendulum;