import connectMongoDB from "@/libs/mongoose"
import Category from "@/models/categories"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { title } = await req.json()
    await connectMongoDB()
    await Category.create({ title })
    return NextResponse.json({ message: 'Category Created' }, { status: 201 })
}

export async function GET() {
    await connectMongoDB()
    const categories = await Category.find()
    return NextResponse.json({ categories })
}

