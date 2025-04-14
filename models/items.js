import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    title: String,
    prices: [{
        branch: String,
        price: Number,
    }],
    category: String,
    description: String,
})

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema)

export default Item;