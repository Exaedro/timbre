
const express = require('express')
const path = require('node:path')
const mysql = require('mysql2');
const { View } = require('electron');
const app = express()
const bcrypt = require('bcrypt');
const session = require('express-session');
const { console } = require('node:inspector');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// Middleware para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
    // try {
    //     const { user_name, password } = req.query; // Asegúrate de que `password` está correctamente definido
    //     // console.log("Usuario:", user_name);
    //     // console.log("Contraseña:", password);


    //     const query_ini = 'SELECT `UsuarioID`, `NombreUsuario`, `Contrasena`, `FechaCreacion` FROM `usuario` WHERE NombreUsuario=?';
    //     const [userResults] = await connection.promise().query(query_ini, [user_name]);

    //     if (userResults.length === 0) {
    //         return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
    //     }

    //     const hashedPassword = userResults[0].Contrasena;

    //     // Verifica si la contraseña coincide
    //     const isMatch = await verifyPassword(password, hashedPassword);

    //     if (isMatch) {
    //         return res.redirect('/index'); // Redirige al inicio si coincide
    //     } else {

    //         return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
    //     }
    // } catch (err) {
    //     console.error('Error al iniciar sesión:', err);
    //     return res.render('login.ejs', { error: 'Error al verificar los datos' });
    // }
    return res.redirect('/index'); // Redirige al inicio si coincide
});


app.get('/index', (req, res) => {

    res.render('index')
})
app.get('/calendar_dia', (req, res) => {

    const dia = req.query.dia;
    const mes = req.query.mes;
    let mes_enviar = parseInt(mes) + 1;
    const nombre_dia = req.query.nombre_dia;
    const año = req.query.año;
    const fecha_comp = `/${año}-${mes_enviar}-${dia}`;

    const query_act_dia = 'SELECT * FROM horarios ORDER BY HoraInicio ASC;'
    connection.query(query_act_dia, [], (err, results_fijo) => {
        if (err) {
            console.error('Error al buscar los datos:', err);
            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });

        }
        const query_evento = 'SELECT * FROM eventos WHERE Fecha="?" ORDER BY Horario ASC;'
        connection.query(query_evento, [fecha_comp], (err, results) => {
            if (err) {
                console.error('Error al buscar los datos:', err);
                return res.render('horarios_fijos', { error: 'Error al buscar los datos' });

            }
            let horario_comp=results+results_fijo
            
            res.render('calendar_dia', { results, results_fijo, dia, mes, nombre_dia, año, mes_enviar });
        })
    })

});
app.get('/horarios_fijos', (req, res) => {
    const query_act_dia = 'SELECT * FROM horarios ORDER BY HoraInicio ASC;'
    connection.query(query_act_dia, [], (err, results) => {
        if (err) {
            console.error('Error al buscar los datos:', err);
            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });

        }

        res.render('horarios_fijos', { results })
    })
});


app.post('/editar_horario_fijo', (req, res) => {
    const { input_id, input_name_horario, input_horario, input_duracion } = req.body;

    if (!input_id || !input_name_horario || !input_horario || !input_duracion) {
        console.error('Datos incompletos recibidos:', req.body);
        return res.status(400).send('Datos incompletos');
    }

    const datatime = Datatime();
    const sql = `UPDATE horarios SET NombreHorario=?,HoraInicio=?,Activo=?,FechaCreacion=?,duracion=? WHERE HorarioID=?`;
    connection.query(sql, [input_name_horario, input_horario, 1, datatime, input_duracion, input_id], (err, result) => {
        if (err) {
            console.error('Error actualizando datos:', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            res.redirect('/horarios_fijos');
        }
    });
});

app.post('/eliminar_horario_fijo', (req, res) => {
    const { input_id } = req.body;

    const sql = `DELETE FROM horarios WHERE HorarioID=?`;
    connection.query(sql, [input_id], (err, result) => {
        if (err) {
            console.error('Error actualizando datos:', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            res.redirect('/horarios_fijos');
        }
    });
});

app.post('/agregar_horario_fijo', (req, res) => {
    const { input_name_horario, input_horario, input_duracion } = req.body;

    let datatime = Datatime();
    const sql = `INSERT INTO horarios (NombreHorario, HoraInicio, Activo, FechaCreacion, duracion) VALUES (?,?,?,?,?)`;
    connection.query(sql, [input_name_horario, input_horario, 1, datatime, input_duracion], (err, result) => {
        if (err) {
            console.error('Error agregar un timbre ', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            res.redirect('/horarios_fijos');
        }
    });
});


app.post('/form_enviar_horario', (req, res) => {
    const { dia_enviar, mes_enviar, semana_enviar, año_enviar, fecha_enviar, input_name_horario_enviar, Descripcion, activity_time_enviar, input_duracion_enviar } = req.body;
    //dia, mes, nombre_dia, año
    let datatime = Datatime();
    console.log(fecha_enviar)
    const sql = `INSERT INTO eventos(NombreEvento, Fecha, Horario,Duracion, TimbreActivo, Descripcion, FechaCreacion)  VALUES (?,?,?,?,?,?,?)`;
    connection.query(sql, [input_name_horario_enviar, fecha_enviar, activity_time_enviar, input_duracion_enviar, 1, Descripcion, datatime], (err, result) => {
        if (err) {
            console.error('Error agregar un timbre ', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            const redirectUrl = `/calendar_dia?dia=${dia_enviar}&mes=${mes_enviar}&nombre_dia=${semana_enviar}&año=${año_enviar}`;
            res.redirect(redirectUrl);
        }
    });
});
app.post('/cerrar_sesion', (req, res) => {

    res.redirect("/iniciar_sesion");

});






app.use(express.static(path.join(__dirname, 'public')))

function Datatime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}