import { CAR_CONFIG } from "../config.js";

/**
 * Creează mașina cu toate componentele
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Funcția pentru materiale
 * @returns {Object} - Obiectul cu datele mașinii {carGroup, wheels, steerPivots}
 */
export function createCar(scene, mat) {
  const carGroup = new THREE.Group();

  // Caroserie
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(
      CAR_CONFIG.BODY.width,
      CAR_CONFIG.BODY.height,
      CAR_CONFIG.BODY.length,
    ),
    mat(CAR_CONFIG.BODY.color, 0.5, 0.3),
  );
  body.position.y = CAR_CONFIG.BODY.y;
  body.castShadow = true;
  carGroup.add(body);

  // Cabină
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
      CAR_CONFIG.CABIN.width,
      CAR_CONFIG.CABIN.height,
      CAR_CONFIG.CABIN.length,
    ),
    mat(CAR_CONFIG.CABIN.color, 0.5, 0.2),
  );
  cabin.position.set(0, CAR_CONFIG.CABIN.y, CAR_CONFIG.CABIN.z);
  cabin.castShadow = true;
  carGroup.add(cabin);

  // Geamuri
  const winMat = mat(CAR_CONFIG.WINDOW.color, 0.1, 0.9);
  winMat.transparent = true;
  winMat.opacity = CAR_CONFIG.WINDOW.opacity;
  const winF = new THREE.Mesh(
    new THREE.PlaneGeometry(CAR_CONFIG.WINDOW.width, CAR_CONFIG.WINDOW.height),
    winMat,
  );
  winF.position.set(0, 0.92, 0.71);
  carGroup.add(winF);

  // Roți
  const wheelGroup = new THREE.Group();

  const wheelGeo = new THREE.CylinderGeometry(
    CAR_CONFIG.WHEEL.radius,
    CAR_CONFIG.WHEEL.radius,
    CAR_CONFIG.WHEEL.width,
    16,
  );
  const wheelMat = mat(CAR_CONFIG.WHEEL.color, 0.8, 0.9);
  const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
  wheelMesh.castShadow = true;

  const capGeo = new THREE.CylinderGeometry(
    CAR_CONFIG.WHEEL.capRadius,
    CAR_CONFIG.WHEEL.capRadius,
    CAR_CONFIG.WHEEL.width + 0.01,
    16,
  );
  const capMat = mat(CAR_CONFIG.WHEEL.capColor, 0.8, 0.1);
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.castShadow = true;

  wheelGroup.add(wheelMesh);
  wheelGroup.add(capMesh);

  const wheelPositions = [
    [-0.8, 0.28, 1.1],
    [0.8, 0.28, 1.1],
    [-0.8, 0.28, -1.1],
    [0.8, 0.28, -1.1],
  ];

  const wheels = [];
  const steerPivots = [];

  wheelPositions.forEach((pos, i) => {
    // Pivot-ul e aliniat cu lumea — fără rotație proprie
    const pivot = new THREE.Group();
    pivot.position.set(...pos);
    carGroup.add(pivot);

    // Roata e în interiorul pivot-ului, rotită pe Z
    const w = wheelGroup.clone();
    w.rotation.z = Math.PI / 2;
    w.position.set(0, 0, 0);
    pivot.add(w);

    wheels.push(w);
    if (i < 2) steerPivots.push(pivot);
  });

  // Faruri
  [
    [-0.55, 0.45, 1.76],
    [0.55, 0.45, 1.76],
  ].forEach((pos) => {
    const f = new THREE.Mesh(
      new THREE.BoxGeometry(
        CAR_CONFIG.HEADLIGHT.width,
        CAR_CONFIG.HEADLIGHT.height,
        CAR_CONFIG.HEADLIGHT.depth,
      ),
      mat(CAR_CONFIG.HEADLIGHT.color, 0.2, 0.5),
    );
    f.position.set(...pos);
    carGroup.add(f);
  });

  scene.add(carGroup);
  carGroup.position.set(CAR_CONFIG.INITIAL_POS.x, 0, CAR_CONFIG.INITIAL_POS.z);

  return { carGroup, wheels, steerPivots };
}
