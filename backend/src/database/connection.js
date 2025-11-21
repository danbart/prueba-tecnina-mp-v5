const sql = require('mssql');
const fs = require('fs/promises');
const path = require('path');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

async function waitPool(cfg, maxTries = 10, delayMs = 3000) {
    let tries = 0;
    while (true) {
        try {
            return await sql.connect(cfg);
        } catch (err) {
            if (++tries >= maxTries) throw err;
            console.log(`⏳ SQL no disponible, reintento ${tries}/${maxTries}…`);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}

async function runSqlFile(pool, filename) {
    const full = path.join(__dirname, '../../sql', filename);
    let script = await fs.readFile(full, 'utf8');

    script = script.replace(/\r\n/g, '\n');

    const batches = script
        .split(/^\s*GO\s*$/gmi)
        .filter(Boolean);

    for (const stmt of batches) {
        await pool.request().batch(stmt);
    }
    console.log(`✅  Ejecutado ${filename} (${batches.length} lotes)`);
}

async function ensureDatabase() {

    const masterPool = await waitPool({ ...config, database: 'master' });

    const { recordset } = await masterPool.request()
        .query("SELECT COUNT(*) AS n FROM sys.databases WHERE name = 'ministerio'");

    if (recordset[0].n === 0) {
        console.log('📀  Creando base de datos ministerio…');
        await masterPool.request().query('CREATE DATABASE ministerio');
    }

    await masterPool.close();

    const pool = await waitPool({ ...config, database: 'ministerio' });

    await runSqlFile(pool, 'tables.sql');
    await runSqlFile(pool, 'procedures.sql');

    return pool;
}

let poolPromise;

async function init() {
    if (!poolPromise) {
        await ensureDatabase();
        poolPromise = ensureDatabase();
    }
    return poolPromise;
}

module.exports = {
    sql,
    poolPromise: init()
};

