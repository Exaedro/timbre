import chalk from "chalk"
import { SerialPort, ReadlineParser } from "serialport"

import './api/index.mjs'
import './web/main.js'

const PUERTO_USB = 'com3'

const port = new SerialPort({
    path: PUERTO_USB,
    baudRate: 9600,
}).setEncoding('utf-8')

port.pipe(new ReadlineParser())

port.on('data', (data) => {
    console.log(data)
})

port.on('open', () => {
    console.log('---------------------')
    console.log(chalk.greenBright('ARDUINO FUNCIONANDO'))
})

port.on('error', (err) => {
    console.log('---------------------')
    
    if(err.message.includes('File not found')) {
        console.log(chalk.redBright('ADVERTENCIA: EL ARDUINO ESTA DESCONECTADO O EL PUERTO ES INCORRECTO'))
        console.log(chalk.blueBright('PUERTO ACTUAL: ') + PUERTO_USB)
        return
    }

    if(err.message.includes('Access denied')) {
        console.log(chalk.redBright('ADVERTENCIA: EL PUERTO ' + PUERTO_USB + ' YA ESTA SIENDO UTILIZADO. ARDUINO SIN FUNCIONAR.'))
        return
    }

    console.log('ERROR DESCONOCIDO: ' + err.message)
})

export const encender = ({ secs }) => {
    try {
        port.write(secs)
    } catch(e) {
        console.error(e)
    }
}