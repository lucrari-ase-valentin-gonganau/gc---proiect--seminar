import { TREE_CONFIG } from "../config.js";

/**
 * Creează un copac decorativ
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Funcția pentru materiale
 * @param {Array} pos - Poziția copacului [x, y, z]
 * @returns {Object} - Obiectul cu componentele copacului {trunk, top}
 */
export function createCopac(scene, mat, pos) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      TREE_CONFIG.TRUNK.radiusTop,
      TREE_CONFIG.TRUNK.radiusBottom,
      TREE_CONFIG.TRUNK.height,
      TREE_CONFIG.TRUNK.radialSegments,
    ),
    mat(TREE_CONFIG.TRUNK.color, 0.95, 0.1),
  );

  trunk.position.set(pos[0], TREE_CONFIG.TRUNK.y, pos[2]);
  trunk.castShadow = true;
  scene.add(trunk);

  const top = new THREE.Mesh(
    new THREE.ConeGeometry(
      TREE_CONFIG.TOP.radius,
      TREE_CONFIG.TOP.height,
      TREE_CONFIG.TOP.radialSegments,
    ),
    mat(TREE_CONFIG.TOP.color, 0.95, 0.1),
  );
  top.position.set(pos[0], TREE_CONFIG.TOP.y, pos[2]);
  top.castShadow = true;
  scene.add(top);

  return { trunk, top };
}
