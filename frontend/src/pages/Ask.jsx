import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Wand2, Tag, Shield, Loader2 } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import api from "../lib/api";

export default function Ask() {
    const nav = useNavigate();
    const [body, setBody] = useState("");
    const [subject, setSubject] = useState("Mathematics");
    const [tags, setTags] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [rewriting, setRewriting] = useState(false);
    const [similar, setSimilar] = useState([]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        api.get("/meta/subjects").then((r) => setSubjects(r.data.subjects)).catch(() => {});
    }, []);

    const rewrite = async () => {
        if (!body.trim() || body.length < 5) return;
        setRewriting(true);
        try {
            const { data } = await api.post("/ai/rewrite", { text: body });
            if (data.rewritten) setBody(data.rewritten);
        } catch {}
        setRewriting(false);
    };

    const findSimilar = async () => {
        if (!body.trim() || body.length < 8) return;
        try {
            const { data } = await api.post("/ai/similar", { text: body });
            setSimilar(data.similar || []);
        } catch {}
    };

    const submit = async (e) => {
        e.preventDefault();
        setErr(""); setBusy(true);
        try {
            const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
            const { data } = await api.post("/questions", { body: body.trim(), subject, tags: parsedTags, is_public: true });
            if (data.question.ai_flagged) {
                setErr("Your message was flagged by moderation. Please rephrase respectfully.");
            } else {
                nav(`/q/${data.question.id}`);
            }
        } catch (e2) {
            setErr(e2.response?.data?.detail || "Could not post. Please try again.");
        }
        setBusy(false);
    };

    return (
        <div className="relative min-h-screen pb-40">
            <AmbientBg />
            <TopBar title="Ask" />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <Shield size={12} className="text-emerald-300" /> You're completely anonymous. Teachers only see a random handle.
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight mt-2">Ask anything.</h1>
                    <p className="text-white/60 text-sm mt-1">No judgment. No records of your identity. Just clarity.</p>
                </motion.div>

                <form onSubmit={submit} className="mt-6" data-testid="ask-form">
                    <div className="glass-strong rounded-3xl p-5 sm:p-6 grain">
                        <textarea
                            data-testid="ask-input"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Ask anything without fear…"
                            rows={6}
                            minLength={5}
                            maxLength={1200}
                            className="w-full bg-transparent resize-none outline-none text-white placeholder:text-white/30 text-lg leading-relaxed"
                            required
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <motion.button
                                type="button" whileTap={{ scale: 0.95 }} onClick={rewrite} disabled={rewriting || body.length < 5}
                                data-testid="btn-rewrite"
                                className="btn-ghost !py-2 !px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {rewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                Improve with AI
                            </motion.button>
                            <motion.button
                                type="button" whileTap={{ scale: 0.95 }} onClick={findSimilar} disabled={body.length < 8}
                                data-testid="btn-similar"
                                className="btn-ghost !py-2 !px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Sparkles size={12} /> Find similar
                            </motion.button>
                            <span className="ml-auto text-[11px] text-white/40">{body.length}/1200</span>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="glass rounded-2xl p-4">
                            <label className="text-[11px] uppercase tracking-[0.2em] text-white/55 block mb-2">Subject</label>
                            <select
                                data-testid="ask-subject"
                                value={subject} onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-3 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                            >
                                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="glass rounded-2xl p-4">
                            <label className="text-[11px] uppercase tracking-[0.2em] text-white/55 block mb-2 inline-flex items-center gap-1"><Tag size={10} /> Tags (comma separated)</label>
                            <input
                                data-testid="ask-tags"
                                value={tags} onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., calculus, chain-rule"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {similar.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mt-4 glass rounded-2xl p-4" data-testid="similar-list"
                            >
                                <div className="text-xs uppercase tracking-[0.2em] text-white/55 mb-2">Similar answered questions</div>
                                <ul className="space-y-2">
                                    {similar.map((s) => (
                                        <li key={s.id}>
                                            <a href={`/q/${s.id}`} className="text-sm text-white/85 hover:text-white underline decoration-white/20 hover:decoration-white/60">
                                                {s.body.slice(0, 120)}{s.body.length > 120 ? "…" : ""}
                                            </a>
                                            <span className="tag ml-2 !text-[10px]">{s.subject}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {err && (
                        <div className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-2" data-testid="ask-error">
                            {typeof err === "string" ? err : JSON.stringify(err)}
                        </div>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit" disabled={busy || body.trim().length < 5}
                        data-testid="ask-submit"
                        className="btn-primary mt-6 w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Send size={16} /> {busy ? "Posting anonymously…" : "Post anonymously"}
                    </motion.button>
                </form>
            </main>

            <BottomNav />
        </div>
    );
}
