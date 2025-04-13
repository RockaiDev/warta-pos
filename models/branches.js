import mongoose, { Schema } from "mongoose";

const branchSchema = new Schema({
    name: String,
    location: String,
    phone: String,
    stuff: [],
})

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema)

export default Branch;

