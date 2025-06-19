import connectMongoDB from "@/libs/mongoose"
import Client from "@/models/clients"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    const { id } = params
    const { name, phone, address, delivery, orders, points, loyaltyPoints } = await req.json()
    await connectMongoDB()
    await Client.findByIdAndUpdate(id, { name, phone, address, delivery, orders, points, loyaltyPoints })
    return NextResponse.json({ message: 'Client Updated' }, { status: 200 })
}

export async function DELETE(req, { params }) {
    const { id } = params
    await connectMongoDB()
    await Client.findByIdAndDelete(id)
    return NextResponse.json({ message: "Client Deleted" }, { status: 200 })
}
