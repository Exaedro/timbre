import express from 'express'
import { encender, apagar } from './index.js'

const app = express()

app.get('/timbre/encender', (req, res) => {
    encender()
    res.send('timbre encendido')
})

app.get('/timbre/apagar', (req, res) => {
    apagar()
    res.send('timbre apagado')
})

app.listen(3000, () => {
    console.log('Servidor en funcionamiento|')
})