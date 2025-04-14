import connectMongoDB from "@/libs/mongoose"
import Item from "@/models/items"
import { NextResponse } from "next/server"

export async function PUT(req, {params}) {
    const {id} = params
    const { title, prices, category, description } = await req.json()
    await connectMongoDB()
    await Item.findByIdAndUpdate(id, { title, prices, category, description })
    return NextResponse.json({message: 'Item Updated'} , {status: 200})
}

export async function DELETE(req, {params}) {
    const { id } = params
    await connectMongoDB()
    await Item.findByIdAndDelete(id)
    return NextResponse({message:"Item Deleted"}, {status: 200})
}