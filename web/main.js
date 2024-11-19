
const express = require('express')
const path = require('node:path')
const mysql = require('mysql2');
const { View } = require('electron');
const app = express()
const session = require('express-session')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Conexión a la base de datos
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'horarios', // Cambien el nombre de la base de datos si quieren
//     port: 3306
// });

// Encender servidor
app.listen(4000, () => {
    console.log('PAGINA: localhost:4000')
})

module.exports = app

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/login', (req, res) => {
    if (req.session.user_dni != undefined) {
        res.redirect('/login')

        //req.destroy() para borrar las cookies.
    }
})
app.get('/iniciar_sesion', async (req, res) => {
    
    // try {
    //     const { user_name, password } = req.query;

    //     // Consulta para verificar al usuario
    //     const query_ini = 'SELECT * FROM usuario WHERE Nombre_usuario = ?  AND password = ?';
    //     const [userResults] = await connection.promise().query(query_ini, [user_name, password]);

    //     if (userResults.length === 0) {
    //         return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
    //     }
    //     else {
    //         // Redirigir a la página de inicio
    //         return res.redirect('/index');
    //     }



    // } catch (err) {
    //     console.error(err);
    //     return res.render('login.ejs', { error: 'Error al verificar los datos' });
    // }
    res.redirect('/index');
})


app.get('/index', (req, res) => {
    res.render('index')
})

app.use(express.static(path.join(__dirname, 'public')))