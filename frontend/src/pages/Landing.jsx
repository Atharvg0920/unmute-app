import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    Shield, Sparkles, MessageSquareHeart, TrendingUp, ArrowRight, ArrowUp,
    Zap, Brain, Lock, Users, CheckCircle2, Flame, Heart, Play, Quote,
} from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import Spotlight from "../components/Spotlight";
import TiltCard from "../components/TiltCard";
import Counter from "../components/Counter";
import Marquee from "../components/Marquee";
import { useAuth } from "../lib/auth";

/* ---------------- helpers ---------------- */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }),
};

const LIVE_SAMPLES = [
    { h: "Curious Fox #4821", s: "Mathematics", b: "Why does the chain rule actually work? I memorise it but never see why.", up: 187 },
    { h: "Silent Owl #1140", s: "Biology", b: "Is ATP literally the currency of the cell or is that just a metaphor?", up: 92 },
    { h: "Quiet Panda #7621", s: "Computer Science", b: "When should I use recursion over a loop? They feel the same to me.", up: 143 },
    { h: "Brave Lynx #3398", s: "Chemistry", b: "Why do noble gases not want to bond when everything else does?", up: 64 },
    { h: "Mellow Raven #2211", s: "Physics", b: "If light has no mass, how does gravity bend it?", up: 219 },
    { h: "Witty Otter #9032", s: "English", b: "How do I stop re-reading the same sentence three times in comprehension?", up: 38 },
    { h: "Bold Wolf #5541", s: "Mathematics", b: "Can someone explain eigenvalues like I'm 12? I'm cooked.", up: 156 },
];

/* ---------------- sections ---------------- */
function Nav() {
    return (
        <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[min(96vw,64rem)]">
            <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="glass rounded-full flex items-center justify-between px-3 sm:px-5 py-2.5"
            >
                <Link to="/" className="flex items-center gap-2" data-testid="landing-brand">
                    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_22px_rgba(139,92,246,0.55)]">
                        <span className="font-display font-black text-white text-sm">U</span>
                    </span>
                    <span className="font-display font-bold text-white tracking-tight">Unmute</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm text-white/65">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how" className="hover:text-white transition-colors">How it works</a>
                    <a href="#voices" className="hover:text-white transition-colors">Voices</a>
                </nav>
                <div className="flex gap-2">
                    <Link to="/login" className="btn-ghost text-sm" data-testid="landing-login">Log in</Link>
                    <Link to="/register" className="btn-primary text-sm" data-testid="landing-register">Join free</Link>
                </div>
            </motion.div>
        </header>
    );
}

