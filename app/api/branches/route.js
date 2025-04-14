import connectMongoDB from "@/libs/mongoose";
import Branch from "@/models/branches";
import { NextResponse } from "next/server";


export async function POST(req) {
    const { name, location, phone, stuff } = await req.json()
    await connectMongoDB()
    await Branch.create({ name, location, phone, stuff })
    return NextResponse.json({message: "Branch Created"} , {status: 201})
}

export async function GET() {
    await connectMongoDB()
    const branches = await Branch.find()
    return NextResponse.json({ branches })
}
