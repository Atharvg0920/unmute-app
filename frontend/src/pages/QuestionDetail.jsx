import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, Send, CheckCircle2, ArrowLeft, Flag } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

export default function QuestionDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [q, setQ] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);

    const load = async () => {
        const { data } = await api.get(`/questions/${id}`);
        setQ(data.question);
        setAnswers(data.answers || []);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    const upvote = async () => {
        if (!user) { window.location.href = "/login"; return; }
        const { data } = await api.post(`/questions/${id}/upvote`);
        setQ((x) => ({ ...x, upvotes: data.upvotes, has_upvoted: data.has_upvoted }));
    };

    const reply = async () => {
        if (!text.trim()) return;
        setBusy(true);
        try {
            await api.post(`/questions/${id}/answer`, { body: text.trim(), is_public: true });
            setText("");
            await load();
        } catch {}
        setBusy(false);
    };

    if (!q) {
        return (
            <div className="relative min-h-screen">
                <AmbientBg />
                <TopBar />
                <main className="max-w-3xl mx-auto px-4 pt-10">
                    <div className="glass rounded-3xl p-6 animate-pulse h-48" />
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-32">
            <AmbientBg />
            <TopBar title="Question" />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <Link to="/feed" className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white mb-3" data-testid="back-to-feed">
                    <ArrowLeft size={14} /> Back to feed
                </Link>

                <motion.article
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                    className="glass-strong rounded-3xl p-6 sm:p-8 grain"
                    data-testid="question-detail"
                >
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500/70 to-blue-500/70 text-white flex items-center justify-center font-bold">
                            {(q.handle || "A")[0]}
                        </div>
                        <span className="font-medium text-white/85">{q.handle}</span>
                        <span>·</span>
                        <span className="tag !py-0.5 !text-[10px]">{q.subject}</span>
                        {q.status === "answered" && (
                            <span className="tag !bg-emerald-500/10 !text-emerald-300 !border-emerald-400/20 inline-flex items-center gap-1">
                                <CheckCircle2 size={11} /> answered
                            </span>
                        )}
                    </div>
                    <p className="mt-4 font-display text-2xl text-white leading-snug" data-testid="detail-body">{q.body}</p>
                    {q.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {q.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
                        </div>
                    )}
                    <div className="mt-5 flex items-center gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={upvote}
                            data-testid="detail-upvote"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                q.has_upvoted ? "bg-violet-500/20 border-violet-400/30 text-violet-200" : "bg-white/5 border-white/10 text-white/75 hover:text-white"
                            }`}
                        >
                            <ArrowUp size={14} />
                            <span className="text-sm font-semibold">{q.upvotes}</span>
                        </motion.button>
                        <button
                            onClick={async () => { await api.post(`/questions/${id}/flag`); await load(); }}
                            data-testid="detail-flag"
                            className="btn-ghost !py-2 !px-3 text-xs inline-flex items-center gap-1.5"
                        >
                            <Flag size={12} /> Report
                        </button>
                    </div>
                </motion.article>

                <div className="mt-6">
                    <h3 className="font-display text-lg text-white mb-3">Answers</h3>
                    {answers.length === 0 && (
                        <div className="glass rounded-3xl p-6 text-sm text-white/65">
                            No replies yet. A teacher will respond soon.
                        </div>
                    )}
                    <div className="grid gap-3">
                        {answers.map((a) => (
                            <motion.div
                                key={a.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-3xl p-5"
                                data-testid={`answer-${a.id}`}
                            >
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-emerald-500/60 to-blue-500/60 text-white flex items-center justify-center font-bold text-[11px]">
                                        {a.teacher_name?.[0] || "T"}
                                    </div>
                                    <span className="text-white/85 font-medium">{a.teacher_name}</span>
                                    <span className="tag !bg-emerald-500/10 !text-emerald-300 !border-emerald-400/20">Teacher</span>
                                </div>
                                <p className="mt-3 text-white/90 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                            </motion.div>
                        ))}
                    </div>

                    {user?.role === "teacher" && (
                        <div className="mt-5 glass-strong rounded-3xl p-4" data-testid="teacher-reply-box">
                            <textarea
                                value={text} onChange={(e) => setText(e.target.value)}
                                placeholder="Reply kindly and clearly…" rows={3}
                                className="w-full bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
                            />
                            <div className="mt-2 flex justify-end">
                                <button onClick={reply} disabled={busy || !text.trim()}
                                    data-testid="teacher-reply-send"
                                    className="btn-primary !py-2 !px-4 text-xs inline-flex items-center gap-1.5 disabled:opacity-60">
                                    <Send size={12} /> {busy ? "Sending…" : "Send reply"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
