JavaScript
// ════════════════════════════════════════════════════════════
//  items.js  –  Power-Up & Weapon Manager
// ════════════════════════════════════════════════════════════
'use strict';

class ItemManager {
  constructor(scene) {
    this.scene = scene;
    this.activeItems = []; // Shells, bananas, bob-ombs dropped on track
  }

  // Deploy an item used by a kart
  useItem(kart, itemType) {
    AUDIO.play('item_use');
    const pos = kart.position.clone();
    const heading = kart.rotation.y;

    switch (itemType) {
      case ITEM.MUSHROOM:
        // Speed boost
        if (window.gameInstance && window.gameInstance.physics) {
          window.gameInstance.physics.applyBoost(MK.MUSHROOM_BOOST, MK.MUSHROOM_DURATION);
        }
        AUDIO.play('boost');
        break;

      case ITEM.BANANA:
        // Drop banana behind kart
        const bananaPos = pos.clone().add(
          new THREE.Vector3(Math.sin(heading) * 2, 0.2, Math.cos(heading) * 2)
        );
        this.spawnTrackItem(ITEM.BANANA, bananaPos);
        NET.useItem(ITEM.BANANA, bananaPos, heading);
        break;

      case ITEM.GREEN_SHELL:
      case ITEM.RED_SHELL:
        // Launch shell forward
        const shellPos = pos.clone().add(
          new THREE.Vector3(-Math.sin(heading) * 2, 0.4, -Math.cos(heading) * 2)
        );
        this.spawnTrackItem(itemType, shellPos, heading);
        NET.useItem(itemType, shellPos, heading);
        break;

      case ITEM.BOB_OMB:
        // Throw bomb forward
        const bombPos = pos.clone().add(
          new THREE.Vector3(-Math.sin(heading) * 3, 0.5, -Math.cos(heading) * 3)
        );
        this.spawnTrackItem(ITEM.BOB_OMB, bombPos, heading);
        NET.useItem(ITEM.BOB_OMB, bombPos, heading);
        break;

      default:
        break;
    }
  }

  spawnTrackItem(type, position, heading = 0) {
    let geo, mat;

    if (type === ITEM.BANANA) {
      geo = new THREE.ConeGeometry(0.3, 0.6, 8);
      mat = new THREE.MeshStandardMaterial({ color: 0xffe135 });
    } else if (type === ITEM.GREEN_SHELL) {
      geo = new THREE.SphereGeometry(0.4, 12, 12);
      mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    } else if (type === ITEM.RED_SHELL) {
      geo = new THREE.SphereGeometry(0.4, 12, 12);
      mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    } else if (type === ITEM.BOB_OMB) {
      geo = new THREE.SphereGeometry(0.5, 12, 12);
      mat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    } else {
      return;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.activeItems.push({
      type,
      mesh,
      heading,
      speed: (type === ITEM.GREEN_SHELL || type === ITEM.RED_SHELL) ? MK.SHELL_SPEED : 0,
      lifetime: 600 // frames
    });
  }

  spawnRemoteItem(itemData) {
    const pos = new THREE.Vector3(itemData.x, itemData.y, itemData.z);
    this.spawnTrackItem(itemData.itemType, pos, itemData.heading);
  }

  update(karts, dt = 1 / 60) {
    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];
      item.lifetime--;

      // Move shells forward
      if (item.speed > 0) {
        item.mesh.position.x -= Math.sin(item.heading) * item.speed * dt;
        item.mesh.position.z -= Math.cos(item.heading) * item.speed * dt;
      }

      // Check collision with karts
      for (const kart of karts) {
        if (!kart || !kart.position) continue;
        const dist = item.mesh.position.distanceTo(kart.position);

        if (dist < 1.2) {
          AUDIO.play('hit');
          // Remove item from scene
          this.scene.remove(item.mesh);
          if (item.mesh.geometry) item.mesh.geometry.dispose();
          if (item.mesh.material) item.mesh.material.dispose();
          this.activeItems.splice(i, 1);
          break;
        }
      }

      // Remove expired items
      if (item.lifetime <= 0 && this.activeItems[i] === item) {
        this.scene.remove(item.mesh);
        if (item.mesh.geometry) item.mesh.geometry.dispose();
        if (item.mesh.material) item.mesh.material.dispose();
        this.activeItems.splice(i, 1);
      }
    }
  }
}
