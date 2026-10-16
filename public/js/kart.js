// ════════════════════════════════════════════════════════════
//  kart.js  –  3D Kart Model Builder & Visual Controller
// ════════════════════════════════════════════════════════════
'use strict';

class Kart {
  constructor(scene, charKey = 'mario', kartKey = 'standard', isLocal = false) {
    this.scene = scene;
    this.charKey = charKey;
    this.kartKey = kartKey;
    this.isLocal = isLocal;

    // Fetch stats and attributes
    this.charData = CHARACTERS[charKey] || CHARACTERS.mario;
    this.kartData = KARTS[kartKey] || KARTS.standard;
    this.stats = getEffectiveStats(charKey, kartKey);

    // Three.js hierarchy container
    this.mesh = new THREE.Group();
    this.wheels = [];
    this.driverMesh = null;
    this.sparkParticles = [];

    // Transform tracking
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();

    // Visual states
    this.steerAngle = 0;
    this.wheelRotation = 0;
    this.driftSparksActive = false;
    this.sparkColor = 0x00ffff; // Blue mini-turbo default

    this._buildModel();
    this.scene.add(this.mesh);
  }

  // ── Build 3D Geometry for Kart & Driver ──────────────────
  _buildModel() {
    const mainColor = this.kartData.color || parseInt(this.charData.color.replace('#', '0x'));

    // 1. Kart Main Body Chassis
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.4, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.3,
      metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Front Nose / Bumper
    const noseGeo = new THREE.BoxGeometry(1.1, 0.25, 0.6);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.3, 1.0);
    nose.castShadow = true;
    this.mesh.add(nose);

    // Seat Back
    const seatGeo = new THREE.BoxGeometry(0.8, 0.6, 0.2);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.6, -0.4);
    this.mesh.add(seat);

    // 2. Wheels Setup
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });

    const wheelPositions = [
      { x: -0.75, y: 0.3, z: 0.7, front: true },   // Front Left
      { x: 0.75, y: 0.3, z: 0.7, front: true },    // Front Right
      { x: -0.75, y: 0.3, z: -0.7, front: false },  // Rear Left
      { x: 0.75, y: 0.3, z: -0.7, front: false }   // Rear Right
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      wheelMesh.castShadow = true;

      // Hubcap detail
      const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.26, 8);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.z = Math.PI / 2;

      wheelGroup.add(wheelMesh);
      wheelGroup.add(hub);
      this.mesh.add(wheelGroup);

      this.wheels.push({ group: wheelGroup, isFront: pos.front });
    });

    // 3. Driver Body & Head
    const driverGroup = new THREE.Group();
    driverGroup.position.set(0, 0.6, -0.2);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.6, 0.6, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: mainColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.3;
    driverGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.75;
    driverGroup.add(head);

    this.driverMesh = driverGroup;
    this.mesh.add(driverGroup);
  }

  // ── Set Transform Directly ──────────────────────────────
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.mesh.position.copy(this.position);
  }

  setHeading(angleY) {
    this.rotation.y = angleY;
    this.mesh.rotation.y = angleY;
  }

  // ── Visual Frame Update ─────────────────────────────────
  updateVisuals(speed, steeringInput, isDrifting = false, boostTier = 0) {
    // 1. Roll Wheels based on speed
    this.wheelRotation += speed * 0.1;

    // 2. Turn Front Wheels
    const targetSteer = steeringInput * 0.4;
    this.steerAngle += (targetSteer - this.steerAngle) * 0.2;

    this.wheels.forEach((w) => {
      w.group.children[0].rotation.x = this.wheelRotation;
      if (w.isFront) {
        w.group.rotation.y = this.steerAngle;
      }
    });

    // 3. Driver Tilt during turns
    if (this.driverMesh) {
      this.driverMesh.rotation.z = -this.steerAngle * 0.5;
    }

    // 4. Update Drift Sparks
    if (isDrifting && boostTier > 0) {
      this.sparkColor = boostTier === 1 ? 0x00ffff : 0xffa500;
      this.setSparksActive(true);
    } else {
      this.setSparksActive(false);
    }

    // Sync mesh container transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }

  setSparksActive(active) {
    this.driftSparksActive = active;
  }

  // ── Cleanup ─────────────────────────────────────────────
  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }
}
