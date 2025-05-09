const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, sparse: true, unique: true, default: null },
    picture: { type: String, default: null },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'God', 'superGod'], 
        default: 'user' 
    },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
