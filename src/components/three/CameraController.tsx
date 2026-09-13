import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

const CAMERA_PRESETS: Record<string, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  full: { 
    position: new THREE.Vector3(22, 12, 24), 
    target: new THREE.Vector3(-1.0, -14.0, 0) 
  },
  surface: { 
    position: new THREE.Vector3(7.5, 5.2, 9.5), 
    target: new THREE.Vector3(0.5, 2.4, 0) 
  },
  wellbore: { 
    position: new THREE.Vector3(6.5, -12.0, 8.5), 
    target: new THREE.Vector3(-1.5, -16.0, 0) 
  },
  reservoir: { 
    position: new THREE.Vector3(9.5, -23.0, 11.5), 
    target: new THREE.Vector3(-1.5, -29.0, 0) 
  },
};

interface Props {
  mode: string;
}

export default function CameraController({ mode }: Props) {
  const controlsRef = useRef<any>(null);
  const { camera, gl, scene } = useThree();

  const isTransitioning = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3(22, 12, 24));
  const targetLookAt = useRef(new THREE.Vector3(-1.0, -14.0, 0));
  const transitionProgress = useRef(0);

  // Trigger smooth preset transition when mode changes
  useEffect(() => {
    const key = mode.toLowerCase();
    const preset = CAMERA_PRESETS[key] || CAMERA_PRESETS.full;
    targetCamPos.current.copy(preset.position);
    targetLookAt.current.copy(preset.target);
    isTransitioning.current = true;
    transitionProgress.current = 0;
  }, [mode]);

  // Handle Double-Click to Focus on clicked component in 3D scene
  useEffect(() => {
    const handleDoubleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const hitPoint = hit.point;

        // Calculate offset position for focused view
        const offset = new THREE.Vector3().subVectors(camera.position, hitPoint).normalize().multiplyScalar(10);
        targetCamPos.current.copy(hitPoint).add(offset);
        targetLookAt.current.copy(hitPoint);

        isTransitioning.current = true;
        transitionProgress.current = 0;
      }
    };

    const domElement = gl.domElement;
    domElement.addEventListener('dblclick', handleDoubleClick);
    return () => {
      domElement.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [camera, gl, scene]);

  useFrame((_, delta) => {
    if (isTransitioning.current) {
      transitionProgress.current += delta * 2.2;
      const lerpSpeed = Math.min(0.08, delta * 3.5);

      camera.position.lerp(targetCamPos.current, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, lerpSpeed);
        controlsRef.current.update();
      }

      // Once close enough, release 100% control to OrbitControls
      const posDist = camera.position.distanceTo(targetCamPos.current);
      const targetDist = controlsRef.current ? controlsRef.current.target.distanceTo(targetLookAt.current) : 0;
      
      if ((posDist < 0.1 && targetDist < 0.1) || transitionProgress.current > 1.5) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3.5}
      maxDistance={65}
      maxPolarAngle={Math.PI * 0.92}
      minPolarAngle={0.05}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      onStart={() => {
        // User started interacting with mouse: immediately release programmatic transition
        isTransitioning.current = false;
      }}
    />
  );
}
