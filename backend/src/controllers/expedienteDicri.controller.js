const service = require('../services/expedienteDicri.service');

exports.obtenerExpedientesDicri = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearExpedienteDicri = async (req, res) => {
    try {
        const idTecnico = req.user?.sub || req.body.idTecnico;
        const { numeroExpediente, descripcionGeneral, referenciaMp, ubicacion } = req.body;
        const nuevoExpediente = await service.create({ numeroExpediente, descripcionGeneral, idTecnico, referenciaMp, ubicacion });
        res.status(201).json(nuevoExpediente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.enviarExpedienteARevision = async (req, res) => {
    try {
        const idUsuario = req.user?.sub || req.body.idUsuario;
        const { idExpediente, comentario } = req.body;
        await service.sendToReview(idExpediente, idUsuario, comentario);
        res.status(200).json({ message: 'Expediente enviado a revisión' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.aprobarExpediente = async (req, res) => {
    try {
        const idUsuario = req.user?.sub || req.body.idUsuario;
        const { idExpediente, comentario } = req.body;
        await service.approve(idExpediente, idUsuario, comentario);
        res.status(200).json({ message: 'Expediente aprobado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rechazarExpediente = async (req, res) => {
    try {

        const idUsuario = req.user?.sub || req.body.idUsuario;
        const { idExpediente, justificacion } = req.body;
        await service.reject(idExpediente, idUsuario, justificacion);
        res.status(200).json({ message: 'Expediente rechazado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearIndicio = async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuario = req.user?.sub || req.body.idUsuario;
        const { descripcion, color, tamano, peso, ubicacion } = req.body;
        await service.createIndicio({ idExpediente: id, descripcion, idUsuario, color, tamano, peso, ubicacion });
        res.status(201).json({ message: 'Indicio creado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateIndicio = async (req, res) => {
    try {
        const { idIndicio } = req.params;
        const { descripcion, color, tamano, peso, ubicacion } = req.body;
        await service.updateIndicio(idIndicio, { descripcion, color, tamano, peso, ubicacion });
        res.status(200).json({ message: 'Indicio actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerExpedienteDicriPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const expediente = await service.getById(id);
        res.status(200).json(expediente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerIndiciosPorExpediente = async (req, res) => {
    try {
        const { id } = req.params;
        const indicios = await service.getIndiciosByExpediente(id);
        res.status(200).json(indicios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.historialExpediente = async (req, res) => {
    try {
        const { id } = req.params;
        const historial = await service.history(id);
        res.status(200).json(historial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};