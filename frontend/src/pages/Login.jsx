import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await login(form.email, form.password);
            nav('/');
        } catch (e) {
            setErr(e.response?.data?.error || 'Error');
        }
    };

    return (
        <div className="flex flex-col items-center mt-24">
            <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                <input
                    type="email"
                    placeholder="Correo"
                    className="border p-2 rounded"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    className="border p-2 rounded"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />
                {err && <p className="text-red-500 text-sm">{err}</p>}
                <button className="bg-blue-600 text-white rounded p-2">Entrar</button>
                <Link to="/register" className="text-sm text-blue-600">Crear cuenta</Link>
            </form>
        </div>
    );
}