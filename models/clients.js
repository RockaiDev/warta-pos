import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema({
    name: String,
    phone: String,
    address: String,
    delivery: Number,
    orders: [],
    points : Number,
    // loyaltyPoints: { type: Number, default: 0 },
})

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema)

export default Client;