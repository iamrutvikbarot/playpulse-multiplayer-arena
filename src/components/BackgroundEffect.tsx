'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  indices: number[];
  gradColors: [string, string];
  wireColor: string;
}

interface CrystalMesh {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  floatPhase: number;
  floatSpeed: number;
  floatRadius: number;
  vertices: Point3D[];
  faces: Face3D[];
  edges: [number, number][];
}

// Generates 3D Icosahedron (20-sided gaming crystal)
function createIcosahedron(): { vertices: Point3D[]; faces: Face3D[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 1;
  const b = 1 / phi;

  const rawVerts: [number, number, number][] = [
    [0, b, a], [0, b, -a], [0, -b, a], [0, -b, -a],
    [b, a, 0], [b, -a, 0], [-b, a, 0], [-b, -a, 0],
    [a, 0, b], [-a, 0, b], [a, 0, -b], [-a, 0, -b],
  ];

  const vertices: Point3D[] = rawVerts.map(([x, y, z]) => {
    const len = Math.hypot(x, y, z);
    return { x: x / len, y: y / len, z: z / len };
  });

  const faceIndices: number[][] = [
    [0, 2, 8], [0, 8, 4], [0, 4, 6], [0, 6, 9], [0, 9, 2],
    [2, 7, 5], [2, 5, 8], [2, 9, 7], [8, 5, 10], [8, 10, 4],
    [4, 10, 1], [4, 1, 6], [6, 1, 11], [6, 11, 9], [9, 11, 7],
    [3, 1, 10], [3, 10, 5], [3, 5, 7], [3, 7, 11], [3, 11, 1],
  ];

  const palette: [string, string, string][] = [
    ['rgba(168, 85, 247, 0.35)', 'rgba(59, 130, 246, 0.15)', '#C084FC'],
    ['rgba(6, 182, 212, 0.35)', 'rgba(16, 185, 129, 0.15)', '#22D3EE'],
    ['rgba(236, 72, 153, 0.35)', 'rgba(168, 85, 247, 0.15)', '#F472B6'],
    ['rgba(245, 158, 11, 0.35)', 'rgba(239, 68, 68, 0.15)', '#FBBF24'],
  ];

  const faces: Face3D[] = faceIndices.map((indices, idx) => {
    const [c1, c2, wire] = palette[idx % palette.length];
    return { indices, gradColors: [c1, c2], wireColor: wire };
  });

  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  faceIndices.forEach((f) => {
    for (let i = 0; i < f.length; i++) {
      const u = f[i];
      const v = f[(i + 1) % f.length];
      const key = u < v ? `${u}_${v}` : `${v}_${u}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
      }
    }
  });

  return { vertices, faces, edges };
}

// Generates 3D Double-Prism Floating Gem
function createGemPrism(): { vertices: Point3D[]; faces: Face3D[]; edges: [number, number][] } {
  const vertices: Point3D[] = [
    { x: 0, y: -1.6, z: 0 },
    { x: 0.9, y: -0.2, z: 0.5 },
    { x: -0.9, y: -0.2, z: 0.5 },
    { x: 0, y: -0.2, z: -1.0 },
    { x: 0.7, y: 0.5, z: 0.4 },
    { x: -0.7, y: 0.5, z: 0.4 },
    { x: 0, y: 0.5, z: -0.8 },
    { x: 0, y: 1.6, z: 0 },
  ];

  const faces: Face3D[] = [
    { indices: [0, 1, 2], gradColors: ['rgba(59, 130, 246, 0.35)', 'rgba(168, 85, 247, 0.15)'], wireColor: '#60A5FA' },
    { indices: [0, 2, 3], gradColors: ['rgba(168, 85, 247, 0.35)', 'rgba(236, 72, 153, 0.15)'], wireColor: '#C084FC' },
    { indices: [0, 3, 1], gradColors: ['rgba(6, 182, 212, 0.35)', 'rgba(59, 130, 246, 0.15)'], wireColor: '#22D3EE' },
    { indices: [1, 4, 5, 2], gradColors: ['rgba(168, 85, 247, 0.25)', 'rgba(59, 130, 246, 0.1)'], wireColor: '#C084FC' },
    { indices: [2, 5, 6, 3], gradColors: ['rgba(236, 72, 153, 0.25)', 'rgba(245, 158, 11, 0.1)'], wireColor: '#F472B6' },
    { indices: [3, 6, 4, 1], gradColors: ['rgba(6, 182, 212, 0.25)', 'rgba(16, 185, 129, 0.1)'], wireColor: '#22D3EE' },
    { indices: [7, 5, 4], gradColors: ['rgba(236, 72, 153, 0.35)', 'rgba(168, 85, 247, 0.15)'], wireColor: '#F472B6' },
    { indices: [7, 6, 5], gradColors: ['rgba(168, 85, 247, 0.35)', 'rgba(59, 130, 246, 0.15)'], wireColor: '#C084FC' },
    { indices: [7, 4, 6], gradColors: ['rgba(59, 130, 246, 0.35)', 'rgba(6, 182, 212, 0.15)'], wireColor: '#60A5FA' },
  ];

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3],
    [1, 4], [2, 5], [3, 6],
    [4, 7], [5, 7], [6, 7],
    [1, 2], [2, 3], [3, 1],
    [4, 5], [5, 6], [6, 4],
  ];

  return { vertices, faces, edges };
}

export function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with smooth spring interpolation
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, screenX: width / 2, screenY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / width - 0.5) * 60;
      mouse.targetY = (e.clientY / height - 0.5) * 60;
      mouse.screenX = e.clientX;
      mouse.screenY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // High-poly 3D Floating Crystals
    const icosa = createIcosahedron();
    const prism = createGemPrism();

    const crystalConfigs = [
      { geo: icosa, xNorm: 0.1, yNorm: 0.22, scale: 65, vRot: [0.007, 0.011, 0.004], radius: 24, speed: 0.0018 },
      { geo: prism, xNorm: 0.9, yNorm: 0.26, scale: 75, vRot: [0.005, -0.009, 0.007], radius: 28, speed: 0.0015 },
      { geo: icosa, xNorm: 0.08, yNorm: 0.8, scale: 58, vRot: [-0.006, 0.008, -0.005], radius: 22, speed: 0.002 },
      { geo: prism, xNorm: 0.92, yNorm: 0.82, scale: 68, vRot: [0.008, 0.006, -0.008], radius: 26, speed: 0.0017 },
      { geo: icosa, xNorm: 0.5, yNorm: 0.06, scale: 46, vRot: [0.004, 0.012, 0.003], radius: 16, speed: 0.0022 },
      { geo: prism, xNorm: 0.5, yNorm: 0.95, scale: 50, vRot: [-0.007, -0.005, 0.009], radius: 18, speed: 0.0019 },
    ];

    const crystals: CrystalMesh[] = crystalConfigs.map((cfg, idx) => ({
      x: cfg.xNorm * width,
      y: cfg.yNorm * height,
      z: 0,
      baseX: cfg.xNorm,
      baseY: cfg.yNorm,
      scale: cfg.scale,
      rotX: idx * 1.2,
      rotY: idx * 0.8,
      rotZ: idx * 1.5,
      vRotX: cfg.vRot[0],
      vRotY: cfg.vRot[1],
      vRotZ: cfg.vRot[2],
      floatPhase: idx * 1.6,
      floatSpeed: cfg.speed,
      floatRadius: cfg.radius,
      vertices: cfg.geo.vertices,
      faces: cfg.geo.faces,
      edges: cfg.geo.edges,
    }));

    // Dynamic 3D Particle Starfield with Constellation Links
    const starCount = Math.min(70, Math.floor((width * height) / 18000));
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.6,
      y: (Math.random() - 0.5) * height * 1.6,
      z: Math.random() * 900 + 100,
      vz: Math.random() * 0.35 + 0.15,
      color: ['#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 2 + 1,
    }));

    let time = 0;

    // 3D projection transformation
    const project = (
      v: Point3D,
      rotX: number,
      rotY: number,
      rotZ: number,
      scale: number,
      centerX: number,
      centerY: number
    ): { px: number; py: number; pz: number } => {
      // Rotation X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = v.y * cosX - v.z * sinX;
      const z1 = v.y * sinX + v.z * cosX;

      // Rotation Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x2 = v.x * cosY + z1 * sinY;
      const z2 = -v.x * sinY + z1 * cosY;

      // Rotation Z
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      // Perspective Projection
      const fov = 450;
      const factor = fov / (fov + z2 * scale + 250);

      return {
        px: x3 * scale * factor + centerX,
        py: y3 * scale * factor + centerY,
        pz: z2,
      };
    };

    const render = () => {
      time += 1;

      // Smooth mouse spring easing
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Deep Space Base Background Fill
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, 0, width, height);

      // 2. Multi-Tiered Luminous Cyber Auroras
      const tPulse1 = Math.sin(time * 0.008) * 40;
      const tPulse2 = Math.cos(time * 0.006) * 50;

      // Top Left Purple Nebula
      const aurora1 = ctx.createRadialGradient(
        width * 0.15 + mouse.x * 0.5,
        height * 0.2 + mouse.y * 0.5,
        20,
        width * 0.15,
        height * 0.2,
        width * 0.45 + tPulse1
      );
      aurora1.addColorStop(0, 'rgba(147, 51, 234, 0.22)');
      aurora1.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)');
      aurora1.addColorStop(1, 'rgba(8, 10, 18, 0)');
      ctx.fillStyle = aurora1;
      ctx.fillRect(0, 0, width, height);

      // Bottom Right Cyan Nebula
      const aurora2 = ctx.createRadialGradient(
        width * 0.85 - mouse.x * 0.5,
        height * 0.8 - mouse.y * 0.5,
        20,
        width * 0.85,
        height * 0.8,
        width * 0.45 + tPulse2
      );
      aurora2.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
      aurora2.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      aurora2.addColorStop(1, 'rgba(8, 10, 18, 0)');
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, width, height);

      // Center Mystic Magenta Energy Core
      const aurora3 = ctx.createRadialGradient(
        width * 0.5 + mouse.x * 0.2,
        height * 0.5 + mouse.y * 0.2,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.35
      );
      aurora3.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      aurora3.addColorStop(0.7, 'rgba(168, 85, 247, 0.04)');
      aurora3.addColorStop(1, 'rgba(8, 10, 18, 0)');
      ctx.fillStyle = aurora3;
      ctx.fillRect(0, 0, width, height);

      // 3. Cyber Synthwave Horizon Grid Floor in Deep Background
      const gridHorizonY = height * 0.65;
      const gridVanishX = width * 0.5 + mouse.x * 0.4;
      ctx.lineWidth = 0.75;

      for (let i = -14; i <= 14; i++) {
        const xBottom = width * 0.5 + i * (width * 0.08);
        ctx.beginPath();
        ctx.moveTo(gridVanishX, gridHorizonY);
        ctx.lineTo(xBottom + mouse.x * 0.8, height);
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.07)';
        ctx.stroke();
      }

      for (let j = 1; j <= 6; j++) {
        const yLine = gridHorizonY + Math.pow(j / 6, 2) * (height - gridHorizonY);
        ctx.beginPath();
        ctx.moveTo(0, yLine);
        ctx.lineTo(width, yLine);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.03 + (j / 6) * 0.06})`;
        ctx.stroke();
      }

      // 4. Render 3D Starfield & Mouse Constellations
      const projectedStars: { sx: number; sy: number; color: string; alpha: number; r: number }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= s.vz;
        if (s.z <= 10) s.z = 900;

        const k = 320 / s.z;
        const sx = s.x * k + width / 2 + mouse.x * 0.25;
        const sy = s.y * k + height / 2 + mouse.y * 0.25;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          const alpha = Math.min(1, Math.max(0.15, (900 - s.z) / 700));
          const r = Math.max(0.8, s.size * k);

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = alpha * 0.85;
          ctx.fill();

          projectedStars.push({ sx, sy, color: s.color, alpha, r });
        }
      }

      // Draw subtle constellation filaments between nearby stars
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projectedStars.length; i++) {
        for (let j = i + 1; j < projectedStars.length; j++) {
          const s1 = projectedStars[i];
          const s2 = projectedStars[j];
          const dist = Math.hypot(s1.sx - s2.sx, s1.sy - s2.sy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(s1.sx, s1.sy);
            ctx.lineTo(s2.sx, s2.sy);
            ctx.strokeStyle = s1.color;
            ctx.globalAlpha = (1 - dist / 85) * 0.18;
            ctx.stroke();
          }
        }
      }

      // 5. Render 3D Polyhedral Crystals (Glassmorphic Gradients + Glowing Neon Edges)
      crystals.forEach((poly) => {
        poly.rotX += poly.vRotX;
        poly.rotY += poly.vRotY;
        poly.rotZ += poly.vRotZ;

        // Fluid 3D figure-8 floating motion
        const floatY = Math.sin(time * poly.floatSpeed + poly.floatPhase) * poly.floatRadius;
        const floatX = Math.cos(time * (poly.floatSpeed * 0.7) + poly.floatPhase) * (poly.floatRadius * 0.6);

        const currentCenterX = poly.baseX * width + floatX + mouse.x * 0.6;
        const currentCenterY = poly.baseY * height + floatY + mouse.y * 0.6;

        // Transform all 3D vertices
        const projected = poly.vertices.map((v) =>
          project(
            v,
            poly.rotX,
            poly.rotY,
            poly.rotZ,
            poly.scale,
            currentCenterX,
            currentCenterY
          )
        );

        // Core Energy Glow inside each crystal
        const coreGlow = ctx.createRadialGradient(
          currentCenterX,
          currentCenterY,
          2,
          currentCenterX,
          currentCenterY,
          poly.scale * 0.9
        );
        coreGlow.addColorStop(0, poly.faces[0]?.wireColor || '#A855F7');
        coreGlow.addColorStop(0.4, 'rgba(168, 85, 247, 0.15)');
        coreGlow.addColorStop(1, 'rgba(8, 10, 18, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(currentCenterX, currentCenterY, poly.scale * 0.9, 0, Math.PI * 2);
        ctx.globalAlpha = 0.55;
        ctx.fill();

        // Depth-Sort Faces (Painter's Algorithm)
        const sortedFaces = poly.faces
          .map((face) => {
            const avgZ =
              face.indices.reduce((sum, idx) => sum + projected[idx].pz, 0) /
              face.indices.length;
            return { face, avgZ };
          })
          .sort((a, b) => b.avgZ - a.avgZ);

        // Render Translucent Multi-Tone Glass Faces
        sortedFaces.forEach(({ face }) => {
          if (face.indices.length < 3) return;

          ctx.beginPath();
          const first = projected[face.indices[0]];
          ctx.moveTo(first.px, first.py);

          for (let i = 1; i < face.indices.length; i++) {
            const pt = projected[face.indices[i]];
            ctx.lineTo(pt.px, pt.py);
          }
          ctx.closePath();

          // Face linear gradient shine
          const pMin = projected[face.indices[0]];
          const pMax = projected[face.indices[1]];
          const faceGrad = ctx.createLinearGradient(pMin.px, pMin.py, pMax.px, pMax.py);
          faceGrad.addColorStop(0, face.gradColors[0]);
          faceGrad.addColorStop(1, face.gradColors[1]);

          ctx.fillStyle = faceGrad;
          ctx.globalAlpha = 0.9;
          ctx.fill();
        });

        // Render Glowing Neon Wireframe Edges
        ctx.lineWidth = 1.4;
        poly.edges.forEach(([i1, i2]) => {
          const p1 = projected[i1];
          const p2 = projected[i2];

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.strokeStyle = poly.faces[0]?.wireColor || '#C084FC';
          ctx.globalAlpha = 0.7;
          ctx.stroke();
        });

        // Render Radiant Vertex Star Glints
        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.px, p.py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = 0.9;
          ctx.fill();
        });
      });

      // 6. Interactive Cursor Energy Aura
      const mouseGrad = ctx.createRadialGradient(
        mouse.screenX,
        mouse.screenY,
        0,
        mouse.screenX,
        mouse.screenY,
        140
      );
      mouseGrad.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      mouseGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      mouseGrad.addColorStop(1, 'rgba(8, 10, 18, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(mouse.screenX, mouse.screenY, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle modern vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,10,18,0.75)_100%)] pointer-events-none" />
    </div>
  );
}
