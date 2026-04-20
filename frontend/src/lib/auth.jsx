import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiError } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = unknown, false = guest, obj = auth
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const token = localStorage.getItem("unmute_token");
        if (!token) {
            setUser(false);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/auth/me");
            setUser(data.user);
        } catch {
            localStorage.removeItem("unmute_token");
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("unmute_token", data.token);
            setUser(data.user);
            return { ok: true, user: data.user };
        } catch (e) {
            return { ok: false, error: formatApiError(e.response?.data?.detail) || e.message };
        }
    };

    const register = async (payload) => {
        try {
            const { data } = await api.post("/auth/register", payload);
            localStorage.setItem("unmute_token", data.token);
            setUser(data.user);
            return { ok: true, user: data.user };
        } catch (e) {
            return { ok: false, error: formatApiError(e.response?.data?.detail) || e.message };
        }
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        localStorage.removeItem("unmute_token");
        setUser(false);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}
