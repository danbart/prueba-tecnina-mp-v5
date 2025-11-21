const Usuario = require('../models/Usuario');
const { poolPromise, sql } = require('../database/connection');
const bcrypt = require('bcryptjs');
const users = [];
let uSeq = 1;

// TODO!: usuario por defecto para pruebas
(async () => {
    const hash = await bcrypt.hash('test123', 10);
    users.push(new Usuario({ id: uSeq++, nombre: 'Fiscal Demo', email: 'fiscal@mp.gt', passwordHash: hash, rol: 'fiscal' }));
})();

module.exports = {
    findByEmail: async email => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('correo', sql.NVarChar, email)
            .execute('sp_get_usuario_por_email');
        return recordset[0] || null;
    },
    create: async ({ nombre, email, password, rol }) => {
        const hash = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, email)
            .input('hash', sql.NVarChar, hash)
            .input('rol', sql.NVarChar, rol)
            .execute('sp_crear_usuario');
    },
    getAll: async () => {
        const pool = await poolPromise;
        const { recordset } = await pool.request().execute('sp_get_usuarios');
        return recordset.map(u => new Usuario(u));
    },
    getById: async id => {
        const pool = await poolPromise;
        const { recordset } = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_get_usuario_por_id');
        return recordset[0] ? new Usuario(recordset[0]) : null;
    },
};