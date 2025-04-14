import connectMongoDB from "@/libs/mongoose"
import User from "@/models/users"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { name, username, password, role, branch } = await req.json()
    await connectMongoDB()
    await User.create({ name, username, password, role, branch })
    return NextResponse.json({ message: 'User Created' }, { status: 201 })
}

export async function GET(req) {
    await connectMongoDB()
    const users = await User.find()
    return NextResponse.json({ users })
}
