import { ROAD_CONFIG, CONFIG } from "../config.js";

/**
 * Creează drumul cu marcajele centrale
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Funcția pentru materiale
 */
export function createDrum(scene, mat) {
  // Drum principal
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_CONFIG.WIDTH, ROAD_CONFIG.LENGTH),
    mat(ROAD_CONFIG.COLOR, 0.9),
  );
  road.rotation.x = THREE.MathUtils.degToRad(-90);
  road.position.y = 0.01;
  road.receiveShadow = true;
  scene.add(road);

  // Marcaj central de drum
  for (
    let z = -CONFIG.MAP_LIMIT;
    z < CONFIG.MAP_LIMIT + 2;
    z += ROAD_CONFIG.MARK_SPACING
  ) {
    const mark = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_CONFIG.MARK_WIDTH, ROAD_CONFIG.MARK_LENGTH),
      mat(ROAD_CONFIG.MARK_COLOR, 0.9),
    );
    mark.rotation.x = THREE.MathUtils.degToRad(-90);
    mark.position.set(0, 0.02, z);
    scene.add(mark);
  }
}
