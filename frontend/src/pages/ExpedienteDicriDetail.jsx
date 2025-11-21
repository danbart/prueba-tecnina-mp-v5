import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const estadoColors = {
    Registrado: 'bg-slate-700 text-slate-100',
    EnRevision: 'bg-amber-600 text-amber-50',
    Aprobado: 'bg-emerald-600 text-emerald-50',
    Rechazado: 'bg-red-600 text-red-50',
};

function ExpedienteDicriDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expediente, setExpediente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [rechazoJustificacion, setRechazoJustificacion] = useState('');

    const [historial, setHistorial] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(true);
    const [historialError, setHistorialError] = useState('');

    const [indicios, setIndicios] = useState([]);
    const [indiciosLoading, setIndiciosLoading] = useState(true);
    const [indiciosError, setIndiciosError] = useState('');
    const [creatingIndicio, setCreatingIndicio] = useState(false);
    const [nuevoIndicio, setNuevoIndicio] = useState({
        descripcion: '',
        color: '',
        tamano: '',
        pesoGramos: '',
        ubicacionLevantamiento: '',
    });

    const fetchExpediente = async () => {
        setLoading(true);
        setError('');
        api.get('/expediente-dicri/' + id)
            .then((res) => {
                setExpediente(res.data);
            })
            .catch((e) => {
                setError(e.response?.data?.error || 'Error al cargar expediente');
            })
            .finally(() => setLoading(false));
    };

    const fetchIndicios = async () => {
        setIndiciosLoading(true);
        setIndiciosError('');
        api.get(`/expediente-dicri/${id}/indicios`)
            .then((res) => {
                setIndicios(res.data);
            })
            .catch((e) => {
                setIndiciosError(e.response?.data?.error || 'Error al cargar indicios');
            })
            .finally(() => setIndiciosLoading(false));
    };

    useEffect(() => {
        fetchExpediente();
        fetchIndicios();
        fetchHistorial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSendToReview = async () => {
        setActionLoading(true);
        setError('');
        api.post('/expediente-dicri/enviar-revision', { idExpediente: id, comentario: 'Enviado a revisión' })
            .then(_ => fetchExpediente())
            .catch(e => {
                setError(e.response?.data?.error || 'Error al enviar a revisión');
            })
            .finally(() => setActionLoading(false));
    };

    const handleApprove = async () => {
        setActionLoading(true);
        setError('');
        api.post(`/expediente-dicri/aprobar`, {
            comentario: expediente?.observacionesCoordinador || null, idExpediente: id
        }
        ).then(_ => fetchExpediente())
            .catch(e => {
                setError(e.response?.data?.error || 'Error al aprobar expediente');
            })
            .finally(() => setActionLoading(false));
    };

    const handleReject = async () => {
        if (!rechazoJustificacion.trim()) {
            setError('La justificación de rechazo es obligatoria.');
            return;
        }

        setActionLoading(true);
        setError('');
        api.post(`/expediente-dicri/rechazar`, {
            justificacion: rechazoJustificacion, idExpediente: id
        })
            .then(_ => {
                setRechazoJustificacion('');
                fetchExpediente();
            })
            .catch(e => {
                setError(e.response?.data?.error || 'Error al rechazar expediente');
            })
            .finally(() => setActionLoading(false));
    };

    const renderAcciones = () => {
        if (!expediente) return null;

        if (expediente.estado === 'Registrado') {
            return (
                <button
                    onClick={handleSendToReview}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {actionLoading ? 'Procesando...' : 'Enviar a revisión'}
                </button>
            );
        }

        if (expediente.estado === 'EnRevision') {
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Justificación (solo si se rechaza)
                        </label>
                        <textarea
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                            value={rechazoJustificacion}
                            onChange={(e) => setRechazoJustificacion(e.target.value)}
                            placeholder="Explique el motivo del rechazo..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {actionLoading ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {actionLoading ? 'Procesando...' : 'Rechazar'}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <p className="text-sm text-slate-400">
                El expediente ya se encuentra en estado <span className="font-semibold">{expediente.estado}</span>.
                No hay acciones disponibles.
            </p>
        );
    };

    const isFinalState =
        expediente && (expediente.estado === 'Aprobado' || expediente.estado === 'Rechazado');

    const handleChangeNuevoIndicio = (e) => {
        const { name, value } = e.target;
        setNuevoIndicio((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateIndicio = async (e) => {
        e.preventDefault();
        setIndiciosError('');

        if (!nuevoIndicio.descripcion.trim()) {
            setIndiciosError('La descripción del indicio es obligatoria.');
            return;
        }

        setCreatingIndicio(true);

        api.post(`/expediente-dicri/${id}/indicio`, {
            descripcion: nuevoIndicio.descripcion,
            color: nuevoIndicio.color || null,
            tamano: nuevoIndicio.tamano || null,
            peso: nuevoIndicio.pesoGramos
                ? Number(nuevoIndicio.pesoGramos)
                : null,
            ubicacion:
                nuevoIndicio.ubicacionLevantamiento || null,
        }).then((res) => {
            // setIndicios((prev) => [...prev, res.data]);
            fetchIndicios();
            setNuevoIndicio({
                descripcion: '',
                color: '',
                tamano: '',
                pesoGramos: '',
                ubicacionLevantamiento: '',
            });
        }).catch((e) => {
            setIndiciosError(
                e.response?.data?.error || 'Error al crear indicio'
            );
        }).finally(() => {
            setCreatingIndicio(false);
        });
    };

    const fetchHistorial = async () => {
        setHistorialLoading(true);
        setHistorialError('');
        api.get(`/expediente-dicri/${id}/historial`)
            .then((res) => {
                setHistorial(res.data);
            })
            .catch((e) => {
                setHistorialError(
                    e.response?.data?.error || 'Error al cargar historial'
                );
            })
            .finally(() => {
                setHistorialLoading(false);
            });
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            return new Date(fecha).toLocaleString();
        } catch {
            return fecha;
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <p className="text-sm text-slate-300">Cargando expediente...</p>
            </div>
        );
    }

    if (!expediente) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-sm text-red-400">No se encontró el expediente.</p>
                    <button
                        onClick={() => navigate('/expedientes-dicri')}
                        className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
                    >
                        Volver al listado
                    </button>
                </div>
            </div>
        );
    }

    const estadoClass = estadoColors[expediente.estado] || 'bg-slate-700 text-slate-100';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Expediente {expediente.numeroExpediente}
                        </h1>
                        <p className="text-sm text-slate-400">
                            ID: {expediente.idExpedienteDicri || expediente.id}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoClass}`}>
                        Estado: {expediente.estado}
                    </span>
                </div>

                {error && (
                    <div className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
                            Información general
                        </h2>
                        <p className="text-sm text-slate-200 whitespace-pre-line">
                            {expediente.descripcionGeneral || 'Sin descripción.'}
                        </p>
                    </div>

                    {expediente.justificacionRechazo && (
                        <div className="border border-red-700/60 rounded-lg p-3 bg-red-950/20">
                            <h3 className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-1">
                                Justificación de rechazo
                            </h3>
                            <p className="text-sm text-red-100 whitespace-pre-line">
                                {expediente.justificacionRechazo}
                            </p>
                        </div>
                    )}

                    {/* Sección de indicios */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                                Indicios del expediente
                            </h2>
                            {indiciosLoading && (
                                <span className="text-xs text-slate-400">
                                    Cargando indicios...
                                </span>
                            )}
                        </div>

                        {indiciosError && (
                            <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                                {indiciosError}
                            </div>
                        )}

                        {/* Tabla de indicios */}
                        <div className="overflow-x-auto rounded-lg border border-slate-700/80">
                            <table className="min-w-full text-xs md:text-sm">
                                <thead className="bg-slate-800/90">
                                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-300">
                                        <th className="px-3 py-2 border-b border-slate-700/80">
                                            #
                                        </th>
                                        <th className="px-3 py-2 border-b border-slate-700/80">
                                            Descripción
                                        </th>
                                        <th className="px-3 py-2 border-b border-slate-700/80 hidden md:table-cell">
                                            Color / Tamaño
                                        </th>
                                        <th className="px-3 py-2 border-b border-slate-700/80 hidden md:table-cell">
                                            Peso (g)
                                        </th>
                                        <th className="px-3 py-2 border-b border-slate-700/80 hidden sm:table-cell">
                                            Ubicación
                                        </th>
                                        <th className="px-3 py-2 border-b border-slate-700/80 hidden lg:table-cell">
                                            Fecha levantamiento
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                    {indiciosLoading ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-4 text-center text-slate-400"
                                            >
                                                Cargando indicios...
                                            </td>
                                        </tr>
                                    ) : indicios.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-4 text-center text-slate-400"
                                            >
                                                No hay indicios registrados para este expediente.
                                            </td>
                                        </tr>
                                    ) : (
                                        indicios.map((ind, idx) => (
                                            <tr key={ind.idIndicio || ind.id || idx} className="hover:bg-slate-800/60">
                                                <td className="px-3 py-2 align-top text-slate-300">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2 align-top text-slate-100">
                                                    {ind.descripcion}
                                                </td>
                                                <td className="px-3 py-2 align-top text-slate-200 hidden md:table-cell">
                                                    <div className="flex flex-col">
                                                        <span>{ind.color || '-'}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {ind.tamano || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 align-top text-slate-200 hidden md:table-cell">
                                                    {ind.peso != null ? ind.peso : '-'}
                                                </td>
                                                <td className="px-3 py-2 align-top text-slate-200 hidden sm:table-cell">
                                                    {ind.ubicacion || '-'}
                                                </td>
                                                <td className="px-3 py-2 align-top text-slate-200 hidden lg:table-cell">
                                                    {formatFecha(ind.fechaRegistro)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Formulario para crear indicio */}
                        {!isFinalState && (
                            <form
                                onSubmit={handleCreateIndicio}
                                className="mt-4 bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-3"
                            >
                                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                    Nuevo indicio
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1">
                                            Descripción *
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={nuevoIndicio.descripcion}
                                            onChange={handleChangeNuevoIndicio}
                                            required
                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Color
                                        </label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={nuevoIndicio.color}
                                            onChange={handleChangeNuevoIndicio}
                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Tamaño
                                        </label>
                                        <input
                                            type="text"
                                            name="tamano"
                                            value={nuevoIndicio.tamano}
                                            onChange={handleChangeNuevoIndicio}
                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Peso (gramos)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="pesoGramos"
                                            value={nuevoIndicio.pesoGramos}
                                            onChange={handleChangeNuevoIndicio}
                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Ubicación del levantamiento
                                        </label>
                                        <input
                                            type="text"
                                            name="ubicacionLevantamiento"
                                            value={nuevoIndicio.ubicacionLevantamiento}
                                            onChange={handleChangeNuevoIndicio}
                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {indiciosError && (
                                    <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                                        {indiciosError}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={creatingIndicio}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs md:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {creatingIndicio ? 'Guardando...' : 'Agregar indicio'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Historial del expediente */}
                        <div className="space-y-3 mt-6">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                                    Historial del expediente
                                </h2>
                                {historialLoading && (
                                    <span className="text-xs text-slate-400">
                                        Cargando historial...
                                    </span>
                                )}
                            </div>

                            {historialError && (
                                <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                                    {historialError}
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-lg border border-slate-700/80">
                                <table className="min-w-full text-xs md:text-sm">
                                    <thead className="bg-slate-800/90">
                                        <tr className="text-left text-[11px] uppercase tracking-wide text-slate-300">
                                            <th className="px-3 py-2 border-b border-slate-700/80">#</th>
                                            <th className="px-3 py-2 border-b border-slate-700/80">Estado</th>
                                            <th className="px-3 py-2 border-b border-slate-700/80 hidden sm:table-cell">
                                                Comentario
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-700/80">
                                                Usuario
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-700/80 hidden md:table-cell">
                                                Fecha
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/80">
                                        {historialLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                                                    Cargando historial...
                                                </td>
                                            </tr>
                                        ) : historial.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                                                    No hay registros de historial para este expediente.
                                                </td>
                                            </tr>
                                        ) : (
                                            historial.map((h, idx) => (
                                                <tr key={h.id || idx} className="hover:bg-slate-800/60">
                                                    <td className="px-3 py-2 align-top text-slate-300">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3 py-2 align-top text-slate-100">
                                                        {h.estado}
                                                    </td>
                                                    <td className="px-3 py-2 align-top text-slate-200 hidden sm:table-cell">
                                                        {h.comentario || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 align-top text-slate-200">
                                                        <div className="flex flex-col">
                                                            <span>{h.usuarioNombre || '-'}</span>
                                                            {h.usuarioEmail && (
                                                                <span className="text-[11px] text-slate-400">
                                                                    {h.usuarioEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 align-top text-slate-200 hidden md:table-cell">
                                                        {formatFecha(h.fecha)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        {isFinalState && (
                            <p className="text-xs text-slate-400 mt-2">
                                El expediente está en estado <strong>{expediente.estado}</strong>, no es posible
                                registrar nuevos indicios.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/expedientes-dicri')}
                            className="px-4 py-2 rounded-lg border border-slate-600 text-sm hover:bg-slate-700/60 transition"
                        >
                            Volver
                        </button>

                        <div className="flex-1 flex justify-end">
                            {renderAcciones()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpedienteDicriDetail;
