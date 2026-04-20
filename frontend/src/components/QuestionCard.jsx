import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquare, Flag, CheckCircle2 } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

export default function QuestionCard({ q, onChange, compact = false }) {
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);
    const [local, setLocal] = useState(q);

    const toggleUpvote = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { window.location.href = "/login"; return; }
        setBusy(true);
        try {
            const { data } = await api.post(`/questions/${local.id}/upvote`);
            const next = { ...local, upvotes: data.upvotes, has_upvoted: data.has_upvoted };
            setLocal(next);
            onChange && onChange(next);
        } catch {}
        setBusy(false);
    };

    const report = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) return;
        await api.post(`/questions/${local.id}/flag`);
        const next = { ...local, ai_flagged: true };
        setLocal(next);
        onChange && onChange(next);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            className="glass rounded-3xl p-5 sm:p-6 grain relative group"
            data-testid={`question-card-${local.id}`}
        >
            <Link to={`/q/${local.id}`} className="block">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500/70 to-blue-500/70 text-white font-display font-bold flex items-center justify-center text-sm shadow-lg">
                        {(local.handle || "A")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span className="font-medium text-white/85" data-testid="q-handle">{local.handle || "Anonymous"}</span>
                            <span>·</span>
                            <span className="tag !py-0.5 !text-[10px]" data-testid="q-subject">{local.subject}</span>
                            {local.status === "answered" && (
                                <span className="tag !bg-emerald-500/10 !border-emerald-400/20 !text-emerald-300 inline-flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Answered
                                </span>
                            )}
                        </div>
                        <p className={`mt-2 text-white/90 leading-relaxed ${compact ? "line-clamp-2" : ""}`} data-testid="q-body">
                            {local.body}
                        </p>
                        {local.tags && local.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {local.tags.slice(0, 5).map((t) => (
                                    <span key={t} className="tag">#{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={toggleUpvote}
                    disabled={busy}
                    data-testid={`upvote-btn-${local.id}`}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                        local.has_upvoted
                            ? "bg-violet-500/20 border-violet-400/30 text-violet-200"
                            : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                    }`}
                >
                    <motion.span
                        key={local.upvotes}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ duration: 0.35, type: "spring", bounce: 0.5 }}
                    >
                        <ArrowUp size={14} />
                    </motion.span>
                    <span className="text-sm font-semibold" data-testid={`upvote-count-${local.id}`}>{local.upvotes || 0}</span>
                </button>

                <div className="flex items-center gap-2 text-white/55 text-xs">
                    <span className="inline-flex items-center gap-1" title="Discussion">
                        <MessageSquare size={13} /> {local.status === "answered" ? "reply" : "awaiting"}
                    </span>
                    {user && (
                        <button
                            onClick={report}
                            className="inline-flex items-center gap-1 hover:text-white/80"
                            data-testid={`flag-btn-${local.id}`}
                            title="Report"
                        >
                            <Flag size={13} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
