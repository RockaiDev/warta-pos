import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    title: String,
    prices: Array,
    category: String,
    description: String,
    branch: String,
}, {timestamps: true})

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema)

export default Item;