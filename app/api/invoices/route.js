import connectMongoDB from "@/libs/mongoose"
import Invoice from "@/models/invoice"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { client, items, total, discount, taxs, delivery, user, payment, branch } = await req.json()
    await connectMongoDB()
    await Invoice.create({ client, items, total, discount, taxs, delivery, user, payment, branch })
    return NextResponse.json({ message: "Invoice Created" }, { status: 201 })
}

export async function GET() {
    await connectMongoDB()
    const invoices = await Invoice.find()
    return NextResponse.json({ invoices })
}

