import React from "react";

/**
 * CSS-keyframe infinite marquee (GPU-accelerated). Children are duplicated for seamless loop.
 */
export default function Marquee({ children, speed = 40, className = "" }) {
    return (
        <div className={`relative overflow-hidden ${className}`} style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
            <div
                className="flex gap-4 w-max"
                style={{
                    animation: `marquee ${speed}s linear infinite`,
                }}
            >
                <div className="flex gap-4 shrink-0">{children}</div>
                <div className="flex gap-4 shrink-0" aria-hidden>{children}</div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
