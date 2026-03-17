const canvas = document.getElementById("c");
const msg = document.getElementById("msg");
const scoreEl = document.getElementById("score");

// Rendare
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.tap = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x87ceeb);

// Scena si ceata
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 30, 80);

// Camera
const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 200);
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);

// Lumini
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 80;
sun.shadow.camera.left = sun.shadow.camera.bottom = -30;
sun.shadow.camera.right = sun.shadow.camera.top = 30;
scene.add(sun);

function mat(color, rough = 0.8, metal = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
  });
}

// sol
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60, 20, 20),
  mat(0x228b22, 0.9),
);
ground.rotation.x = THREE.MathUtils.degToRad(-90);
ground.receiveShadow = true;
scene.add(ground);

// dungi de drum
const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), mat(0x444444, 0.9));
road.rotation.x = THREE.MathUtils.degToRad(-90);
road.position.y = 0.01;
road.receiveShadow = true;
scene.add(road);

// Maracaj central de drum
for (let z = -28; z < 30; z += 4) {
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 2),
    mat(0xffffff, 0.9),
  );
  mark.rotation.x = THREE.MathUtils.degToRad(-90);
  mark.position.set(0, 0.02, z);
  scene.add(mark);
}

// Masina
const carGroup = new THREE.Group();

// caroserie
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 0.5, 3.5),
  mat(0xe74c3c, 0.5, 0.3),
);
body.position.y = 0.45;
body.castShadow = true;
carGroup.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 0.5, 1.8),
  mat(0xc0392b, 0.5, 0.2),
);

cabin.position.set(0, 0.9, -0.2);
cabin.castShadow = true;
carGroup.add(cabin);

// geamuri
const winMat = mat(0x3498db, 0.1, 0.9);
winMat.transparent = true;
winMat.opacity = 0.7;
const winF = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), winMat);
winF.position.set(0, 0.92, 0.71);
carGroup.add(winF);

const wheelGroup = new THREE.Group();
// roti
const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
const wheelMat = mat(0x333333, 0.8, 0.9);
const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
wheelMesh.castShadow = true;

const capGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.21, 16);
const capMat = mat(0xffffff, 0.8, 0.1);
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

// vom face mai tarziu o animatie de rotire a rotilor,
// asa ca le vom pune intr-un array pentru a le putea accesa usor
const wheels = [];
const steerPivots = [];
wheelPositions.forEach((pos, i) => {
  // pivot-ul e aliniat cu lumea — fără rotație proprie
  const pivot = new THREE.Group();
  pivot.position.set(...pos);
  carGroup.add(pivot);

  // roata e în interiorul pivot-ului, rotită pe Z
  const w = wheelGroup.clone();
  w.rotation.z = Math.PI / 2;
  w.position.set(0, 0, 0);
  pivot.add(w);

  wheels.push(w);
  if (i < 2) steerPivots.push(pivot);
});
// faruri
[
  [-0.55, 0.45, 1.76],
  [0.55, 0.45, 1.76],
].forEach((pos) => {
  const f = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.15, 0.05),
    mat(0xffffaa, 0.2, 0.5),
  );
  f.position.set(...pos);
  carGroup.add(f);
});

scene.add(carGroup);
carGroup.position.set(0, 0, 5);

// pietre
const stoneColors = [0x7f8c8d, 0x95a5a6, 0xbdc3c7];

// random stones pe langa drum
const stonePositions = Array.from({ length: 3 }).map(() => [
  (Math.random() - 0.5) * 50,
  0,
  (Math.random() - 0.5) * 50,
]);

const stones = [];
const stoneData = [];

stonePositions.forEach((pos, i) => {
  const sg = new THREE.Group();

  const s1 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.5, 0),
    mat(stoneColors[i], 0.95),
  );
  s1.scale.set(1, 0.6, 1);
  s1.castShadow = true;
  sg.add(s1);

  const s2 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.3, 0),
    mat(stoneColors[i] + 0x111111, 0.95),
  );
  s2.position.set(0.3, 0.2, -0.2);
  s2.castShadow = true;
  sg.add(s2);

  sg.position.set(...pos);
  sg.position.y = 0.35;
  sg.rotation.y = Math.random() * Math.PI;

  scene.add(sg);
  stones.push(sg);
  stoneData.push({ hit: false, originalY: 0.35, bounceT: 0 });
});

const threes = [];

// Copaci decorativi
[
  [-8, 0, -5],
  [-10, 0, 3],
  [8, 0, -10],
  [9, 0, 2],
  [-7, 0, -18],
  [8, 0, -20],
].forEach((pos) => {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6),
    mat(0x5d4037, 0.95, 0.1),
  );

  trunk.position.set(pos[0], 0.6, pos[2]);
  trunk.castShadow = true;
  scene.add(trunk);

  const top = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2.5, 7),
    mat(0x2ecc71, 0.95, 0.1),
  );
  top.position.set(pos[0], 2.4, pos[2]);
  top.castShadow = true;
  scene.add(top);
  threes.push({ trunk, top });
});

// stari masina default
const carInitial = {
  vel: 0,
  angle: 0,
  x: 0,
  z: 5,
  maxSpeed: 12,
  accel: 18,
  brake: 10,
  friction: 5,
  turnSpeed: 2.2,
};

const car = { ...carInitial };

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
  for (let i = 0; i < 20; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + Math.random() * 0.1, 4, 4),
      mat(color, 0.8),
    );
    p.position.copy(pos);
    scene.add(p);
    particles.push({
      mesh: p,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 5,
      vz: (Math.random() - 0.5) * 5,
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
    sg.position.y = 0.35;
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
  car.x = Math.max(-28, Math.min(28, car.x));
  car.z = Math.max(-28, Math.min(28, car.z));

  // actualizare pozitie masina
  carGroup.position.set(car.x, 0, car.z);
  carGroup.rotation.y = car.angle;

  // roti se rotesc
  const wheelRot = car.vel * dt * 2;
  wheels.forEach((w) => {
    w.rotation.x += wheelRot;
  });
  const steerAngle =
    (keys["ArrowLeft"] ? 1 : keys["ArrowRight"] ? -1 : 0) * 0.4;
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

      car.vel *= 0.35;
      if (score >= 3) {
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
      Math.max(0, Math.sin(t * 4) * 1.5 * Math.exp(-t * 2));
    sg.rotation.x += 3 * dt;
    sg.rotation.z += 2 * dt;
    if (t > 1.2) sg.visible = false;
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
    p.vy -= 9.8 * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.life -= dt * 1.5;
    p.mesh.material.opacity = Math.max(0, p.life);
    p.mesh.material.transparent = true;

    if (p.mesh.position.y < 0 || p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }

  // camera care urmareste masna
  const camOffset = new THREE.Vector3(
    Math.sin(car.angle) * -10,
    6,
    Math.cos(car.angle) * -10,
  );
  camera.position.lerp(
    new THREE.Vector3(car.x + camOffset.x, camOffset.y, car.z + camOffset.z),
    0.1,
  );

  camera.lookAt(car.x, 1, car.z);

  renderer.render(scene, camera);
}
animate();
