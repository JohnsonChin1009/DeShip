'use client';

import { useRef, useEffect } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  isSymbol?: boolean;
  symbol?: string | null;
};

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Create particles
    const particlesArray: Particle[] = [];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 20));

    // Colors that match your theme
    const gradientColors = [
      '#6366F1', // Indigo
      '#818CF8', // Light Indigo
      '#A5B4FC', // Lighter Indigo
      '#C7D2FE', // Very Light Indigo
      '#E0E7FF', // Lightest Indigo
      '#F8FAFC', // White
    ];

    // Educational symbols
    const symbols = ['📚', '🎓', '✏️', '🔬', '🧮', '🔍', '📝', '💡'];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 5 + 1;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = Math.random() * 1 - 0.5;
      const speedY = Math.random() * 1 - 0.5;
      const colorIndex = Math.floor(Math.random() * gradientColors.length);

      // 15% chance to create a symbol particle
      const isSymbol = Math.random() < 0.15;
      const symbolIndex = Math.floor(Math.random() * symbols.length);

      particlesArray.push({
        x,
        y,
        size: isSymbol ? 12 : size,
        speedX,
        speedY,
        color: gradientColors[colorIndex],
        isSymbol: isSymbol,
        symbol: isSymbol ? symbols[symbolIndex] : null,
      });
    }

    // Connect particles with lines
    function connect() {
      if (!ctx) return; // Add null check here

      const maxDistance = 150;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;

            // Draw glow effect
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.1})`;
            ctx.lineWidth = 3;
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();

            // Draw main line
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.4})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return;
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];

        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x > canvas.width || p.x < 0) {
          p.speedX = -p.speedX;
        }
        if (p.y > canvas.height || p.y < 0) {
          p.speedY = -p.speedY;
        }

        // Draw particle
        if (p.isSymbol && p.symbol) {
          ctx.font = `${p.size}px Arial`;
          ctx.fillText(p.symbol, p.x, p.y);
        } else {
          // Draw glow effect for particles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}33`; // 20% opacity
          ctx.fill();

          // Draw main particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      connect();
    }

    animate();

    // Mouse interaction
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 150,
    };

    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;

      // Repel particles from mouse
      for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];
        if (mouse.x && mouse.y) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;

            p.x += forceDirectionX * force * 2;
            p.y += forceDirectionY * force * 2;
          }
        }
      }
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
