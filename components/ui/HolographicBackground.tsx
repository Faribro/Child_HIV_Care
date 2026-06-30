import React, { useRef, useEffect } from 'react';

interface HolographicBackgroundProps {
  intensity?: number;
  glowColor?: string;
  theme?: 'dark' | 'classic' | 'emerald';
}

export function HolographicBackground({ 
  intensity = 1, 
  glowColor, 
  theme = 'dark' 
}: HolographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const themeColors = {
      dark: {
        primary: '59, 130, 246',    // Blue
        secondary: '248, 250, 252',  // slate-50
        accent: '245, 166, 35',      // Amber
        glow: glowColor || 'rgba(59, 130, 246, 0.12)'
      },
      classic: {
        primary: '59, 130, 246',    // Blue
        secondary: '239, 246, 255',  // Light Blue
        accent: '245, 158, 11',      // Gold
        glow: glowColor || 'rgba(59, 130, 246, 0.12)'
      },
      emerald: {
        primary: '16, 185, 129',    // Emerald
        secondary: '236, 253, 245',  // Mint/Green
        accent: '245, 158, 11',      // Sand/Gold
        glow: glowColor || 'rgba(16, 185, 129, 0.12)'
      }
    };

    const activeColors = themeColors[theme] || themeColors.dark;

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 180,
      active: false
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.active = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseSize: number;
      pulseSpeed: number;
      pulseTime: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4 * intensity;
        this.vy = (Math.random() - 0.5) * 0.4 * intensity;
        this.baseSize = Math.random() * 2 + 1;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
        this.pulseTime = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulseTime += this.pulseSpeed;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        if (!ctx) return;
        const size = this.baseSize + Math.sin(this.pulseTime) * 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        const alpha = 0.2 + (Math.sin(this.pulseTime) + 1) * 0.25;
        ctx.fillStyle = `rgba(${activeColors.primary}, ${alpha})`;
        ctx.fill();

        if (this.baseSize > 2) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${activeColors.primary}, 0.04)`;
          ctx.fill();
        }
      }
    }

    const nodeCount = Math.floor((width * height) / 14000);
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    interface Point3D {
      x: number;
      y: number;
      z: number;
      colorType: 'primary' | 'accent' | 'secondary';
    }

    const helixPoints: Point3D[] = [];
    const helixSegments = 45;
    const radius = 90;
    
    for (let i = 0; i < helixSegments; i++) {
      const angle = (i / helixSegments) * Math.PI * 6;
      const progress = i / helixSegments;
      const y = (progress - 0.5) * 450;

      helixPoints.push({
        x: Math.cos(angle) * radius,
        y: y,
        z: Math.sin(angle) * radius,
        colorType: 'primary'
      });

      helixPoints.push({
        x: Math.cos(angle + Math.PI) * radius,
        y: y,
        z: Math.sin(angle + Math.PI) * radius,
        colorType: 'accent'
      });
    }

    let rotY = 0;

    const project = (p: Point3D, rotYAngle: number) => {
      const cos = Math.cos(rotYAngle);
      const sin = Math.sin(rotYAngle);
      
      const rx = p.x * cos - p.z * sin;
      const rz = p.x * sin + p.z * cos;
      
      const fov = 350;
      const scale = fov / (fov + rz);
      
      const screenX = width * 0.82 + rx * scale;
      const screenY = height * 0.45 + p.y * scale;

      return {
        x: screenX,
        y: screenY,
        scale: scale,
        depth: rz
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background grids
      ctx.strokeStyle = `rgba(${activeColors.primary}, 0.02)`;
      ctx.lineWidth = 1;
      const gridSize = 80;
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (mouse.active) {
        ctx.strokeStyle = `rgba(${activeColors.primary}, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${activeColors.accent}, 0.08)`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${activeColors.primary}, 0.15)`;
        ctx.beginPath();
        ctx.moveTo(mouse.x - 30, mouse.y);
        ctx.lineTo(mouse.x + 30, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 30);
        ctx.lineTo(mouse.x, mouse.y + 30);
        ctx.stroke();
      }

      nodes.forEach(node => {
        node.update();
        node.draw();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (115 - dist) / 115 * 0.15;
            ctx.strokeStyle = `rgba(${activeColors.primary}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      rotY += 0.005;
      const projected = helixPoints.map(p => ({
        orig: p,
        proj: project(p, rotY)
      }));

      projected.sort((a, b) => b.proj.depth - a.proj.depth);

      for (let i = 0; i < helixSegments; i++) {
        const p1 = projected.find(p => p.orig === helixPoints[i * 2]);
        const p2 = projected.find(p => p.orig === helixPoints[i * 2 + 1]);

        if (p1 && p2) {
          const depthAlpha = (p1.proj.depth + p2.proj.depth) / 2;
          const baseAlpha = 0.05 + (1 - (depthAlpha + radius) / (radius * 2)) * 0.18;
          ctx.strokeStyle = `rgba(${activeColors.secondary}, ${baseAlpha})`;
          ctx.lineWidth = 1 * p1.proj.scale;
          ctx.beginPath();
          ctx.moveTo(p1.proj.x, p1.proj.y);
          ctx.lineTo(p2.proj.x, p2.proj.y);
          ctx.stroke();
        }
      }

      projected.forEach(item => {
        const size = (item.orig.colorType === 'accent' ? 2.5 : 3.5) * item.proj.scale;
        const color = item.orig.colorType === 'accent' 
          ? `rgba(${activeColors.accent}, ${0.15 + (1 - (item.proj.depth + radius)/(radius*2)) * 0.65})`
          : `rgba(${activeColors.primary}, ${0.15 + (1 - (item.proj.depth + radius)/(radius*2)) * 0.65})`;
        
        ctx.beginPath();
        ctx.arc(item.proj.x, item.proj.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (item.proj.depth < -20) {
          ctx.beginPath();
          ctx.arc(item.proj.x, item.proj.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = item.orig.colorType === 'accent'
            ? `rgba(${activeColors.accent}, 0.06)`
            : `rgba(${activeColors.primary}, 0.06)`;
          ctx.fill();
        }
      });

      const scanY = (Date.now() / 20) % (height * 1.5) - height * 0.25;
      if (scanY > 0 && scanY < height) {
        ctx.fillStyle = `rgba(${activeColors.primary}, 0.007)`;
        ctx.fillRect(0, scanY, width, 2);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, glowColor, theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
export default HolographicBackground;
