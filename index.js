import { createDrum } from "./components/drum.js";
import { createCopac } from "./components/copac.js";
import { setupLights } from "./components/lumini.js";
import { createCar } from "./components/car.js";
import { createStones } from "./components/piatra.js";
import {
  CONFIG,
  CAMERA_CONFIG,
  ROAD_CONFIG,
  CAR_CONFIG,
  STONE_CONFIG,
  TREE_CONFIG,
  PARTICLE_CONFIG,
} from "./config.js";

// ============================================
// INITIALIZARE SCENA
// ============================================

const canvas = document.getElementById("c");
const msg = document.getElementById("msg");
const scoreEl = document.getElementById("score");

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
camera.position.set(CAMERA_CONFIG.INITIAL_POS.x, CAMERA_CONFIG.INITIAL_POS.y, CAMERA_CONFIG.INITIAL_POS.z);
camera.lookAt(0, 0, 0);

// Lumini
setupLights(scene);

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
createDrum(scene, mat);

// Masina
const { carGroup, wheels, steerPivots } = createCar(scene, mat);

// Pietre
const { stones, stoneData, stonePositions, stoneColors } = createStones(scene, mat);

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

// Input
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") e.preventDefault();
  if (e.code === "KeyR") resetScene();
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});
canvas.addEventListener("click", () => {
  canvas.focus();
  msg.textContent = "Dreapta stanga si primul pietroi, da?";
});

// scor
let score = 0;

// Particule explozeie
const particles = [];
function spanwParticles(pos, color) {
  for (let i = 0; i < PARTICLE_CONFIG.COUNT_PER_EXPLOSION; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(PARTICLE_CONFIG.MIN_SIZE + Math.random() * (PARTICLE_CONFIG.MAX_SIZE - PARTICLE_CONFIG.MIN_SIZE), 4, 4),
      mat(color, 0.8),
    );
    p.position.copy(pos);
    scene.add(p);
    particles.push({
      mesh: p,
      vx: (Math.random() - 0.5) * PARTICLE_CONFIG.VELOCITY_RANGE,
      vy: Math.random() * PARTICLE_CONFIG.VELOCITY_RANGE,
      vz: (Math.random() - 0.5) * PARTICLE_CONFIG.VELOCITY_RANGE,
      life: 1,
    });
  }
}

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
    particles.forEach((p) => scene.remove(p.mesh));
    particles.length = 0;
  });

  msg.textContent = "Resetat! Dreapta stanga si primul pietroi, da?";
  msg.style.color = "black";
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

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);

  // Input si fizica masina
  const accel = keys["Space"];
  const left = keys["ArrowLeft"];
  const right = keys["ArrowRight"];
  const fwd = keys["ArrowUp"];
  const back = keys["ArrowDown"];

  // acceleratie / frana
  if (accel && fwd) {
    car.vel = Math.min(car.vel + car.accel * dt, car.maxSpeed);
  } else if (accel && back) {
    car.vel = Math.max(car.vel - car.brake * dt, -car.maxSpeed * 0.5);
  } else if (!accel) {
    const friction = car.friction + (fwd || back ? car.brake * 0.5 : car.brake);
    if (Math.abs(car.vel) < friction * dt) {
      car.vel = 0;
    } else {
      car.vel -= Math.sign(car.vel) * friction * dt;
    }
  }

  // directie daca se misca
  if (Math.abs(car.vel) > 0.1) {
    const dir = Math.sign(car.vel);
    if (left) {
      car.angle += car.turnSpeed * dt * dir;
    }
    if (right) {
      car.angle -= car.turnSpeed * dt * dir;
    }
  }

  // miscare
  car.x += Math.sin(car.angle) * car.vel * dt;
  car.z += Math.cos(car.angle) * car.vel * dt;

  // limitare la teren
  car.x = Math.max(-CONFIG.MAP_LIMIT, Math.min(CONFIG.MAP_LIMIT, car.x));
  car.z = Math.max(-CONFIG.MAP_LIMIT, Math.min(CONFIG.MAP_LIMIT, car.z));

  // actualizare pozitie masina
  carGroup.position.set(car.x, 0, car.z);
  carGroup.rotation.y = car.angle;

  // roti se rotesc
  const wheelRot = car.vel * dt * CAR_CONFIG.WHEEL_ROTATION_MULT;
  wheels.forEach((w) => {
    w.rotation.x += wheelRot;
  });
  const steerAngle =
    (keys["ArrowLeft"] ? 1 : keys["ArrowRight"] ? -1 : 0) * CAR_CONFIG.STEER_ANGLE;
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
      msg.textContent = "Boum! Treci la urmatorul!";
      msg.style.color = "white";

      spanwParticles(sg.position.clone(), stoneColors[i]);

      car.vel *= STONE_CONFIG.VELOCITY_REDUCTION;
      if (score >= STONE_CONFIG.COUNT) {
        setTimeout(() => {
          msg.textContent =
            "Felicitari! Ai terminat jocul! Apasa R pentru reset.";
          msg.style.color = "red";
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
      Math.max(0, Math.sin(t * STONE_CONFIG.BOUNCE_SPEED) * STONE_CONFIG.BOUNCE_HEIGHT * Math.exp(-t * STONE_CONFIG.BOUNCE_DECAY));
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
    }
  });

  // particule
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy -= PARTICLE_CONFIG.GRAVITY * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.life -= dt * PARTICLE_CONFIG.LIFE_DECAY;
    p.mesh.material.opacity = Math.max(0, p.life);
    p.mesh.material.transparent = true;

    if (p.mesh.position.y < 0 || p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }

  // camera care urmareste masna
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

  renderer.render(scene, camera);
}
animate();
