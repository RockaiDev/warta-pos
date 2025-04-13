import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema({
    reason: String,
    value: Number,
    description: String,
    user: String,
    branch: String,
}, { timestamps: true })

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema)

export default Expense;