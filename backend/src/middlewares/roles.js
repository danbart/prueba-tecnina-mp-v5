module.exports = allowed => (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.rol)) {
        return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
};