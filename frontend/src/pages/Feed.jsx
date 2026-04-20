import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Sparkles, Clock, Filter } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import QuestionCard from "../components/QuestionCard";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

const SORTS = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "popular", label: "Popular", icon: Flame },
];

export default function Feed() {
    const { user } = useAuth();
    const [subject, setSubject] = useState("All");
    const [sort, setSort] = useState("recent");
    const [only, setOnly] = useState("answered");
    const [subjects, setSubjects] = useState(["All"]);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/meta/subjects").then((r) => setSubjects(["All", ...r.data.subjects])).catch(() => {});
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/questions", { params: { subject, sort, only } });
            setList(data.questions);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [subject, sort, only]);

    const isStudent = user && user.role === "student";

    return (
        <div className="relative min-h-screen pb-32">
            <AmbientBg />
            <TopBar title="Live feed" />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="mb-5"
                >
                    <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight">Doubt feed</h1>
                    <p className="text-white/60 text-sm mt-1">The questions your whole class is quietly asking — out loud.</p>
                </motion.div>

                <div className="glass rounded-3xl p-3 sm:p-4 flex flex-wrap items-center gap-3 mb-5" data-testid="feed-filters">
                    <div className="flex gap-1 p-1 rounded-full bg-black/40 border border-white/10">
                        {SORTS.map((s) => (
                            <button
                                key={s.id} onClick={() => setSort(s.id)}
                                data-testid={`sort-${s.id}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
                                    sort === s.id ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white" : "text-white/60 hover:text-white"
                                }`}
                            >
                                <s.icon size={12} /> {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 p-1 rounded-full bg-black/40 border border-white/10">
                        {[
                            { id: "answered", label: "Answered" },
                            { id: "open", label: "Open" },
                            { id: "all", label: "All" },
                        ].map((o) => (
                            <button key={o.id} onClick={() => setOnly(o.id)}
                                data-testid={`only-${o.id}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    only === o.id ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
                                }`}>
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-white/55">
                        <Filter size={12} />
                        <select
                            data-testid="subject-filter"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-full px-3 py-1.5 text-white text-xs outline-none focus:ring-2 focus:ring-violet-500/50"
                        >
                            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {isStudent && (
                    <Link to="/ask" data-testid="feed-cta-ask"
                        className="mb-5 glass rounded-3xl p-4 flex items-center gap-3 hover:border-white/15 transition-colors block">
                        <Sparkles size={18} className="text-violet-300" />
                        <span className="text-sm text-white/80">Got a doubt? <span className="text-white">Ask anonymously →</span></span>
                    </Link>
                )}

                {loading && (
                    <div className="grid gap-4">
                        {[0,1,2].map((i) => (
                            <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                                <div className="h-3 w-1/3 rounded-full bg-white/10" />
                                <div className="mt-4 h-4 w-full rounded bg-white/10" />
                                <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    <div className="grid gap-4">
                        {!loading && list.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8 text-center">
                                <p className="font-display text-lg text-white">All quiet here.</p>
                                <p className="text-white/60 text-sm mt-1">Be the first to ask — you might speak for everyone.</p>
                            </motion.div>
                        )}
                        {list.map((q) => (
                            <QuestionCard key={q.id} q={q} onChange={(nq) => setList((arr) => arr.map(x => x.id === nq.id ? nq : x))} />
                        ))}
                    </div>
                </AnimatePresence>
            </main>

            {isStudent && <BottomNav />}
        </div>
    );
}
