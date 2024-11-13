import { Router } from "express";
const router = new Router()

import { auth } from '../utils/auth.mjs'
import { encender } from "../../index.mjs";

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

export default router