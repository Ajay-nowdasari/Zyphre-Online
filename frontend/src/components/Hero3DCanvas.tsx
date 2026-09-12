'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from './ThemeContext';

interface Hero3DCanvasProps {
  level: number;
  equippedGear: string[];
  isLevelingUp?: boolean;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({
  level,
  equippedGear,
  isLevelingUp,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 3. Theme-based Colors (Elden Realm / High Fantasy)
    let primaryColorHex = 0xd4af37; // Royal Gold
    let secondaryColorHex = 0xf59e0b; // Amber Fire
    let ambientLightColor = 0x252835;

    if (theme === 'CATHEDRAL_ARCANA') {
      primaryColorHex = 0x3b82f6; // Arcane sapphire
      secondaryColorHex = 0x60a5fa;
      ambientLightColor = 0x1e2640;
    } else if (theme === 'RETRO_DUNGEON') {
      primaryColorHex = 0xfbbf24; // Runic gold
      secondaryColorHex = 0xe11d48; // Crimson ruby
      ambientLightColor = 0x351520;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(ambientLightColor, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(primaryColorHex, 3.5, 10);
    rimLight.position.set(-2, 3, -2);
    scene.add(rimLight);

    const groundLight = new THREE.PointLight(secondaryColorHex, 2.0, 6);
    groundLight.position.set(0, -1, 1);
    scene.add(groundLight);

    // 5. Main Hero Container (for unified rotation & floating)
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Dais / Pedestal
    const daisGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.2, 32);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x151522,
      roughness: 0.4,
      metalness: 0.8,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -1.1;
    heroGroup.add(dais);

    // Glowing Hologram Ring on Dais
    const ringGeo = new THREE.TorusGeometry(1.25, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryColorHex,
      wireframe: false,
    });
    const daisRing = new THREE.Mesh(ringGeo, ringMat);
    daisRing.rotation.x = Math.PI / 2;
    daisRing.position.y = -0.98;
    heroGroup.add(daisRing);

    // 6. Character Mesh Body Hierarchy
    const charGroup = new THREE.Group();
    heroGroup.add(charGroup);

    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2438,
      roughness: 0.3,
      metalness: 0.9,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: primaryColorHex,
    });

    // Torso (Stylized Cyber Plate)
    const torsoGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.8, 8);
    const torso = new THREE.Mesh(torsoGeo, armorMaterial);
    torso.position.y = 0.4;
    charGroup.add(torso);

    // Glowing Chest Arc Reactor
    const coreGeo = new THREE.OctahedronGeometry(0.12);
    const coreMesh = new THREE.Mesh(coreGeo, glowMaterial);
    coreMesh.position.set(0, 0.45, 0.28);
    charGroup.add(coreMesh);

    // Head / Helm
    const headGeo = new THREE.DodecahedronGeometry(0.24);
    const head = new THREE.Mesh(headGeo, armorMaterial);
    head.position.y = 1.05;
    charGroup.add(head);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.16);
    const visorMat = new THREE.MeshBasicMaterial({ color: secondaryColorHex });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.05, 0.18);
    charGroup.add(visor);

    // Pauldrons (Shoulders)
    const shoulderGeo = new THREE.BoxGeometry(0.2, 0.25, 0.25);
    const leftShoulder = new THREE.Mesh(shoulderGeo, armorMaterial);
    leftShoulder.position.set(-0.48, 0.65, 0);
    charGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, armorMaterial);
    rightShoulder.position.set(0.48, 0.65, 0);
    charGroup.add(rightShoulder);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);
    const leftLeg = new THREE.Mesh(legGeo, armorMaterial);
    leftLeg.position.set(-0.2, -0.35, 0);
    charGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, armorMaterial);
    rightLeg.position.set(0.2, -0.35, 0);
    charGroup.add(rightLeg);

    // 7. Dynamic 3D Equipment
    const hasGear = (key: string) => equippedGear.includes(key);

    // Cyber Katana
    if (hasGear('GEAR_CYBER_KATANA')) {
      const bladeGeo = new THREE.BoxGeometry(0.04, 1.1, 0.08);
      const bladeMat = new THREE.MeshBasicMaterial({ color: primaryColorHex });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.65, 0.3, 0.2);
      blade.rotation.z = -0.35;
      blade.rotation.x = 0.2;
      charGroup.add(blade);

      const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
      const hilt = new THREE.Mesh(hiltGeo, armorMaterial);
      hilt.position.set(0.5, -0.2, 0.25);
      hilt.rotation.z = -0.35;
      charGroup.add(hilt);
    }

    // Chrono Wings
    if (hasGear('GEAR_CHRONO_WINGS')) {
      const wingShape = new THREE.ConeGeometry(0.2, 1.3, 4);
      const wingMat = new THREE.MeshBasicMaterial({
        color: secondaryColorHex,
        wireframe: true,
      });

      const leftWing = new THREE.Mesh(wingShape, wingMat);
      leftWing.position.set(-0.7, 0.8, -0.3);
      leftWing.rotation.z = 0.8;
      leftWing.rotation.y = 0.3;
      charGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingShape, wingMat);
      rightWing.position.set(0.7, 0.8, -0.3);
      rightWing.rotation.z = -0.8;
      rightWing.rotation.y = -0.3;
      charGroup.add(rightWing);
    }

    // Aegis Shield
    if (hasGear('GEAR_AEGIS_SHIELD')) {
      const shieldGeo = new THREE.IcosahedronGeometry(0.35, 1);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: primaryColorHex,
        transparent: true,
        opacity: 0.65,
        wireframe: true,
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.set(-0.65, 0.35, 0.3);
      charGroup.add(shield);
    }

    // Runic Halo
    if (hasGear('GEAR_RUNIC_HALO')) {
      const haloGeo = new THREE.TorusGeometry(0.38, 0.02, 16, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2.3;
      halo.position.set(0, 1.45, 0);
      charGroup.add(halo);
    }

    // 8. Orbiting Particle Swarm
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.2 + Math.random() * 0.8;
      const angle = Math.random() * Math.PI * 2;
      particlePos[i] = Math.cos(angle) * radius;
      particlePos[i + 1] = (Math.random() - 0.5) * 2.5;
      particlePos[i + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryColorHex,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    heroGroup.add(particles);

    // 9. Interactive Mouse / Touch Drag Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevMouseX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      targetRotationY += deltaX * 0.01;
      prevMouseX = clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth dampening rotation
      heroGroup.rotation.y += (targetRotationY - heroGroup.rotation.y) * 0.08;

      // Auto gentle idle spin when not dragging
      if (!isDragging) {
        targetRotationY += 0.003;
      }

      // Floating / breathing animation
      charGroup.position.y = Math.sin(elapsedTime * 2) * 0.06;

      // Core pulse
      const coreScale = 1 + Math.sin(elapsedTime * 4) * 0.15;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      // Rotate particles
      particles.rotation.y = elapsedTime * 0.1;

      // Level-up celebration spin
      if (isLevelingUp) {
        heroGroup.rotation.y += 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme, equippedGear, isLevelingUp]);

  return (
    <div className="relative w-full h-full min-h-[320px] select-none cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs text-white/70 flex items-center gap-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Drag to rotate 3D Avatar</span>
      </div>
    </div>
  );
};
