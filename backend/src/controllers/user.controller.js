const usuarioService = require('../services/usuarios.service');

exports.getAll = async (req, res) => {
    try {
        const usuarios = await usuarioService.getAll();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getById = async (req, res) => {
    try {
        const usuario = await usuarioService.getById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};