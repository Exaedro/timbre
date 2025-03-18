const API_KEY = process.env.API_KEY

export const auth = (req, res, next) => {
    const { apikey } = req.query

    if(apikey != API_KEY) return res.status(401).json({ mensaje: 'prohibido', codigo: 401 })

    next()
}