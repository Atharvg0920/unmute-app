import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function Counter({ to = 100, suffix = "", duration = 1.6 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10%" });
    const [v, setV] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let raf;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min(1, (now - start) / (duration * 1000));
            const eased = 1 - Math.pow(1 - t, 3);
            setV(Math.round(eased * to));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, to, duration]);

    return (
        <motion.span ref={ref}>
            {v.toLocaleString()}{suffix}
        </motion.span>
    );
}
