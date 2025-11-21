const { poolPromise, sql } = require('../database/connection');
const ExpedienteDicri = require('../models/ExpedienteDicri');
const { get } = require('../routes/expedienteDicri.router');

const _db = [];
let _seq = 1;

function _findIndex(id) {
    return _db.findIndex(e => e.id === Number(id));
}

const expedientesDicriService = {
    /** Obtiene todos los expedientes DICRI */
    getAll: async () => {
        const pool = await poolPromise;
        const { recordset } = await pool.request().execute('sp_obtener_expedientes_dicri');
        return recordset;
    },

    getById: async (id) => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_get_expediente_dicri_por_id');
        return recordset[0];
    },

    /** Crea un expediente y lo devuelve */
    create: async ({ numeroExpediente, descripcionGeneral, idTecnico, referenciaMp, ubicacion }) => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('numero', sql.NVarChar, numeroExpediente)
            .input('descripcionGeneral', sql.NVarChar, descripcionGeneral)
            .input('idTecnico', sql.Int, idTecnico)
            .input('referenciaMp', sql.NVarChar, referenciaMp)
            .input('ubicacion', sql.NVarChar, ubicacion)
            .input('justificacionRechazo', sql.NVarChar, null)
            .input('id', sql.Int, null)
            .execute('sp_crear_expediente_dicri');

        return recordset[0];
    },

    /** Envía un expediente a revisión (de 'Registrado' -> 'EnRevision') */
    sendToReview: async (idExpediente, idUsuario, comentario = null) => {
        const pool = await poolPromise;
        await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .input('idUsuario', sql.Int, idUsuario)
            .input('comentario', sql.NVarChar, comentario)
            .execute('sp_expediente_a_revision');
    },

    /** Aprueba un expediente (pasa a 'Aprobado') */
    approve: async (idExpediente, idUsuario, comentario = null) => {
        const pool = await poolPromise;
        await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .input('idUsuario', sql.Int, idUsuario)
            .input('comentario', sql.NVarChar, comentario)
            .execute('sp_aprobar_expediente');
    },

    /** Rechaza un expediente (pasa a 'Rechazado') */
    reject: async (idExpediente, idUsuario, justificacion) => {
        const pool = await poolPromise;
        await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .input('idUsuario', sql.Int, idUsuario)
            .input('justificacion', sql.NVarChar, justificacion)
            .execute('sp_rechazar_expediente');
    },

    createIndicio: async ({ idExpediente, descripcion, idUsuario, color = null, tamano = null, peso = null, ubicacion = null }) => {
        const pool = await poolPromise;
        await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .input('descripcion', sql.NVarChar, descripcion)
            .input('color', sql.NVarChar, color)
            .input('tamano', sql.NVarChar, tamano)
            .input('peso', sql.Decimal(10, 2), peso)
            .input('ubicacion', sql.NVarChar, ubicacion)
            .input('idTecnico', sql.Int, idUsuario)
            .execute('sp_crear_indicio');
    },

    updateIndicio: async (idIndicio, { descripcion, color = null, tamano = null, peso = null, ubicacion = null }) => {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, idIndicio)
            .input('descripcion', sql.NVarChar, descripcion)
            .input('color', sql.NVarChar, color)
            .input('tamano', sql.NVarChar, tamano)
            .input('peso', sql.Decimal(10, 2), peso)
            .input('ubicacion', sql.NVarChar, ubicacion)
            .execute('sp_actualizar_indicio');
    },

    getIndiciosByExpediente: async (idExpediente) => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .execute('sp_obtener_indicios_por_expediente');
        return recordset;
    },

    /** Historial de un expediente */
    history: async (idExpediente) => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('idExpediente', sql.Int, idExpediente)
            .execute('sp_obtener_historial_expediente');
        return recordset;
    }
};

module.exports = expedientesDicriService;
