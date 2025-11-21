const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.user = data; // { sub, rol, iat, exp }
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
};