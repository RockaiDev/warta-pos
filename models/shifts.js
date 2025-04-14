import mongoose, { Schema } from "mongoose";

const shiftSchema = new Schema({
    status: {
        type: String,
        default: 'open'
    },
    invoices: [],
    expenses: [],
    casher: String,
    close: String,
    branch: String,
}, { timestamps: true })

const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema)

export default Shift;