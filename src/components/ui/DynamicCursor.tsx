import React, { useEffect, useState } from 'react';

export default function DynamicCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting3D, setIsInteracting3D] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (desktops/laptops)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering over buttons, links, or inputs
      const isInteractive = Boolean(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]')
      );
      setIsHovered(isInteractive);

      // Check if hovering inside the 3D canvas viewport
      const isCanvas = Boolean(target.tagName === 'CANVAS' || target.closest('canvas'));
      setIsInteracting3D(isCanvas);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Precision Core Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isInteracting3D
              ? 'w-3 h-3 bg-cyan-400 border border-cyan-200 shadow-sm shadow-cyan-500/50'
              : isHovered
              ? 'w-3.5 h-3.5 bg-amber-500 shadow-sm shadow-amber-500/50'
              : 'w-2 h-2 bg-amber-500/90'
          }`}
        />
      </div>

      {/* Subtle Precision Reticle Outer Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div
          className={`rounded-full border transition-all duration-200 ${
            isInteracting3D
              ? 'w-7 h-7 border-cyan-400/50 scale-100'
              : isHovered
              ? 'w-8 h-8 border-amber-500/60 scale-110'
              : 'w-5 h-5 border-amber-500/20 scale-90'
          }`}
        />
      </div>
    </>
  );
}