function Hero() {
    return (
        <section className="relative pt-32 sm:pt-40 pb-16 px-5 sm:px-8 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="flex flex-wrap items-center gap-2">
                        <span className="tag inline-flex items-center gap-1.5" data-testid="badge-live">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live · 100% anonymous
                        </span>
                        <span className="tag hidden sm:inline-flex">built by students, for students</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp} initial="hidden" animate="show" custom={1}
                        className="font-display mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.98]"
                    >
                        The questions
                        <br />
                        you were
                        {" "}
                        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 text-transparent bg-clip-text">
                            afraid to ask.
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp} initial="hidden" animate="show" custom={2}
                        className="mt-6 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed"
                    >
                        Unmute is the safe, anonymous space where students ask, vote, and learn together.
                        No names. No fear. Just clarity — routed to the right teacher, instantly.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap gap-3">
                        <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3.5" data-testid="cta-start">
                            Start asking <ArrowRight size={16} />
                        </Link>
                        <Link to="/feed" className="btn-ghost inline-flex items-center gap-2 text-base px-6 py-3.5" data-testid="cta-feed">
                            <Play size={14} /> Explore the feed
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" custom={4}
                        className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55"
                    >
                        <div className="flex items-center gap-2"><Lock size={12} className="text-violet-300" /> End-to-end anonymous</div>
                        <div className="flex items-center gap-2"><Zap size={12} className="text-blue-300" /> Routed in &lt; 1 sec</div>
                        <div className="flex items-center gap-2"><Brain size={12} className="text-fuchsia-300" /> AI-assisted writing</div>
                    </motion.div>
                </div>

                {/* Floating app preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotate: -3 }}
                    animate={{ opacity: 1, y: 0, rotate: -3 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:col-span-5"
                    style={{ perspective: 1200 }}
                >
                    <TiltCard className="rounded-[2rem]" max={7}>
                        <div className="glass-strong rounded-[2rem] p-5 grain">
                            <div className="flex items-center gap-2 text-xs text-white/55">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Answered 1 min ago · Priya S.
                            </div>
                            <p className="mt-3 font-display text-lg text-white leading-snug">
                                "Why does the chain rule <em className="not-italic bg-gradient-to-r from-violet-300 to-blue-300 text-transparent bg-clip-text">actually</em> work? I memorise it but never see why."
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/60">
                                <span className="tag !py-0.5 !text-[10px]">Mathematics</span>
                                <span className="tag !py-0.5 !text-[10px]">#calculus</span>
                            </div>
                            <div className="mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-400/15 p-3">
                                <div className="flex items-center gap-2 text-[11px] text-emerald-300/90">
                                    <CheckCircle2 size={12} /> Priya Sharma · teacher
                                </div>
                                <p className="mt-1 text-sm text-white/85 leading-relaxed">
                                    Think of each function as a little machine. Composing them means a tiny change at the input cascades. The chain rule is just multiplying each machine's sensitivity.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-sm"
                                >
                                    <ArrowUp size={14} /> 187
                                </motion.button>
                                <span className="text-[11px] text-white/55">Curious Otter #4821</span>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>
            </div>
        </section>
    );
}

function StatsRow() {
    const stats = [
        { k: "12k+", label: "Anonymous questions asked", icon: MessageSquareHeart, n: 12000, suf: "+" },
        { k: "98%", label: "Answered in under 24h", icon: Zap, n: 98, suf: "%" },
        { k: "0", label: "Names ever revealed", icon: Lock, n: 0, suf: "" },
    ];
    return (
        <section className="px-5 sm:px-8 max-w-6xl mx-auto mt-4 sm:mt-8">
            <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
                        custom={i}
                        className="glass rounded-3xl p-5 flex items-center gap-4"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-white/10 flex items-center justify-center">
                            <s.icon size={18} className="text-white/85" />
                        </div>
                        <div>
                            <div className="font-display text-3xl text-white tracking-tight">
                                <Counter to={s.n} suffix={s.suf} />
                            </div>
                            <div className="text-xs text-white/55 mt-0.5">{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function LiveMarquee() {
    return (
        <section className="mt-16">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-4 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/55">Live feed · right now</span>
            </div>
            <Marquee speed={55}>
                {LIVE_SAMPLES.map((q, i) => (
                    <div key={i} className="glass w-[22rem] rounded-3xl p-5 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-violet-500/70 to-blue-500/70 text-white flex items-center justify-center font-bold text-[11px]">
                                {q.h[0]}
                            </div>
                            <span className="font-medium text-white/85">{q.h}</span>
                            <span className="tag !py-0.5 !text-[10px] ml-auto">{q.s}</span>
                        </div>
                        <p className="mt-3 text-sm text-white/90 leading-relaxed line-clamp-3">{q.b}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-violet-200">
                            <ArrowUp size={12} /> {q.up}
                        </div>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}

function FeaturesBento() {
    return (
        <section id="features" className="mt-24 px-5 sm:px-8 max-w-6xl mx-auto">
            <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
                className="max-w-2xl"
            >
                <span className="tag inline-flex">Why students love it</span>
                <h2 className="font-display text-4xl sm:text-5xl text-white mt-4 tracking-tight leading-[1.05]">
                    Built for the
                    <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 text-transparent bg-clip-text">
                        quietest voice in the room.
                    </span>
                </h2>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-6">
                {/* Row 1: Big Anonymous (4) + AI (2) */}
                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={0}
                    whileHover={{ y: -4 }}
                    className="md:col-span-4 glass rounded-3xl p-6 sm:p-8 overflow-hidden relative group"
                >
                    <div
                        aria-hidden
                        className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-60 blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-110"
                        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 60%)" }}
                    />
                    <Shield size={28} className="text-violet-300" style={{ filter: "drop-shadow(0 0 14px rgba(139,92,246,0.55))" }} />
                    <h3 className="mt-4 font-display text-2xl text-white">Judgment-free by design</h3>
                    <p className="mt-2 text-white/70 text-sm max-w-lg leading-relaxed">
                        Every student gets a random handle like <span className="text-violet-300">Curious Fox #4821</span>. Teachers never see who you are — only what you need.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {["Curious Fox #4821", "Silent Owl #1140", "Brave Lynx #3398", "Witty Otter #9032"].map((h) => (
                            <span key={h} className="tag !text-[10px]">{h}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={1}
                    whileHover={{ y: -4 }}
                    className="md:col-span-2 glass rounded-3xl p-6 relative overflow-hidden"
                >
                    <div aria-hidden className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full opacity-50 blur-3xl"
                        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.35), transparent 60%)" }} />
                    <Sparkles size={24} className="text-fuchsia-300" style={{ filter: "drop-shadow(0 0 12px rgba(236,72,153,0.5))" }} />
                    <h3 className="mt-3 font-display text-xl text-white">AI rewrites</h3>
                    <p className="mt-1 text-sm text-white/65 leading-relaxed">Can't find the words? GPT-5.2 rewrites your question — kindly, precisely.</p>
                </motion.div>

                {/* Row 2: three equal (2+2+2) */}
                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={2}
                    whileHover={{ y: -4 }}
                    className="md:col-span-2 glass rounded-3xl p-6"
                >
                    <MessageSquareHeart size={24} className="text-blue-300" style={{ filter: "drop-shadow(0 0 12px rgba(59,130,246,0.45))" }} />
                    <h3 className="mt-3 font-display text-xl text-white">Smart routing</h3>
                    <p className="mt-1 text-sm text-white/65 leading-relaxed">Your doubt reaches the right subject teacher — automatically.</p>
                </motion.div>

                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={3}
                    whileHover={{ y: -4 }}
                    className="md:col-span-2 glass rounded-3xl p-6"
                >
                    <TrendingUp size={24} className="text-emerald-300" style={{ filter: "drop-shadow(0 0 12px rgba(16,185,129,0.45))" }} />
                    <h3 className="mt-3 font-display text-xl text-white">Upvoted wisdom</h3>
                    <p className="mt-1 text-sm text-white/65 leading-relaxed">The doubts everyone silently shares rise to the top.</p>
                </motion.div>

                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={4}
                    whileHover={{ y: -4 }}
                    className="md:col-span-2 glass rounded-3xl p-6"
                >
                    <Users size={24} className="text-cyan-300" style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.45))" }} />
                    <h3 className="mt-3 font-display text-xl text-white">You're not alone</h3>
                    <p className="mt-1 text-sm text-white/65 leading-relaxed">See how many peers quietly share the exact same doubt.</p>
                </motion.div>

                {/* Row 3: Badges wide (6) */}
                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={5}
                    whileHover={{ y: -4 }}
                    className="md:col-span-6 glass rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                >
                    <div aria-hidden className="absolute -top-16 left-1/3 h-48 w-[30rem] rounded-full opacity-40 blur-3xl pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.35), transparent 60%)" }} />
                    <div className="flex flex-wrap items-start gap-6 relative">
                        <div className="min-w-0 flex-1">
                            <Flame size={24} className="text-orange-300" style={{ filter: "drop-shadow(0 0 12px rgba(251,146,60,0.5))" }} />
                            <h3 className="mt-3 font-display text-2xl text-white">Play-worthy badges</h3>
                            <p className="mt-1 text-sm text-white/65 leading-relaxed max-w-md">
                                Earn Curious Mind, Top Contributor, Streak Starter — recognition without ever revealing who you are.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { name: "Curious Mind", grad: "from-violet-500 to-blue-500" },
                                { name: "Top Contributor", grad: "from-orange-400 to-rose-500" },
                                { name: "Streak Starter", grad: "from-emerald-400 to-cyan-500" },
                            ].map((b) => (
                                <div key={b.name} className="flex flex-col items-center gap-1">
                                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${b.grad} shadow-[0_0_24px_rgba(139,92,246,0.4)] flex items-center justify-center`}>
                                        <Flame size={20} className="text-white" />
                                    </div>
                                    <span className="text-[11px] text-white/65">{b.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function HowItWorks() {
    const steps = [
        { n: "01", title: "Type it out", desc: "Drop your doubt — or tap AI to rephrase it. No name, no email on display.", icon: Brain },
        { n: "02", title: "We route it", desc: "Unmute sends it to the right teacher for your subject instantly.", icon: Zap },
        { n: "03", title: "Everyone learns", desc: "Teacher replies. Your class upvotes. Answers get archived.", icon: Heart },
    ];
    return (
        <section id="how" className="mt-24 px-5 sm:px-8 max-w-6xl mx-auto">
            <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
                className="max-w-xl"
            >
                <span className="tag inline-flex">How it works</span>
                <h2 className="font-display text-4xl sm:text-5xl text-white mt-4 tracking-tight leading-[1.05]">
                    Three taps and
                    <span className="block bg-gradient-to-r from-blue-300 to-violet-300 text-transparent bg-clip-text">you're heard.</span>
                </h2>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {steps.map((s, i) => (
                    <motion.div
                        key={s.n}
                        variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={i}
                        whileHover={{ y: -6 }}
                        className="neu rounded-3xl p-6 relative overflow-hidden"
                    >
                        <div className="text-white/15 font-display text-7xl absolute -top-2 right-4 select-none">{s.n}</div>
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-white/10 flex items-center justify-center">
                                <s.icon size={18} className="text-white/85" />
                            </div>
                            <h3 className="mt-4 font-display text-xl text-white">{s.title}</h3>
                            <p className="mt-1 text-sm text-white/65 leading-relaxed">{s.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function Voices() {
    const quotes = [
        { n: "Class 11 student", q: "I stopped asking questions in class years ago. On Unmute I asked 7 in a week." },
        { n: "Priya · Physics teacher", q: "I finally see what they don't understand. The upvotes tell me exactly where to spend class time." },
        { n: "First-year CS student", q: "It feels like group chat, but the teachers are actually here. Addictive." },
    ];
    return (
        <section id="voices" className="mt-24 px-5 sm:px-8 max-w-6xl mx-auto">
            <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
                className="max-w-xl"
            >
                <span className="tag inline-flex">Voices</span>
                <h2 className="font-display text-4xl sm:text-5xl text-white mt-4 tracking-tight leading-[1.05]">
                    What the
                    <span className="bg-gradient-to-r from-fuchsia-300 to-violet-300 text-transparent bg-clip-text"> quiet ones </span>
                    say.
                </h2>
            </motion.div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {quotes.map((q, i) => (
                    <motion.div
                        key={i}
                        variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={i}
                        whileHover={{ y: -4 }}
                        className="glass rounded-3xl p-6"
                    >
                        <Quote size={20} className="text-violet-300 opacity-70" />
                        <p className="mt-3 text-white/90 leading-relaxed">{q.q}</p>
                        <div className="mt-4 text-xs text-white/55">— {q.n}</div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function BigCTA() {
    return (
        <section className="mt-24 px-5 sm:px-8 max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 text-center grain"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(59,130,246,0.14) 50%, rgba(168,85,247,0.18) 100%)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 30px 80px rgba(139,92,246,0.25)",
                }}
            >
                <div
                    aria-hidden
                    className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full blur-3xl opacity-50"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.65), transparent 60%)" }}
                />
                <motion.h2
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
                    className="font-display text-4xl sm:text-6xl text-white tracking-tight leading-[1.05] relative"
                >
                    Don't keep it to yourself.
                </motion.h2>
                <motion.p
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={1}
                    className="mt-4 text-white/70 max-w-xl mx-auto relative"
                >
                    Every doubt you bury is someone else's stuck chapter too. Unmute it.
                </motion.p>
                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} custom={2}
                    className="mt-8 flex flex-wrap justify-center gap-3 relative"
                >
                    <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3.5" data-testid="cta-bottom-start">
                        Create your anonymous identity <ArrowRight size={16} />
                    </Link>
                    <Link to="/feed" className="btn-ghost inline-flex items-center gap-2" data-testid="cta-bottom-feed">
                        Browse live questions
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="mt-20 mb-10 px-5 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
                    <span className="font-display font-black text-white text-[10px]">U</span>
                </span>
                <span>Unmute · anonymous by design</span>
            </div>
            <div className="flex gap-4">
                <a className="hover:text-white/75">Privacy</a>
                <a className="hover:text-white/75">Moderation</a>
                <a className="hover:text-white/75">Contact</a>
            </div>
        </footer>
    );
}

/* ---------------- main ---------------- */
export default function Landing() {
    const { user } = useAuth();
    const nav = useNavigate();
    useEffect(() => {
        if (user && user.role === "teacher") nav("/teacher", { replace: true });
    }, [user, nav]);

    const { scrollYProgress } = useScroll();
    const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <AmbientBg />
            <Spotlight />
            {/* Scroll progress bar */}
            <motion.div
                style={{ scaleX: barScale, transformOrigin: "0%" }}
                className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-400 to-blue-500 z-50"
            />
            <Nav />
            <main>
                <Hero />
                <StatsRow />
                <LiveMarquee />
                <FeaturesBento />
                <HowItWorks />
                <Voices />
                <BigCTA />
            </main>
            <Footer />
        </div>
    );
}
