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
    console.log('---------------------\nARDUINO FUNCIONANDO')
})

port.on('error', (err) => {
    console.log('Error: ', err.message)
})

export const encender = ({ secs }) => {
    // port.write(`A-${secs}`)
    port.write("ENCENDER-" + secs)
}

export const apagar = () => {
    port.write("APAGAR")
}