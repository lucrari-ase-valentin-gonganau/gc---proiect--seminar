import { TREE_CONFIG } from "../config.js";

/**
 * Creeaza un copac decorativ cu multiple niveluri de frunzis
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Functia pentru materiale
 * @param {Array} pos - Pozitia copacului [x, y, z]
 * @returns {Object} - Obiectul cu componentele copacului {trunk, top}
 */
export function createCopac(scene, mat, pos) {
  // Variatie aleatoare pentru dimensiuni (90% - 110%)
  const scale = 0.9 + Math.random() * 0.2;

  // Trunchi
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      TREE_CONFIG.TRUNK.radiusTop * scale,
      TREE_CONFIG.TRUNK.radiusBottom * scale,
      TREE_CONFIG.TRUNK.height * scale,
      TREE_CONFIG.TRUNK.radialSegments,
    ),
    mat(TREE_CONFIG.TRUNK.color, 0.95, 0.05),
  );

  trunk.position.set(pos[0], TREE_CONFIG.TRUNK.y * scale, pos[2]);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  scene.add(trunk);

  // Frunzis - 3 niveluri suprapuse pentru aspect mai bogat
  const foliageParts = [];
  TREE_CONFIG.FOLIAGE.levels.forEach((level, index) => {
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(
        level.radius * scale,
        level.height * scale,
        TREE_CONFIG.FOLIAGE.radialSegments,
      ),
      mat(level.color, 0.85, 0.05),
    );
    foliage.position.set(pos[0], level.y * scale, pos[2]);
    foliage.castShadow = true;
    foliage.receiveShadow = true;

    // Rotatie aleatoare pentru varietate
    foliage.rotation.y = Math.random() * Math.PI * 2;

    scene.add(foliage);
    foliageParts.push(foliage);
  });

  // Returneaza primul nivel de frunzis ca "top" pentru coliziuni
  return { trunk, top: foliageParts[0] };
}
