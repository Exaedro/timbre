
const express = require('express')
const path = require('node:path')
const mysql = require('mysql2');
const { View } = require('electron');
const app = express()
const bcrypt = require('bcrypt');
const { console } = require('node:inspector');
const session = require('express-session')
const { PORT } = require('./config.js');
const { clave_sesion } = require('./config.js');
// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// !!!! Contraseña para ingresar "tecnica1"
// Configuración de express-session
app.use(
    session({
        secret: clave_sesion,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 30 * 60 * 1000, // 30 minutos en milisegundos 
        },
    })
);




app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// Middleware para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/resources', express.static(path.join(__dirname, '../public/resources')));

// Conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'timbre',
    port: 3306
});

// Encender servidor
app.listen(PORT, () => {
    console.log(`PAGINA: localhost: ${PORT}`)
})



const isLogged = (req, res, next) => {
    if (req.session.user_sesion == '' || typeof req.session.user_sesion == 'undefined') {
        res.redirect('/')
    } else {
        next()
    }
}




app.get('/', (req, res) => {
    res.render('login')
})

// app.get('/login', (req, res) => {
//     if (req.session.user_dni != undefined) {
//         res.redirect('/login')

//         //req.destroy() para borrar las cookies.
//     }
// })


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

app.post('/cambiar_tema', (req, res) => {
    if (req.session.user_tema === "oscuro") {
        req.session.user_tema = "claro";
    } else {
        req.session.user_tema = "oscuro";
    }

    // Redirigir a la página anterior
    res.redirect(req.get("Referer") || "/");
});

