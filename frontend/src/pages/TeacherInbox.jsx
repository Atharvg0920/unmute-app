import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, CheckCircle2, Send, Wand2, Loader2, BarChart3 } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import Spotlight from "../components/Spotlight";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

function ReplyBox({ qid, onDone }) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [aiBusy, setAiBusy] = useState(false);

    const suggest = async () => {
        setAiBusy(true);
        try {
            const { data } = await api.post("/ai/auto-answer", { text: "" });
            if (data.answer) setText((t) => t ? t : data.answer);
        } catch {}
        setAiBusy(false);
    };

    const send = async () => {
        if (!text.trim()) return;
        setBusy(true);
        try {
            await api.post(`/questions/${qid}/answer`, { body: text.trim(), is_public: true });
            setText("");
            onDone && onDone();
        } catch {}
        setBusy(false);
    };

    return (
        <div className="mt-3 rounded-2xl bg-black/40 border border-white/10 p-3">
            <textarea
                data-testid={`reply-input-${qid}`}
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Write a kind, clear reply…"
                rows={3}
                className="w-full bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
            />
            <div className="flex items-center gap-2 mt-2">
                <button
                    onClick={send} disabled={busy || !text.trim()}
                    data-testid={`reply-send-${qid}`}
                    className="btn-primary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                    <Send size={12} /> {busy ? "Sending…" : "Send"}
                </button>
                <span className="ml-auto text-[10px] text-white/45">{text.length}/4000</span>
            </div>
        </div>
    );
}

function Heatmap() {
    const [data, setData] = useState([]);
    useEffect(() => {
        api.get("/stats/heatmap").then((r) => setData(r.data.heatmap || [])).catch(() => {});
    }, []);
    if (data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className="glass rounded-3xl p-5" data-testid="heatmap">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                <BarChart3 size={12} /> Doubt heatmap
            </div>
            <div className="mt-3 space-y-2">
                {data.map((d) => (
                    <div key={d.subject} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-sm text-white/80 truncate">{d.subject}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                                style={{ width: `${(d.count / max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-white/55 w-10 text-right">{d.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TeacherInbox() {
    const { user } = useAuth();
    const [tab, setTab] = useState("open");
    const [list, setList] = useState([]);
    const [answers, setAnswers] = useState({}); // qid -> list of answers
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/questions/inbox", { params: { status: tab } });
            setList(data.questions);
            // fetch answers for answered ones
            const ans = {};
            await Promise.all(
                data.questions
                    .filter((q) => q.status === "answered")
                    .map(async (q) => {
                        try {
                            const r = await api.get(`/questions/${q.id}`);
                            ans[q.id] = r.data.answers || [];
                        } catch {}
                    })
            );
            setAnswers(ans);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

    return (
        <div className="relative min-h-screen pb-24">
            <AmbientBg />
            <Spotlight color="rgba(59,130,246,0.16)" size={500} />
            <TopBar title="Teacher" />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
                <section>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight">Welcome, {user?.name?.split(" ")[0] || "Teacher"}.</h1>
                        <p className="text-white/60 text-sm mt-1">
                            Questions are anonymously routed from your subjects{user?.subjects?.length ? `: ${user.subjects.join(", ")}` : ""}.
                        </p>
                    </motion.div>

                    <div className="mt-5 flex gap-1 p-1 rounded-full bg-black/40 border border-white/10 w-fit">
                        {[
                            { id: "open", label: "Open", icon: Inbox },
                            { id: "answered", label: "Answered", icon: CheckCircle2 },
                            { id: "all", label: "All" },
                        ].map((t) => (
                            <button
                                key={t.id} onClick={() => setTab(t.id)}
                                data-testid={`tab-${t.id}`}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
                                    tab === t.id ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white" : "text-white/65 hover:text-white"
                                }`}
                            >
                                {t.icon && <t.icon size={12} />} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 grid gap-4">
                        {loading && [0,1].map((i) => (
                            <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                                <div className="h-3 w-1/3 rounded-full bg-white/10" />
                                <div className="mt-4 h-4 w-5/6 rounded bg-white/10" />
                            </div>
                        ))}
                        {!loading && list.length === 0 && (
                            <div className="glass rounded-3xl p-8 text-center">
                                <p className="font-display text-lg text-white">No questions here.</p>
                                <p className="text-white/60 text-sm mt-1">Encourage your students to speak up on Unmute.</p>
                            </div>
                        )}
                        <AnimatePresence mode="popLayout">
                            {list.map((q) => (
                                <motion.div
                                    key={q.id} layout
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="glass rounded-3xl p-5 sm:p-6 grain"
                                    data-testid={`teacher-question-${q.id}`}
                                >
                                    <div className="flex items-center gap-2 text-xs text-white/60">
                                        <span className="font-medium text-white/85">{q.handle}</span>
                                        <span>·</span>
                                        <span className="tag !py-0.5 !text-[10px]">{q.subject}</span>
                                        <span className="tag !bg-violet-500/10 !text-violet-200 !border-violet-400/20">
                                            ↑ {q.upvotes}
                                        </span>
                                        {q.status === "answered" && (
                                            <span className="tag !bg-emerald-500/10 !text-emerald-300 !border-emerald-400/20 inline-flex items-center gap-1">
                                                <CheckCircle2 size={11} /> answered
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-white/90 leading-relaxed">{q.body}</p>
                                    {q.tags?.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {q.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
                                        </div>
                                    )}
                                    {q.status === "answered" && answers[q.id]?.length > 0 && (
                                        <div className="mt-3 rounded-2xl bg-emerald-500/5 border border-emerald-400/15 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/80 mb-1">Your reply</div>
                                            <p className="text-sm text-white/85 whitespace-pre-wrap">{answers[q.id][0].body}</p>
                                        </div>
                                    )}
                                    {q.status === "open" && (
                                        <ReplyBox qid={q.id} onDone={load} />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                <aside className="space-y-4">
                    <Heatmap />
                    <div className="glass rounded-3xl p-5">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/60">Tips</div>
                        <ul className="mt-2 text-sm text-white/75 space-y-2 leading-relaxed">
                            <li>• Use <span className="text-violet-300">Improve with AI</span> in chat to help students rephrase.</li>
                            <li>• Prioritize high-upvote questions to help the silent majority.</li>
                            <li>• Answers are posted publicly by default to help everyone.</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
}
