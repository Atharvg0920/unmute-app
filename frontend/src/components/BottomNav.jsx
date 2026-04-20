import React from "react";
import { NavLink } from "react-router-dom";
import { Home, MessageCirclePlus, Sparkles, User } from "lucide-react";

const items = [
    { to: "/feed", label: "Feed", icon: Home, testid: "nav-feed" },
    { to: "/ask", label: "Ask", icon: MessageCirclePlus, testid: "nav-ask" },
    { to: "/mine", label: "Mine", icon: Sparkles, testid: "nav-mine" },
    { to: "/profile", label: "You", icon: User, testid: "nav-profile" },
];

export default function BottomNav() {
    return (
        <nav
            data-testid="bottom-nav"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-full px-3 py-2 flex gap-1 items-center"
            style={{ width: "min(92vw, 28rem)" }}
        >
            {items.map(({ to, label, icon: Icon, testid }) => (
                <NavLink
                    key={to}
                    to={to}
                    data-testid={testid}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-full transition-all ${
                            isActive
                                ? "bg-gradient-to-r from-violet-500/90 to-blue-500/90 text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)]"
                                : "text-white/60 hover:text-white"
                        }`
                    }
                >
                    <Icon size={18} />
                    <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
