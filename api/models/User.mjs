import { Schema, model } from "mongoose";

/**
 * NO VAMOS A USAR MONGO
 * DEJO ESTO PARA HACERLO DESPUES EN SQL
 * 😶‍🌫️
 */

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: new Date.now()
    }
})

const userModel = model('users', userSchema)

export default userModel