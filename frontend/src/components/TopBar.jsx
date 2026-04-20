import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogOut, ShieldCheck } from "lucide-react";

export default function TopBar({ title, right }) {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    return (
        <header className="sticky top-0 z-30 px-4 sm:px-6 pt-4">
            <div className="glass rounded-full flex items-center justify-between px-4 sm:px-5 py-2.5 max-w-5xl mx-auto">
                <Link to="/" className="flex items-center gap-2" data-testid="brand-home">
                    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_18px_rgba(139,92,246,0.55)]">
                        <span className="font-display font-black text-white text-sm">U</span>
                    </span>
                    <span className="font-display font-bold text-white tracking-tight">
                        Unmute
                    </span>
                    {title && (
                        <span className="ml-3 hidden sm:inline text-xs uppercase tracking-[0.2em] text-white/50">
                            · {title}
                        </span>
                    )}
                </Link>
                <div className="flex items-center gap-2">
                    {right}
                    {user ? (
                        <>
                            {user.role === "teacher" && (
                                <span className="tag" data-testid="teacher-badge">
                                    <ShieldCheck size={12} /> Teacher
                                </span>
                            )}
                            <button
                                onClick={async () => { await logout(); nav("/"); }}
                                className="btn-ghost text-sm inline-flex items-center gap-1.5"
                                data-testid="logout-btn"
                            >
                                <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost text-sm" data-testid="header-login">Log in</Link>
                            <Link to="/register" className="btn-primary text-sm" data-testid="header-register">Join</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
