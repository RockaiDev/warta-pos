import connectMongoDB from "@/libs/mongoose"
import WebItem from "@/models/WebSiteItems"
import { NextResponse } from "next/server"

export async function POST(req){
    const { titleEn, titleAr, category, showExtras, image, price, description, points, size } = await req.json()
    await connectMongoDB()
    await WebItem.create({ titleEn, titleAr, category, showExtras, image, price, description, points, size })
    return NextResponse.json({message: "WebItem Created"} , {status: 201})
}

export async function GET(){
    await connectMongoDB()
    const items = await WebItem.find()
    return NextResponse.json({items})
}
