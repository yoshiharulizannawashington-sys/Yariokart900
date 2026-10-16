JavaScript
// ════════════════════════════════════════════════════════════
//  physics.js  –  Kart Physics Engine & Drift Dynamics
// ════════════════════════════════════════════════════════════
'use strict';

class PhysicsEngine {
  constructor(kart, collidables = []) {
    this.kart = kart;
    this.collidables = collidables;

    // Movement state variables
    this.speed = 0;
    this.heading = 0;
    this.boostTimer = 0;
    this.boostPower = 0;

    // Drift state
    this.isDrifting = false;
    this.driftDir = 0; // -1 for left, 1 for right
    this.driftFrames = 0;
    this.miniTurboTier = 0; // 0 = none, 1 = blue, 2 = orange

    // Off-road state
    this.isOffroad = false;
  }

  update(inputs, dt = 1 / 60) {
    const stats = this.kart.stats;
    const { accel, brake, left, right, drift } = inputs;

    // 1. Calculate Base Acceleration & Reverse
    let maxSpd = stats.maxSpeed;
    let accelRate = stats.acceleration;

    // Apply active item/mini-turbo boost
    if (this.boostTimer > 0) {
      maxSpd += this.boostPower;
      accelRate *= 2.0;
      this.boostTimer -= dt * 60;
    } else if (this.isOffroad) {
      maxSpd *= MK.OFFTRACK_FRICTION;
    }

    if (accel) {
      this.speed = Math.min(maxSpd, this.speed + accelRate);
    } else if (brake) {
      this.speed = Math.max(-maxSpd * 0.4, this.speed - accelRate * 1.5);
    } else {
      // Natural friction deceleration
      this.speed *= 0.98;
    }

    // 2. Steering & Drifting Logic
    let steerInput = 0;
    if (left) steerInput -= 1;
    if (right) steerInput += 1;

    // Initiate Drift
    if (drift && !this.isDrifting && Math.abs(this.speed) > 3 && steerInput !== 0) {
      this.isDrifting = true;
      this.driftDir = steerInput;
      this.driftFrames = 0;
      this.miniTurboTier = 0;
      AUDIO.play('boost');
    }

    // Release Drift -> Apply Mini-Turbo Boost
    if (!drift && this.isDrifting) {
      if (this.miniTurboTier > 0) {
        this.applyBoost(
          MK.MINI_TURBO_BOOST * (this.miniTurboTier === 2 ? 1.5 : 1.0),
          MK.MINI_TURBO_DURATION
        );
        AUDIO.play('boost');
      }
      this.isDrifting = false;
      this.driftFrames = 0;
      this.miniTurboTier = 0;
    }

    // Process Active Drift
    if (this.isDrifting) {
      this.driftFrames++;

      // Drift spark charge tiers (Blue -> Orange)
      if (this.driftFrames > MK.MINI_TURBO_THRESHOLD * 1.8) {
        this.miniTurboTier = 2; // Orange mini-turbo
      } else if (this.driftFrames > MK.MINI_TURBO_THRESHOLD) {
        this.miniTurboTier = 1; // Blue mini-turbo
      }

      // Lock turn direction into drift arc
      const turnSpeed = stats.handling * 1.2;
      this.heading -= this.driftDir * turnSpeed;

      // Slight extra drift angle compensation
      if (steerInput === this.driftDir) {
        this.heading -= this.driftDir * turnSpeed * 0.4;
      }
    } else if (steerInput !== 0 && Math.abs(this.speed) > 0.1) {
      // Normal turning
      const direction = this.speed >= 0 ? 1 : -1;
      this.heading -= steerInput * stats.handling * direction;
    }

    // 3. Compute Velocity Vector
    const moveX = -Math.sin(this.heading) * this.speed * dt;
    const moveZ = -Math.cos(this.heading) * this.speed * dt;

    // Apply movement to position
    this.kart.position.x += moveX;
    this.kart.position.z += moveZ;

    // Update rotation transform
    this.kart.rotation.y = this.heading;

    // 4. Update Visual Model State
    this.kart.updateVisuals(this.speed, steerInput, this.isDrifting, this.miniTurboTier);

    // 5. Basic Boundary / Collidable Collisions
    this._checkCollisions();
  }

  applyBoost(power, durationFrames) {
    this.boostPower = power;
    this.boostTimer = durationFrames;
  }

  _checkCollisions() {
    // Basic boundary radius containment check against track obstacles
    const pos = this.kart.position;
    for (const obj of this.collidables) {
      if (!obj.position) continue;
      const dx = pos.x - obj.position.x;
      const dz = pos.z - obj.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = MK.KART_RADIUS + (obj.radius || 1.0);

      if (dist < minDist && dist > 0) {
        // Bounce kart off barrier/obstacle
        const overlap = minDist - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
        this.speed *= -MK.WALL_BOUNCE;
        AUDIO.play('hit');
      }
    }
  }
}
