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

router.get('/timbre/exportar/csv', async (req, res) => {
    const results = await query({ sql: 'SELECT HorarioID as horario_id, NombreHorario as nombre_horario, HoraInicio as hora_inicio, Activo as horario_activo, FechaCreacion as fecha_creacion_horario, duracion as horario_duracion FROM horarios' })

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    results.forEach(row => csvStream.write(row));
    csvStream.end();
})

export default router