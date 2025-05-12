const API_KEY = process.env.API_KEY

const auth = (req, res, next) => {
    const { apikey } = req.query

    if(apikey != API_KEY) return res.status(401).json({ mensaje: 'prohibido', codigo: 401 })

    next()
}

module.exports = { auth }