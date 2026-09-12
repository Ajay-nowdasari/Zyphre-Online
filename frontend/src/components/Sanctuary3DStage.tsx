'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from './AudioEngine';
import { Sparkles, Eye, Swords, Shield, Box } from 'lucide-react';

interface Sanctuary3DStageProps {
  equippedGear: string[];
  mode: 'HERO_SANCTUARY' | 'BOSS_COLOSSEUM';
  bossHpPercent?: number;
  bossName?: string;
  attackTrigger?: number; // Incrementing triggers attack animation in 3D!
  onChestClick?: () => void;
}

export const Sanctuary3DStage: React.FC<Sanctuary3DStageProps> = ({
  equippedGear,
  mode,
  bossHpPercent = 100,
  bossName = 'Chronos, The Void-Titan',
  attackTrigger = 0,
  onChestClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCameraView, setActiveCameraView] = useState<'ORBIT' | 'HERO_FOCUS' | 'CINEMATIC'>('ORBIT');

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070b, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    if (mode === 'HERO_SANCTUARY') {
      camera.position.set(0, 1.4, 4.4);
    } else {
      camera.position.set(0, 2.2, 6.2);
    }

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x2a2835, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d0, 2.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Dynamic torch / magic lights
    const goldTorchLight = new THREE.PointLight(0xf59e0b, 3.5, 8);
    goldTorchLight.position.set(-2.5, 2, 1);
    scene.add(goldTorchLight);

    const cyanRuneLight = new THREE.PointLight(0x00f0ff, 3.0, 8);
    cyanRuneLight.position.set(2.5, 1.5, 1);
    scene.add(cyanRuneLight);

    let bossLight: THREE.PointLight | null = null;
    if (mode === 'BOSS_COLOSSEUM') {
      bossLight = new THREE.PointLight(0xf43f5e, 5.0, 10);
      bossLight.position.set(0, 2.5, 0);
      scene.add(bossLight);
    }

    // 4. Sanctuary Dais / Stone Arena Floor
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const floorGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.3, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x11131c,
      roughness: 0.7,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.95;
    floor.receiveShadow = true;
    arenaGroup.add(floor);

    // Outer Runic Gold Ring
    const runicRingGeo = new THREE.TorusGeometry(2.9, 0.04, 16, 64);
    const runicRingMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    const runicRing = new THREE.Mesh(runicRingGeo, runicRingMat);
    runicRing.rotation.x = Math.PI / 2;
    runicRing.position.y = -0.78;
    arenaGroup.add(runicRing);

    // Inner Glowing Cyan Sigil Ring
    const sigilRingGeo = new THREE.TorusGeometry(1.6, 0.03, 16, 64);
    const sigilRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const sigilRing = new THREE.Mesh(sigilRingGeo, sigilRingMat);
    sigilRing.rotation.x = Math.PI / 2;
    sigilRing.position.y = -0.78;
    arenaGroup.add(sigilRing);

    // 5. Hero Character Model
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    if (mode === 'BOSS_COLOSSEUM') {
      heroGroup.position.set(0, 0, 1.8); // Position hero in front of boss
    } else {
      heroGroup.position.set(0, 0, 0);
    }

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1d2e,
      roughness: 0.25,
      metalness: 0.85,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.9,
    });

    const bodyGroup = new THREE.Group();
    heroGroup.add(bodyGroup);

    // Torso (Gothic plate)
    const torsoGeo = new THREE.CylinderGeometry(0.36, 0.26, 0.85, 8);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    bodyGroup.add(torso);

    // Chest Arcana Core
    const arcanaCoreGeo = new THREE.OctahedronGeometry(0.14);
    const arcanaCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const arcanaCore = new THREE.Mesh(arcanaCoreGeo, arcanaCoreMat);
    arcanaCore.position.set(0, 0.5, 0.3);
    bodyGroup.add(arcanaCore);

    // Knight Helm
    const helmGeo = new THREE.DodecahedronGeometry(0.24);
    const helm = new THREE.Mesh(helmGeo, armorMat);
    helm.position.y = 1.15;
    helm.castShadow = true;
    bodyGroup.add(helm);

    // Visor of Will (Golden Glow)
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.16);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.15, 0.18);
    bodyGroup.add(visor);

    // Pauldrons (Gold filigree shoulders)
    const pauldronGeo = new THREE.BoxGeometry(0.24, 0.3, 0.3);
    const leftPauldron = new THREE.Mesh(pauldronGeo, goldTrimMat);
    leftPauldron.position.set(-0.52, 0.72, 0);
    bodyGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, goldTrimMat);
    rightPauldron.position.set(0.52, 0.72, 0);
    bodyGroup.add(rightPauldron);

    // Greaves (Legs)
    const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.75, 8);
    const leftLeg = new THREE.Mesh(legGeo, armorMat);
    leftLeg.position.set(-0.2, -0.35, 0);
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, armorMat);
    rightLeg.position.set(0.2, -0.35, 0);
    bodyGroup.add(rightLeg);

    // 6. Dynamic 3D Equipment
    const hasGear = (key: string) => equippedGear.includes(key);

    // Sunforged Flaming Broadsword
    if (hasGear('GEAR_CYBER_KATANA') || mode === 'BOSS_COLOSSEUM') {
      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(0.65, 0.45, 0.25);
      bladeGroup.rotation.z = -0.3;
      bodyGroup.add(bladeGroup);

      // Steel blade core
      const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.04);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.15,
      });
      const swordBlade = new THREE.Mesh(bladeGeo, bladeMat);
      bladeGroup.add(swordBlade);

      // Glowing Solar/Fire aura around blade
      const auraGeo = new THREE.BoxGeometry(0.12, 1.44, 0.07);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.55,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      bladeGroup.add(aura);

      // Golden ornate crossguard
      const crossguardGeo = new THREE.BoxGeometry(0.36, 0.08, 0.12);
      const crossguard = new THREE.Mesh(crossguardGeo, goldTrimMat);
      crossguard.position.set(0, -0.65, 0);
      bladeGroup.add(crossguard);

      // Pommel with ruby gem
      const pommelGeo = new THREE.OctahedronGeometry(0.06);
      const pommelMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
      const pommel = new THREE.Mesh(pommelGeo, pommelMat);
      pommel.position.set(0, -0.85, 0);
      bladeGroup.add(pommel);
    }

    // Seraphic Angelic Wings of Celestial Gold
    if (hasGear('GEAR_CHRONO_WINGS')) {
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.25,
        wireframe: false,
      });

      // Left Wing Array
      const lWingGroup = new THREE.Group();
      lWingGroup.position.set(-0.35, 0.6, -0.25);
      bodyGroup.add(lWingGroup);

      for (let i = 0; i < 4; i++) {
        const featherGeo = new THREE.ConeGeometry(0.12 - i * 0.02, 1.1 - i * 0.15, 5);
        const feather = new THREE.Mesh(featherGeo, wingMat);
        feather.position.set(-0.2 - i * 0.18, 0.3 - i * 0.1, 0);
        feather.rotation.z = 0.7 + i * 0.25;
        feather.rotation.y = -0.2;
        lWingGroup.add(feather);
      }

      // Right Wing Array
      const rWingGroup = new THREE.Group();
      rWingGroup.position.set(0.35, 0.6, -0.25);
      bodyGroup.add(rWingGroup);

      for (let i = 0; i < 4; i++) {
        const featherGeo = new THREE.ConeGeometry(0.12 - i * 0.02, 1.1 - i * 0.15, 5);
        const feather = new THREE.Mesh(featherGeo, wingMat);
        feather.position.set(0.2 + i * 0.18, 0.3 - i * 0.1, 0);
        feather.rotation.z = -(0.7 + i * 0.25);
        feather.rotation.y = 0.2;
        rWingGroup.add(feather);
      }
    }

    // Aegis Kite Shield of Valor (Heraldic Knight Shield)
    if (hasGear('GEAR_AEGIS_SHIELD')) {
      const shieldGroup = new THREE.Group();
      shieldGroup.position.set(-0.68, 0.45, 0.28);
      bodyGroup.add(shieldGroup);

      // Heater / Kite Shield Plate
      const shieldGeo = new THREE.CylinderGeometry(0.32, 0.16, 0.85, 6);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x141824,
        roughness: 0.3,
        metalness: 0.85,
      });
      const shieldPlate = new THREE.Mesh(shieldGeo, shieldMat);
      shieldPlate.rotation.z = Math.PI;
      shieldGroup.add(shieldPlate);

      // Gold Filigree Border & Cross on Shield
      const crossVertGeo = new THREE.BoxGeometry(0.06, 0.7, 0.02);
      const crossVert = new THREE.Mesh(crossVertGeo, goldTrimMat);
      crossVert.position.z = 0.15;
      shieldGroup.add(crossVert);

      const crossHorizGeo = new THREE.BoxGeometry(0.3, 0.06, 0.02);
      const crossHoriz = new THREE.Mesh(crossHorizGeo, goldTrimMat);
      crossHoriz.position.set(0, 0.1, 0.15);
      shieldGroup.add(crossHoriz);
    }

    // Crown of the Sun King (Levitating Runic Diadem)
    if (hasGear('GEAR_RUNIC_HALO')) {
      const haloGeo = new THREE.TorusGeometry(0.44, 0.028, 16, 32);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xd4af37,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2.1;
      halo.position.set(0, 1.55, 0);
      bodyGroup.add(halo);
    }

    // 7. Interactive 3D Treasure Chest in Sanctuary Mode
    let chestGroup: THREE.Group | null = null;
    if (mode === 'HERO_SANCTUARY') {
      chestGroup = new THREE.Group();
      chestGroup.position.set(1.5, -0.7, 0.8);
      scene.add(chestGroup);

      // Chest Body
      const chestBaseGeo = new THREE.BoxGeometry(0.55, 0.35, 0.4);
      const chestMat = new THREE.MeshStandardMaterial({
        color: 0x3d2714,
        roughness: 0.6,
        metalness: 0.4,
      });
      const chestBase = new THREE.Mesh(chestBaseGeo, chestMat);
      chestBase.position.y = 0.17;
      chestGroup.add(chestBase);

      // Chest Gilded Edges
      const rimGeo = new THREE.BoxGeometry(0.57, 0.05, 0.42);
      const chestRim = new THREE.Mesh(rimGeo, goldTrimMat);
      chestRim.position.y = 0.35;
      chestGroup.add(chestRim);

      // Gold Sparkle Particles over Chest
      const sparkleCount = 15;
      const spGeo = new THREE.BufferGeometry();
      const spPos = new Float32Array(sparkleCount * 3);
      for (let i = 0; i < sparkleCount * 3; i += 3) {
        spPos[i] = (Math.random() - 0.5) * 0.6;
        spPos[i + 1] = 0.3 + Math.random() * 0.5;
        spPos[i + 2] = (Math.random() - 0.5) * 0.5;
      }
      spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
      const spMat = new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 0.04,
        transparent: true,
        opacity: 0.9,
      });
      const chestSparkles = new THREE.Points(spGeo, spMat);
      chestGroup.add(chestSparkles);
    }

    // 8. 3D World Boss Colosseum Titan (in BOSS mode)
    let bossGroup: THREE.Group | null = null;
    let bossCore: THREE.Mesh | null = null;
    if (mode === 'BOSS_COLOSSEUM') {
      bossGroup = new THREE.Group();
      bossGroup.position.set(0, 1.2, -1.8);
      scene.add(bossGroup);

      // Boss Polyhedral Titan Body
      const titanGeo = new THREE.DodecahedronGeometry(1.2, 0);
      const titanMat = new THREE.MeshStandardMaterial({
        color: 0x1f0f18,
        roughness: 0.2,
        metalness: 0.9,
      });
      const titanBody = new THREE.Mesh(titanGeo, titanMat);
      bossGroup.add(titanBody);

      // Glowing Blood-Red Core
      const bCoreGeo = new THREE.OctahedronGeometry(0.6, 1);
      const bCoreMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      bossCore = new THREE.Mesh(bCoreGeo, bCoreMat);
      bossGroup.add(bossCore);

      // Menacing Horns / Spikes
      const hornGeo = new THREE.ConeGeometry(0.2, 1.0, 4);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x0a0508, roughness: 0.4 });

      const lHorn = new THREE.Mesh(hornGeo, hornMat);
      lHorn.position.set(-0.9, 1.2, 0);
      lHorn.rotation.z = 0.5;
      bossGroup.add(lHorn);

      const rHorn = new THREE.Mesh(hornGeo, hornMat);
      rHorn.position.set(0.9, 1.2, 0);
      rHorn.rotation.z = -0.5;
      bossGroup.add(rHorn);

      // Orbiting Dark Energy Rings
      const bossRingGeo = new THREE.TorusGeometry(1.6, 0.03, 16, 64);
      const bossRingMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: true });
      const bRing = new THREE.Mesh(bossRingGeo, bossRingMat);
      bossGroup.add(bRing);
    }

    // 9. Combat Projectile / Solar Wrath Beam (Activated upon attackTrigger)
    let attackBeam: THREE.Mesh | null = null;
    let attackProgress = 0;
    let isAttacking = false;

    if (attackTrigger > 0 && mode === 'BOSS_COLOSSEUM') {
      isAttacking = true;
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.4, 16);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      attackBeam = new THREE.Mesh(beamGeo, beamMat);
      attackBeam.rotation.x = Math.PI / 2;
      attackBeam.position.set(0, 1.0, 0);
      scene.add(attackBeam);
      sound.playQuestComplete();
    }

    // 10. Ambient Floating Sparks Swarm
    const sparkCount = 80;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i += 3) {
      const rad = 1.5 + Math.random() * 2.2;
      const ang = Math.random() * Math.PI * 2;
      sPos[i] = Math.cos(ang) * rad;
      sPos[i + 1] = (Math.random() - 0.5) * 3.0;
      sPos[i + 2] = Math.sin(ang) * rad;
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({
      color: mode === 'BOSS_COLOSSEUM' ? 0xf43f5e : 0xf59e0b,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
    });
    const sparkPoints = new THREE.Points(sGeo, sMat);
    scene.add(sparkPoints);

    // 11. Mouse / Touch Orbit Controls
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      targetRotY += (clientX - prevX) * 0.008;
      prevX = clientX;
    };
    const onUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('touchstart', onDown);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);

    // 12. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth rotation
      if (mode === 'HERO_SANCTUARY') {
        heroGroup.rotation.y += (targetRotY - heroGroup.rotation.y) * 0.08;
        if (!isDragging) targetRotY += 0.0025;
      } else {
        arenaGroup.rotation.y += (targetRotY - arenaGroup.rotation.y) * 0.08;
        if (!isDragging) targetRotY += 0.002;
      }

      // Hero breathing float
      bodyGroup.position.y = Math.sin(t * 2.2) * 0.04;
      arcanaCore.rotation.y = t * 2;

      // Sigil rings slow spin
      sigilRing.rotation.z = t * 0.3;
      runicRing.rotation.z = -t * 0.15;

      // Boss Animation in Colosseum
      if (bossGroup && bossCore) {
        bossGroup.position.y = 1.2 + Math.sin(t * 1.5) * 0.15;
        bossGroup.rotation.y = t * 0.4;
        bossCore.rotation.x = t * 0.8;
        const scale = 1.0 + Math.sin(t * 3) * 0.1;
        bossCore.scale.set(scale, scale, scale);
      }

      // Attack Beam animation
      if (isAttacking && attackBeam) {
        attackProgress += 0.06;
        attackBeam.scale.set(1, Math.min(1, attackProgress), 1);
        if (attackProgress > 1.5) {
          scene.remove(attackBeam);
          isAttacking = false;
        }
      }

      sparkPoints.rotation.y = t * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dom.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('resize', onResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mode, equippedGear, attackTrigger, bossHpPercent]);

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[440px] select-none cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 3D Scene Controls & Overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-auto">
        <span className="px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{mode === 'HERO_SANCTUARY' ? 'HERO SANCTUARY 3D' : 'BOSS COLOSSEUM 3D'}</span>
        </span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md text-xs text-white/75 flex items-center gap-2 shadow-2xl font-mono">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>Click & Drag to Orbit 3D World</span>
      </div>
    </div>
  );
};
