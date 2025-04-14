import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: String,
    username: String,
    password: String,
    role: String,
    branch: String,
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User;