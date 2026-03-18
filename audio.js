// ============================================
// SISTEM AUDIO
// ============================================
// Gestioneaza toate efectele sonore ale jocului

class AudioManager {
  constructor() {
    this.sounds = {};
    this.engineSound = null;
    this.isEngineRunning = false;
    this.isMuted = true; // MUTED by default - activeaza cu tasta M
    this.volume = 0.5; // Volumul general (0.0 - 1.0)
    this.audioAvailable = {};
  }

  // Incarca un sunet si verifica daca exista
  loadSound(name, path) {
    try {
      const audio = new Audio(path);

      // Event listener pentru erori (fisier lipseste sau corrupt)
      audio.addEventListener("error", () => {
        this.audioAvailable[name] = false;
        // Fara log pentru erori - jocul functioneaza si fara audio
      });

      // Event listener pentru incarcare reusita
      audio.addEventListener(
        "canplaythrough",
        () => {
          this.audioAvailable[name] = true;
        },
        { once: true },
      );

      return audio;
    } catch (error) {
      this.audioAvailable[name] = false;
      return null;
    }
  }

  // Initializeaza toate sunetele
  init() {
    // Audio MUTED by default - apasa M pentru a activa

    try {
      // Sunet motor - ATENTIE: WAV poate fi foarte mare!
      // Pentru motor, este recomandat MP3 sau OGG (fisiere mai mici)
      this.engineSound = this.loadSound("engine", "sounds/engine.mp3");
      if (this.engineSound) {
        this.engineSound.loop = true;
        this.engineSound.volume = 0;
        this.engineSound.playbackRate = 0.8;
        this.engineSound.preload = "none"; // NU incarca automat - reduce sacadatul
      }

      // Sunet lovit piatra
      this.sounds.hitStone = this.loadSound("hitStone", "sounds/hit-stone.mp3");
      if (this.sounds.hitStone) {
        this.sounds.hitStone.volume = this.volume * 0.8;
        this.sounds.hitStone.preload = "metadata";
      }

      // Sunet franare
      this.sounds.brake = this.loadSound("brake", "sounds/brake.mp3");
      if (this.sounds.brake) {
        this.sounds.brake.volume = this.volume * 0.6;
        this.sounds.brake.preload = "metadata";
      }

      // Sunet zgarietura (tabla/geam)
      this.sounds.scratch = this.loadSound("scratch", "sounds/scratch.mp3");
      if (this.sounds.scratch) {
        this.sounds.scratch.volume = this.volume * 0.7;
        this.sounds.scratch.preload = "metadata";
      }

      // Sunet lovit copac/bariera (impact mai puternic)
      // Acest sunet este optional - jocul functioneaza si fara el
      this.sounds.crash = this.loadSound("crash", "sounds/crash.mp3");
      if (this.sounds.crash) {
        this.sounds.crash.volume = this.volume * 0.8;
        this.sounds.crash.preload = "metadata";
      }

      // Audio gata - muted by default
    } catch (error) {
      // Erori audio nu afecteaza jocul
    }
  }

  // Ajusteaza volumul motorului bazat pe viteza
  updateEngine(velocity, maxSpeed, isAccelerating) {
    if (
      this.isMuted ||
      !this.engineSound ||
      this.audioAvailable["engine"] === false
    )
      return;

    const speedRatio = Math.abs(velocity / maxSpeed);

    if (isAccelerating && Math.abs(velocity) > 0.1) {
      // Creste volumul si viteza de redare cand accelereaza
      const targetVolume = Math.min(0.3 + speedRatio * 0.5, 0.8);
      const targetPlaybackRate = 0.8 + speedRatio * 0.7; // 0.8 - 1.5

      this.engineSound.volume = targetVolume * this.volume;
      this.engineSound.playbackRate = targetPlaybackRate;

      if (this.engineSound.paused) {
        this.engineSound.play().catch(() => {
          // Ignora erorile de autoplay
        });
      }
    } else if (Math.abs(velocity) > 0.5) {
      // Motor la ralanti (miscare fara accelerare)
      this.engineSound.volume = Math.max(0.15, speedRatio * 0.3) * this.volume;
      this.engineSound.playbackRate = 0.8 + speedRatio * 0.3;
    } else {
      // Stop motor daca nu se misca
      this.engineSound.volume = 0;
    }
  }

  // Reda sunet lovit piatra
  playStoneHit() {
    if (this.isMuted) return;
    this.playSound("hitStone");
  }

  // Reda sunet franare
  playBrake() {
    if (this.isMuted) return;
    // Previne redarea repetata rapid
    if (
      this.sounds.brake &&
      (this.sounds.brake.paused || this.sounds.brake.currentTime > 0.5)
    ) {
      this.playSound("brake");
    }
  }

  // Reda sunet zgarietura (lovit bariera/copac)
  playScratch() {
    if (this.isMuted) return;
    this.playSound("scratch");
  }

  // Reda sunet crash puternic
  playCrash() {
    if (this.isMuted) return;
    this.playSound("crash");
  }

  // Functie helper pentru redare sunet
  playSound(soundName) {
    const sound = this.sounds[soundName];

    // Verifica daca sunetul exista si nu a dat eroare la incarcare
    if (!sound || this.audioAvailable[soundName] === false) {
      return; // Sunetul nu este disponibil - jocul continua normal
    }

    try {
      sound.currentTime = 0; // Reia de la inceput
      sound.play().catch(() => {
        // Ignora erorile pentru a nu polua consola sau bloca jocul
      });
    } catch (error) {
      // Sunetul nu se poate reda - jocul continua normal
    }
  }

  // Toggle mute pentru toate sunetele
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.engineSound.volume = 0;
      Object.values(this.sounds).forEach((sound) => {
        sound.volume = 0;
      });
    } else {
      // Restaureaza volumul
      Object.entries(this.sounds).forEach(([name, sound]) => {
        sound.volume = this.getOriginalVolume(name);
      });
    }
    return this.isMuted;
  }

  // Obtine volumul original pentru fiecare sunet
  getOriginalVolume(soundName) {
    const volumes = {
      hitStone: 0.8,
      brake: 0.6,
      scratch: 0.7,
      crash: 0.8,
    };
    return (volumes[soundName] || 0.5) * this.volume;
  }

  // Seteaza volumul general
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted) {
      Object.entries(this.sounds).forEach(([name, sound]) => {
        sound.volume = this.getOriginalVolume(name);
      });
    }
  }

  // Opreste toate sunetele
  stopAll() {
    if (this.engineSound) {
      this.engineSound.pause();
      this.engineSound.currentTime = 0;
    }
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

// Exporta o singura instanta
export const audioManager = new AudioManager();
