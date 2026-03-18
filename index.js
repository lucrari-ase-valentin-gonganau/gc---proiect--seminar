import { createDrum } from "./components/drum.js";
import { createCopac } from "./components/copac.js";
import { setupLights } from "./components/lumini.js";
import { createCar } from "./components/car.js";
import { createStones } from "./components/piatra.js";
import { createParticleSystem } from "./components/particles.js";
import { setMessage } from "./utils.js";
import { audioManager } from "./audio.js";
import {
  CONFIG,
  CAMERA_CONFIG,
  CAR_CONFIG,
  STONE_CONFIG,
  TREE_CONFIG,
} from "./config.js";

// ============================================
// INITIALIZARE SCENA
// ============================================

const canvas = document.getElementById("c");
const msg = document.getElementById("msg");
const scoreEl = document.getElementById("score");
const totalStonesEl = document.getElementById("total-stones");

// Seteaza numarul total de pietre
totalStonesEl.textContent = STONE_CONFIG.COUNT;

// Rendare
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.tap = THREE.PCFSoftShadowMap;
renderer.setClearColor(CONFIG.SKY_COLOR);

// Scena si ceata
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(CONFIG.SKY_COLOR, CONFIG.FOG_NEAR, CONFIG.FOG_FAR);

// Camera
const camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.FOV, 1, 0.1, 200);
camera.position.set(
  CAMERA_CONFIG.INITIAL_POS.x,
  CAMERA_CONFIG.INITIAL_POS.y,
  CAMERA_CONFIG.INITIAL_POS.z,
);
camera.lookAt(0, 0, 0);

// OrbitControls pentru modul orbital
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2.1; // Nu permite sa mearga sub pamant
controls.enabled = false; // Initial dezactivat

// Mod camera: 'follow' sau 'orbital'
let cameraMode = "follow";

if (CONFIG.IS_DEV) {
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // Grila ofera un plan de referinta pentru pozitionarea obiectelor.
  // Primul parametru = dimensiunea totala, al doilea = numarul de subdiviziuni.
  const gridHelper = new THREE.GridHelper(100, 10);
  scene.add(gridHelper);
}

// Lumini
const { ambient, sun } = setupLights(scene);

// Stari pentru faruri si zi/noapte
let headlightsOn = false;
let isNight = false;

function mat(color, rough = 0.8, metal = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
  });
}

// sol
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(CONFIG.GROUND_SIZE, CONFIG.GROUND_SIZE, 20, 20),
  mat(CONFIG.GROUND_COLOR, 0.9),
);
ground.rotation.x = THREE.MathUtils.degToRad(-90);
ground.receiveShadow = true;
scene.add(ground);

// Drum
const {
  barrierSouth,
  barrierNorth,
  fenceEast,
  fenceWest,
  fenceNorth,
  fenceSouth,
} = createDrum(scene, mat);

// Masina
const {
  carGroup,
  wheels,
  steerPivots,
  headlights,
  headlightSpots,
  brakeLights,
  brakeLightSpots,
  reverseLights,
  reverseLightSpots,
} = createCar(scene, mat);

// Pietre
const { stones, stoneData, stonePositions, stoneColors } = createStones(
  scene,
  mat,
);

// Particule
const particleSystem = createParticleSystem();

const threes = [];

// Generare aleatorie copaci - minimum 50, cu distante sigure
function generateTreePositions(count = TREE_CONFIG.COUNT) {
  const positions = [];
  const minDistBetweenTrees = TREE_CONFIG.MIN_DIST_BETWEEN;
  const minDistFromRoad = TREE_CONFIG.MIN_DIST_FROM_ROAD;
  const mapSize = CONFIG.MAP_LIMIT;

  let attempts = 0;
  const maxAttempts = count * TREE_CONFIG.MAX_ATTEMPTS_MULTIPLIER;

  while (positions.length < count && attempts < maxAttempts) {
    attempts++;

    // Genereaza pozitie aleatoare
    const x = (Math.random() - 0.5) * mapSize * 2;
    const z = (Math.random() - 0.5) * mapSize * 2;

    // Verifica daca e prea aproape de drum (drum e in centru pe x=0)
    if (Math.abs(x) < minDistFromRoad) continue;

    // Verifica distanta fata de ceilalti copaci
    let tooClose = false;
    for (const pos of positions) {
      const dx = pos[0] - x;
      const dz = pos[2] - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistBetweenTrees) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      positions.push([x, 0, z]);
    }
  }

  return positions;
}

