import connectMongoDB from "@/libs/mongoose"
import WebOrder from "@/models/orders"
import { NextResponse } from "next/server"

export async function POST(req){
    const { title, prices, category, description } = await req.json()
    await connectMongoDB()
    await WebOrder.create({ title, prices, category, description })
    return NextResponse.json({message: "Item Created"} , {status: 201})
}

export async function GET(){
    await connectMongoDB()
    const items = await WebOrder.find().sort({createdAt:-1})
    return NextResponse.json({items})
}