// ============================================
// CONSTANTE DE CONFIGURARE
// ============================================

// Configurare generala
export const CONFIG = {
  IS_DEV: false,
  SKY_COLOR: 0x87ceeb,
  GROUND_SIZE: 60,
  GROUND_COLOR: 0x228b22,
  MAP_LIMIT: 28,
  FOG_NEAR: 30,
  FOG_FAR: 80,
};

// Camera
export const CAMERA_CONFIG = {
  FOV: 65,
  INITIAL_POS: { x: 0, y: 8, z: 14 },
  OFFSET: { x: 0, y: 6, z: -10 },
  LERP_SPEED: 0.1,
};

// Drum
export const ROAD_CONFIG = {
  WIDTH: 6,
  LENGTH: 60,
  COLOR: 0x444444,
  MARK_COLOR: 0xffffff,
  MARK_WIDTH: 0.2,
  MARK_LENGTH: 2,
  MARK_SPACING: 4,
};

// Masina
export const CAR_CONFIG = {
  BODY: {
    width: 1.4,
    height: 0.5,
    length: 3.5,
    color: 0xe74c3c,
    y: 0.45,
  },
  CABIN: {
    width: 1.4,
    height: 0.5,
    length: 1.8,
    color: 0xc0392b,
    y: 0.9,
    z: -0.2,
  },
  WINDOW: {
    width: 1.2,
    height: 0.4,
    color: 0x3498db,
    opacity: 0.7,
  },
  WHEEL: {
    radius: 0.28,
    width: 0.2,
    color: 0x333333,
    capRadius: 0.15,
    capColor: 0xffffff,
  },
  HEADLIGHT: {
    width: 0.3,
    height: 0.15,
    depth: 0.05,
    color: 0xffffaa,
  },
  TAILLIGHT: {
    width: 0.3,
    height: 0.15,
    depth: 0.05,
    color: 0x330000,
    brakeColor: 0xff0000,
    lightIntensity: 2,
  },
  REVERSELIGHT: {
    width: 0.25,
    height: 0.15,
    depth: 0.05,
    color: 0x222222,
    activeColor: 0xffffff,
    lightIntensity: 3,
  },
  PHYSICS: {
    maxSpeed: 12,
    accel: 18,
    brake: 10,
    friction: 5,
    turnSpeed: 2.2,
  },
  INITIAL_POS: { x: 0, z: 5 },
  STEER_ANGLE: 0.4,
  WHEEL_ROTATION_MULT: 2,
};

// Pietre - Modifica COUNT pentru a schimba numarul de pietre in joc
export const STONE_CONFIG = {
  COUNT: 15, // Numarul de pietre pe teren (modifica acest numar pentru mai multe/mai putine pietre)
  COLORS: [
    0x7f8c8d, 0x95a5a6, 0xbdc3c7, 0x606d6e, 0x889899, 0xa0a8a9, 0x6b7879,
    0x8f9a9b, 0xc5cbcc, 0x707b7c, 0x98a3a4, 0xb8bfc0, 0x788384, 0x909b9c,
    0xccd2d3,
  ], // Culori de piatra (gri/argintiu)
  SIZE_MAIN: 0.5,
  SIZE_SECONDARY: 0.3,
  SPAWN_RANGE: 50,
  INITIAL_Y: 0.18, // Inaltime ajustata sa fie lipite de sol
  BOUNCE_SPEED: 4,
  BOUNCE_HEIGHT: 1.5,
  BOUNCE_DECAY: 2,
  BOUNCE_DURATION: 1.2,
  VELOCITY_REDUCTION: 0.35,
};

// Copaci
export const TREE_CONFIG = {
  COUNT: 50,
  MIN_DIST_BETWEEN: 2.5,
  MIN_DIST_FROM_ROAD: 4.5,
  MAX_ATTEMPTS_MULTIPLIER: 20,
  TRUNK: {
    radiusTop: 0.15,
    radiusBottom: 0.22,
    height: 1.5,
    radialSegments: 8,
    color: 0x4a3728,
    y: 0.75,
  },
  FOLIAGE: {
    // 3 niveluri de frunzis pentru aspect mai plin
    levels: [
      { radius: 1.3, height: 1.8, y: 2.1, color: 0x1e7d42 }, // Jos - verde inchis
      { radius: 1.1, height: 1.6, y: 2.8, color: 0x2ecc71 }, // Mijloc - verde mediu
      { radius: 0.8, height: 1.3, y: 3.4, color: 0x52d97a }, // Sus - verde deschis
    ],
    radialSegments: 8,
  },
};

// Particule
export const PARTICLE_CONFIG = {
  COUNT_PER_EXPLOSION: 20,
  MIN_SIZE: 0.07,
  MAX_SIZE: 0.17,
  VELOCITY_RANGE: 5,
  GRAVITY: 9.8,
  LIFE_DECAY: 1.5,
};
