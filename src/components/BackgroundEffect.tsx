import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function BackgroundEffect() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070913, 0.0012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 0, 450);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x070913, 1);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D background');
      return;
    }

    // 2. Cosmic 3D Particle Nebula Galaxy (3500 Stars)
    const particleCount = 3200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0xf59e0b), // Saffron Gold
      new THREE.Color(0xec4899), // Ruby Rose
      new THREE.Color(0x06b6d4), // Cyan Star
      new THREE.Color(0x8b5cf6), // Amethyst Violet
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0xf97316), // Radiant Orange
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spiral galaxy distribution
      const radius = Math.random() * 900 + 40;
      const spinAngle = radius * 0.003;
      const branchAngle = ((i % 4) * Math.PI * 2) / 4;

      const randomX = (Math.random() - 0.5) * 120;
      const randomY = (Math.random() - 0.5) * 140;
      const randomZ = (Math.random() - 0.5) * 250;

      positions[i3] = Math.cos(spinAngle + branchAngle) * radius + randomX;
      positions[i3 + 1] = randomY + (Math.sin(radius * 0.02) * 60);
      positions[i3 + 2] = Math.sin(spinAngle + branchAngle) * radius + randomZ;

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;

      scales[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Circular Point Texture
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      map: createCircleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // 3. Floating 3D Sacred Geometric Polyhedra
    const polyhedraGroup = new THREE.Group();
    const polyCount = 12;
    const polyMeshes: { mesh: THREE.Group; rotSpeed: THREE.Vector3; floatSpeed: number; baseY: number }[] = [];

    for (let i = 0; i < polyCount; i++) {
      const pGroup = new THREE.Group();
      const size = Math.random() * 24 + 16;
      let polyGeom: THREE.BufferGeometry;

      const type = i % 3;
      if (type === 0) {
        polyGeom = new THREE.IcosahedronGeometry(size, 0);
      } else if (type === 1) {
        polyGeom = new THREE.OctahedronGeometry(size, 0);
      } else {
        polyGeom = new THREE.DodecahedronGeometry(size, 0);
      }

      const pColor = colorPalette[i % colorPalette.length];

      // Inner subtle glow mesh
      const innerMat = new THREE.MeshBasicMaterial({
        color: pColor,
        transparent: true,
        opacity: 0.12,
        wireframe: false,
      });
      const innerMesh = new THREE.Mesh(polyGeom, innerMat);
      pGroup.add(innerMesh);

      // Outer vibrant wireframe
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: pColor,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const wireframeMesh = new THREE.Mesh(polyGeom, wireframeMat);
      pGroup.add(wireframeMesh);

      // Vertex sparkle dots
      const wireframeGeom = new THREE.WireframeGeometry(polyGeom);
      const line = new THREE.LineSegments(wireframeGeom);
      line.material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
      pGroup.add(line);

      const x = (Math.random() - 0.5) * 850;
      const y = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 450;
      pGroup.position.set(x, y, z);

      polyhedraGroup.add(pGroup);
      polyMeshes.push({
        mesh: pGroup,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.018,
          (Math.random() - 0.5) * 0.012
        ),
        floatSpeed: Math.random() * 1.5 + 0.8,
        baseY: y,
      });
    }
    scene.add(polyhedraGroup);

    // 4. Undulating 3D Cyber-Vedic Terrain Grid
    const gridCols = 40;
    const gridRows = 40;
    const gridGeometry = new THREE.PlaneGeometry(1600, 1600, gridCols, gridRows);
    gridGeometry.rotateX(-Math.PI / 2);
    gridGeometry.translate(0, -220, -200);

    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(gridMesh);

    // 5. Interactive Mouse Parallax Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Camera parallax
      camera.position.x = mouse.x * 70;
      camera.position.y = mouse.y * 50;
      camera.lookAt(0, 0, 0);

      // Rotate particle nebula
      particleSystem.rotation.y = time * 0.035;
      particleSystem.rotation.x = Math.sin(time * 0.015) * 0.08;

      // Animate polyhedra
      polyMeshes.forEach((item, idx) => {
        item.mesh.rotation.x += item.rotSpeed.x;
        item.mesh.rotation.y += item.rotSpeed.y;
        item.mesh.rotation.z += item.rotSpeed.z;
        item.mesh.position.y = item.baseY + Math.sin(time * item.floatSpeed + idx) * 18;
      });

      // Animate undulating grid waves
      const posAttr = gridGeometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getZ(i);
        const wave = Math.sin(u * 0.015 + time * 1.5) * 14 + Math.cos(v * 0.015 + time * 1.2) * 12;
        posAttr.setY(i, -220 + wave);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070913]">
      <div ref={containerRef} className="w-full h-full block" />
      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-[#070913]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070913_85%)] pointer-events-none opacity-85" />
    </div>
  );
}
