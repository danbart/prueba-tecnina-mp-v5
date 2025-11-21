const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes'));

app.get('/', (req, res) => {
    res.send('API del Ministerio Público en funcionamiento.');
});

module.exports = app;
