import { Router } from "express";
const router = new Router()

import { auth } from '../utils/auth.mjs'
import { encender, apagar } from "../../arduino.mjs";

router.get('/timbre/encender', auth, (req, res) => {
    try {
        encender()
        res.json({ mensaje: "timbre encendido", encendido: true })
    } catch(e) {
        res.status(400).json({ message: "ocurrio un error al intentar encender el timbre.", encendido: false })
        console.error(e)
    }
})

router.get('/timbre/apagar', auth, (req, res) => {
    try {
        apagar()
        res.json({ mensaje: "timbre apagado", apagado: true })
    } catch(e) {
        res.status(400).json({ message: "ocurrio un error al intentar encender el timbre.", apagado: false })
        console.error(e)
    }
})

export default router