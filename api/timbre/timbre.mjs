import { query } from "../models/database.mjs";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

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
    let diasApagado = await query('SELECT * FROM dias_apagado')

    if(!config) {
        config = configPorDefecto
    }

    diasApagado = diasApagado.map(dia => {
        return {
            id_dia: dia.Id_dia,
            fecha: dayjs(dia.Fecha, 'YYYY-MM-DD'),
            hora_inicio: dia.hora_inicio,
            hora_fin: dia.hora_fin
        }
    })

    return [horarios, config, diasApagado]
}

// Función que se ejecutará en cada minuto exacto
async function timbre() {
    const hora = dayjs().format('HH:mm:ss')
    const fecha = dayjs().format('YYYY-MM-DD')

    const [horarios, config, diasApagado] = await obtenerDatos()

    const horarioEncontrado = horarios.find(horario => horario.HoraInicio === hora)
    const horarioApagado = diasApagado.find(horario => horario.fecha === fecha)

    // Si el timbre esta desactivado no hace nada
    if(config[0].Activo === 0) return
    // Si no hay un horario establecido a tal hora para que el timbre suene no hace nada
    if(!horarioEncontrado) return
    // Si hay un horario establecido para que el timbre no suene no hace nada
    if(horarioApagado) {
        const hora_inicio = dayjs(horarioApagado.hora_inicio, 'HH:mm:ss')
        const hora_fin = dayjs(horarioApagado.hora_fin, 'HH:mm:ss')

        if(hora.isAfter(hora_inicio) && hora.isBefore(hora_fin)) return 
    }

    const duracion = horarioEncontrado.duracion
    const estado = horarioEncontrado.Activo
    
    if(estado === 1) {
        console.log('EL TIMBRE ESTA SONANDO')
        fetch('http://localhost:3000/timbre/encender?apikey=cambiardespues&secs=' + duracion)
    }
}

// Llamar la función para comenzar
sincronizar(timbre);
