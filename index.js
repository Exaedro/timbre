import { SerialPort, ReadlineParser } from "serialport"
const serverPort = 3000

import './server.js'

const port = new SerialPort({
    path: 'com3',
    baudRate: 9600,
}).setEncoding('utf-8')

port.pipe(new ReadlineParser())

port.on('data', (data) => {
    console.log(data)
})

port.on('open', () => {
    console.log('Puerto del arduino abierto')
})

port.on('error', (err) => {
    console.log('Error: ', err.message)
})

export const encender = () => {
    port.write("65")
}

export const apagar = () => {
    port.write("66")
}