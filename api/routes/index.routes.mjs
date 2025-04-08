import { Router } from "express";
const router = new Router()

import { auth } from '../utils/auth.mjs'
import { encender } from "../../index.mjs";
import { format } from "@fast-csv/format";
import { query } from "../models/database.mjs";

router.get('/timbre/encender', auth, (req, res) => {
    const { secs = "1" } = req.query
    const tiempo = secs == "1" ? secs + ' segundo' : secs + ' segundos' 

    try {
        encender({ secs })
        res.status(200).json({ mensaje: 'encendido', tiempo, codigo: 200 })
    } catch(e) {
        console.error(e)
        res.status(400).json({ mensaje: 'ocurrio un error inesperado', codigo: 400 })
    }
})

router.get('/timbre/exportar/horarios', async (req, res) => {
    const results = await query({ sql: 'SELECT HoraInicio, duracion FROM horarios' })

    const csvStream = format({ headers: false });
    csvStream.pipe(res);

    results.forEach(row => csvStream.write(row));
    csvStream.end();
})

router.get('/timbre/exportar/eventos', async (req, res) => {
    const results = await query({ sql: 'SELECT Fecha, Horario, Duracion FROM eventos' })

    const csvStream = format({ headers: false })
    csvStream.pipe(res)

    results.forEach(row => csvStream.write(row))
    csvStream.end()
})

router.get('/timbre/exportar/apagado', async (req, res) => {
    const results = await query({ sql: 'SELECT Fecha, hora_inicio FROM dias_apagado' })

    const csvStream = format({ headers: false })
    csvStream.pipe(res)

    results.forEach(row => csvStream.write(row))
    csvStream.end()
})

export default router