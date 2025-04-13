import connectMongoDB from "@/libs/mongoose"
import User from "@/models/users"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
    const { username } = params
    await connectMongoDB()
    const user = await User.findOne({ username: username })
    return NextResponse.json({ user })
}

export async function DELETE(req, { params }) {
    const { username } = params
    await connectMongoDB()
    await User.findOneAndDelete({ username: username })
    return NextResponse.json({ message: "User Deleted" }, { status: 200 })
}