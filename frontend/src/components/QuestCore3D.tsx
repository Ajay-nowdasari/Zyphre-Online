'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from './ThemeContext';

interface QuestCore3DProps {
  burstTrigger?: number; // Increment to trigger a visual particle burst
  activeAttribute?: string;
}

export const QuestCore3D: React.FC<QuestCore3DProps> = ({ burstTrigger, activeAttribute }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Color based on theme and activeAttribute
    let coreColor = 0x00f0ff;
    if (activeAttribute === 'INTELLECT') coreColor = 0x38bdf8;
    else if (activeAttribute === 'STRENGTH') coreColor = 0xf43f5e;
    else if (activeAttribute === 'VITALITY') coreColor = 0x10b981;
    else if (activeAttribute === 'CHARISMA') coreColor = 0xa855f7;
    else if (theme === 'LOFI') coreColor = 0xf59e0b;
    else if (theme === 'RETRO_DUNGEON') coreColor = 0xfbbf24;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(coreColor, 4, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Floating Crystal Core (Octahedron / Icosahedron)
    const crystalGeo = new THREE.OctahedronGeometry(0.8, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    scene.add(crystal);

    // Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cage);

    // Orbiting Gyroscopic Ring
    const ringGeo = new THREE.TorusGeometry(1.25, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    // Particles
    const particleCount = 40;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const dist = 0.9 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pPos[i] = dist * Math.cos(theta) * Math.cos(phi);
      pPos[i + 1] = dist * Math.sin(phi);
      pPos[i + 2] = dist * Math.sin(theta) * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: coreColor,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      crystal.rotation.x = time * 0.4;
      crystal.rotation.y = time * 0.6;

      cage.rotation.x = -time * 0.2;
      cage.rotation.z = time * 0.3;

      ring1.rotation.y = time * 0.5;
      ring1.rotation.x = time * 0.3;

      ring2.rotation.z = -time * 0.4;
      ring2.rotation.y = -time * 0.2;

      particles.rotation.y = time * 0.2;

      // Gentle floating levitation
      scene.position.y = Math.sin(time * 2) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme, activeAttribute, burstTrigger]);

  return (
    <div className="relative w-full h-full min-h-[180px] flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
