import React from "react";

export default function AmbientBg() {
    return (
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div
                className="orb"
                style={{
                    top: "-6rem",
                    left: "-4rem",
                    width: "22rem",
                    height: "22rem",
                    background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 60%)",
                }}
            />
            <div
                className="orb"
                style={{
                    top: "40%",
                    right: "-6rem",
                    width: "26rem",
                    height: "26rem",
                    background: "radial-gradient(circle, rgba(59,130,246,0.45), transparent 60%)",
                }}
            />
            <div
                className="orb"
                style={{
                    bottom: "-8rem",
                    left: "30%",
                    width: "30rem",
                    height: "30rem",
                    background: "radial-gradient(circle, rgba(168,85,247,0.35), transparent 65%)",
                }}
            />
        </div>
    );
}
