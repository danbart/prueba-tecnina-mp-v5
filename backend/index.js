const app = require('./src/app');
const { poolPromise } = require('./src/database/connection');

(async () => {
    try {
        console.time('⏳  DB ready');
        await poolPromise;
        console.timeEnd('⏳  DB ready');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () =>
            console.log(`Servidor backend corriendo en puerto ${PORT}`)
        );
    } catch (err) {
        console.error('❌  No se pudo conectar a la BD:', err);
        process.exit(1);
    }
})();