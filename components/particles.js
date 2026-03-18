import { PARTICLE_CONFIG } from "../config.js";

/**
 * Creeaza sistemul de particule
 * @returns {Object} - Obiectul cu array-ul de particule si functiile de gestionare
 */
export function createParticleSystem() {
  const particles = [];

  /**
   * Spawn particule la o pozitie data
   * @param {THREE.Scene} scene - Scena
   * @param {Function} mat - Functia pentru materiale
   * @param {THREE.Vector3} pos - Pozitia exploziei
   * @param {number} color - Culoarea particulelor
   */
  function spawn(scene, mat, pos, color) {
    for (let i = 0; i < PARTICLE_CONFIG.COUNT_PER_EXPLOSION; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(
          PARTICLE_CONFIG.MIN_SIZE +
            Math.random() *
              (PARTICLE_CONFIG.MAX_SIZE - PARTICLE_CONFIG.MIN_SIZE),
          4,
          4,
        ),
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

  /**
   * Update particule in loop-ul de animatie
   * @param {THREE.Scene} scene - Scena Three.js
   * @param {number} dt - Delta time
   */
  function update(scene, dt) {
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
  }

  /**
   * Curata toate particulele
   * @param {THREE.Scene} scene - Scena Three.js
   */
  function clear(scene) {
    particles.forEach((p) => scene.remove(p.mesh));
    particles.length = 0;
  }

  return { particles, spawn, update, clear };
}
