import chalk from "chalk"
import { SerialPort, ReadlineParser } from "serialport"
const serverPort = 3000

import './api/index.mjs'
import './web/main.js'

const port = new SerialPort({
    path: 'com3',
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
    }

    else {
        console.log('ERROR DESCONOCIDO: ' + err.message)
    }
})

export const encender = ({ secs }) => {
    // port.write(`A-${secs}`)
    port.write("A-" + secs)
}

export const apagar = () => {
    port.write("APAGAR")
}