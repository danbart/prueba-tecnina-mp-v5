const authService = require('../services/auth.service');
const usuarioService = require('../services/usuarios.service');


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const data = await authService.refresh(refreshToken);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        await usuarioService.create({ nombre, email, password, rol });
        const login = await authService.login(email, password);
        res.status(201).json(login);
    } catch (e) { res.status(400).json({ error: e.message }); }
};