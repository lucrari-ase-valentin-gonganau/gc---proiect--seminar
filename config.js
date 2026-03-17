// ============================================
// CONSTANTE DE CONFIGURARE
// ============================================

// Configurare generala
export const CONFIG = {
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

// Pietre
export const STONE_CONFIG = {
  COUNT: 3,
  COLORS: [0x7f8c8d, 0x95a5a6, 0xbdc3c7],
  SIZE_MAIN: 0.5,
  SIZE_SECONDARY: 0.3,
  SPAWN_RANGE: 50,
  INITIAL_Y: 0.35,
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
    radiusBottom: 0.2,
    height: 1.2,
    radialSegments: 6,
    color: 0x5d4037,
    y: 0.6,
  },
  TOP: {
    radius: 1.2,
    height: 2.5,
    radialSegments: 7,
    color: 0x2ecc71,
    y: 2.4,
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