// Copaci decorativi
const treePositions = generateTreePositions(TREE_CONFIG.COUNT);
treePositions.forEach((pos) => {
  const tree = createCopac(scene, mat, pos);
  threes.push(tree);
});

// stari masina default
const carInitial = {
  vel: 0,
  angle: 0,
  x: CAR_CONFIG.INITIAL_POS.x,
  z: CAR_CONFIG.INITIAL_POS.z,
  maxSpeed: CAR_CONFIG.PHYSICS.maxSpeed,
  accel: CAR_CONFIG.PHYSICS.accel,
  brake: CAR_CONFIG.PHYSICS.brake,
  friction: CAR_CONFIG.PHYSICS.friction,
  turnSpeed: CAR_CONFIG.PHYSICS.turnSpeed,
};

let car = { ...carInitial };

// Initializeaza sistemul audio
audioManager.init();

// Input
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "KeyR") resetScene();

  if (e.code === "KeyC") {
    cameraMode = cameraMode === "follow" ? "orbital" : "follow";
    controls.enabled = cameraMode === "orbital";
    canvas.style.cursor = cameraMode === "orbital" ? "grab" : "none";
    const message =
      cameraMode === "orbital"
        ? "Mod Orbital: Mișcă mouse-ul pentru a rota camera"
        : "Mod Urmărire: Camera urmărește mașina";
    setMessage(msg, message, "info", 2000);
  }

  if (e.code === "KeyL") {
    headlightsOn = !headlightsOn;
    headlightSpots.forEach((light) => {
      light.intensity = headlightsOn ? 1.5 : 0;
    });
    headlights.forEach((mesh) => {
      if (headlightsOn) {
        mesh.material.emissive.setHex(CAR_CONFIG.HEADLIGHT.color);
        mesh.material.emissiveIntensity = 0.8;
      } else {
        mesh.material.emissive.setHex(0x000000);
        mesh.material.emissiveIntensity = 0;
      }
    });
    setMessage(
      msg,
      headlightsOn ? "Faruri aprinse" : "Faruri stinse",
      "warning",
      2000,
    );
  }

  if (e.code === "KeyN") {
    isNight = !isNight;
    if (isNight) {
      // Noapte
      renderer.setClearColor(0x0a1128);
      scene.fog.color.setHex(0x0a1128);
      ambient.intensity = 0.15;
      sun.intensity = 0.2;
      sun.color.setHex(0x8888ff);
    } else {
      // Zi
      renderer.setClearColor(CONFIG.SKY_COLOR);
      scene.fog.color.setHex(CONFIG.SKY_COLOR);
      ambient.intensity = 0.5;
      sun.intensity = 1.2;
      sun.color.setHex(0xfff4e0);
    }
    setMessage(
      msg,
      isNight ? "Mod Noapte" : "Mod Zi",
      isNight ? "info" : "warning",
      2000,
    );
  }

  if (e.code === "KeyM") {
    const muted = audioManager.toggleMute();
    setMessage(msg, muted ? "Sunete oprite" : "Sunete pornite", "info", 2000);
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});
canvas.addEventListener("click", () => {
  canvas.focus();
  setMessage(
    msg,
    "Folosește săgețile pentru a conduce! (Apasă M pentru sunete)",
    "default",
  );
});

// scor
let score = 0;

// reset
function resetScene() {
  car = { ...carInitial };
  score = 0;
  stones.forEach((sg, i) => {
    sg.position.set(...stonePositions[i]);
    sg.position.y = STONE_CONFIG.INITIAL_Y;
    sg.visible = true;
    stoneData[i].hit = false;
    stoneData[i].bounceT = 0;
  });
  particleSystem.clear(scene);

  setMessage(msg, "Resetat! Folosește săgețile pentru a conduce!", "success");
}

