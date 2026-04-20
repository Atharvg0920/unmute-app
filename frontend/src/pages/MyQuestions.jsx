import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Inbox, CheckCircle2, Flame } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import QuestionCard from "../components/QuestionCard";
import api from "../lib/api";

export default function MyQuestions() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/questions/mine");
            setList(data.questions);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const stats = {
        asked: list.length,
        answered: list.filter((q) => q.status === "answered").length,
        upvotes: list.reduce((a, q) => a + (q.upvotes || 0), 0),
    };

    return (
        <div className="relative min-h-screen pb-32">
            <AmbientBg />
            <TopBar title="My questions" />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight">Your voice, anonymous.</h1>
                    <p className="text-white/60 text-sm mt-1">Track your doubts — only you can see this page.</p>
                </motion.div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                        { label: "Asked", value: stats.asked, icon: Inbox, color: "from-violet-500/80 to-violet-300/30" },
                        { label: "Answered", value: stats.answered, icon: CheckCircle2, color: "from-emerald-500/80 to-emerald-300/30" },
                        { label: "Upvotes", value: stats.upvotes, icon: Flame, color: "from-orange-500/80 to-pink-400/30" },
                    ].map((s) => (
                        <div key={s.label} className="glass rounded-2xl p-4" data-testid={`stat-${s.label.toLowerCase()}`}>
                            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
                                <s.icon size={14} className="text-white" />
                            </div>
                            <div className="font-display text-2xl mt-2 text-white">{s.value}</div>
                            <div className="text-xs text-white/55">{s.label}</div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="mt-5 grid gap-4">
                        {[0,1,2].map((i) => (
                            <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                                <div className="h-3 w-1/3 rounded-full bg-white/10" />
                                <div className="mt-4 h-4 w-5/6 rounded bg-white/10" />
                            </div>
                        ))}
                    </div>
                ) : list.length === 0 ? (
                    <div className="mt-6 glass rounded-3xl p-8 text-center">
                        <p className="font-display text-lg text-white">No questions yet.</p>
                        <p className="text-white/60 text-sm mt-1">Your first doubt might help a dozen silent ones.</p>
                        <Link to="/ask" className="btn-primary inline-flex mt-4" data-testid="empty-ask-cta">Ask your first question</Link>
                    </div>
                ) : (
                    <div className="mt-5 grid gap-4">
                        {list.map((q) => <QuestionCard key={q.id} q={q} compact />)}
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
