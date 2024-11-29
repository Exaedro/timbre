import { query } from "../models/database.mjs";
import dayjs from "dayjs";

const dias = {
    "0": "domingo",
    "1": "lunes",
    "2": "martes",
    "3": "miercoles",
    "4": "jueves",
    "5": "viernes",
    "6": "sabado"
}

const configPorDefecto = [
    {
        Activo: "1",
    }
]

function sincronizar(callback) {
    const ahora = new Date()

    // Calcula cuántos milisegundos faltan para el próximo minuto exacto
    const msHastaProximoMinuto = (60 - ahora.getSeconds()) * 1000 - ahora.getMilliseconds()

    setTimeout(() => {
        callback()

        setInterval(callback, 60 * 1000)
    }, msHastaProximoMinuto)
}

async function obtenerDatos() {
    const horarios = await query('SELECT * FROM horarios')
    let config = await query('SELECT Activo FROM configuraciontimbre ORDER BY FechaCreacion DESC LIMIT 1')
    const eventos = await query('SELECT * FROM eventos')

    if(!config) {
        config = configPorDefecto
    }

    return [horarios, config, eventos]
}

// Función que se ejecutará en cada minuto exacto
async function timbre() {
    const hora = dayjs().format('HH:mm:ss')
    const fecha = new Date(dayjs().format('YYYY-MM-DD'))

    const [horarios, config, eventos] = await obtenerDatos()
    const horarioEncontrado = horarios.find(horario => horario.HoraInicio === hora)
    // const eventoEncontrado = eventos.find(evento => evento.Fecha === fecha)

    // Si el timbre esta desactivado no hace nada
    if(config[0].Activo === 0) return
    if(!horarioEncontrado) return
    // if(eventoEncontrado && eventoEncontrado.TimbreActivo === 0) return

    const duracion = horarioEncontrado.duracion
    const estado = horarioEncontrado.Activo
    
    if(estado === 1) {
        console.log('EL TIMBRE ESTA SONANDO')
        fetch('http://localhost:3000/timbre/encender?apikey=cambiardespues&secs=' + duracion)
    }
}

// Llamar la función para comenzar
sincronizar(timbre);
