import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Brain, Flame, MessageCircle, Trophy, BookOpen } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

const ICONS = { MessageCircle, Brain, Trophy, Flame };

export default function Profile() {
    const { user } = useAuth();
    const [badges, setBadges] = useState([]);
    const isStudent = user?.role === "student";

    useEffect(() => {
        api.get("/me/badges").then((r) => setBadges(r.data.badges)).catch(() => {});
    }, []);

    return (
        <div className="relative min-h-screen pb-32">
            <AmbientBg />
            <TopBar title="You" />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="glass-strong rounded-3xl p-6 sm:p-8 grain"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-[0_10px_30px_rgba(139,92,246,0.35)]">
                            <span className="font-display font-black text-white text-2xl">
                                {(isStudent ? user?.handle : user?.name)?.[0] || "U"}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs uppercase tracking-[0.2em] text-white/55">{user?.role}</div>
                            <div className="font-display text-2xl text-white truncate">
                                {isStudent ? user?.handle : user?.name}
                            </div>
                            {isStudent && <div className="text-xs text-white/50 mt-0.5">Your anonymous handle. Teachers only see this.</div>}
                            {!isStudent && user?.subjects?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {user.subjects.map((s) => <span key={s} className="tag">{s}</span>)}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {isStudent && (
                    <section className="mt-6">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55 mb-3">
                            <Award size={12} /> Badges
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="badges">
                            {badges.map((b) => {
                                const Icon = ICONS[b.icon] || BookOpen;
                                return (
                                    <motion.div
                                        key={b.id}
                                        whileHover={{ y: -2 }}
                                        className={`rounded-3xl p-4 text-center ${b.owned ? "glass-strong" : "glass opacity-60"}`}
                                        data-testid={`badge-${b.id}`}
                                    >
                                        <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                                            b.owned ? "bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_24px_rgba(139,92,246,0.4)]" : "bg-white/5 border border-white/10"
                                        }`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        <div className="mt-2 font-display text-sm text-white">{b.label}</div>
                                        <div className="text-[11px] text-white/55 mt-0.5">{b.desc}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="mt-6 glass rounded-3xl p-5">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/55">How you appear</div>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">
                        {isStudent
                            ? "You're anonymous. Your email and name are never shared with teachers or other students. Only your random handle is visible."
                            : "Students see your name and subjects. You never see their real identity — only anonymous handles."}
                    </p>
                </section>
            </main>
            {isStudent && <BottomNav />}
        </div>
    );
}
