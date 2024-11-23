
const express = require('express')
const path = require('node:path')
const mysql = require('mysql2');
const { View } = require('electron');
const app = express()
const bcrypt = require('bcrypt');
const session = require('express-session')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'timbre', // Cambien el nombre de la base de datos si quieren
    port: 3306
});

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


// Función para comparar una contraseña con su hash
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        throw error;
    }
}

app.get('/iniciar_sesion', async (req, res) => {
    try {
        const { user_name, password } = req.query; // Asegúrate de que `password` está correctamente definido
        console.log("Usuario:", user_name);
        console.log("Contraseña:", password);


        const query_ini = 'SELECT `UsuarioID`, `NombreUsuario`, `Contrasena`, `FechaCreacion` FROM `usuario` WHERE NombreUsuario=?';
        const [userResults] = await connection.promise().query(query_ini, [user_name]);

        if (userResults.length === 0) {
            return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
        }

        const hashedPassword = userResults[0].Contrasena;

        // Verifica si la contraseña coincide
        const isMatch = await verifyPassword(password, hashedPassword);

        if (isMatch) {
            return res.redirect('/index'); // Redirige al inicio si coincide
        } else {

            return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.render('login.ejs', { error: 'Error al verificar los datos' });
    }
});


app.get('/index', (req, res) => {
    res.render('index')
})
app.get('/calendar_dia', (req, res) => {

    const dia = req.query.dia;
    const mes = req.query.mes;
    const nombre_dia = req.query.nombre_dia;
    const año = req.query.año;

    res.render('calendar_dia', { dia, mes, nombre_dia, año });
});
app.get('/horarios_fijos', (req, res) => {
    const query_act_dia = 'SELECT * FROM `horarios` WHERE 1'
    connection.query(query_act_dia, [], (err, results) => {
        if (err) {
            console.error('Error al buscar los datos:', err);
            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });

        }

        res.render('horarios_fijos', { results})
    })
});

app.use(express.static(path.join(__dirname, 'public')))