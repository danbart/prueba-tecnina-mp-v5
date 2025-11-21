const jwt = require('jsonwebtoken');
const usuarioService = require('./usuarios.service');
const JWT_SECRET = process.env.SECRET_KEY;
const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
const refreshStore = new Map(); // refreshToken -> userId

module.exports = {
    login: async (email, password) => {
        const user = await usuarioService.findByEmail(email);
        if (!user) throw new Error('Credenciales inválidas');
        const ok = await require('bcryptjs').compare(password, user.passwordHash);
        if (!ok) throw new Error('Credenciales inválidas');
        const accessToken = jwt.sign({ sub: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
        refreshStore.set(refreshToken, user.id);
        return { accessToken, refreshToken, user: { id: user.id, nombre: user.nombre, rol: user.rol } };
    },
    refresh: async token => {
        if (!refreshStore.has(token)) throw new Error('Refresh inválido');
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await usuarioService.findByEmail(payload.sub);
        if (!user) throw new Error('Usuario no existe');
        const accessToken = jwt.sign({ sub: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        return { accessToken };
    }
};
