import connectMongoDB from "@/libs/mongoose"
import Client from "@/models/clients"
import { NextResponse } from "next/server"

export async function POST(req, res) {
    const { name, phone, address, delivery, orders, points } = await req.json()
    await connectMongoDB()
    await Client.create({ name, phone, address, delivery, orders, points })
    return NextResponse.json({ message: "Client created successfully" }, { status: 201 })
}

export async function GET(req, res) {
    await connectMongoDB()
    const clients = await Client.find()
    return NextResponse.json({clients})
}

