import connectMongoDB from "@/libs/mongoose"
import Item from "@/models/items"
import { NextResponse } from "next/server"

export async function POST(req){
    const { titleEn, titleAr, category, showExtras, image, price, description, points, size, rate } = await req.json()
    await connectMongoDB()
    await Item.create({ titleEn, titleAr, category, showExtras, image, price, description, points, size, rate })
    return NextResponse.json({message: "Item Created"} , {status: 201})
}

export async function GET(){
    await connectMongoDB()
    const items = await Item.find()
    return NextResponse.json({items})
}
