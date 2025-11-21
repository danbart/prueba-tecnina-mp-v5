import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'fiscal' });
    const [err, setErr] = useState('');

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        try {
            await register(form);
            nav('/');
        } catch (e) {
            setErr(e.response?.data?.error || 'Error');
        }
    };

    return (
        <div className="flex flex-col items-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Registro</h1>
            <form onSubmit={submit} className="flex flex-col gap-4 w-80">
                <input name="nombre" placeholder="Nombre" className="border p-2 rounded" value={form.nombre} onChange={handle} />
                <input name="email" type="email" placeholder="Correo" className="border p-2 rounded" value={form.email} onChange={handle} />
                <input name="password" type="password" placeholder="Contraseña" className="border p-2 rounded" value={form.password} onChange={handle} />
                <select name="rol" className="border p-2 rounded" value={form.rol} onChange={handle}>
                    <option value="fiscal">Fiscal</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="tecnico">Técnico</option>
                </select>
                {err && <p className="text-red-500 text-sm">{err}</p>}
                <button className="bg-green-600 text-white rounded p-2">Crear cuenta</button>
                <Link to="/login" className="text-sm text-blue-600">Ya tengo cuenta</Link>
            </form>
        </div>
    );
}