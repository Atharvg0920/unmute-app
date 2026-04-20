import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowUp, CheckCircle2, Shield, Sparkles } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import Spotlight from "../components/Spotlight";
import TiltCard from "../components/TiltCard";
import { useAuth } from "../lib/auth";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr(""); setBusy(true);
        const r = await login(email, password);
        setBusy(false);
        if (!r.ok) { setErr(r.error); return; }
        nav(r.user.role === "teacher" ? "/teacher" : "/feed", { replace: true });
    };

    return (
        <div className="relative min-h-screen grid lg:grid-cols-2">
            <AmbientBg />
            <Spotlight />

            {/* Left: brand + social proof */}
            <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
                <Link to="/" className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_22px_rgba(139,92,246,0.55)]">
                        <span className="font-display font-black text-white">U</span>
                    </span>
                    <span className="font-display font-bold text-white">Unmute</span>
                </Link>

                <div className="max-w-md">
                    <h2 className="font-display text-4xl text-white leading-tight">
                        Your doubts,
                        <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 text-transparent bg-clip-text">heard anonymously.</span>
                    </h2>
                    <p className="mt-4 text-white/65 leading-relaxed">
                        Join thousands of students asking the questions they couldn't ask out loud.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20, rotate: -2 }}
                        animate={{ opacity: 1, y: 0, rotate: -2 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-10 max-w-sm"
                        style={{ perspective: 1200 }}
                    >
                        <TiltCard className="rounded-3xl" max={6}>
                            <div className="glass-strong rounded-3xl p-5 grain">
                                <div className="flex items-center gap-2 text-[11px] text-white/55">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Answered just now
                                </div>
                                <p className="mt-3 font-display text-base text-white leading-snug">
                                    "How do I stop freezing during oral exams?"
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-white/55">
                                    <span className="tag !py-0.5 !text-[10px]">English</span>
                                    <span>· Quiet Panda #7621</span>
                                </div>
                                <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-400/15 p-3 text-sm text-white/80">
                                    Rehearse out loud to a mirror — your brain learns the muscle pattern, not just the words.
                                </div>
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 px-3 py-1 text-xs">
                                    <ArrowUp size={12} /> 142
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/45">
                    <span className="inline-flex items-center gap-1.5"><Shield size={12} /> Anonymous</span>
                    <span className="inline-flex items-center gap-1.5"><Sparkles size={12} /> AI-assisted</span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} /> Teacher-verified</span>
                </div>
            </aside>

            {/* Right: form */}
            <section className="flex items-center justify-center px-4 py-10">
                <motion.form
                    onSubmit={submit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-strong w-full max-w-md rounded-3xl p-7 sm:p-9 grain"
                    data-testid="login-form"
                >
                    <div className="lg:hidden flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_18px_rgba(139,92,246,0.55)]">
                            <span className="font-display font-black text-white">U</span>
                        </span>
                        <span className="font-display font-bold text-white">Unmute</span>
                    </div>
                    <h1 className="font-display text-3xl text-white mt-6 lg:mt-0">Welcome back.</h1>
                    <p className="text-white/60 text-sm mt-1">Your voice, still anonymous.</p>

                    <label className="block mt-6 text-xs uppercase tracking-[0.2em] text-white/55">Email</label>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 px-4 py-3">
                        <Mail size={16} className="text-white/45" />
                        <input
                            data-testid="login-email"
                            className="bg-transparent w-full outline-none placeholder:text-white/35 text-white"
                            type="email" required
                            placeholder="you@school.edu"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <label className="block mt-4 text-xs uppercase tracking-[0.2em] text-white/55">Password</label>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 px-4 py-3">
                        <Lock size={16} className="text-white/45" />
                        <input
                            data-testid="login-password"
                            className="bg-transparent w-full outline-none placeholder:text-white/35 text-white"
                            type="password" required minLength={6}
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {err && (
                        <div className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-2" data-testid="login-error">
                            {err}
                        </div>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        disabled={busy}
                        type="submit"
                        data-testid="login-submit"
                        className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <LogIn size={16} /> {busy ? "Signing in…" : "Sign in"}
                    </motion.button>

                    <div className="mt-5 flex items-center justify-between text-sm">
                        <span className="text-white/55">New here?</span>
                        <Link to="/register" className="text-violet-300 hover:text-violet-200" data-testid="link-register">Create an account</Link>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-white/60">
                        <strong className="text-white/80 font-medium">Demo accounts</strong>
                        <div className="mt-1">Student: <code className="text-violet-300">student.demo@unmute.edu</code> / <code>Student@123</code></div>
                        <div>Teacher: <code className="text-blue-300">priya.sharma@unmute.edu</code> / <code>Teacher@123</code></div>
                    </div>
                </motion.form>
            </section>
        </div>
    );
}
