import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./lib/auth";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Ask from "./pages/Ask";
import MyQuestions from "./pages/MyQuestions";
import TeacherInbox from "./pages/TeacherInbox";
import QuestionDetail from "./pages/QuestionDetail";
import Profile from "./pages/Profile";

function Protected({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-white/60">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/feed" replace />;
    return children;
}

function Shell() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/feed" element={<Feed />} />
                <Route path="/q/:id" element={<QuestionDetail />} />

                <Route path="/ask" element={<Protected role="student"><Ask /></Protected>} />
                <Route path="/mine" element={<Protected role="student"><MyQuestions /></Protected>} />
                <Route path="/profile" element={<Protected><Profile /></Protected>} />
                <Route path="/teacher" element={<Protected role="teacher"><TeacherInbox /></Protected>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Shell />
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}
