import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const estadoColors = {
    Registrado: 'bg-slate-700 text-slate-100',
    EnRevision: 'bg-amber-600 text-amber-50',
    Aprobado: 'bg-emerald-600 text-emerald-50',
    Rechazado: 'bg-red-600 text-red-50',
};

const estados = ['', 'Registrado', 'EnRevision', 'Aprobado', 'Rechazado'];

function ExpedientesDicriList() {
    const [expedientes, setExpedientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const fetchExpedientes = async () => {
        setLoading(true);
        setError('');
        api.get('/expediente-dicri')
            .then((res) => {
                setExpedientes(Array.isArray(res.data) ? res.data : []);
            })
            .catch((e) => {
                setError(e.response?.data?.error || 'Error al cargar expedientes');
            })
            .finally(() => setLoading(false));

    };

    useEffect(() => {
        fetchExpedientes();
    }, []);

    const filtered = useMemo(() => {
        return expedientes.filter((e) => {
            const matchEstado = estadoFilter ? e.estado === estadoFilter : true;

            const term = search.toLowerCase().trim();
            const matchSearch = term
                ? (e.numeroExpediente || '')
                    .toString()
                    .toLowerCase()
                    .includes(term) ||
                (e.descripcionGeneral || '')
                    .toString()
                    .toLowerCase()
                    .includes(term)
                : true;

            return matchEstado && matchSearch;
        });
    }, [expedientes, estadoFilter, search]);

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleString();
        } catch {
            return fecha;
        }
    };

    const handleRowClick = (expediente) => {
        const id = expediente.idExpedienteDicri || expediente.id;
        if (!id) return;
        navigate(`/expedientes-dicri/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Expedientes DICRI</h1>
                        <p className="text-sm text-slate-400">
                            Gestión de expedientes e indicios para DICRI.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/expedientes-dicri/nuevo')}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium shadow-sm"
                    >
                        + Nuevo expediente
                    </button>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 shadow-lg space-y-4">
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="flex-1 flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Buscar
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Número de expediente o descripción..."
                                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todos</option>
                                    {estados
                                        .filter((x) => x)
                                        .map((estado) => (
                                            <option key={estado} value={estado}>
                                                {estado}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={fetchExpedientes}
                                disabled={loading}
                                className="px-3 py-2 rounded-lg border border-slate-600 text-xs font-medium hover:bg-slate-700/60 disabled:opacity-60"
                            >
                                {loading ? 'Actualizando...' : 'Refrescar'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    {/* Tabla */}
                    <div className="overflow-x-auto rounded-lg border border-slate-700/80">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-800/90">
                                <tr className="text-left text-xs uppercase tracking-wide text-slate-300">
                                    <th className="px-3 py-2 border-b border-slate-700/80">#</th>
                                    <th className="px-3 py-2 border-b border-slate-700/80">
                                        Número de expediente
                                    </th>
                                    <th className="px-3 py-2 border-b border-slate-700/80">
                                        Estado
                                    </th>
                                    <th className="px-3 py-2 border-b border-slate-700/80">
                                        Fecha registro
                                    </th>
                                    <th className="px-3 py-2 border-b border-slate-700/80 hidden md:table-cell">
                                        Descripción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-6 text-center text-slate-400"
                                        >
                                            Cargando expedientes...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-6 text-center text-slate-400"
                                        >
                                            No hay expedientes que coincidan con el filtro.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((e, idx) => {
                                        const estadoClass =
                                            estadoColors[e.estado] ||
                                            'bg-slate-700 text-slate-100';

                                        return (
                                            <tr
                                                key={e.idExpedienteDicri || e.id || idx}
                                                className="hover:bg-slate-800/70 cursor-pointer transition"
                                                onClick={() => handleRowClick(e)}
                                            >
                                                <td className="px-3 py-2 align-middle text-slate-300">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-100">
                                                            {e.numeroExpediente}
                                                        </span>
                                                        <span className="md:hidden text-xs text-slate-400">
                                                            {formatFecha(e.fechaRegistro)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 align-middle">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold ${estadoClass}`}
                                                    >
                                                        {e.estado}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 align-middle text-slate-200 hidden sm:table-cell">
                                                    {formatFecha(e.fechaRegistro)}
                                                </td>
                                                <td className="px-3 py-2 align-middle text-slate-400 hidden md:table-cell">
                                                    {e.descripcionGeneral
                                                        ? e.descripcionGeneral.length > 80
                                                            ? e.descripcionGeneral.slice(0, 80) + '...'
                                                            : e.descripcionGeneral
                                                        : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpedientesDicriList;
