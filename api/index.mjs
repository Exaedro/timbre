import express from 'express'
import { encender, apagar } from '../index.mjs'

const app = express()

app.get('/timbre/encender', (req, res) => {
    const { secs } = req.query

    encender({ secs })
    res.send('timbre encendido')
})

app.get('/timbre/apagar', (req, res) => {
    apagar()
    res.send('timbre apagado')
})

app.listen(3000, () => {
    console.log('API: localhost:3000')
})