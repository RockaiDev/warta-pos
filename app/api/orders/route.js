import connectMongoDB from "@/libs/mongoose"
import Order from "@/models/orders"
import { NextResponse } from "next/server"

export async function POST(req) {
    const orderData = await req.json()
    await connectMongoDB()
    await Order.create(orderData)
    return NextResponse.json({ message: "Order Created" }, { status: 201 })
}

export async function GET() {
    await connectMongoDB()
    const orders = await Order.find().sort({ createdAt: -1 })
    return NextResponse.json({ orders })
} 