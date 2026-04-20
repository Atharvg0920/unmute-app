import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Sparkles, MessageSquareHeart, TrendingUp, ArrowRight } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import { useAuth } from "../lib/auth";

export default function Landing() {
    const { user } = useAuth();
    const nav = useNavigate();
    useEffect(() => {
        if (user && user.role === "teacher") nav("/teacher", { replace: true });
    }, [user, nav]);

    const features = [
        { icon: Shield, title: "Judgment-free", desc: "Ask anything without revealing who you are. Zero social risk." },
        { icon: Sparkles, title: "AI-assisted", desc: "Rewrite your question, find similar answers, get instant help." },
        { icon: MessageSquareHeart, title: "Smart routing", desc: "Questions reach the right teacher, by subject — automatically." },
        { icon: TrendingUp, title: "Upvoted wisdom", desc: "The doubts everyone shares rise to the top." },
    ];

    return (
        <div className="relative min-h-screen">
            <AmbientBg />

            <header className="px-5 sm:px-8 pt-6 flex items-center justify-between max-w-6xl mx-auto">
                <Link to="/" className="flex items-center gap-2" data-testid="landing-brand">
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_22px_rgba(139,92,246,0.55)]">
                        <span className="font-display font-black text-white">U</span>
                    </span>
                    <span className="font-display font-bold text-white text-lg">Unmute</span>
                </Link>
                <div className="flex gap-2">
                    <Link to="/login" className="btn-ghost text-sm" data-testid="landing-login">Log in</Link>
                    <Link to="/register" className="btn-primary text-sm" data-testid="landing-register">Join free</Link>
                </div>
            </header>

            <main className="px-5 sm:px-8 max-w-6xl mx-auto pt-14 sm:pt-24 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                >
                    <span className="tag mb-5 inline-flex" data-testid="badge-anonymous">
                        <Shield size={12} /> 100% anonymous · student-safe
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                        The questions you were
                        <br />
                        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 text-transparent bg-clip-text">
                            afraid to ask.
                        </span>
                    </h1>
                    <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
                        Unmute is a safe, anonymous space where students ask, vote, and learn together.
                        No names. No fear. Just clarity.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/register" className="btn-primary inline-flex items-center gap-2" data-testid="cta-start">
                            Start asking <ArrowRight size={16} />
                        </Link>
                        <Link to="/feed" className="btn-ghost" data-testid="cta-feed">
                            Explore the feed
                        </Link>
                    </div>
                </motion.div>

                {/* Floating mock card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.7 }}
                    className="mt-16 grid gap-6 md:grid-cols-5"
                >
                    <div className="md:col-span-3 glass rounded-3xl p-6 sm:p-8 grain">
                        <div className="flex items-center gap-2 text-xs text-white/55">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live on feed now
                        </div>
                        <p className="mt-4 font-display text-xl sm:text-2xl text-white leading-snug">
                            “Why does the chain rule <em className="not-italic bg-gradient-to-r from-violet-300 to-blue-300 text-transparent bg-clip-text">actually</em> work? I keep memorizing but don't get it.”
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span className="tag">Mathematics</span>
                            <span className="tag">#calculus</span>
                            <span>·</span>
                            <span className="text-white/50">Curious Otter #4821</span>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 px-3 py-1 text-xs">
                                <TrendingUp size={12} /> 187 upvotes
                            </span>
                            <span className="text-xs text-emerald-300/90">Answered by Priya · 2 min</span>
                        </div>
                    </div>

                    <div className="md:col-span-2 grid gap-4">
                        {features.slice(0, 2).map((f) => (
                            <div key={f.title} className="glass rounded-3xl p-5">
                                <f.icon className="text-violet-300" size={22} style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,0.55))" }} />
                                <h3 className="mt-3 font-display text-lg text-white">{f.title}</h3>
                                <p className="text-sm text-white/65 mt-1 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {features.slice(2).map((f) => (
                        <div key={f.title} className="glass rounded-3xl p-5 sm:p-6 flex gap-4">
                            <f.icon className="text-blue-300 shrink-0" size={22} style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.55))" }} />
                            <div>
                                <h3 className="font-display text-lg text-white">{f.title}</h3>
                                <p className="text-sm text-white/65 mt-1 leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
                    <span>Built for students who deserve to be heard.</span>
                    <span>© Unmute · anonymous by design</span>
                </footer>
            </main>
        </div>
    );
}
