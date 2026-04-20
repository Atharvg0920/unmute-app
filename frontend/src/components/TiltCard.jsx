import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * 3D tilt wrapper. Wraps children with a small perspective tilt on mouse move.
 */
export default function TiltCard({ children, className = "", max = 10, glow = true }) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 15 });
    const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 15 });

    const handle = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
    };
    const reset = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handle}
            onMouseLeave={reset}
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            className={`relative ${className}`}
        >
            {glow && (
                <div
                    aria-hidden
                    className="absolute -inset-px rounded-[inherit] opacity-60 blur-md pointer-events-none"
                    style={{
                        background:
                            "conic-gradient(from 120deg, rgba(139,92,246,0.35), rgba(59,130,246,0.25), transparent 60%, rgba(168,85,247,0.3))",
                    }}
                />
            )}
            <div style={{ transform: "translateZ(30px)" }} className="relative">
                {children}
            </div>
        </motion.div>
    );
}
