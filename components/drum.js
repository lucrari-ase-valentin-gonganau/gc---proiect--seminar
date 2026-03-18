import { ROAD_CONFIG, CONFIG } from "../config.js";

/**
 * Creeaza drumul cu marcajele centrale
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Functia pentru materiale
 */
export function createDrum(scene, mat) {
  // Drum principal - lung pentru aspect vizual
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_CONFIG.WIDTH, ROAD_CONFIG.LENGTH),
    mat(ROAD_CONFIG.COLOR, 0.9),
  );
  road.rotation.x = THREE.MathUtils.degToRad(-90);
  road.position.y = 0.01;
  road.receiveShadow = true;
  scene.add(road);

  // Marcaj central de drum - doar pe zona drumului (ROAD_PLAY_LIMIT)
  for (
    let z = -CONFIG.ROAD_PLAY_LIMIT;
    z <= CONFIG.ROAD_PLAY_LIMIT;
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

  // Bariere vizuale la capetele zonei drumului
  const barrierWidth = ROAD_CONFIG.WIDTH + 2;
  const barrierHeight = 0.8;
  const barrierDepth = 0.3;

  // Bariera sud (spate)
  const barrierSouth = new THREE.Mesh(
    new THREE.BoxGeometry(barrierWidth, barrierHeight, barrierDepth),
    mat(0xffcc00, 0.7, 0.2),
  );
  barrierSouth.position.set(
    0,
    barrierHeight / 2,
    -CONFIG.ROAD_PLAY_LIMIT - 0.5,
  );
  barrierSouth.castShadow = true;
  scene.add(barrierSouth);

  // Benzi negre si galbene pe bariera sud
  for (let x = -barrierWidth / 2; x < barrierWidth / 2; x += 1) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, barrierHeight + 0.02, barrierDepth + 0.02),
      mat(x % 2 === 0 ? 0x000000 : 0xffcc00, 0.8, 0.1),
    );
    stripe.position.set(x, barrierHeight / 2, -CONFIG.ROAD_PLAY_LIMIT - 0.5);
    scene.add(stripe);
  }

  // Bariera nord (fata)
  const barrierNorth = new THREE.Mesh(
    new THREE.BoxGeometry(barrierWidth, barrierHeight, barrierDepth),
    mat(0xffcc00, 0.7, 0.2),
  );
  barrierNorth.position.set(0, barrierHeight / 2, CONFIG.ROAD_PLAY_LIMIT + 0.5);
  barrierNorth.castShadow = true;
  scene.add(barrierNorth);

  // Benzi negre si galbene pe bariera nord
  for (let x = -barrierWidth / 2; x < barrierWidth / 2; x += 1) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, barrierHeight + 0.02, barrierDepth + 0.02),
      mat(x % 2 === 0 ? 0x000000 : 0xffcc00, 0.8, 0.1),
    );
    stripe.position.set(x, barrierHeight / 2, CONFIG.ROAD_PLAY_LIMIT + 0.5);
    scene.add(stripe);
  }

  // Garduri laterale - imprejmuiesc toata zona (la marginea ground-ului)
  const fenceHeight = 1.2;
  const fenceDepth = 0.1;
  const fenceLimit = CONFIG.GROUND_SIZE / 2 - 1; // Limita ground-ului

  // Gard est (dreapta) - lungime completa
  const fenceEast = [];
  for (let z = -fenceLimit; z <= fenceLimit; z += 2) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, fenceHeight, 0.15),
      mat(0x8b4513, 0.9, 0.1),
    );
    post.position.set(fenceLimit, fenceHeight / 2, z);
    post.castShadow = true;
    scene.add(post);

    // Bara orizontala
    if (z < fenceLimit) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(fenceDepth, 0.12, 2),
        mat(0x654321, 0.9, 0.1),
      );
      rail.position.set(fenceLimit, fenceHeight * 0.7, z + 1);
      rail.castShadow = true;
      scene.add(rail);
      fenceEast.push(rail);
    }
  }

  // Gard vest (stanga) - lungime completa
  const fenceWest = [];
  for (let z = -fenceLimit; z <= fenceLimit; z += 2) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, fenceHeight, 0.15),
      mat(0x8b4513, 0.9, 0.1),
    );
    post.position.set(-fenceLimit, fenceHeight / 2, z);
    post.castShadow = true;
    scene.add(post);

    // Bara orizontala
    if (z < fenceLimit) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(fenceDepth, 0.12, 2),
        mat(0x654321, 0.9, 0.1),
      );
      rail.position.set(-fenceLimit, fenceHeight * 0.7, z + 1);
      rail.castShadow = true;
      scene.add(rail);
      fenceWest.push(rail);
    }
  }

  // Gard nord (sus) - inchide tarcul
  const fenceNorth = [];
  for (let x = -fenceLimit; x <= fenceLimit; x += 2) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, fenceHeight, 0.15),
      mat(0x8b4513, 0.9, 0.1),
    );
    post.position.set(x, fenceHeight / 2, fenceLimit);
    post.castShadow = true;
    scene.add(post);

    // Bara orizontala
    if (x < fenceLimit) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.12, fenceDepth),
        mat(0x654321, 0.9, 0.1),
      );
      rail.position.set(x + 1, fenceHeight * 0.7, fenceLimit);
      rail.castShadow = true;
      scene.add(rail);
      fenceNorth.push(rail);
    }
  }

  // Gard sud (jos) - inchide tarcul
  const fenceSouth = [];
  for (let x = -fenceLimit; x <= fenceLimit; x += 2) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, fenceHeight, 0.15),
      mat(0x8b4513, 0.9, 0.1),
    );
    post.position.set(x, fenceHeight / 2, -fenceLimit);
    post.castShadow = true;
    scene.add(post);

    // Bara orizontala
    if (x < fenceLimit) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.12, fenceDepth),
        mat(0x654321, 0.9, 0.1),
      );
      rail.position.set(x + 1, fenceHeight * 0.7, -fenceLimit);
      rail.castShadow = true;
      scene.add(rail);
      fenceSouth.push(rail);
    }
  }

  return {
    barrierSouth,
    barrierNorth,
    fenceEast,
    fenceWest,
    fenceNorth,
    fenceSouth,
  };
}
