
const express = require('express')
const path = require('node:path')
const mysql = require('mysql2');
const { View } = require('electron');
const app = express()
const session = require('express-session')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'horarios', // Cambien el nombre de la base de datos si quieren
    port: 3306
});

// Encender servidor
app.listen(4000, () => {
    console.log('PAGINA: localhost:4000')
})

module.exports = app

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/index', (req, res) => {
    if (req.session.user_dni != undefined) {
        res.redirect('/index')

        //req.destroy() para borrar las cookies.
    }
})

app.use(express.static(path.join(__dirname, 'public')))