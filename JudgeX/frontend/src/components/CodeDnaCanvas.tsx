import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CODE_AND_BINARY_TOKENS = [
  '01010110', '11001001', '0101', '1010', '1100', '0011', '1001', '0110',
  '{ }', '[ ]', '( )', '</>', '=>', '&&', '||', ';', '::',
  'const', 'fn()', 'return', 'async', 'await', 'O(N)', 'dp[n]',
  '01101', '10010', '0101', '1110', '0001', '1011', '01', '10', '11'
];

function createTextTexture(text: string, color: string = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '700 42px "Consolas", "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const CodeDnaCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4.5, 40);
    blueLight.position.set(6, 6, 6);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4.5, 40);
    cyanLight.position.set(-6, -6, 6);
    scene.add(cyanLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 3);
    rimLight.position.set(0, 12, -10);
    scene.add(rimLight);

    // 3. Parent Group for Grand 3D DNA
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // 4. Generate Larger Helix Parameters
    const helixTurns = 3.8;
    const helixHeight = 28;
    const radius = 3.2;
    const pointsCount = 240;

    const pointsA: THREE.Vector3[] = [];
    const pointsB: THREE.Vector3[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * Math.PI * 2 * helixTurns;
      const y = (t - 0.5) * helixHeight;

      const xA = Math.sin(angle) * radius;
      const zA = Math.cos(angle) * radius;

      const xB = Math.sin(angle + Math.PI) * radius;
      const zB = Math.cos(angle + Math.PI) * radius;

      pointsA.push(new THREE.Vector3(xA, y, zA));
      pointsB.push(new THREE.Vector3(xB, y, zB));
    }

    const curveA = new THREE.CatmullRomCurve3(pointsA);
    const curveB = new THREE.CatmullRomCurve3(pointsB);

    // Ultra-Transparent Crystal Glass Material
    const ultraGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      roughness: 0.02,
      metalness: 0.05,
      transmission: 0.98,
      opacity: 0.28,
      transparent: true,
      depthWrite: false,
      ior: 1.4,
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
    });

    // Sleek Thin Glass Tubes (Tube Radius 0.28)
    const tubeGeoA = new THREE.TubeGeometry(curveA, 160, 0.28, 20, false);
    const tubeMeshA = new THREE.Mesh(tubeGeoA, ultraGlassMaterial);
    dnaGroup.add(tubeMeshA);

    const tubeGeoB = new THREE.TubeGeometry(curveB, 160, 0.28, 20, false);
    const tubeMeshB = new THREE.Mesh(tubeGeoB, ultraGlassMaterial);
    dnaGroup.add(tubeMeshB);

    // Translucent Connecting Base Pair Rungs
    const basePairMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.35,
    });

    const basePairCount = 52;
    for (let i = 0; i < basePairCount; i++) {
      const t = i / basePairCount;
      const posA = curveA.getPoint(t);
      const posB = curveB.getPoint(t);

      const distance = posA.distanceTo(posB);
      const rungGeo = new THREE.CylinderGeometry(0.05, 0.05, distance, 12);
      const rungMesh = new THREE.Mesh(rungGeo, basePairMaterial);

      const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      rungMesh.position.copy(midpoint);
      rungMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(posB, posA).normalize()
      );

      dnaGroup.add(rungMesh);
    }

    // 5. Code & Binary Sprites Flowing INSIDE the Glass Tubes
    interface FlowingSprite {
      sprite: THREE.Sprite;
      offset: number;
      curveSelect: 'A' | 'B';
    }

    const codeSprites: FlowingSprite[] = [];
    const totalSprites = CODE_AND_BINARY_TOKENS.length;

    for (let i = 0; i < totalSprites; i++) {
      const token = CODE_AND_BINARY_TOKENS[i];
      const isBinary = /^[01]+$/.test(token);
      const color = isBinary ? '#34d399' : (i % 2 === 0 ? '#38bdf8' : '#fbbf24');

      const texture = createTextTexture(token, color);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.65, 0.32, 1);
      dnaGroup.add(sprite);

      codeSprites.push({
        sprite,
        offset: i / totalSprites,
        curveSelect: i % 2 === 0 ? 'A' : 'B',
      });
    }

    // 6. Glowing Energy Pulses inside the tubes
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const pulseGeo = new THREE.SphereGeometry(0.3, 16, 16);

    const pulseA = new THREE.Mesh(pulseGeo, pulseMaterial);
    const pulseB = new THREE.Mesh(pulseGeo, pulseMaterial);

    dnaGroup.add(pulseA);
    dnaGroup.add(pulseB);

    // 7. Background Floating Ambient Particles
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
      particlePositions[i + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i + 2] = (Math.random() - 0.5) * 22;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Lerped Scroll & Mouse Interaction Physics
    let targetScroll = 0;
    let currentScroll = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop (Cinematic Slow Motion)
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Lerp scroll position
      currentScroll += (targetScroll - currentScroll) * 0.08;

      // Lerp mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Ultra-Serene 3D DNA Slow Motion
        dnaGroup.rotation.y = elapsedTime * 0.025 + currentScroll * Math.PI * 1.2;
        dnaGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05 + currentMouseY * 0.2;
        dnaGroup.rotation.z = currentMouseX * 0.1;

        dnaGroup.position.y = Math.sin(elapsedTime * 0.3) * 0.2 + (currentScroll - 0.5) * 2.5;
        dnaGroup.position.x = Math.cos(elapsedTime * 0.2) * 0.1;

        // Flow code and binary numbers INSIDE the glass tubes (Ultra Slow Motion)
        for (let i = 0; i < codeSprites.length; i++) {
          const item = codeSprites[i];
          const progress = (item.offset + elapsedTime * 0.007 + currentScroll * 0.2) % 1;
          const curve = item.curveSelect === 'A' ? curveA : curveB;
          const pos = curve.getPoint(progress);

          item.sprite.position.copy(pos);
        }

        // Energy pulses traveling inside in ultra slow motion
        const pulseTimeA = (elapsedTime * 0.015 + currentScroll * 0.3) % 1;
        const pulseTimeB = (elapsedTime * 0.015 + currentScroll * 0.3 + 0.5) % 1;

        pulseA.position.copy(curveA.getPoint(pulseTimeA));
        pulseB.position.copy(curveB.getPoint(pulseTimeB));

        blueLight.intensity = 3.5 + Math.sin(elapsedTime * 2) * 0.8;
        cyanLight.intensity = 3.5 + Math.cos(elapsedTime * 2) * 0.8;

        particleSystem.rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      renderer.dispose();
      tubeGeoA.dispose();
      tubeGeoB.dispose();
      ultraGlassMaterial.dispose();
      basePairMaterial.dispose();
      pulseMaterial.dispose();
      pulseGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default CodeDnaCanvas;
