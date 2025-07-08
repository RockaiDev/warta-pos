import mongoose, { Schema } from "mongoose";

const WebitemSchema = new Schema({
    titleEn: String,
    titleAr: String,
    category: String,
    showExtras: String,
    image: {
        type: String,
        default: "https://res.cloudinary.com/db152mwtg/image/upload/v1709404852/Lagham-GB/hkjjjnujxvkrzpjlnqxk.png"
    },
    price: Number,
    description: String,
    points: Number,
    size: String ,
}, {timestamps: true})

const WebItem = mongoose.models.WebItem || mongoose.model('WebItem', WebitemSchema)

export default WebItem;