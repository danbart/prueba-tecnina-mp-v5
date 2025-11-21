
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ExpedienteDicriCreate() {
    const [numeroExpediente, setNumeroExpediente] = useState('');
    const [descripcionGeneral, setDescripcionGeneral] = useState('');
    const [referenciaMp, setReferenciaMp] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        api.post('/expediente-dicri', { numeroExpediente, descripcionGeneral })
            .then(() => {
                navigate('/expedientes-dicri');
            })
            .catch(e => {
                setError(e.response?.data?.error || 'Error al crear expediente');
            })
            .finally(() => setLoading(false));
    };


    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            <div className="max-w-3xl mx-auto w-full px-4 py-8">
                <h1 className="text-2xl font-semibold mb-6">
                    Crear expediente DICRI
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-800/70 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Número de expediente
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={numeroExpediente}
                            onChange={(e) => setNumeroExpediente(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Referencia MP (opcional)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={referenciaMp}
                            onChange={(e) => setReferenciaMp(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ubicación (opcional)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Descripción general
                        </label>
                        <textarea
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            value={descripcionGeneral}
                            onChange={(e) => setDescripcionGeneral(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-lg border border-slate-600 text-sm hover:bg-slate-700/60 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Guardar expediente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ExpedienteDicriCreate;
