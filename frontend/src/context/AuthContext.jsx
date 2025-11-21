import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setToken(res.data.accessToken);
        setUser(res.data.user);
    };

    const register = async ({ nombre, email, password, rol }) => {
        const res = await api.post('/auth/register', { nombre, email, password, rol });
        setToken(res.data.accessToken);
        setUser(res.data.user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthCtx.Provider value={{ token, user, login, logout, register }}>
            {children}
        </AuthCtx.Provider>
    );
}
