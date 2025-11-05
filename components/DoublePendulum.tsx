import React, { useRef, useEffect, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { RigidBody, useRevoluteJoint, RapierRigidBody } from '@react-three/rapier';
import { Sphere, Cylinder, Line } from '@react-three/drei';
// FIX: Import Vector3 directly from 'three' to resolve issues with namespaced access.
import { Vector3 } from 'three';
import useSimulationStore from '../store/useSimulationStore';
import useDataStore from '../store/useDataStore';

const PENDULUM_LENGTH = 3;
const BOB1_ID = 'pendulum-bob-1';
const BOB2_ID = 'pendulum-bob-2';
const MAX_TRAIL_LENGTH = 300;
const ANCHOR_Y_POSITION = PENDULUM_LENGTH * 2 + 0.5; // Position anchor high above ground

interface DoublePendulumProps {
  manageBodyRef: (id: string, ref: RapierRigidBody | null) => void;
}

const DoublePendulum: React.FC<DoublePendulumProps> = ({ manageBodyRef }) => {
  const { mass1, mass2, gravityY, interactionMode, setForceState, showTrails } = useSimulationStore();
  
  const addEnergyDataPoint = useDataStore((state) => state.addEnergyDataPoint);
  const clearHistory = useDataStore((state) => state.clearHistory);

  const anchorRef = useRef<RapierRigidBody>(null);
  const bob1Ref = useRef<RapierRigidBody>(null);
  const bob2Ref = useRef<RapierRigidBody>(null);
  const rod1Ref = useRef<any>(null);
  const rod2Ref = useRef<any>(null);

  const energyRef = useRef({ ke: 0, pe: 0 });
  
  const [trail1, setTrail1] = useState<Vector3[]>([]);
  const [trail2, setTrail2] = useState<Vector3[]>([]);

  const anchorPosition: [number, number, number] = [0, ANCHOR_Y_POSITION, 0];
  const bob1StartPos: [number, number, number] = [0, ANCHOR_Y_POSITION - PENDULUM_LENGTH, 0];
  const bob2StartPos: [number, number, number] = [0, ANCHOR_Y_POSITION - PENDULUM_LENGTH * 2, 0];

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
    if (bob1Ref.current) manageBodyRef(BOB1_ID, bob1Ref.current);
    if (bob2Ref.current) manageBodyRef(BOB2_ID, bob2Ref.current);
    return () => {
        manageBodyRef(BOB1_ID, null);
        manageBodyRef(BOB2_ID, null);
    };
  }, [manageBodyRef]);
  
  // Effect to clear trails if toggled off
  useEffect(() => {
    if (!showTrails) {
      setTrail1([]);
      setTrail2([]);
    }
  }, [showTrails]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>, bobId: string) => {
    event.stopPropagation();
    if (interactionMode === 'force') {
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        setForceState({
            objectId: bobId,
            startPoint: event.point.toArray(),
        });
    }
  };

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
    const anchorPos = new Vector3().fromArray(anchorPosition);
    const bob1PosVec = bob1Ref.current.translation();
    const bob2PosVec = bob2Ref.current.translation();
    const bob1Pos = new Vector3(bob1PosVec.x, bob1PosVec.y, bob1PosVec.z);
    const bob2Pos = new Vector3(bob2PosVec.x, bob2PosVec.y, bob2PosVec.z);


    const updateRod = (rod: any, start: Vector3, end: Vector3) => {
        const vec = end.clone().sub(start);
        const length = vec.length();
        rod.scale.y = length;
        rod.position.copy(start.clone().add(vec.clone().multiplyScalar(0.5)));
        // FIX: Use the directly imported Vector3 class.
        rod.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), vec.normalize());
    }
    
    updateRod(rod1Ref.current, anchorPos, bob1Pos);
    updateRod(rod2Ref.current, bob1Pos, bob2Pos);
    
    // Update Trails
    if (showTrails) {
        setTrail1(prev => {
            const newTrail = [...prev, bob1Pos.clone()];
            if (newTrail.length > MAX_TRAIL_LENGTH) newTrail.shift();
            return newTrail;
        });
        setTrail2(prev => {
            const newTrail = [...prev, bob2Pos.clone()];
            if (newTrail.length > MAX_TRAIL_LENGTH) newTrail.shift();
            return newTrail;
        });
    }

    // High frequency energy calculation
    const v1 = bob1Ref.current.linvel();
    const v2 = bob2Ref.current.linvel();

    const speed1Sq = v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
    const speed2Sq = v2.x * v2.x + v2.y * v2.y + v2.z * v2.z;
    
    const ke = 0.5 * mass1 * speed1Sq + 0.5 * mass2 * speed2Sq;
    const pe = mass1 * -gravityY * bob1PosVec.y + mass2 * -gravityY * bob2PosVec.y;

    energyRef.current = { ke, pe };
  });

  return (
    <>
      {/* Trails */}
      {/* FIX: The <Line /> component throws a RangeError if it receives fewer than 2 points.
          Conditionally render the trails only when their point arrays are long enough to form a line. */}
      {showTrails && (
        <>
          {trail1.length > 1 && <Line points={trail1} color="#c026d3" lineWidth={2} transparent opacity={0.6} />}
          {trail2.length > 1 && <Line points={trail2} color="#4338ca" lineWidth={2} transparent opacity={0.6} />}
        </>
      )}

      {/* Anchor */}
      <RigidBody ref={anchorRef} type="fixed" colliders={false} position={anchorPosition}>
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
        <Sphere 
            args={[0.5]} 
            castShadow
            onPointerDown={(e) => handlePointerDown(e, BOB1_ID)}
            onPointerUp={(e) => (e.target as HTMLElement).releasePointerCapture(e.pointerId)}
        >
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
        <Sphere 
            args={[0.5]} 
            castShadow
            onPointerDown={(e) => handlePointerDown(e, BOB2_ID)}
            onPointerUp={(e) => (e.target as HTMLElement).releasePointerCapture(e.pointerId)}
        >
          <meshStandardMaterial color="#4338ca" />
        </Sphere>
      </RigidBody>
    </>
  );
};

export default DoublePendulum;