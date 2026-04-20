import React, { useEffect, useRef } from "react";

/**
 * Mouse-follow radial spotlight. Attaches to whole viewport.
 * Keeps perf cheap: only updates CSS vars on a ref.
 */
export default function Spotlight({ color = "rgba(139,92,246,0.28)", size = 600 }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e) => {
            el.style.setProperty("--mx", `${e.clientX}px`);
            el.style.setProperty("--my", `${e.clientY}px`);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);
    return (
        <div
            ref={ref}
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
                background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 30%), ${color}, transparent 55%)`,
                transition: "background 0.05s linear",
            }}
        />
    );
}
