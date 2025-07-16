import React, { useRef, useImperativeHandle, forwardRef } from "react";

export interface RippleHandle {
  createRipple: (event: React.MouseEvent) => void;
}

interface RippleProps {
  color?: string;
  duration?: number;
  className?: string;
}

export const Ripple = forwardRef<RippleHandle, RippleProps>(
  ({ color = "rgba(59,130,246,0.3)", duration = 600, className = "" }, ref) => {
    const rippleRef = useRef<HTMLSpanElement>(null);

    const createRipple = (event: React.MouseEvent) => {
      const button = event.currentTarget as HTMLElement;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.style.position = "absolute";
      circle.style.borderRadius = "50%";
      circle.style.backgroundColor = color;
      circle.style.opacity = "0.75";
      circle.style.pointerEvents = "none";
      circle.style.transform = "scale(0)";
      circle.style.animation = `ripple ${duration}ms linear`;
      circle.className = `ripple-effect ${className}`;
      rippleRef.current?.appendChild(circle);
      circle.addEventListener("animationend", () => {
        circle.remove();
      });
    };

    useImperativeHandle(ref, () => ({ createRipple }), []);

    return (
      <span
        ref={rippleRef}
        className="absolute inset-0 pointer-events-none overflow-hidden z-10"
        aria-hidden="true"
      />
    );
  }
);

Ripple.displayName = "Ripple";

// Add ripple animation to global styles (Tailwind's globals.css or similar):
// .ripple-effect {
//   animation: ripple 600ms linear;
// }
// @keyframes ripple {
//   to {
//     opacity: 0;
//     transform: scale(2);
//   }
// }

// Usage: In a parent component, call createRipple on onClick and render <Ripple /> absolutely inside the element. 