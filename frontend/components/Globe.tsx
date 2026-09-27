'use client';

import { useEffect, useRef, useState } from 'react';

interface City {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Berlin', lat: 52.52, lng: 13.4 },
  { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], // NY -> London
  [1, 9], // London -> Dubai
  [9, 2], // Dubai -> Tokyo
  [5, 2], // SF -> Tokyo
  [3, 8], // Paris -> Cape Town
  [7, 1], // Sao Paulo -> London
  [4, 10], // Sydney -> Singapore
  [0, 5], // NY -> SF
];

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Globe parameters
    let radius = Math.min(width, height) * 0.38;
    let rotationY = 0.4;
    let rotationX = 0.3;
    let velY = 0.0025; // Auto-rotation speed
    let velX = 0;
    let dragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Generate Globe Dot Matrix (Fibonacci sphere)
    const DOT_COUNT = 900;
    const dots: { x: number; y: number; z: number }[] = [];
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < DOT_COUNT; i++) {
      const theta = (2 * Math.PI * i) / phi;
      const y = 1 - (i / (DOT_COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      dots.push({ x, y, z });
    }

    // Convert City lat/lng to 3D point unit vector
    const cityPoints = CITIES.map((city) => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lng + 180) * (Math.PI / 180);
      return {
        x: -(Math.sin(phi) * Math.cos(theta)),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
        name: city.name,
      };
    });

    // Particle progress along arcs
    const arcParticles = CONNECTIONS.map(() => ({
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.004,
    }));

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      setIsDragging(true);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      velY = deltaX * 0.005;
      velX = deltaY * 0.005;
      rotationY += velY;
      rotationX += velX;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      dragging = false;
      setIsDragging(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragging = true;
        setIsDragging(true);
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      velY = deltaX * 0.005;
      velX = deltaY * 0.005;
      rotationY += velY;
      rotationX += velX;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Render loop
    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;
      radius = Math.min(width, height) * 0.38;

      if (!dragging) {
        rotationY += velY;
        rotationX += velX;
        velY *= 0.96; // Inertia damping
        velX *= 0.96;
        if (Math.abs(velY) < 0.0015) velY = 0.002; // Minimum auto-spin
      }

      // Clamp rotationX to avoid flipping upside down
      rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationX));

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 3D rotation matrix helper
      const rotate3D = (x: number, y: number, z: number) => {
        // Rotate around X axis
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotate around Y axis
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        return { x: x2, y: y1, z: z2 };
      };

      // 1. Draw Outer Atmosphere Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.35);
      bgGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      bgGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Sphere Outline Ring
      ctx.strokeStyle = 'rgba(237, 234, 225, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Project & Sort Dots
      dots.forEach((dot) => {
        const p = rotate3D(dot.x, dot.y, dot.z);
        if (p.z < 0) return; // Occlude back dots for depth

        const screenX = cx + p.x * radius;
        const screenY = cy + p.y * radius;
        const alpha = Math.max(0.1, (p.z + 0.2) / 1.2);
        const dotSize = Math.max(0.8, (p.z + 1) * 1.2);

        ctx.fillStyle = `rgba(237, 234, 225, ${alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Project & Draw Animated Arcs
      CONNECTIONS.forEach(([startIdx, endIdx], connIdx) => {
        const c1 = cityPoints[startIdx];
        const c2 = cityPoints[endIdx];

        const p1 = rotate3D(c1.x, c1.y, c1.z);
        const p2 = rotate3D(c2.x, c2.y, c2.z);

        // Only draw arc if at least one point is on front hemisphere
        if (p1.z < -0.2 && p2.z < -0.2) return;

        const p1X = cx + p1.x * radius;
        const p1Y = cy + p1.y * radius;
        const p2X = cx + p2.x * radius;
        const p2Y = cy + p2.y * radius;

        // Calculate 3D mid arc height
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const midZ = (p1.z + p2.z) / 2;
        const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ) || 1;
        const arcHeight = 1.35; // Lift arc off globe surface

        const pMid = rotate3D((midX / midLen) * arcHeight, (midY / midLen) * arcHeight, (midZ / midLen) * arcHeight);
        const pMidX = cx + pMid.x * radius;
        const pMidY = cy + pMid.y * radius;

        const arcAlpha = Math.max(0.05, (p1.z + p2.z + 2) / 4);

        // Draw Arc Bezier Curve
        ctx.beginPath();
        ctx.moveTo(p1X, p1Y);
        ctx.quadraticCurveTo(pMidX, pMidY, p2X, p2Y);
        ctx.strokeStyle = `rgba(237, 234, 225, ${arcAlpha * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Update & Draw Arc Traveling Particle Light
        const particle = arcParticles[connIdx];
        particle.progress = (particle.progress + particle.speed) % 1;
        const t = particle.progress;

        // Bezier formula for particle position: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const partX = (1 - t) * (1 - t) * p1X + 2 * (1 - t) * t * pMidX + t * t * p2X;
        const partY = (1 - t) * (1 - t) * p1Y + 2 * (1 - t) * t * pMidY + t * t * p2Y;

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(partX, partY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Draw City Location Markers
      cityPoints.forEach((city) => {
        const p = rotate3D(city.x, city.y, city.z);
        if (p.z < -0.1) return; // Skip back of globe

        const screenX = cx + p.x * radius;
        const screenY = cy + p.y * radius;
        const alpha = Math.max(0.2, (p.z + 0.3) / 1.3);

        // Pulsing Ring
        const ringRadius = 4 + Math.sin(pulseTime * 2 + p.x) * 3;
        ctx.strokeStyle = `rgba(237, 234, 225, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Core Glowing Marker Dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative h-full w-full flex items-center justify-center pointer-events-auto">
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-cursor duration-200 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />
    </div>
  );
}
