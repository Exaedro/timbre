import { createConnection } from "mysql2/promise";

const CONFIGURACION = {
    host: 'localhost',
    user: 'root',
    database: 'timbre',
    password: '',
    port: 3306
}

export const query = async (sql, valores) => {
    const coneccion = await createConnection(CONFIGURACION)

    let [resultado] = await coneccion.query(sql, valores)
    if(resultado.length === 0) resultado = null
    
    await coneccion.end()

    return resultado
}