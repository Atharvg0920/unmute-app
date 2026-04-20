import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
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
        <div className="relative min-h-screen flex items-center justify-center px-4">
            <AmbientBg />
            <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong w-full max-w-md rounded-3xl p-7 sm:p-9 grain"
                data-testid="login-form"
            >
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_18px_rgba(139,92,246,0.55)]">
                        <span className="font-display font-black text-white">U</span>
                    </span>
                    <span className="font-display font-bold text-white">Unmute</span>
                </div>
                <h1 className="font-display text-3xl text-white mt-6">Welcome back.</h1>
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
        </div>
    );
}
