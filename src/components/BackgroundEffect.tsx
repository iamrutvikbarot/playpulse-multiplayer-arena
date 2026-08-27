import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Mesh3D {
  position: Point3D;
  rotation: Point3D;
  rotSpeed: Point3D;
  vertices: Point3D[];
  edges: [number, number][];
  color: string;
  size: number;
  type: 'cube' | 'octahedron' | 'icosahedron' | 'gem';
}

export function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Geometry generators
    const createCube = (size: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const s = size / 2;
      const vertices: Point3D[] = [
        { x: -s, y: -s, z: -s },
        { x: s, y: -s, z: -s },
        { x: s, y: s, z: -s },
        { x: -s, y: s, z: -s },
        { x: -s, y: -s, z: s },
        { x: s, y: -s, z: s },
        { x: s, y: s, z: s },
        { x: -s, y: s, z: s },
      ];
      const edges: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 0], // front
        [4, 5], [5, 6], [6, 7], [7, 4], // back
        [0, 4], [1, 5], [2, 6], [3, 7], // connectors
      ];
      return { vertices, edges };
    };

    const createOctahedron = (size: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const s = size / 1.5;
      const vertices: Point3D[] = [
        { x: 0, y: -s, z: 0 }, // top
        { x: 0, y: s, z: 0 },  // bottom
        { x: -s, y: 0, z: 0 }, // left
        { x: s, y: 0, z: 0 },  // right
        { x: 0, y: 0, z: -s }, // back
        { x: 0, y: 0, z: s },  // front
      ];
      const edges: [number, number][] = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 5], [5, 3], [3, 4], [4, 2],
      ];
      return { vertices, edges };
    };

    const createGem = (size: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const s = size / 2;
      const vertices: Point3D[] = [
        { x: 0, y: -s * 1.3, z: 0 },
        { x: -s, y: -s * 0.3, z: -s },
        { x: s, y: -s * 0.3, z: -s },
        { x: s, y: -s * 0.3, z: s },
        { x: -s, y: -s * 0.3, z: s },
        { x: 0, y: s * 1.3, z: 0 },
      ];
      const edges: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
        [5, 1], [5, 2], [5, 3], [5, 4],
      ];
      return { vertices, edges };
    };

    // Initialize 3D Meshes in space
    const palette = ['#A855F7', '#06B6D4', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'];
    const meshCount = 14;
    const meshes: Mesh3D[] = [];

    for (let i = 0; i < meshCount; i++) {
      const type = (['cube', 'octahedron', 'gem'] as const)[i % 3];
      const size = Math.random() * 45 + 35;
      const geom = type === 'cube' ? createCube(size) : type === 'octahedron' ? createOctahedron(size) : createGem(size);

      meshes.push({
        position: {
          x: (Math.random() - 0.5) * (width * 1.2),
          y: (Math.random() - 0.5) * (height * 1.2),
          z: Math.random() * 600 + 200,
        },
        rotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2,
        },
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.018,
          z: (Math.random() - 0.5) * 0.012,
        },
        vertices: geom.vertices,
        edges: geom.edges,
        color: palette[i % palette.length],
        size,
        type,
      });
    }

    // Floating 3D Star motes
    const starCount = 60;
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * (width * 1.5),
      y: (Math.random() - 0.5) * (height * 1.5),
      z: Math.random() * 800 + 50,
      radius: Math.random() * 2 + 0.8,
      color: palette[Math.floor(Math.random() * palette.length)],
      twinkle: Math.random() * Math.PI * 2,
    }));

    // 3D Matrix Math Projection
    const project = (p: Point3D, fov: number, cx: number, cy: number) => {
      const scale = fov / (fov + p.z);
      return {
        x: p.x * scale + cx,
        y: p.y * scale + cy,
        scale,
      };
    };

    const rotatePoint = (p: Point3D, rx: number, ry: number, rz: number): Point3D => {
      // Rotate around X
      let y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
      let z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);
      let x1 = p.x;

      // Rotate around Y
      let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);
      let y2 = y1;

      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y2 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y2 * Math.cos(rz);
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    let tick = 0;

    const render = () => {
      tick += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const fov = 450;
      const cx = width / 2 + mouseRef.current.x * 25;
      const cy = height / 2 + mouseRef.current.y * 25;

      // 1. Ambient Nebula Glow Backdrops
      const grad1 = ctx.createRadialGradient(cx, cy * 0.8, 50, cx, cy * 0.8, width * 0.8);
      grad1.addColorStop(0, 'rgba(30, 20, 60, 0.45)');
      grad1.addColorStop(0.5, 'rgba(10, 16, 35, 0.3)');
      grad1.addColorStop(1, 'rgba(5, 7, 15, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.2, 20, width * 0.8, height * 0.2, 400);
      grad2.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Perspective Cyber Horizon Grid
      const gridY = height * 0.75;
      const gridFov = 350;
      const gridLines = 14;
      ctx.lineWidth = 1;

      // Horizontal wave grid lines
      for (let i = 0; i < gridLines; i++) {
        const depth = (i + (tick % 1)) * 35;
        const scale = gridFov / (gridFov + depth * 3);
        const yPos = gridY + (depth * 2) * scale;
        if (yPos > height + 50) continue;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0, (1 - depth / 400) * 0.25)})`;
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }

      // Vertical converging perspective lines
      for (let x = -width; x <= width * 2; x += 110) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)';
        ctx.moveTo(x + mouseRef.current.x * 40, height);
        ctx.lineTo(width / 2 + (x - width / 2) * 0.15, gridY);
        ctx.stroke();
      }

      // 3. Render 3D Stars with Twinkle
      for (const s of stars) {
        s.twinkle += 0.03;
        s.z -= 0.35;
        if (s.z < 50) s.z = 850;

        const proj = project(
          {
            x: s.x - mouseRef.current.x * 60,
            y: s.y - mouseRef.current.y * 60,
            z: s.z,
          },
          fov,
          cx,
          cy
        );

        if (proj.x >= 0 && proj.x <= width && proj.y >= 0 && proj.y <= height) {
          const alpha = (1 - s.z / 850) * (0.3 + Math.sin(s.twinkle) * 0.2);
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, Math.max(0.5, s.radius * proj.scale), 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fill();
        }
      }

      // 4. Render 3D Rotating Polyhedral Meshes
      // Sort meshes by depth (Z-index back to front)
      meshes.sort((a, b) => b.position.z - a.position.z);

      for (const mesh of meshes) {
        // Apply rotation
        mesh.rotation.x += mesh.rotSpeed.x;
        mesh.rotation.y += mesh.rotSpeed.y;
        mesh.rotation.z += mesh.rotSpeed.z;

        // Gentle floating drift
        mesh.position.y += Math.sin(tick + mesh.size) * 0.25;

        // Interactive camera tilt with mouse
        const effectivePos: Point3D = {
          x: mesh.position.x - mouseRef.current.x * 120,
          y: mesh.position.y - mouseRef.current.y * 120,
          z: mesh.position.z,
        };

        // Project rotated vertices
        const projVertices = mesh.vertices.map((v) => {
          const rotated = rotatePoint(v, mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
          const worldPoint: Point3D = {
            x: rotated.x + effectivePos.x,
            y: rotated.y + effectivePos.y,
            z: rotated.z + effectivePos.z,
          };
          return project(worldPoint, fov, cx, cy);
        });

        const centerProj = project(effectivePos, fov, cx, cy);
        const depthAlpha = Math.max(0.08, Math.min(0.55, 1 - effectivePos.z / 900));

        // Draw Wireframe Edges
        ctx.strokeStyle = mesh.color;
        ctx.lineWidth = Math.max(0.8, 1.6 * centerProj.scale);
        ctx.globalAlpha = depthAlpha * 0.75;

        for (const [i, j] of mesh.edges) {
          const p1 = projVertices[i];
          const p2 = projVertices[j];
          if (!p1 || !p2) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Draw Vertex Node Glows
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = depthAlpha * 0.9;
        for (const pv of projVertices) {
          ctx.beginPath();
          ctx.arc(pv.x, pv.y, Math.max(1, 2.2 * pv.scale), 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle glowing center core
        const coreGrad = ctx.createRadialGradient(
          centerProj.x,
          centerProj.y,
          0,
          centerProj.x,
          centerProj.y,
          mesh.size * centerProj.scale * 1.5
        );
        coreGrad.addColorStop(0, `${mesh.color}22`);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.globalAlpha = depthAlpha * 0.6;
        ctx.beginPath();
        ctx.arc(centerProj.x, centerProj.y, mesh.size * centerProj.scale * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070913]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette Overlay for Crisp Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-[#070913]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070913_80%)] pointer-events-none opacity-80" />
    </div>
  );
}