app.get('/iniciar_sesion', async (req, res) => {
    try {
        const { user_name, password } = req.query;

        // Si no se envían credenciales, simplemente renderiza la vista sin error
        if (!user_name || !password) {
            return res.render('login.ejs', { error: null });
        }

        const query_ini = 'SELECT `UsuarioID`, `NombreUsuario`, `Contrasena`, `FechaCreacion` FROM `usuario` WHERE NombreUsuario=?';
        const [userResults] = await connection.promise().query(query_ini, [user_name]);

        if (userResults.length === 0) {
            return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
        }

        const hashedPassword = userResults[0].Contrasena;
        const isMatch = await verifyPassword(password, hashedPassword);

        if (isMatch) {
            req.session.user_sesion = true;
            return res.redirect('/index');
        } else {
            return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error en inicio de sesión:', err);
        return res.render('login.ejs', { error: 'Error al verificar los datos' });
    }
});


app.get('/index', isLogged, async (req, res) => {
    try {
        const query_eventos = "SELECT `Fecha` FROM `eventos` WHERE 1";
        const [results_eventos] = await connection.promise().query(query_eventos);

        const query_dias_apagados = "SELECT `Fecha` FROM `dias_apagado` WHERE hora_inicio = ? AND hora_fin = ?";
        const [results_dia_apagado] = await connection.promise().query(query_dias_apagados, ["00:00", "24:00"]);

        let año_actual = new Date().getFullYear();
        let feriados = [];

        try {
            const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${año_actual}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            feriados = await response.json();
        } catch (error) {
            console.error('Error al obtener los feriados:', error);
        }

        res.render('index', { results_eventos, results_dia_apagado, data: feriados, session: req.session });

    } catch (err) {
        console.error('Error en la consulta:', err);
        res.render('horarios_fijos', { error: 'Error al buscar los datos' });
    }
});


app.get('/calendar_dia', isLogged, (req, res) => {
    const dia = req.query.dia;
    const mes = req.query.mes;
    let mes_enviar = parseInt(mes) + 1;
    const nombre_dia = req.query.nombre_dia;
    const año = req.query.año;
    const fecha_comp = `${año}-${mes_enviar}-${dia}`;

    const quyery_dia_apagago = "SELECT * FROM `dias_apagado` WHERE Fecha=? AND desac_total=?";
    connection.query(quyery_dia_apagago, [fecha_comp, 0], (err, results_dia_apagado) => {
        if (err) {
            console.error('Error al buscar los datos:', err);
            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });
        } else {
            const quyery_dia_apagago_desac = "SELECT * FROM `dias_apagado` WHERE Fecha=? AND desac_total=?";
            connection.query(quyery_dia_apagago_desac, [fecha_comp, 1], (err, results_dia_apagado_desac) => {
                if (err) {
                    console.error('Error al buscar los datos:', err);
                    return res.render('horarios_fijos', { error: 'Error al buscar los datos' });
                } else {
                    const query_act_dia = 'SELECT * FROM horarios ORDER BY HoraInicio ASC;';
                    connection.query(query_act_dia, [], (err, results_fijo) => {
                        if (err) {
                            console.error('Error al buscar los datos:', err);
                            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });
                        }

                        const query_evento = 'SELECT * FROM eventos WHERE Fecha=? ORDER BY Horario ASC;';
                        connection.query(query_evento, [fecha_comp], (err, results_evento) => {
                            if (err) {
                                console.error('Error al buscar los datos:', err);
                                return res.render('horarios_fijos', { error: 'Error al buscar los datos' });
                            }

                            // Crear un conjunto de horas de eventos, manteniendo la parte completa de la hora (HH:MM)
                            const eventoHoras = new Set(results_evento.map(evento => evento.Horario));

                            // Filtrar horarios fijos eliminando aquellos que tengan la misma hora que un evento
                            const horariosFiltrados = results_fijo.filter(horario =>
                                !eventoHoras.has(horario.HoraInicio)
                            );

                            // Combinar los resultados: horarios filtrados y eventos, asegurando que los eventos se mantengan si hay coincidencias
                            const combinedResults = [
                                ...horariosFiltrados.map(item => ({ ...item, type: 'fixed' })),
                                ...results_evento.map(item => ({ ...item, type: 'event' }))
                            ];

                            // Ordenar por hora
                            combinedResults.sort((a, b) => {
                                const horaA = a.HoraInicio || a.Horario;
                                const horaB = b.HoraInicio || b.Horario;
                                return horaA.localeCompare(horaB);
                            });

                            res.render('calendar_dia', {
                                combinedResults, results_dia_apagado, results_dia_apagado_desac,
                                dia, mes, nombre_dia, año, mes_enviar, session: req.session
                            });
                        });
                    });
                }
            });
        }
    });
});
app.get('/horarios_fijos', isLogged, (req, res) => {
    const query_act_dia = 'SELECT * FROM horarios ORDER BY HoraInicio ASC;'
    connection.query(query_act_dia, [], (err, results) => {
        if (err) {
            console.error('Error al buscar los datos:', err);
            return res.render('horarios_fijos', { error: 'Error al buscar los datos' });

        }

        res.render('horarios_fijos', { results, session: req.session })
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
    const sql = `INSERT INTO eventos(NombreEvento, Fecha, Horario,duracion, Activo, Descripcion, FechaCreacion)  VALUES (?,?,?,?,?,?,?)`;
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
app.post('/eliminar_horario_dia', (req, res) => {
    const { type, id_horario, dia_enviar,mes, mes_enviar, semana_enviar, año_enviar, mes_enviar_act } = req.body;
    let datatime = Datatime();

    if (type === "event") {

        const DELETE_evento = "DELETE FROM `eventos` WHERE EventoID=?"
        connection.query(DELETE_evento, [id_horario], (err, result) => {
            if (err) {
                console.error('Error agregar un timbre ', err);
                res.status(500).send('Error actualizando los datos');
            }
            else {
                const redirectUrl = `/calendar_dia?dia=${dia_enviar}&mes=${mes}&nombre_dia=${semana_enviar}&año=${año_enviar}`;
                res.redirect(redirectUrl);
            }
        });

    } else {
        const query_horario = "SELECT * FROM `horarios` WHERE HorarioID=?";
        connection.query(query_horario, [id_horario], (err, result) => {
            if (err) {
                console.error('Error agregar un timbre ', err);
                res.status(500).send('Error actualizando los datos');
            } else {
                let nombre_horario = result[0].NombreHorario
                let HoraInicio = result[0].HoraInicio
                let duracion = result[0].duracion
                const fecha = `${año_enviar}-${mes_enviar}-${dia_enviar}`

                const insert_horario = `INSERT INTO eventos(NombreEvento, Fecha, Horario ,duracion, Activo, Descripcion, FechaCreacion)  VALUES (?,?,?,?,?,?,?)`;
                connection.query(insert_horario, [nombre_horario, fecha, HoraInicio, duracion, 0, "..", datatime], (err, result) => {
                    if (err) {
                        console.error('Error agregar un timbre ', err);
                        res.status(500).send('Error agregando evento');
                    } else {
                        const redirectUrl = `/calendar_dia?dia=${dia_enviar}&mes=${mes_enviar_act}&nombre_dia=${semana_enviar}&año=${año_enviar}`;
                        res.redirect(redirectUrl);
                    }
                });
            }

        });
    }

});


app.post('/enviar_dia_apagado', (req, res) => {
    let { dia_enviar, mes_enviar, semana_enviar, año_enviar } = req.body;
    let mes = parseInt(mes_enviar) + 1;
    let fecha_comp = `${año_enviar}-${mes}-${dia_enviar}`; // Ajustar formato de fecha
    const sql = "INSERT INTO `dias_apagado`(`Fecha`,`hora_inicio`, `hora_fin`,`desac_total`) VALUES (?,?,?,?)";
    connection.query(sql, [fecha_comp, "00:00", "24:00", 1], (err, result) => {
        if (err) {
            console.error('Error agregar un timbre ', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            const redirectUrl = `/calendar_dia?dia=${dia_enviar}&mes=${mes_enviar}&nombre_dia=${semana_enviar}&año=${año_enviar}`;
            res.redirect(redirectUrl);
        }
    })
});


app.post('/eliminar_dia_apagado', (req, res) => {
    const { dia_enviar, mes_enviar, semana_enviar, año_enviar } = req.body;
    let mes = parseInt(mes_enviar) + 1;
    let fecha_comp = `${año_enviar}-${mes}-${dia_enviar}`; // Ajustar formato de fecha

    const sql = "DELETE FROM `dias_apagado` WHERE Fecha=? AND desac_total=?";
    connection.query(sql, [fecha_comp, 1], (err, result) => {
        if (err) {
            console.error('Error agregar un timbre ', err);
            res.status(500).send('Error actualizando los datos');
        } else {
            const redirectUrl = `/calendar_dia?dia=${dia_enviar}&mes=${mes_enviar}&nombre_dia=${semana_enviar}&año=${año_enviar}`;
            res.redirect(redirectUrl);
        }
    });


});

app.post('/form_enviar_horario_dia_apagado', (req, res) => {
    const { dia_enviar, mes_enviar, semana_enviar, año_enviar, fecha_enviar, hora_inicio, hora_fin } = req.body;

    const envair_horario_apagar = "INSERT INTO `dias_apagado`( `Fecha`, `hora_inicio`, `hora_fin`,`desac_total`) VALUES (?,?,?,?)";
    connection.query(envair_horario_apagar, [fecha_enviar, hora_inicio, hora_fin, 0], (err, result) => {
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
    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/');
    });
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