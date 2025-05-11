import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, sparse: true, unique: true, default: null },
    picture: { type: String, default: null },
    phone: { type: String, default: null },
    country: { type: String, default: null },
    bio: { type: String, default: null },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'God', 'superGod'], 
        default: 'user' 
    },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema)
