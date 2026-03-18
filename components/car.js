import { CAR_CONFIG } from "../config.js";

/**
 * Creeaza masina cu toate componentele
 * @param {THREE.Scene} scene - Scena Three.js
 * @param {Function} mat - Functia pentru materiale
 * @returns {Object} - Obiectul cu datele masinii {carGroup, wheels, steerPivots}
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

  // Cabina
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

  // Geam fata (parbriz)
  const winF = new THREE.Mesh(
    new THREE.PlaneGeometry(CAR_CONFIG.WINDOW.width, CAR_CONFIG.WINDOW.height),
    winMat,
  );
  winF.position.set(0, 0.92, 0.71);
  carGroup.add(winF);

  // Geam spate (luneta)
  const winB = new THREE.Mesh(
    new THREE.PlaneGeometry(CAR_CONFIG.WINDOW.width, CAR_CONFIG.WINDOW.height),
    winMat.clone(),
  );
  winB.position.set(0, 0.92, -1.11);
  winB.rotation.y = Math.PI; // Rotit 180 grade pentru a fi orientat corect
  carGroup.add(winB);

  // Geamuri laterale
  const sideWindowWidth = CAR_CONFIG.CABIN.length * 0.85; // Lungimea geamului lateral
  const sideWindowHeight = CAR_CONFIG.WINDOW.height;

  // Geam stanga
  const winL = new THREE.Mesh(
    new THREE.PlaneGeometry(sideWindowWidth, sideWindowHeight),
    winMat.clone(),
  );
  winL.position.set(-0.75, 0.92, CAR_CONFIG.CABIN.z);
  winL.rotation.y = -Math.PI / 2; // Rotit 90 grade spre stanga
  carGroup.add(winL);

  // Geam dreapta
  const winR = new THREE.Mesh(
    new THREE.PlaneGeometry(sideWindowWidth, sideWindowHeight),
    winMat.clone(),
  );
  winR.position.set(0.75, 0.92, CAR_CONFIG.CABIN.z);
  winR.rotation.y = Math.PI / 2; // Rotit 90 grade spre dreapta
  carGroup.add(winR);

  // Roti
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
    // Pivot-ul e aliniat cu lumea - fara rotatie proprie
    const pivot = new THREE.Group();
    pivot.position.set(...pos);
    carGroup.add(pivot);

    // Roata e in interiorul pivot-ului, rotita pe Z
    const w = wheelGroup.clone();
    w.rotation.z = Math.PI / 2;
    w.position.set(0, 0, 0);
    pivot.add(w);

    wheels.push(w);
    if (i < 2) steerPivots.push(pivot);
  });

  // Faruri
  const headlights = [];
  const headlightSpots = [];
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
    headlights.push(f);

    // SpotLight pentru faruri
    const spotlight = new THREE.SpotLight(0xffffee, 0, 30, Math.PI / 6, 0.5, 2);
    spotlight.position.set(pos[0], pos[1], pos[2]);
    spotlight.target.position.set(pos[0], 0, pos[2] + 10);
    spotlight.castShadow = true;
    carGroup.add(spotlight);
    carGroup.add(spotlight.target);
    headlightSpots.push(spotlight);
  });

  // Stopuri rosii (franare) - pozitionate mai jos sa nu se vada prin luneta
  const brakeLights = [];
  const brakeLightSpots = [];
  [
    [-0.55, 0.3, -1.76],
    [0.55, 0.3, -1.76],
  ].forEach((pos) => {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(
        CAR_CONFIG.TAILLIGHT.width,
        CAR_CONFIG.TAILLIGHT.height,
        CAR_CONFIG.TAILLIGHT.depth,
      ),
      mat(CAR_CONFIG.TAILLIGHT.color, 0.2, 0.5),
    );
    s.position.set(...pos);
    carGroup.add(s);
    brakeLights.push(s);

    // SpotLight pentru stop - emite doar spre spate
    const light = new THREE.SpotLight(
      CAR_CONFIG.TAILLIGHT.brakeColor,
      0,
      5,
      Math.PI / 4,
      0.5,
      1,
    );
    light.position.set(pos[0], pos[1], pos[2]);
    light.target.position.set(pos[0], pos[1] - 0.5, pos[2] - 5);
    carGroup.add(light);
    carGroup.add(light.target);
    brakeLightSpots.push(light);
  });

  // Stopuri albe (mers inapoi) - pozitionate mai jos
  const reverseLights = [];
  const reverseLightSpots = [];
  [
    [-0.35, 0.3, -1.76],
    [0.35, 0.3, -1.76],
  ].forEach((pos) => {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(
        CAR_CONFIG.REVERSELIGHT.width,
        CAR_CONFIG.REVERSELIGHT.height,
        CAR_CONFIG.REVERSELIGHT.depth,
      ),
      mat(CAR_CONFIG.REVERSELIGHT.color, 0.2, 0.5),
    );
    s.position.set(...pos);
    carGroup.add(s);
    reverseLights.push(s);

    // SpotLight pentru reverse - emite doar spre spate
    const light = new THREE.SpotLight(
      CAR_CONFIG.REVERSELIGHT.activeColor,
      0,
      6,
      Math.PI / 3,
      0.5,
      1,
    );
    light.position.set(pos[0], pos[1], pos[2]);
    light.target.position.set(pos[0], pos[1] - 0.3, pos[2] - 5);
    carGroup.add(light);
    carGroup.add(light.target);
    reverseLightSpots.push(light);
  });

  scene.add(carGroup);
  carGroup.position.set(CAR_CONFIG.INITIAL_POS.x, 0, CAR_CONFIG.INITIAL_POS.z);

  return {
    carGroup,
    wheels,
    steerPivots,
    headlights,
    headlightSpots,
    brakeLights,
    brakeLightSpots,
    reverseLights,
    reverseLightSpots,
  };
}
