import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User as UserIcon, Check } from "lucide-react";
import AmbientBg from "../components/AmbientBg";
import api from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get("/meta/subjects").then((r) => setAllSubjects(r.data.subjects)).catch(() => {});
    }, []);

    const toggle = (s) => setSubjects((list) => list.includes(s) ? list.filter((x) => x !== s) : [...list, s]);

    const submit = async (e) => {
        e.preventDefault(); setErr(""); setBusy(true);
        const r = await register({ email, password, name, role, subjects: role === "teacher" ? subjects : [] });
        setBusy(false);
        if (!r.ok) { setErr(r.error); return; }
        nav(r.user.role === "teacher" ? "/teacher" : "/feed", { replace: true });
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
            <AmbientBg />
            <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong w-full max-w-md rounded-3xl p-7 sm:p-9 grain"
                data-testid="register-form"
            >
                <h1 className="font-display text-3xl text-white">Join Unmute.</h1>
                <p className="text-white/60 text-sm mt-1">Students stay fully anonymous. Teachers help without judging.</p>

                <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-full bg-black/40 border border-white/10">
                    {["student", "teacher"].map((r) => (
                        <button
                            key={r} type="button"
                            onClick={() => setRole(r)}
                            data-testid={`role-${r}`}
                            className={`py-2 rounded-full text-sm font-medium transition-all ${
                                role === r
                                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg"
                                    : "text-white/65 hover:text-white"
                            }`}
                        >
                            I'm a {r}
                        </button>
                    ))}
                </div>

                <label className="block mt-5 text-xs uppercase tracking-[0.2em] text-white/55">Display name</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 px-4 py-3">
                    <UserIcon size={16} className="text-white/45" />
                    <input data-testid="reg-name" className="bg-transparent w-full outline-none placeholder:text-white/35 text-white"
                        required maxLength={80}
                        placeholder={role === "teacher" ? "Ms. Priya" : "Your real name (kept private)"}
                        value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {role === "student" && (
                    <p className="mt-1 text-[11px] text-white/45">
                        <Check size={10} className="inline" /> Never shown to teachers — you'll be given a random handle like “Curious Fox #1042”.
                    </p>
                )}

                <label className="block mt-4 text-xs uppercase tracking-[0.2em] text-white/55">Email</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 px-4 py-3">
                    <Mail size={16} className="text-white/45" />
                    <input data-testid="reg-email" className="bg-transparent w-full outline-none placeholder:text-white/35 text-white"
                        type="email" required placeholder="you@school.edu"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <label className="block mt-4 text-xs uppercase tracking-[0.2em] text-white/55">Password</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-violet-500/50 px-4 py-3">
                    <Lock size={16} className="text-white/45" />
                    <input data-testid="reg-password" className="bg-transparent w-full outline-none placeholder:text-white/35 text-white"
                        type="password" required minLength={6} placeholder="At least 6 chars"
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {role === "teacher" && (
                    <>
                        <label className="block mt-4 text-xs uppercase tracking-[0.2em] text-white/55">Subjects you teach</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {allSubjects.map((s) => (
                                <button
                                    type="button" key={s}
                                    data-testid={`subj-${s}`}
                                    onClick={() => toggle(s)}
                                    className={`tag !py-1.5 !text-xs cursor-pointer ${
                                        subjects.includes(s)
                                            ? "!bg-violet-500/25 !border-violet-400/35 !text-white"
                                            : ""
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {err && (
                    <div className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-2" data-testid="register-error">
                        {err}
                    </div>
                )}

                <motion.button whileTap={{ scale: 0.97 }} disabled={busy} type="submit"
                    data-testid="register-submit"
                    className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-60">
                    <UserPlus size={16} /> {busy ? "Creating…" : "Create account"}
                </motion.button>

                <div className="mt-4 text-sm text-center text-white/60">
                    Already here? <Link to="/login" className="text-violet-300" data-testid="link-login">Log in</Link>
                </div>
            </motion.form>
        </div>
    );
}
