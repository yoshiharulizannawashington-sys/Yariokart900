JavaScript
// ════════════════════════════════════════════════════════════
//  circuits.js  –  3D Track Builders
// ════════════════════════════════════════════════════════════
'use strict';

const CIRCUITS = {
    figure8: {
        name: 'Figure-8 Circuit',
        difficulty: '⭐',
        meta: { bgColor: 0x70c8ff, fogDensity: 0.005 },
        startPos: [
            { x: 0, y: 0.5, z: 20, ry: 0 },
            { x: -3, y: 0.5, z: 23, ry: 0 },
            { x: 3, y: 0.5, z: 23, ry: 0 },
            { x: -3, y: 0.5, z: 26, ry: 0 },
            { x: 3, y: 0.5, z: 26, ry: 0 },
            { x: -3, y: 0.5, z: 29, ry: 0 },
            { x: 3, y: 0.5, z: 29, ry: 0 },
            { x: 0, y: 0.5, z: 32, ry: 0 }
        ],
        build(scene) {
            const collidables = [];
            const minimapPath = [];

            // Ground Grass
            const grassGeo = new THREE.PlaneGeometry(300, 300);
            const grassMat = new THREE.MeshStandardMaterial({ color: MK.COL.GRASS, roughness: 0.8 });
            const grass = new THREE.Mesh(grassGeo, grassMat);
            grass.rotation.x = -Math.PI / 2;
            grass.receiveShadow = true;
            scene.add(grass);

            // Generate Figure-8 loop points
            const points = [];
            const segments = 100;
            const scaleX = 40;
            const scaleZ = Here is the code for **`public/js/circuits.js`**. This file builds the 3D track geometries using Three.js for the four race circuits (Figure-8 Circuit, Yoshi Falls, Cheep Cheep Beach, and Luigi's Mansion).

On GitHub, click **Add file** $\rightarrow$ **Create new file**, type `public/js/circuits.js` in the file name box, paste this code, and click **Commit changes...**:

```javascript
// ════════════════════════════════════════════════════════════
//  circuits.js – 3D Circuit Track Builders (Three.js)
// ════════════════════════════════════════════════════════════
'use strict';

const CIRCUITS = {
  figure8: {
    name: 'Figure-8 Circuit',
    difficulty: '⭐',
    meta: { bgColor: 0x70c8ff },
    startPos: [
      { x: 0, y: 0.5, z: 0, ry: 0 },
      { x: -3, y: 0.5, z: -2, ry: 0 },
      { x: 3, y: 0.5, z: -2, ry: 0 },
      { x: -3, y: 0.5, z: -5, ry: 0 },
      { x: 3, y: 0.5, z: -5, ry: 0 },
      { x: -3, y: 0.5, z: -8, ry: 0 },
      { x: 3, y: 0.5, z: -8, ry: 0 },
      { x: 0, y: 0.5, z: -10, ry: 0 },
    ],
    build(scene) {
      const collidables = [];
      const minimapPath = [];

      // Ground plane (Grass)
      const groundGeo = new THREE.PlaneGeometry(300, 300);
      const groundMat = new THREE.MeshStandardMaterial({ color: MK.COL.GRASS });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Figure-8 track path generation
      const points = [];
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const scale = 60;
        const x = Math.sin(t) * scale;
        const z = Math.sin(t) * Math.cos(t) * scale;
        points.push(new THREE.Vector3(x, 0.05, z));
        minimapPath.push({ x, z });
      }

      const trackCurve = new THREE.CatmullRomCurve3(points);
      const trackGeo = new THREE.TubeGeometry(trackCurve, 120, 6, 8, false);
      const trackMat = new THREE.MeshStandardMaterial({ color: MK.COL.ROAD });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.scale.set(1, 0.02, 1);
      track.receiveShadow = true;
      scene.add(track);

      // Finish line structure
      const finishGeo = new THREE.BoxGeometry(14, 0.1, 2);
      const finishMat = new THREE.MeshStandardMaterial({ color: MK.COL.FINISHLINE });
      const finish = new THREE.Mesh(finishGeo, finishMat);
      finish.position.set(0, 0.08, 0);
      scene.add(finish);

      // Item Boxes around the loop
      const boxPositions = [
        { x: 0, z: 25 },
        { x: 0, z: -25 },
        { x: -35, z: 0 },
        { x: 35, z: 0 }
      ];

      const itemBoxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const itemBoxMat = new THREE.MeshStandardMaterial({ color: MK.COL.ITEM_BOX, roughness: 0.2 });

      boxPositions.forEach(p => {
        const box = new THREE.Mesh(itemBoxGeo, itemBoxMat);
        box.position.set(p.x, 1.0, p.z);
        box.userData = { isItemBox: true };
        scene.add(box);
      });

      return { collidables, minimapPath };
    }
  },

  yoshifalls: {
    name: 'Yoshi Falls',
    difficulty: '⭐',
    meta: { bgColor: 0x44aaee },
    startPos: [
      { x: 0, y: 0.5, z: 0, ry: 0 },
      { x: -3, y: 0.5, z: -2, ry: 0 },
      { x: 3, y: 0.5, z: -2, ry: 0 },
      { x: 0, y: 0.5, z: -5, ry: 0 }
    ],
    build(scene) {
      const collidables = [];
      const minimapPath = [];

      // Oval ring path
      const points = [];
      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const x = Math.cos(t) * 45;
        const z = Math.sin(t) * 25;
        points.push(new THREE.Vector3(x, 0.05, z));
        minimapPath.push({ x, z });
      }

      const groundGeo = new THREE.PlaneGeometry(200, 200);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x228833 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const trackCurve = new THREE.CatmullRomCurve3(points);
      const trackGeo = new THREE.TubeGeometry(trackCurve, 80, 7, 8, true);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x555566 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.scale.set(1, 0.02, 1);
      scene.add(track);

      return { collidables, minimapPath };
    }
  },

  cheepcheep: {
    name: 'Cheep Cheep Beach',
    difficulty: '⭐⭐',
    meta: { bgColor: 0x88ccff },
    startPos: [
      { x: 0, y: 0.5, z: 0, ry: 0 },
      { x: -3, y: 0.5, z: -2, ry: 0 },
      { x: 3, y: 0.5, z: -2, ry: 0 },
      { x: 0, y: 0.5, z: -5, ry: 0 }
    ],
    build(scene) {
      const collidables = [];
      const minimapPath = [];

      const groundGeo = new THREE.PlaneGeometry(250, 250);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0xddcc88 }); // Sand
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const points = [];
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * Math.PI * 2;
        const x = Math.cos(t) * 50;
        const z = Math.sin(t) * 35;
        points.push(new THREE.Vector3(x, 0.05, z));
        minimapPath.push({ x, z });
      }

      const trackCurve = new THREE.CatmullRomCurve3(points);
      const trackGeo = new THREE.TubeGeometry(trackCurve, 60, 6, 8, true);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x665544 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.scale.set(1, 0.02, 1);
      scene.add(track);

      return { collidables, minimapPath };
    }
  },

  luigimansion: {
    name: "Luigi's Mansion",
    difficulty: '⭐⭐⭐',
    meta: { bgColor: 0x111122 },
    startPos: [
      { x: 0, y: 0.5, z: 0, ry: 0 },
      { x: -3, y: 0.5, z: -2, ry: 0 },
      { x: 3, y: 0.5, z: -2, ry: 0 },
      { x: 0, y: 0.5, z: -5, ry: 0 }
    ],
    build(scene) {
      const collidables = [];
      const minimapPath = [];

      const groundGeo = new THREE.PlaneGeometry(200, 200);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1d2e1d });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Square haunted circuit
      const corners = [
        { x: -30, z: -30 },
        { x: 30, z: -30 },
        { x: 30, z: 30 },
        { x: -30, z: 30 }
      ];

      const points = corners.map(c => new THREE.Vector3(c.x, 0.05, c.z));
      points.push(new THREE.Vector3(corners[0].x, 0.05, corners[0].z));
      points.forEach(p => minimapPath.push({ x: p.x, z: p.z }));

      const trackCurve = new THREE.CatmullRomCurve3(points);
      const trackGeo = new THREE.TubeGeometry(trackCurve, 60, 6, 8, true);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.scale.set(1, 0.02, 1);
      scene.add(track);

      return { collidables, minimapPath };
    }
  }
};
