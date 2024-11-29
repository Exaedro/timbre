import express from 'express'
import cors from 'cors'

// Timbre
import './timbre/timbre.mjs'

const app = express()

// Config
app.set('json spaces', 2)

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
import router from './routes/index.routes.mjs'
app.use(router)

// Servidor
app.listen(3000, () => {
    console.log('API: localhost:3000')
})