import * as THREE from "three";

const MIN_RADIUS = 0.001;
const FRAMING_MARGIN = 1.2;
const NEAR_PLANE_DIVISOR = 100;
const FAR_PLANE_MULTIPLIER = 100;
const DEGREES_PER_HALF_TURN = 180;

export const frameCamera = (
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D
): THREE.Vector3 | null => {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) {
    return null;
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, MIN_RADIUS);
  const fovRadians = (camera.fov * Math.PI) / DEGREES_PER_HALF_TURN;
  const distance = (radius / Math.sin(fovRadians / 2)) * FRAMING_MARGIN;

  camera.position.set(center.x, center.y, center.z + distance);
  camera.near = distance / NEAR_PLANE_DIVISOR;
  camera.far = distance * FAR_PLANE_MULTIPLIER;
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  return center;
};
