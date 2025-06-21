import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema({
    client: String,
    items: [],
    total: Number,
    discount: {
        type: Number,
        default: 0,
    }, 
    taxs: {
        type: Number,
        default: 0
    },
    delivery: Number,
    user: String,
    payment: String,
    branch: String,
    id: Number,
    source: {
        type: String,
        default: 'cashier' // 'cashier' للكاشير، 'web' للموقع
    }
}, { timestamps: true })

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)

export default Invoice;