/**
 * Configureaza luminile scenei
 * @param {THREE.Scene} scene - Scena Three.js
 */
export function setupLights(scene) {
  // Lumina ambientala
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Lumina directionala (soare)
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -30;
  sun.shadow.camera.right = sun.shadow.camera.top = 30;
  scene.add(sun);

  return { ambient, sun };
}