// resize
function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// game loop
const clock = new THREE.Clock();
const carBB = new THREE.Box3();
const stoneBB = new THREE.Box3();
const threeBB = new THREE.Box3();
const barrierBB = new THREE.Box3();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);

  // Input si fizica masina
  const left = keys["ArrowLeft"];
  const right = keys["ArrowRight"];
  const fwd = keys["ArrowUp"];
  const back = keys["ArrowDown"];

  // acceleratie / frana / reverse
  let isBraking = false;
  let isReversing = false;

  if (fwd) {
    car.vel = Math.min(car.vel + car.accel * dt, car.maxSpeed);
  } else if (back) {
    if (car.vel > 0.5) {
      // Franare daca merge inainte
      car.vel = Math.max(car.vel - car.brake * dt, 0);
      isBraking = true;
    } else {
      // Mers inapoi
      car.vel = Math.max(car.vel - car.accel * 0.6 * dt, -car.maxSpeed * 0.5);
      isReversing = car.vel < -0.1;
    }
  } else {
    // Frictiune
    if (Math.abs(car.vel) < car.friction * dt) {
      car.vel = 0;
    } else {
      car.vel -= Math.sign(car.vel) * car.friction * dt;
    }
  }

  // Actualizeaza sunetul motorului
  audioManager.updateEngine(car.vel, car.maxSpeed, fwd);

  // Sunet franare
  if (isBraking) {
    audioManager.playBrake();
  }

  // Control stopuri - franarea are prioritate, apoi luminile de pozitie
  brakeLights.forEach((light, i) => {
    if (isBraking) {
      // Franare - intensitate maxima
      light.material.color.setHex(CAR_CONFIG.TAILLIGHT.brakeColor);
      light.material.emissive.setHex(CAR_CONFIG.TAILLIGHT.brakeColor);
      light.material.emissiveIntensity = 0.8;
      brakeLightSpots[i].intensity = CAR_CONFIG.TAILLIGHT.lightIntensity;
    } else if (headlightsOn) {
      // Lumini de pozitie - intensitate mica (tail lights)
      light.material.color.setHex(0xff3333);
      light.material.emissive.setHex(0xff0000);
      light.material.emissiveIntensity = 0.2;
      brakeLightSpots[i].intensity = 0.3;
    } else {
      // Stinse
      light.material.color.setHex(CAR_CONFIG.TAILLIGHT.color);
      light.material.emissive.setHex(0x000000);
      light.material.emissiveIntensity = 0;
      brakeLightSpots[i].intensity = 0;
    }
  });

  reverseLights.forEach((light, i) => {
    if (isReversing) {
      light.material.color.setHex(CAR_CONFIG.REVERSELIGHT.activeColor);
      light.material.emissive.setHex(CAR_CONFIG.REVERSELIGHT.activeColor);
      light.material.emissiveIntensity = 1;
      reverseLightSpots[i].intensity = CAR_CONFIG.REVERSELIGHT.lightIntensity;
    } else {
      light.material.color.setHex(CAR_CONFIG.REVERSELIGHT.color);
      light.material.emissive.setHex(0x000000);
      light.material.emissiveIntensity = 0;
      reverseLightSpots[i].intensity = 0;
    }
  });

  // directie daca se misca - viteza de rotire proportionala cu viteza
  if (Math.abs(car.vel) > 0.1) {
    const dir = Math.sign(car.vel);
    // Factor de steering proportional cu viteza (min 0.3, max 1.0)
    const speedFactor = Math.min(Math.abs(car.vel) / car.maxSpeed, 1.0);
    const adjustedTurnSpeed = car.turnSpeed * Math.max(speedFactor, 0.3);

    if (left) {
      car.angle += adjustedTurnSpeed * dt * dir;
    }
    if (right) {
      car.angle -= adjustedTurnSpeed * dt * dir;
    }
  }

  // miscare - calculeaza pozitia viitoare
  const nextX = car.x + Math.sin(car.angle) * car.vel * dt;
  const nextZ = car.z + Math.cos(car.angle) * car.vel * dt;

  // limitare la teren
  car.x = Math.max(-CONFIG.MAP_LIMIT, Math.min(CONFIG.MAP_LIMIT, nextX));
  car.z = Math.max(-CONFIG.MAP_LIMIT, Math.min(CONFIG.MAP_LIMIT, nextZ));

  // actualizare pozitie masina
  carGroup.position.set(car.x, 0, car.z);
  carGroup.rotation.y = car.angle;

  // Coliziuni cu bariere - verifica inainte sa aplice miscarea definitiv
  carBB.setFromObject(carGroup);
  let hasBarrierCollision = false;

  [barrierSouth, barrierNorth].forEach((barrier) => {
    barrierBB.setFromObject(barrier);
    if (carBB.intersectsBox(barrierBB)) {
      hasBarrierCollision = true;
    }
  });

  // Daca loveste bariera, anuleaza miscarea si reduce viteza
  if (hasBarrierCollision) {
    car.x -= Math.sin(car.angle) * car.vel * dt;
    car.z -= Math.cos(car.angle) * car.vel * dt;
    car.vel *= 0.3; // Reduce viteza semnificativ la impact
    carGroup.position.set(car.x, 0, car.z);

    // Sunet crash/zgarietura la impact cu bariera
    audioManager.playCrash();
  }

  // roti se rotesc
  const wheelRot = car.vel * dt * CAR_CONFIG.WHEEL_ROTATION_MULT;
  wheels.forEach((w) => {
    w.rotation.x += wheelRot;
  });
  const steerAngle =
    (keys["ArrowLeft"] ? 1 : keys["ArrowRight"] ? -1 : 0) *
    CAR_CONFIG.STEER_ANGLE;
  steerPivots[0].rotation.y = steerAngle;
  steerPivots[1].rotation.y = steerAngle;

  // Coliziuni
  carBB.setFromObject(carGroup);
  stones.forEach((sg, i) => {
    if (stoneData[i].hit) return;
    stoneBB.setFromObject(sg);
    if (carBB.intersectsBox(stoneBB)) {
      stoneData[i].hit = true;
      stoneData[i].bounceT = 0;
      score++;
      scoreEl.textContent = `Scor: ${score}`;
      setMessage(msg, "Boum! Treci la urmatorul!", "success");

      // Sunet lovit piatra
      audioManager.playStoneHit();

      particleSystem.spawn(scene, mat, sg.position.clone(), stoneColors[i]);

      car.vel *= STONE_CONFIG.VELOCITY_REDUCTION;
      if (score >= STONE_CONFIG.COUNT) {
        setTimeout(() => {
          setMessage(
            msg,
            "Felicitari! Ai terminat jocul! Apasa R pentru reset.",
            "highlight",
          );
        }, 1000);
      }
    }
  });

  stones.forEach((sg, i) => {
    if (!stoneData[i].hit) {
      return;
    }
    stoneData[i].bounceT += dt;
    const t = stoneData[i].bounceT;
    sg.position.y =
      stoneData[i].originalY +
      Math.max(
        0,
        Math.sin(t * STONE_CONFIG.BOUNCE_SPEED) *
          STONE_CONFIG.BOUNCE_HEIGHT *
          Math.exp(-t * STONE_CONFIG.BOUNCE_DECAY),
      );
    sg.rotation.x += 3 * dt;
    sg.rotation.z += 2 * dt;
    if (t > STONE_CONFIG.BOUNCE_DURATION) sg.visible = false;
  });

  // loveste un copac, nu poate inainta
  threes.forEach(({ trunk, top }) => {
    threeBB.setFromObject(trunk);
    if (carBB.intersectsBox(threeBB)) {
      car.x -= Math.sin(car.angle) * car.vel * dt;
      car.z -= Math.cos(car.angle) * car.vel * dt;
      carGroup.position.set(car.x, 0, car.z);

      // Sunet zgarietura la impact cu copac
      audioManager.playScratch();
    }
  });

  // Particule
  particleSystem.update(scene, dt);

  // Camera
  if (cameraMode === "follow") {
    // Camera care urmareste masina
    const camOffset = new THREE.Vector3(
      Math.sin(car.angle) * CAMERA_CONFIG.OFFSET.z,
      CAMERA_CONFIG.OFFSET.y,
      Math.cos(car.angle) * CAMERA_CONFIG.OFFSET.z,
    );
    camera.position.lerp(
      new THREE.Vector3(car.x + camOffset.x, camOffset.y, car.z + camOffset.z),
      CAMERA_CONFIG.LERP_SPEED,
    );
    camera.lookAt(car.x, 1, car.z);
  } else {
    // Mod orbital - OrbitControls ia controlul
    controls.target.set(car.x, 0, car.z);
    controls.update();
  }

  renderer.render(scene, camera);
}
animate();
