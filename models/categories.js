import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    title: String,
})

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)

export default Category;

