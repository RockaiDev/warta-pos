import connectMongoDB from "@/libs/mongoose"
import Item from "@/models/items"
import { NextResponse } from "next/server"

export async function POST(req){
    const { title, prices, category, description, branch } = await req.json()
    await connectMongoDB()
    await Item.create({ title, prices, category, description, branch })
    return NextResponse.json({message: "Item Created"} , {status: 201})
}

export async function GET(){
    await connectMongoDB()
    const items = await Item.find()
    return NextResponse.json({items})
}
