const { Router } = require('express');
const router = new Router()

const { auth } = require('../utils/auth.js')
const { format } = require("@fast-csv/format");
const { query } = require("../models/database.mjs");

router.get('/timbre/exportar/horarios', async (req, res) => {
    const results = await query({ sql: 'SELECT HoraInicio, duracion FROM horarios' })

    const csvStream = format({ headers: false });
    csvStream.pipe(res);

    results.forEach(row => csvStream.write(row));
    csvStream.end();
})

router.get('/timbre/exportar/eventos', async (req, res) => {
    const results = await query({ sql: 'SELECT DATE_FORMAT(Fecha, "%Y/%m/%d") as Fecha, Horario, Duracion FROM eventos' })

    const csvStream = format({ headers: false })
    csvStream.pipe(res)

    results.forEach(row => csvStream.write(row))
    csvStream.end()
})

router.get('/timbre/exportar/apagado', async (req, res) => {
    const results = await query({ sql: 'SELECT DATE_FORMAT(Fecha, "%Y/%m/%d") as Fecha, hora_inicio FROM `dias_apagado`' })

    const csvStream = format({ headers: false })
    csvStream.pipe(res)

    results.forEach(row => csvStream.write(row))
    csvStream.end()
})

module.exports = router