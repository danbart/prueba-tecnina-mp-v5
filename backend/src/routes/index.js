const express = require('express');
const authRoutes = require('./auth.routes');
const auth = require('../middlewares/auth');
const userRoutes = require('./user.routes');
const expedienteDicriRoutes = require('./expedienteDicri.router');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', auth, userRoutes);
router.use('/expediente-dicri', auth, expedienteDicriRoutes);

module.exports = router;