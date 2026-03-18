import { STONE_CONFIG } from "../config.js";

/**
 * Creeaza pietrele pe teren
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Functia pentru materiale
 * @returns {Object} - Obiectul cu date despre pietre {stones, stoneData, stonePositions, stoneColors}
 */
export function createStones(scene, mat) {
  const baseColors = STONE_CONFIG.COLORS;

  // Genereaza culori pentru toate pietrele (ciclica daca COUNT > numarul de culori)
  const stoneColors = Array.from({ length: STONE_CONFIG.COUNT }).map(
    (_, i) => baseColors[i % baseColors.length],
  );

  // Random stones pe langa drum
  const stonePositions = Array.from({ length: STONE_CONFIG.COUNT }).map(() => [
    (Math.random() - 0.5) * STONE_CONFIG.SPAWN_RANGE,
    0,
    (Math.random() - 0.5) * STONE_CONFIG.SPAWN_RANGE,
  ]);

  const stones = [];
  const stoneData = [];

  stonePositions.forEach((pos, i) => {
    const sg = new THREE.Group();

    // Culoare principala pentru piatra
    const mainColor = stoneColors[i];

    const s1 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(STONE_CONFIG.SIZE_MAIN, 0),
      mat(mainColor, 0.95),
    );
    s1.scale.set(1, 0.6, 1);
    s1.castShadow = true;
    sg.add(s1);

    // Variatie de culoare pentru a doua piatra (mai deschisa)
    const secondaryColor = new THREE.Color(mainColor)
      .offsetHSL(0, 0, 0.1)
      .getHex();

    const s2 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(STONE_CONFIG.SIZE_SECONDARY, 0),
      mat(secondaryColor, 0.95),
    );
    s2.position.set(0.3, 0.2, -0.2);
    s2.castShadow = true;
    sg.add(s2);

    sg.position.set(...pos);
    sg.position.y = STONE_CONFIG.INITIAL_Y;
    sg.rotation.y = Math.random() * Math.PI;

    scene.add(sg);
    stones.push(sg);
    stoneData.push({
      hit: false,
      originalY: STONE_CONFIG.INITIAL_Y,
      bounceT: 0,
    });
  });

  return { stones, stoneData, stonePositions, stoneColors };
}
