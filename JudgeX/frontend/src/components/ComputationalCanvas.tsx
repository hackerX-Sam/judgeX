import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
}

export const ComputationalCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create particle nodes
    const nodeCount = Math.floor(Math.min(width, height) / 18);
    const nodes: Node[] = [];
    const labels = ['O(N)', 'fn()', 'arr[i]', 'dp[n]', 'O(1)', 'logN', 'dfs()', 'tree', 'node', 'stack'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 1,
        label: Math.random() < 0.2 ? labels[Math.floor(Math.random() * labels.length)] : undefined,
      });
    }

    // Cursor position tracking
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw cursor ambient glow trail
      if (mouse.x > 0 && mouse.y > 0) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
        glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 300, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect nodes and update positions
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.25;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw connection lines directly to mouse cursor
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 220) {
          const malpha = (1 - mdist / 220) * 0.55;
          ctx.strokeStyle = `rgba(6, 182, 212, ${malpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw node point
        ctx.fillStyle = node.label ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw label if exists
        if (node.label) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.fillText(node.label, node.x + 6, node.y + 3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
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
export default ComputationalCanvas;
